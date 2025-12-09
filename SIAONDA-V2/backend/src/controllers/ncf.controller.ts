import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// Schema de validación para crear secuencia NCF
const crearSecuenciaSchema = z.object({
  tipoComprobante: z.string().min(3).max(3), // B01, B02, B14, B15
  serie: z.string().length(1).default('E'), // E para electrónico
  numeroInicial: z.number().int().positive(),
  numeroFinal: z.number().int().positive(),
  fechaVencimiento: z.string().datetime(),
  observaciones: z.string().optional()
});

// GET /api/ncf - Obtener todas las secuencias
export const getSecuencias = asyncHandler(async (req: Request, res: Response) => {
  const activo = req.query.activo === 'true' ? true : req.query.activo === 'false' ? false : undefined;
  const tipoComprobante = req.query.tipoComprobante as string;

  const where: any = {};

  if (activo !== undefined) {
    where.activo = activo;
  }

  if (tipoComprobante) {
    where.tipoComprobante = tipoComprobante;
  }

  const secuencias = await prisma.secuenciaNcf.findMany({
    where,
    orderBy: [
      { activo: 'desc' },
      { fechaVencimiento: 'desc' }
    ]
  });

  res.json(secuencias);
});

// GET /api/ncf/:id - Obtener una secuencia por ID
export const getSecuencia = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const secuencia = await prisma.secuenciaNcf.findUnique({
    where: { id }
  });

  if (!secuencia) {
    throw new AppError('Secuencia NCF no encontrada', 404);
  }

  res.json(secuencia);
});

// POST /api/ncf - Crear nueva secuencia NCF
export const crearSecuencia = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = crearSecuenciaSchema.parse(req.body);

  // Validar que numeroFinal sea mayor que numeroInicial
  if (data.numeroFinal <= data.numeroInicial) {
    throw new AppError('El número final debe ser mayor que el número inicial', 400);
  }

  // Verificar que no exista una secuencia superpuesta activa
  const secuenciasExistentes = await prisma.secuenciaNcf.findMany({
    where: {
      tipoComprobante: data.tipoComprobante,
      serie: data.serie,
      activo: true,
      OR: [
        {
          AND: [
            { numeroInicial: { lte: data.numeroInicial } },
            { numeroFinal: { gte: data.numeroInicial } }
          ]
        },
        {
          AND: [
            { numeroInicial: { lte: data.numeroFinal } },
            { numeroFinal: { gte: data.numeroFinal } }
          ]
        }
      ]
    }
  });

  if (secuenciasExistentes.length > 0) {
    throw new AppError('Ya existe una secuencia activa que se superpone con el rango especificado', 400);
  }

  const secuencia = await prisma.secuenciaNcf.create({
    data: {
      tipoComprobante: data.tipoComprobante,
      serie: data.serie,
      numeroInicial: data.numeroInicial,
      numeroFinal: data.numeroFinal,
      numeroActual: data.numeroInicial - 1, // Empieza antes del primer número
      fechaVencimiento: new Date(data.fechaVencimiento),
      observaciones: data.observaciones || null
    }
  });

  res.status(201).json({
    message: 'Secuencia NCF creada exitosamente',
    secuencia
  });
});

// PUT /api/ncf/:id/desactivar - Desactivar una secuencia
export const desactivarSecuencia = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);

  const secuencia = await prisma.secuenciaNcf.findUnique({
    where: { id }
  });

  if (!secuencia) {
    throw new AppError('Secuencia NCF no encontrada', 404);
  }

  const secuenciaActualizada = await prisma.secuenciaNcf.update({
    where: { id },
    data: { activo: false }
  });

  res.json({
    message: 'Secuencia NCF desactivada',
    secuencia: secuenciaActualizada
  });
});

// GET /api/ncf/siguiente/:tipo - Obtener el siguiente NCF disponible
export const obtenerSiguienteNcf = asyncHandler(async (req: Request, res: Response) => {
  const tipoComprobante = req.params.tipo;

  // Buscar secuencia activa con números disponibles
  const secuencia = await prisma.secuenciaNcf.findFirst({
    where: {
      tipoComprobante,
      activo: true,
      numeroActual: { lt: prisma.secuenciaNcf.fields.numeroFinal },
      fechaVencimiento: { gte: new Date() }
    },
    orderBy: { numeroActual: 'asc' }
  });

  if (!secuencia) {
    throw new AppError(`No hay secuencias NCF disponibles para el tipo ${tipoComprobante}`, 404);
  }

  // Incrementar el número actual y generar el NCF
  const siguienteNumero = secuencia.numeroActual + BigInt(1);

  if (siguienteNumero > secuencia.numeroFinal) {
    throw new AppError('La secuencia NCF ha alcanzado su límite', 400);
  }

  // Actualizar el número actual
  await prisma.secuenciaNcf.update({
    where: { id: secuencia.id },
    data: { numeroActual: siguienteNumero }
  });

  // Formatear NCF: B02E00000001 (tipo + serie + 8 dígitos)
  const ncf = `${tipoComprobante}${secuencia.serie}${siguienteNumero.toString().padStart(8, '0')}`;

  res.json({
    ncf,
    secuenciaId: secuencia.id,
    numeroUtilizado: siguienteNumero.toString(),
    numerosRestantes: (secuencia.numeroFinal - siguienteNumero).toString()
  });
});

// GET /api/ncf/estadisticas - Obtener estadísticas de uso
export const getEstadisticas = asyncHandler(async (req: Request, res: Response) => {
  const secuencias = await prisma.secuenciaNcf.findMany({
    where: { activo: true }
  });

  const estadisticas = secuencias.map(seq => {
    const total = Number(seq.numeroFinal - seq.numeroInicial) + 1;
    const usados = Number(seq.numeroActual - seq.numeroInicial) + 1;
    const disponibles = total - usados;
    const porcentajeUsado = ((usados / total) * 100).toFixed(2);

    return {
      id: seq.id,
      tipoComprobante: seq.tipoComprobante,
      serie: seq.serie,
      total,
      usados,
      disponibles,
      porcentajeUsado,
      fechaVencimiento: seq.fechaVencimiento,
      estado: disponibles === 0 ? 'Agotada' : disponibles < 100 ? 'Crítica' : 'Disponible'
    };
  });

  res.json(estadisticas);
});
