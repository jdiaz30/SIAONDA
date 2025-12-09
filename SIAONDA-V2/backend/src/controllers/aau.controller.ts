import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * Controlador para el módulo de Atención al Usuario (AaU)
 * Gestiona formularios de registro de obras y servicios
 */

// GET /api/aau/estadisticas/dashboard
export const getEstadisticasDashboard = asyncHandler(async (req: Request, res: Response) => {
  const now = new Date();
  const primerDiaMes = new Date(now.getFullYear(), now.getMonth(), 1);

  // Obtener estados
  const estadoPendiente = await prisma.formularioEstado.findUnique({ where: { nombre: 'PENDIENTE' } });
  const estadoEnRevision = await prisma.formularioEstado.findUnique({ where: { nombre: 'EN_REVISION_REGISTRO' } });
  const estadoDevuelto = await prisma.formularioEstado.findUnique({ where: { nombre: 'DEVUELTO' } });
  const estadoCertificado = await prisma.formularioEstado.findUnique({ where: { nombre: 'CERTIFICADO' } });
  const estadoAsentado = await prisma.formularioEstado.findUnique({ where: { nombre: 'ASENTADO' } });
  const estadoEntregado = await prisma.formularioEstado.findUnique({ where: { nombre: 'ENTREGADO' } });

  // Contar por estado
  const [pendientes, enRevision, devueltos, certificados] = await Promise.all([
    prisma.formulario.count({ where: { estadoId: estadoPendiente?.id } }),
    prisma.formulario.count({ where: { estadoId: estadoEnRevision?.id } }),
    prisma.formulario.count({ where: { estadoId: estadoDevuelto?.id } }),
    prisma.formulario.count({ where: { estadoId: estadoCertificado?.id } }),
  ]);

  // Estadísticas del mes
  const [recibidosMes, asentadosMes, entregadosMes, devueltosMes] = await Promise.all([
    prisma.formulario.count({
      where: {
        fecha: {
          gte: primerDiaMes,
        },
      },
    }),
    prisma.formulario.count({
      where: {
        estadoId: estadoAsentado?.id,
        fechaAsentamiento: {
          gte: primerDiaMes,
        },
      },
    }),
    prisma.formulario.count({
      where: {
        estadoId: estadoEntregado?.id,
        fechaEntrega: {
          gte: primerDiaMes,
        },
      },
    }),
    prisma.formulario.count({
      where: {
        estadoId: estadoDevuelto?.id,
        fechaDevolucion: {
          gte: primerDiaMes,
        },
      },
    }),
  ]);

  res.json({
    pendientes,
    enRevision,
    devueltos,
    certificados,
    recibidosMes,
    asentadosMes,
    entregadosMes,
    devueltosMes,
  });
});

// GET /api/aau/formularios
export const getFormularios = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = (page - 1) * limit;
  const buscar = req.query.buscar as string;
  const estado = req.query.estado as string;
  const tipo = req.query.tipo as string;
  const fechaInicio = req.query.fechaInicio as string;
  const fechaFin = req.query.fechaFin as string;

  const where: any = {};

  // Filtro de búsqueda
  if (buscar) {
    where.OR = [
      { codigo: { contains: buscar, mode: 'insensitive' } },
      {
        clientes: {
          some: {
            cliente: {
              nombrecompleto: { contains: buscar, mode: 'insensitive' },
            },
          },
        },
      },
    ];
  }

  // Filtro de estado
  if (estado) {
    const estadoObj = await prisma.formularioEstado.findUnique({ where: { nombre: estado } });
    if (estadoObj) {
      where.estadoId = estadoObj.id;
    }
  }

  // Filtro de tipo (categoría de producto)
  if (tipo) {
    where.productos = {
      some: {
        producto: {
          categoria: { contains: tipo, mode: 'insensitive' },
        },
      },
    };
  }

  // Filtro de fechas
  if (fechaInicio || fechaFin) {
    where.fecha = {};
    if (fechaInicio) {
      where.fecha.gte = new Date(fechaInicio);
    }
    if (fechaFin) {
      where.fecha.lte = new Date(fechaFin);
    }
  }

  const [formularios, total] = await Promise.all([
    prisma.formulario.findMany({
      where,
      skip,
      take: limit,
      include: {
        estado: true,
        usuario: {
          select: {
            id: true,
            nombrecompleto: true,
          },
        },
        clientes: {
          include: {
            cliente: {
              select: {
                id: true,
                codigo: true,
                nombrecompleto: true,
                identificacion: true,
              },
            },
          },
        },
        productos: {
          include: {
            producto: {
              select: {
                id: true,
                codigo: true,
                nombre: true,
                categoria: true,
              },
            },
          },
        },
        factura: {
          select: {
            id: true,
            codigo: true,
            total: true,
          },
        },
      },
      orderBy: {
        fecha: 'desc',
      },
    }),
    prisma.formulario.count({ where }),
  ]);

  res.json({
    data: formularios,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

// GET /api/aau/formularios/devueltos
export const getFormulariosDevueltos = asyncHandler(async (req: Request, res: Response) => {
  const estadoDevuelto = await prisma.formularioEstado.findUnique({
    where: { nombre: 'DEVUELTO' },
  });

  if (!estadoDevuelto) {
    return res.json({ data: [] });
  }

  const formularios = await prisma.formulario.findMany({
    where: {
      estadoId: estadoDevuelto.id,
    },
    include: {
      estado: true,
      usuario: {
        select: {
          id: true,
          nombrecompleto: true,
        },
      },
      clientes: {
        include: {
          cliente: {
            select: {
              id: true,
              codigo: true,
              nombrecompleto: true,
              identificacion: true,
            },
          },
        },
      },
      productos: {
        include: {
          producto: {
            select: {
              id: true,
              codigo: true,
              nombre: true,
              categoria: true,
            },
          },
        },
      },
    },
    orderBy: {
      fechaDevolucion: 'asc',
    },
  });

  res.json({ data: formularios });
});

// GET /api/aau/formularios/en-revision
export const getFormulariosEnRevision = asyncHandler(async (req: Request, res: Response) => {
  const estadoEnRevision = await prisma.formularioEstado.findUnique({
    where: { nombre: 'EN_REVISION_REGISTRO' },
  });

  if (!estadoEnRevision) {
    return res.json({ data: [] });
  }

  const formularios = await prisma.formulario.findMany({
    where: {
      estadoId: estadoEnRevision.id,
    },
    include: {
      estado: true,
      usuario: {
        select: {
          id: true,
          nombrecompleto: true,
        },
      },
      clientes: {
        include: {
          cliente: {
            select: {
              id: true,
              codigo: true,
              nombrecompleto: true,
              identificacion: true,
            },
          },
        },
      },
      productos: {
        include: {
          producto: {
            select: {
              id: true,
              codigo: true,
              nombre: true,
              categoria: true,
            },
          },
        },
      },
    },
    orderBy: {
      fecha: 'desc',
    },
  });

  res.json({ data: formularios });
});

// GET /api/aau/formularios/pendientes-entrega
export const getCertificadosPendientes = asyncHandler(async (req: Request, res: Response) => {
  const estadoCertificado = await prisma.formularioEstado.findUnique({
    where: { nombre: 'CERTIFICADO' },
  });

  if (!estadoCertificado) {
    return res.json({ data: [] });
  }

  const formularios = await prisma.formulario.findMany({
    where: {
      estadoId: estadoCertificado.id,
    },
    include: {
      estado: true,
      usuario: {
        select: {
          id: true,
          nombrecompleto: true,
        },
      },
      clientes: {
        include: {
          cliente: {
            select: {
              id: true,
              codigo: true,
              nombrecompleto: true,
              identificacion: true,
              telefono: true,
              movil: true,
            },
          },
        },
      },
      productos: {
        include: {
          producto: {
            select: {
              id: true,
              codigo: true,
              nombre: true,
              categoria: true,
            },
          },
        },
      },
      certificados: {
        select: {
          id: true,
          codigo: true,
          fechaEmision: true,
        },
      },
    },
    orderBy: {
      fecha: 'desc',
    },
  });

  res.json({ data: formularios });
});

// POST /api/aau/formularios/:id/enviar-registro
export const enviarARegistro = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const formulario = await prisma.formulario.findUnique({
    where: { id: parseInt(id) },
    include: { estado: true },
  });

  if (!formulario) {
    return res.status(404).json({ message: 'Formulario no encontrado' });
  }

  // Solo se puede enviar si está PAGADO
  if (formulario.estado.nombre !== 'PAGADO') {
    return res.status(400).json({
      message: 'Solo se pueden enviar formularios en estado PAGADO',
    });
  }

  const estadoEnRevision = await prisma.formularioEstado.findUnique({
    where: { nombre: 'EN_REVISION_REGISTRO' },
  });

  if (!estadoEnRevision) {
    return res.status(500).json({ message: 'Estado EN_REVISION_REGISTRO no encontrado' });
  }

  const formularioActualizado = await prisma.formulario.update({
    where: { id: parseInt(id) },
    data: {
      estadoId: estadoEnRevision.id,
    },
    include: {
      estado: true,
    },
  });

  res.json({
    message: 'Formulario enviado a Registro exitosamente',
    data: formularioActualizado,
  });
});

// POST /api/aau/formularios/:id/corregir-reenviar
export const corregirYReenviar = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const datosCorreccion = req.body;

  const formulario = await prisma.formulario.findUnique({
    where: { id: parseInt(id) },
    include: { estado: true },
  });

  if (!formulario) {
    return res.status(404).json({ message: 'Formulario no encontrado' });
  }

  // Solo se puede corregir si está DEVUELTO
  if (formulario.estado.nombre !== 'DEVUELTO') {
    return res.status(400).json({
      message: 'Solo se pueden corregir formularios en estado DEVUELTO',
    });
  }

  const estadoEnRevision = await prisma.formularioEstado.findUnique({
    where: { nombre: 'EN_REVISION_REGISTRO' },
  });

  if (!estadoEnRevision) {
    return res.status(500).json({ message: 'Estado EN_REVISION_REGISTRO no encontrado' });
  }

  // Actualizar formulario con correcciones y cambiar estado
  const formularioActualizado = await prisma.formulario.update({
    where: { id: parseInt(id) },
    data: {
      ...datosCorreccion,
      estadoId: estadoEnRevision.id,
      mensajeDevolucion: null, // Limpiar mensaje de devolución
      fechaDevolucion: null,
    },
    include: {
      estado: true,
      clientes: {
        include: {
          cliente: true,
        },
      },
      productos: {
        include: {
          producto: true,
        },
      },
    },
  });

  // TODO: Registrar en historial (Fase 2)

  res.json({
    message: 'Formulario corregido y reenviado a Registro exitosamente',
    data: formularioActualizado,
  });
});

// POST /api/aau/formularios/:id/entregar
export const registrarEntrega = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { firmaCliente } = req.body;

  const formulario = await prisma.formulario.findUnique({
    where: { id: parseInt(id) },
    include: { estado: true },
  });

  if (!formulario) {
    return res.status(404).json({ message: 'Formulario no encontrado' });
  }

  // Solo se puede entregar si está CERTIFICADO
  if (formulario.estado.nombre !== 'CERTIFICADO') {
    return res.status(400).json({
      message: 'Solo se pueden entregar formularios en estado CERTIFICADO',
    });
  }

  const estadoEntregado = await prisma.formularioEstado.findUnique({
    where: { nombre: 'ENTREGADO' },
  });

  if (!estadoEntregado) {
    return res.status(500).json({ message: 'Estado ENTREGADO no encontrado' });
  }

  const formularioActualizado = await prisma.formulario.update({
    where: { id: parseInt(id) },
    data: {
      estadoId: estadoEntregado.id,
      fechaEntrega: new Date(),
      // Opcional: Guardar firma del cliente si se proporciona
      ...(firmaCliente && { observaciones: `Firma del cliente: ${firmaCliente}` }),
    },
    include: {
      estado: true,
    },
  });

  res.json({
    message: 'Entrega registrada exitosamente',
    data: formularioActualizado,
  });
});

// GET /api/aau/formularios/:id/historial (Fase 2)
export const getHistorial = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // TODO: Implementar tabla de historial en Fase 2
  // Por ahora retornar array vacío
  res.json([]);
});
