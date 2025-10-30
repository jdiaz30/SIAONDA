import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { format } from 'date-fns';

// Schema de validación para abrir caja
const abrirCajaSchema = z.object({
  descripcion: z.string().min(1),
  montoInicial: z.number().min(0).default(0),
  observaciones: z.string().optional()
});

// Schema de validación para cerrar caja
const cerrarCajaSchema = z.object({
  montoFinal: z.number().min(0),
  observaciones: z.string().optional()
});

// Generar código de caja: CAJA-YYYYMMDD-NNNN
const generateCodigoCaja = async (): Promise<string> => {
  const now = new Date();
  const año = now.getFullYear();
  const mes = (now.getMonth() + 1).toString().padStart(2, '0');
  const dia = now.getDate().toString().padStart(2, '0');
  const fecha = `${año}${mes}${dia}`;

  const count = await prisma.caja.count({
    where: {
      fecha: {
        gte: new Date(año, now.getMonth(), now.getDate(), 0, 0, 0),
        lt: new Date(año, now.getMonth(), now.getDate() + 1, 0, 0, 0)
      }
    }
  });

  const numero = (count + 1).toString().padStart(4, '0');
  return `CAJA-${fecha}-${numero}`;
};

// GET /api/cajas
export const getCajas = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const search = req.query.search as string;
  const estadoId = req.query.estadoId ? parseInt(req.query.estadoId as string) : undefined;
  const fechaInicio = req.query.fechaInicio ? new Date(req.query.fechaInicio as string) : undefined;
  const fechaFin = req.query.fechaFin ? new Date(req.query.fechaFin as string) : undefined;

  const where: any = {};

  if (search) {
    where.OR = [
      { codigo: { contains: search, mode: 'insensitive' } },
      { usuario: { nombrecompleto: { contains: search, mode: 'insensitive' } } }
    ];
  }

  if (estadoId) {
    where.estadoId = estadoId;
  }

  if (fechaInicio && fechaFin) {
    where.fecha = {
      gte: fechaInicio,
      lte: fechaFin
    };
  }

  const [cajas, total] = await Promise.all([
    prisma.caja.findMany({
      where,
      skip,
      take: limit,
      include: {
        estado: true,
        usuario: {
          select: {
            id: true,
            codigo: true,
            nombrecompleto: true
          }
        },
        _count: {
          select: {
            facturas: true
          }
        }
      },
      orderBy: { fecha: 'desc' }
    }),
    prisma.caja.count({ where })
  ]);

  res.json({
    cajas,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

// GET /api/cajas/:id
export const getCaja = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const caja = await prisma.caja.findUnique({
    where: { id },
    include: {
      estado: true,
      usuario: {
        select: {
          id: true,
          codigo: true,
          nombrecompleto: true
        }
      },
      facturas: {
        include: {
          estado: true,
          cliente: {
            select: {
              nombrecompleto: true
            }
          },
          items: true
        },
        orderBy: { fecha: 'asc' }
      }
    }
  });

  if (!caja) {
    throw new AppError('Caja no encontrada', 404);
  }

  res.json(caja);
});

// POST /api/cajas/abrir
export const abrirCaja = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.usuario) {
    throw new AppError('No autenticado', 401);
  }

  const data = abrirCajaSchema.parse(req.body);

  // Verificar que el usuario no tenga otra caja abierta
  const cajaAbierta = await prisma.caja.findFirst({
    where: {
      usuarioId: req.usuario.id,
      estado: {
        nombre: 'Abierta'
      }
    }
  });

  if (cajaAbierta) {
    throw new AppError('Ya tienes una caja abierta. Debes cerrarla antes de abrir otra', 400);
  }

  // Estado: Abierta
  const estadoAbierta = await prisma.cajaEstado.findFirst({
    where: { nombre: 'Abierta' }
  });

  if (!estadoAbierta) {
    throw new AppError('Estado Abierta no configurado', 500);
  }

  // Generar código
  const codigo = await generateCodigoCaja();

  // Crear caja
  const caja = await prisma.caja.create({
    data: {
      codigo,
      descripcion: data.descripcion,
      fecha: new Date(),
      horaApertura: new Date(),
      montoInicial: data.montoInicial,
      observaciones: data.observaciones || null,
      estadoId: estadoAbierta.id,
      usuarioId: req.usuario.id
    },
    include: {
      estado: true,
      usuario: {
        select: {
          id: true,
          nombrecompleto: true
        }
      }
    }
  });

  res.status(201).json({
    message: 'Caja abierta exitosamente',
    caja
  });
});

// POST /api/cajas/:id/cerrar
export const cerrarCaja = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);

  if (!req.usuario) {
    throw new AppError('No autenticado', 401);
  }

  const data = cerrarCajaSchema.parse(req.body);

  // Verificar que la caja existe y pertenece al usuario
  const caja = await prisma.caja.findUnique({
    where: { id },
    include: {
      estado: true,
      facturas: {
        where: {
          estado: {
            nombre: 'Pagada'
          }
        }
      }
    }
  });

  if (!caja) {
    throw new AppError('Caja no encontrada', 404);
  }

  if (caja.usuarioId !== req.usuario.id) {
    throw new AppError('Esta caja no te pertenece', 403);
  }

  if (caja.estado.nombre !== 'Abierta') {
    throw new AppError('La caja ya está cerrada', 400);
  }

  // Calcular totales de facturas
  const totalFacturas = caja.facturas.reduce((sum, f) => sum + Number(f.total), 0);
  const montoEsperado = Number(caja.montoInicial) + totalFacturas;
  const diferencia = data.montoFinal - montoEsperado;

  // Estado: Cerrada
  const estadoCerrada = await prisma.cajaEstado.findFirst({
    where: { nombre: 'Cerrada' }
  });

  if (!estadoCerrada) {
    throw new AppError('Estado Cerrada no configurado', 500);
  }

  // Cerrar caja
  const cajaActualizada = await prisma.caja.update({
    where: { id },
    data: {
      horaCierre: new Date(),
      montoFinal: data.montoFinal,
      totalFacturas,
      diferencia,
      observaciones: data.observaciones
        ? `${caja.observaciones || ''}\nCierre: ${data.observaciones}`
        : caja.observaciones,
      estadoId: estadoCerrada.id
    },
    include: {
      estado: true,
      usuario: {
        select: {
          id: true,
          nombrecompleto: true
        }
      },
      facturas: {
        include: {
          estado: true,
          cliente: {
            select: {
              nombrecompleto: true
            }
          }
        }
      }
    }
  });

  res.json({
    message: 'Caja cerrada exitosamente',
    caja: cajaActualizada
  });
});

// GET /api/cajas/:id/reporte
export const generarReporteCierre = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const caja = await prisma.caja.findUnique({
    where: { id },
    include: {
      estado: true,
      usuario: {
        select: {
          codigo: true,
          nombrecompleto: true
        }
      },
      facturas: {
        where: {
          estado: {
            nombre: 'Pagada'
          }
        },
        include: {
          estado: true,
          cliente: {
            select: {
              nombrecompleto: true,
              identificacion: true
            }
          },
          items: true
        },
        orderBy: { fecha: 'asc' }
      }
    }
  });

  if (!caja) {
    throw new AppError('Caja no encontrada', 404);
  }

  // Agrupar facturas por método de pago
  const porMetodoPago: { [key: string]: { cantidad: number; total: number } } = {};

  caja.facturas.forEach(f => {
    const metodo = f.metodoPago || 'Efectivo';
    if (!porMetodoPago[metodo]) {
      porMetodoPago[metodo] = { cantidad: 0, total: 0 };
    }
    porMetodoPago[metodo].cantidad++;
    porMetodoPago[metodo].total += Number(f.total);
  });

  const reporte = {
    caja: {
      codigo: caja.codigo,
      fecha: format(caja.fecha, 'dd/MM/yyyy'),
      horaApertura: caja.horaApertura ? format(caja.horaApertura, 'HH:mm:ss') : null,
      horaCierre: caja.horaCierre ? format(caja.horaCierre, 'HH:mm:ss') : null,
      estado: caja.estado.nombre
    },
    usuario: caja.usuario,
    montos: {
      montoInicial: Number(caja.montoInicial),
      totalFacturas: Number(caja.totalFacturas || 0),
      montoEsperado: Number(caja.montoInicial) + Number(caja.totalFacturas || 0),
      montoFinal: Number(caja.montoFinal || 0),
      diferencia: Number(caja.diferencia || 0)
    },
    facturas: {
      cantidad: caja.facturas.length,
      detalle: caja.facturas.map(f => ({
        codigo: f.codigo,
        ncf: f.ncf,
        cliente: f.cliente.nombrecompleto,
        metodoPago: f.metodoPago,
        subtotal: f.subtotal,
        itbis: f.itbis,
        total: f.total,
        hora: format(f.fecha, 'HH:mm:ss')
      }))
    },
    porMetodoPago,
    observaciones: caja.observaciones
  };

  res.json(reporte);
});

// GET /api/cajas/usuario/activa
export const getCajaActiva = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.usuario) {
    throw new AppError('No autenticado', 401);
  }

  const caja = await prisma.caja.findFirst({
    where: {
      usuarioId: req.usuario.id,
      estado: {
        nombre: 'Abierta'
      }
    },
    include: {
      estado: true,
      usuario: {
        select: {
          id: true,
          nombrecompleto: true
        }
      },
      _count: {
        select: {
          facturas: true
        }
      }
    }
  });

  res.json(caja);
});

// GET /api/cajas/estados
export const getEstadosCaja = asyncHandler(async (req: Request, res: Response) => {
  const estados = await prisma.cajaEstado.findMany({
    orderBy: { nombre: 'asc' }
  });

  res.json(estados);
});

// DELETE /api/cajas/:id
export const deleteCaja = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const caja = await prisma.caja.findUnique({
    where: { id },
    include: {
      estado: true,
      facturas: true
    }
  });

  if (!caja) {
    throw new AppError('Caja no encontrada', 404);
  }

  if (caja.facturas.length > 0) {
    throw new AppError('No se puede eliminar una caja que tiene facturas asociadas', 400);
  }

  if (caja.estado.nombre === 'Cerrada') {
    throw new AppError('No se puede eliminar una caja cerrada', 400);
  }

  await prisma.caja.delete({ where: { id } });

  res.json({ message: 'Caja eliminada exitosamente' });
});
