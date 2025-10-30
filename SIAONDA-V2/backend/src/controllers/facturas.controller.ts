import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// Schema de validación para crear factura
const createFacturaSchema = z.object({
  certificadoId: z.number().int().positive(),
  clienteId: z.number().int().positive(),
  items: z.array(z.object({
    concepto: z.string().min(1),
    cantidad: z.number().int().positive(),
    precioUnitario: z.number().positive(),
    itbis: z.number().min(0).default(0)
  })),
  metodoPago: z.string(),
  ncf: z.string().optional(),
  observaciones: z.string().optional()
});

// Generar código de factura: FAC-YYYYMMDD-NNNN
const generateCodigoFactura = async (): Promise<string> => {
  const now = new Date();
  const año = now.getFullYear();
  const mes = (now.getMonth() + 1).toString().padStart(2, '0');
  const dia = now.getDate().toString().padStart(2, '0');
  const fecha = `${año}${mes}${dia}`;

  const count = await prisma.factura.count({
    where: {
      fecha: {
        gte: new Date(año, now.getMonth(), now.getDate(), 0, 0, 0),
        lt: new Date(año, now.getMonth(), now.getDate() + 1, 0, 0, 0)
      }
    }
  });

  const numero = (count + 1).toString().padStart(4, '0');
  return `FAC-${fecha}-${numero}`;
};

// Generar NCF (Número de Comprobante Fiscal)
// Formato: E310000000001 (E31 = Factura de crédito fiscal, seguido de 9 dígitos secuenciales)
const generateNCF = async (): Promise<string> => {
  const prefijo = 'E31'; // E31 = Factura con valor fiscal

  // Buscar última secuencia NCF
  const ultimaFactura = await prisma.factura.findFirst({
    where: {
      ncf: {
        startsWith: prefijo
      }
    },
    orderBy: {
      id: 'desc'
    }
  });

  let secuencia = 1;
  if (ultimaFactura?.ncf) {
    const ultimaSecuencia = parseInt(ultimaFactura.ncf.substring(3));
    secuencia = ultimaSecuencia + 1;
  }

  // TODO: En producción, validar que no se exceda el rango autorizado por DGII
  // y obtener NCF de la secuencia autorizada actual

  const numeroSecuencia = secuencia.toString().padStart(9, '0');
  return `${prefijo}${numeroSecuencia}`;
};

// GET /api/facturas
export const getFacturas = asyncHandler(async (req: Request, res: Response) => {
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
      { ncf: { contains: search, mode: 'insensitive' } },
      { cliente: { nombrecompleto: { contains: search, mode: 'insensitive' } } }
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

  const [facturas, total] = await Promise.all([
    prisma.factura.findMany({
      where,
      skip,
      take: limit,
      include: {
        estado: true,
        cliente: {
          select: {
            id: true,
            codigo: true,
            nombrecompleto: true,
            identificacion: true,
            rnc: true
          }
        },
        certificado: {
          select: {
            id: true,
            codigo: true
          }
        },
        items: true,
        caja: {
          select: {
            id: true,
            codigo: true
          }
        }
      },
      orderBy: { fecha: 'desc' }
    }),
    prisma.factura.count({ where })
  ]);

  res.json({
    facturas,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

// GET /api/facturas/:id
export const getFactura = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const factura = await prisma.factura.findUnique({
    where: { id },
    include: {
      estado: true,
      cliente: true,
      certificado: {
        include: {
          formulario: {
            include: {
              productos: {
                include: {
                  producto: true
                }
              }
            }
          }
        }
      },
      items: true,
      caja: {
        include: {
          usuario: {
            select: {
              id: true,
              nombrecompleto: true
            }
          }
        }
      }
    }
  });

  if (!factura) {
    throw new AppError('Factura no encontrada', 404);
  }

  res.json(factura);
});

// POST /api/facturas
export const createFactura = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.usuario) {
    throw new AppError('No autenticado', 401);
  }

  const data = createFacturaSchema.parse(req.body);

  // Verificar que el certificado existe
  const certificado = await prisma.certificado.findUnique({
    where: { id: data.certificadoId },
    include: {
      facturas: true,
      formulario: {
        include: {
          productos: {
            include: {
              producto: {
                include: {
                  costos: {
                    where: {
                      OR: [
                        { fechaFinal: null },
                        { fechaFinal: { gte: new Date() } }
                      ],
                      fechaInicio: { lte: new Date() }
                    },
                    orderBy: { cantidadMin: 'asc' }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!certificado) {
    throw new AppError('Certificado no encontrado', 404);
  }

  if (certificado.facturas && certificado.facturas.length > 0) {
    throw new AppError('Este certificado ya tiene una factura', 400);
  }

  // Verificar que el cliente existe
  const cliente = await prisma.cliente.findUnique({
    where: { id: data.clienteId }
  });

  if (!cliente) {
    throw new AppError('Cliente no encontrado', 404);
  }

  // Estado inicial: Pendiente
  const estadoPendiente = await prisma.facturaEstado.findFirst({
    where: { nombre: 'Pendiente' }
  });

  if (!estadoPendiente) {
    throw new AppError('Estado Pendiente no configurado', 500);
  }

  // Generar código y NCF
  const codigo = await generateCodigoFactura();
  const ncf = data.ncf || await generateNCF();

  // Calcular totales
  let subtotal = 0;
  let totalItbis = 0;

  data.items.forEach(item => {
    const itemSubtotal = item.cantidad * item.precioUnitario;
    subtotal += itemSubtotal;
    totalItbis += item.itbis;
  });

  const total = subtotal + totalItbis;

  // Crear factura con transacción
  const factura = await prisma.$transaction(async (tx) => {
    const nuevaFactura = await tx.factura.create({
      data: {
        codigo,
        ncf,
        fecha: new Date(),
        subtotal,
        itbis: totalItbis,
        total,
        metodoPago: data.metodoPago,
        observaciones: data.observaciones || null,
        estadoId: estadoPendiente.id,
        clienteId: data.clienteId,
        certificadoId: data.certificadoId
      }
    });

    // Crear items de factura
    for (const item of data.items) {
      await tx.facturaItem.create({
        data: {
          facturaId: nuevaFactura.id,
          concepto: item.concepto,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          itbis: item.itbis,
          subtotal: item.cantidad * item.precioUnitario,
          total: (item.cantidad * item.precioUnitario) + item.itbis
        }
      });
    }

    return nuevaFactura;
  });

  // Obtener factura completa
  const facturaCompleta = await prisma.factura.findUnique({
    where: { id: factura.id },
    include: {
      estado: true,
      cliente: true,
      certificado: true,
      items: true
    }
  });

  res.status(201).json(facturaCompleta);
});

// PUT /api/facturas/:id/pagar
export const pagarFactura = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);

  if (!req.usuario) {
    throw new AppError('No autenticado', 401);
  }

  const { cajaId, metodoPago, referencia } = req.body;

  if (!cajaId) {
    throw new AppError('ID de caja requerido', 400);
  }

  // Verificar que la factura existe
  const factura = await prisma.factura.findUnique({
    where: { id },
    include: { estado: true }
  });

  if (!factura) {
    throw new AppError('Factura no encontrada', 404);
  }

  if (factura.estado.nombre === 'Pagada') {
    throw new AppError('La factura ya está pagada', 400);
  }

  if (factura.estado.nombre === 'Anulada') {
    throw new AppError('No se puede pagar una factura anulada', 400);
  }

  // Verificar que la caja existe y está abierta
  const caja = await prisma.caja.findUnique({
    where: { id: cajaId },
    include: { estado: true }
  });

  if (!caja) {
    throw new AppError('Caja no encontrada', 404);
  }

  if (caja.estado.nombre !== 'Abierta') {
    throw new AppError('La caja debe estar abierta para procesar pagos', 400);
  }

  // Estado: Pagada
  const estadoPagada = await prisma.facturaEstado.findFirst({
    where: { nombre: 'Pagada' }
  });

  if (!estadoPagada) {
    throw new AppError('Estado Pagada no configurado', 500);
  }

  // Actualizar factura
  const facturaActualizada = await prisma.factura.update({
    where: { id },
    data: {
      estadoId: estadoPagada.id,
      cajaId,
      metodoPago: metodoPago || factura.metodoPago,
      fechaPago: new Date(),
      referenciaPago: referencia || null
    },
    include: {
      estado: true,
      cliente: true,
      certificado: true,
      items: true,
      caja: true
    }
  });

  res.json({
    message: 'Factura pagada exitosamente',
    factura: facturaActualizada
  });
});

// PUT /api/facturas/:id/anular
export const anularFactura = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);

  if (!req.usuario) {
    throw new AppError('No autenticado', 401);
  }

  const { motivo } = req.body;

  if (!motivo) {
    throw new AppError('Motivo de anulación requerido', 400);
  }

  const factura = await prisma.factura.findUnique({
    where: { id },
    include: { estado: true }
  });

  if (!factura) {
    throw new AppError('Factura no encontrada', 404);
  }

  if (factura.estado.nombre === 'Anulada') {
    throw new AppError('La factura ya está anulada', 400);
  }

  if (factura.estado.nombre === 'Pagada') {
    throw new AppError('No se puede anular una factura pagada. Debe emitir nota de crédito', 400);
  }

  const estadoAnulada = await prisma.facturaEstado.findFirst({
    where: { nombre: 'Anulada' }
  });

  if (!estadoAnulada) {
    throw new AppError('Estado Anulada no configurado', 500);
  }

  const facturaActualizada = await prisma.factura.update({
    where: { id },
    data: {
      estadoId: estadoAnulada.id,
      observaciones: `ANULADA: ${motivo}. ${factura.observaciones || ''}`
    },
    include: {
      estado: true,
      cliente: true,
      certificado: true
    }
  });

  res.json({
    message: 'Factura anulada exitosamente',
    factura: facturaActualizada
  });
});

// GET /api/facturas/estados
export const getEstadosFactura = asyncHandler(async (req: Request, res: Response) => {
  const estados = await prisma.facturaEstado.findMany({
    orderBy: { nombre: 'asc' }
  });

  res.json(estados);
});

// GET /api/facturas/reporte/ventas
export const getReporteVentas = asyncHandler(async (req: Request, res: Response) => {
  const fechaInicio = req.query.fechaInicio ? new Date(req.query.fechaInicio as string) : undefined;
  const fechaFin = req.query.fechaFin ? new Date(req.query.fechaFin as string) : undefined;

  if (!fechaInicio || !fechaFin) {
    throw new AppError('Fechas de inicio y fin requeridas', 400);
  }

  const where: any = {
    fecha: {
      gte: fechaInicio,
      lte: fechaFin
    }
  };

  const facturas = await prisma.factura.findMany({
    where,
    include: {
      estado: true,
      cliente: {
        select: {
          nombrecompleto: true,
          rnc: true
        }
      },
      items: true
    },
    orderBy: { fecha: 'asc' }
  });

  // Calcular totales
  let totalGeneral = 0;
  let totalItbis = 0;
  let totalPagadas = 0;
  let totalPendientes = 0;

  facturas.forEach(f => {
    if (f.estado.nombre === 'Pagada') {
      totalPagadas += Number(f.total);
    } else if (f.estado.nombre === 'Pendiente') {
      totalPendientes += Number(f.total);
    }
    totalGeneral += Number(f.total);
    totalItbis += Number(f.itbis);
  });

  res.json({
    facturas,
    resumen: {
      totalFacturas: facturas.length,
      totalGeneral,
      totalItbis,
      totalPagadas,
      totalPendientes,
      fechaInicio,
      fechaFin
    }
  });
});

// DELETE /api/facturas/:id
export const deleteFactura = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const factura = await prisma.factura.findUnique({
    where: { id },
    include: { estado: true }
  });

  if (!factura) {
    throw new AppError('Factura no encontrada', 404);
  }

  if (factura.estado.nombre === 'Pagada') {
    throw new AppError('No se puede eliminar una factura pagada', 400);
  }

  await prisma.factura.delete({ where: { id } });

  res.json({ message: 'Factura eliminada exitosamente' });
});
