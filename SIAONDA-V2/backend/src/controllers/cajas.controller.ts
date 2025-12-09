import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { format } from 'date-fns';

// Schema de validación para abrir caja
const abrirCajaSchema = z.object({
  descripcion: z.string().min(1),
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

  // Estado: Cierre Abierto
  const estadoCierreAbierto = await prisma.cierreEstado.findFirst({
    where: { nombre: 'Abierto' }
  });

  if (!estadoCierreAbierto) {
    throw new AppError('Estado de cierre Abierto no configurado', 500);
  }

  // Crear caja Y cierre en transacción (según SIAONDA V1)
  const resultado = await prisma.$transaction(async (tx) => {
    // 1. Crear la caja
    const nuevaCaja = await tx.caja.create({
      data: {
        codigo,
        descripcion: data.descripcion,
        fecha: new Date(),
        horaApertura: new Date(),
        montoInicial: 0, // Siempre inicia en 0
        observaciones: data.observaciones || null,
        estadoId: estadoAbierta.id,
        usuarioId: req.usuario!.id
      }
    });

    // 2. Crear cierre automáticamente (según SIAONDA V1: se crea al abrir caja)
    const cierre = await tx.cierre.create({
      data: {
        cajaId: nuevaCaja.id,
        fechaInicio: new Date(),
        fechaFinal: new Date(), // Se actualiza al cerrar
        estadoId: estadoCierreAbierto.id,
        totalEsperado: 0,
        totalReal: 0,
        diferencia: 0
      }
    });

    return { caja: nuevaCaja, cierre };
  });

  // Obtener caja completa con relaciones
  const cajaCompleta = await prisma.caja.findUnique({
    where: { id: resultado.caja.id },
    include: {
      estado: true,
      usuario: {
        select: {
          id: true,
          nombrecompleto: true
        }
      },
      cierres: true
    }
  });

  res.status(201).json({
    message: 'Caja abierta exitosamente (cierre creado automáticamente)',
    caja: cajaCompleta
  });
});

// POST /api/cajas/:id/cerrar
// Implementación según SIAONDA V1: Crear Cierre y asociar facturas
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
      cierres: {
        where: {
          estado: {
            nombre: 'Abierto'
          }
        },
        orderBy: { id: 'desc' },
        take: 1
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

  // Obtener el cierre activo (creado al abrir la caja)
  const cierreActivo = caja.cierres[0];

  if (!cierreActivo) {
    throw new AppError('No se encontró un cierre activo para esta caja', 500);
  }

  // Estados necesarios
  const estadoCajaCerrada = await prisma.cajaEstado.findFirst({
    where: { nombre: 'Cerrada' }
  });

  const estadoCierreCerrado = await prisma.cierreEstado.findFirst({
    where: { nombre: 'Cerrado' }
  });

  const estadoFacturaCerrada = await prisma.facturaEstado.findFirst({
    where: { nombre: 'Cerrada' }
  });

  if (!estadoCajaCerrada || !estadoCierreCerrado || !estadoFacturaCerrada) {
    throw new AppError('Estados no configurados correctamente en la base de datos', 500);
  }

  // Obtener todas las facturas pendientes de asociar al cierre (cierreId = 0)
  // Según SIAONDA V1: buscarparacierre busca WHERE ID_caja = X AND ID_estado NOT IN (1) AND ID_cierre = 0
  // Estado 1 es "Abierta", así que buscamos facturas Pagadas o Cerradas con cierreId = 0
  const facturasParaCierre = await prisma.factura.findMany({
    where: {
      cajaId: id,
      OR: [
        { cierreId: 0 },
        { cierreId: null }
      ],
      estado: {
        nombre: {
          notIn: ['Abierta']
        }
      }
    }
  });

  // Calcular totales (montoInicial siempre es 0)
  const totalFacturas = facturasParaCierre.reduce((sum, f) => sum + Number(f.total), 0);
  const montoEsperado = totalFacturas; // No hay monto inicial
  const diferencia = data.montoFinal - montoEsperado;

  // Realizar operación de cierre en transacción
  const resultado = await prisma.$transaction(async (tx) => {
    // 1. Cerrar el registro de cierre (actualizar fecha_final y estado)
    await tx.cierre.update({
      where: { id: cierreActivo.id },
      data: {
        fechaFinal: new Date(),
        estadoId: estadoCierreCerrado.id,
        totalEsperado: montoEsperado,
        totalReal: data.montoFinal,
        diferencia
      }
    });

    // 2. Asociar TODAS las facturas pagadas/cerradas al cierre
    // UPDATE t_documento SET ID_cierre = X WHERE ID_caja = Y AND ID_cierre = 0
    for (const factura of facturasParaCierre) {
      await tx.factura.update({
        where: { id: factura.id },
        data: {
          cierreId: cierreActivo.id,
          // Si la factura está pagada, cambiar estado a "Cerrada"
          estadoId: factura.estadoId === (await prisma.facturaEstado.findFirst({ where: { nombre: 'Pagada' } }))?.id
            ? estadoFacturaCerrada.id
            : factura.estadoId
        }
      });
    }

    // 3. Cerrar la caja (cambiar estado a Cerrada)
    const cajaActualizada = await tx.caja.update({
      where: { id },
      data: {
        horaCierre: new Date(),
        montoFinal: data.montoFinal,
        totalFacturas,
        diferencia,
        observaciones: data.observaciones
          ? `${caja.observaciones || ''}\nCierre: ${data.observaciones}`
          : caja.observaciones,
        estadoId: estadoCajaCerrada.id,
        // Liberar usuario (según V1: UPDATE t_caja SET ID_usuario = NULL)
        usuarioId: null
      },
      include: {
        estado: true,
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

    return {
      caja: cajaActualizada,
      cierre: cierreActivo,
      facturasAsociadas: facturasParaCierre.length
    };
  });

  res.json({
    message: 'Caja cerrada exitosamente según flujo SIAONDA V1',
    caja: resultado.caja,
    cierreId: resultado.cierre.id,
    facturasAsociadas: resultado.facturasAsociadas,
    diferencia
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
        cliente: f.cliente?.nombrecompleto || 'N/A',
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

// ============================================================================
// SOLICITUDES IRC - INTEGRACIÓN CON CAJA
// ============================================================================

// Schema de validación para cobrar solicitud IRC
const cobrarSolicitudSchema = z.object({
  metodoPago: z.string().min(1),
  referencia: z.string().nullable().optional(),
  observaciones: z.string().nullable().optional(),
  requiereNCF: z.boolean().optional().default(false),
  rnc: z.string().nullable().optional()
});

// GET /api/cajas/solicitudes-pendientes
// Lista de solicitudes IRC (pendientes o pagadas según filtro)
export const getSolicitudesPendientes = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const search = req.query.search as string;
  const estado = req.query.estado as string; // 'PENDIENTE' | 'PAGADA' | undefined (todas)

  const where: any = {};

  // Filtrar por estado si se especifica
  if (estado === 'PENDIENTE') {
    where.factura = null; // Sin factura = pendiente
    where.estado = { nombre: 'PENDIENTE' };
  } else if (estado === 'PAGADA') {
    where.factura = { isNot: null }; // Con factura = pagada
    where.estado = { nombre: 'PAGADA' };
  }
  // Si no se especifica estado, muestra todas

  if (search) {
    where.OR = [
      { codigo: { contains: search, mode: 'insensitive' } },
      { nombreEmpresa: { contains: search, mode: 'insensitive' } },
      { rnc: { contains: search, mode: 'insensitive' } }
    ];
  }

  const [solicitudes, total] = await Promise.all([
    prisma.solicitudRegistroInspeccion.findMany({
      where,
      skip,
      take: limit,
      include: {
        estado: true,
        categoriaIrc: true,
        recibidoPor: {
          select: {
            id: true,
            nombrecompleto: true
          }
        },
        formulario: {
          select: {
            id: true,
            codigo: true
          }
        },
        factura: {
          select: {
            id: true,
            codigo: true,
            ncf: true,
            fecha: true,
            total: true,
            metodoPago: true
          }
        }
      },
      orderBy: { fechaRecepcion: 'desc' }
    }),
    prisma.solicitudRegistroInspeccion.count({ where })
  ]);

  res.json({
    solicitudes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

// POST /api/cajas/cobrar-solicitud/:id
// Registrar pago de una solicitud IRC y generar factura con NCF
export const cobrarSolicitud = asyncHandler(async (req: AuthRequest, res: Response) => {
  const solicitudId = parseInt(req.params.id);

  if (!req.usuario) {
    throw new AppError('No autenticado', 401);
  }

  const data = cobrarSolicitudSchema.parse(req.body);

  // Verificar que la cajera tiene una caja abierta
  const cajaActiva = await prisma.caja.findFirst({
    where: {
      usuarioId: req.usuario.id,
      estado: {
        nombre: 'Abierta'
      }
    }
  });

  if (!cajaActiva) {
    throw new AppError('Debes tener una caja abierta para registrar pagos', 400);
  }

  // Buscar solicitud con su categoría IRC para obtener el precio
  const solicitud = await prisma.solicitudRegistroInspeccion.findUnique({
    where: { id: solicitudId },
    include: {
      categoriaIrc: true,
      factura: true,
      estado: true
    }
  });

  if (!solicitud) {
    throw new AppError('Solicitud no encontrada', 404);
  }

  if (solicitud.factura) {
    throw new AppError('Esta solicitud ya tiene una factura asociada', 400);
  }

  // Calcular monto (precio de la categoría IRC)
  // ONDA es una institución sin fines de lucro, no cobra ITBIS
  const total = Number(solicitud.categoriaIrc.precio);

  // Generar código de factura
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

  // Generar NCF
  const generateNCF = async (tipoComprobante: string = 'B02'): Promise<string> => {
    const secuencia = await prisma.secuenciaNcf.findFirst({
      where: {
        tipoComprobante,
        activo: true,
        numeroActual: {
          lt: prisma.secuenciaNcf.fields.numeroFinal
        },
        fechaVencimiento: {
          gte: new Date()
        }
      },
      orderBy: {
        numeroActual: 'asc'
      }
    });

    if (!secuencia) {
      throw new AppError(
        `No hay secuencias NCF disponibles para el tipo ${tipoComprobante}`,
        500
      );
    }

    const siguienteNumero = secuencia.numeroActual + BigInt(1);
    const ncf = `${tipoComprobante}${secuencia.serie}${siguienteNumero.toString().padStart(8, '0')}`;

    await prisma.secuenciaNcf.update({
      where: { id: secuencia.id },
      data: { numeroActual: siguienteNumero }
    });

    return ncf;
  };

  const codigoFactura = await generateCodigoFactura();

  // Solo generar NCF si el cliente lo requiere
  let ncf: string | null = null;
  if (data.requiereNCF) {
    if (!data.rnc) {
      throw new AppError('Se requiere RNC para emitir comprobante fiscal', 400);
    }
    ncf = await generateNCF('B02'); // B02 = Factura de Consumo
  }

  // Buscar estados necesarios
  const estadoFacturaPagada = await prisma.facturaEstado.findFirst({
    where: { nombre: 'Pagada' }
  });

  const estadoSolicitudPagada = await prisma.estadoSolicitudInspeccion.findFirst({
    where: { nombre: 'PAGADA' }
  });

  if (!estadoFacturaPagada || !estadoSolicitudPagada) {
    throw new AppError('Estados no configurados en el sistema', 500);
  }

  // Crear factura y actualizar solicitud en transacción
  const resultado = await prisma.$transaction(async (tx) => {
    // 1. Crear factura
    const factura = await tx.factura.create({
      data: {
        codigo: codigoFactura,
        ncf: ncf || null,
        rnc: data.rnc || null,
        fecha: new Date(),
        subtotal: total,
        itbis: 0, // ONDA no cobra ITBIS
        descuento: 0,
        total,
        pagado: total, // Monto pagado
        fechaPago: new Date(),
        metodoPago: data.metodoPago,
        referenciaPago: data.referencia || null,
        observaciones: data.observaciones || `Pago de Solicitud IRC ${solicitud.codigo}`,
        estadoId: estadoFacturaPagada.id,
        cajaId: cajaActiva.id,
        cierreId: 0, // Se asociará al cerrar la caja
        clienteId: null // IRC no tiene cliente asociado
      }
    });

    // 2. Crear item de factura
    await tx.facturaItem.create({
      data: {
        facturaId: factura.id,
        concepto: `Solicitud de Registro IRC - ${solicitud.categoriaIrc.nombre}`,
        cantidad: 1,
        precioUnitario: total,
        subtotal: total,
        itbis: 0, // ONDA no cobra ITBIS
        total
      }
    });

    // 3. Vincular factura a solicitud
    await tx.solicitudRegistroInspeccion.update({
      where: { id: solicitudId },
      data: {
        facturaId: factura.id,
        estadoId: estadoSolicitudPagada.id,
        fechaPago: new Date()
      }
    });

    return factura;
  });

  // Obtener factura completa con sus relaciones
  const facturaCompleta = await prisma.factura.findUnique({
    where: { id: resultado.id },
    include: {
      estado: true,
      items: true,
      caja: {
        select: {
          codigo: true,
          usuario: {
            select: {
              nombrecompleto: true
            }
          }
        }
      }
    }
  });

  res.status(201).json({
    message: 'Pago registrado exitosamente',
    factura: facturaCompleta,
    solicitud: {
      codigo: solicitud.codigo,
      nombreEmpresa: solicitud.nombreEmpresa,
      rnc: solicitud.rnc
    }
  });
});
