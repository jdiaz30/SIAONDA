import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../../middleware/auth';

const prisma = new PrismaClient();

/**
 * CREAR VIAJE DE OFICIO
 */
export const crearViaje = async (req: AuthRequest, res: Response) => {
  try {
    const { provinciaId, fechaInicio, fechaFin, inspectoresIds, observaciones } = req.body;
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    // Validaciones
    if (!provinciaId || !fechaInicio || !inspectoresIds || inspectoresIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos'
      });
    }

    // Generar código único: VIAJE-OFICIO-YYYY-NNNN
    const año = new Date().getFullYear();
    const ultimoViaje = await prisma.viajeOficio.findFirst({
      where: {
        codigo: {
          startsWith: `VIAJE-OFICIO-${año}-`
        }
      },
      orderBy: { id: 'desc' }
    });

    let numero = 1;
    if (ultimoViaje) {
      const match = ultimoViaje.codigo.match(/VIAJE-OFICIO-\d{4}-(\d{4})/);
      if (match) {
        numero = parseInt(match[1]) + 1;
      }
    }

    const codigo = `VIAJE-OFICIO-${año}-${numero.toString().padStart(4, '0')}`;

    // Obtener estado ABIERTO
    const estadoAbierto = await prisma.estadoViajeOficio.findFirst({
      where: { nombre: 'ABIERTO' }
    });

    if (!estadoAbierto) {
      return res.status(500).json({
        success: false,
        message: 'Estado ABIERTO no encontrado. Ejecuta el seed de estados.'
      });
    }

    // Si no se proporciona fechaFin, usar la misma que fechaInicio (viajes de un día)
    const fechaFinViaje = fechaFin ? new Date(fechaFin) : new Date(fechaInicio);

    // Crear viaje con inspectores asignados
    const viaje = await prisma.viajeOficio.create({
      data: {
        codigo,
        provinciaId: Number(provinciaId),
        fechaInicio: new Date(fechaInicio),
        fechaFin: fechaFinViaje,
        estadoViajeId: estadoAbierto.id,
        observaciones,
        creadoPorId: usuarioId,
        inspectores: {
          create: inspectoresIds.map((inspectorId: number) => ({
            inspectorId: Number(inspectorId)
          }))
        }
      },
      include: {
        provincia: true,
        estadoViaje: true,
        inspectores: {
          include: {
            inspector: {
              select: {
                id: true,
                nombrecompleto: true,
                codigo: true
              }
            }
          }
        },
        creadoPor: {
          select: {
            id: true,
            nombrecompleto: true
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Viaje de oficio creado exitosamente',
      data: viaje
    });
  } catch (error) {
    console.error('Error al crear viaje:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear viaje de oficio',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * LISTAR VIAJES DE OFICIO
 */
export const listarViajes = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, estadoId, provinciaId, search } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    if (estadoId) {
      where.estadoViajeId = Number(estadoId);
    }

    if (provinciaId) {
      where.provinciaId = Number(provinciaId);
    }

    if (search) {
      where.codigo = {
        contains: String(search),
        mode: 'insensitive'
      };
    }

    const [viajes, total] = await Promise.all([
      prisma.viajeOficio.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { id: 'desc' },
        include: {
          provincia: true,
          estadoViaje: true,
          inspectores: {
            include: {
              inspector: {
                select: {
                  id: true,
                  nombrecompleto: true,
                  codigo: true
                }
              }
            }
          },
          creadoPor: {
            select: {
              id: true,
              nombrecompleto: true
            }
          },
          _count: {
            select: {
              actasInspeccion: true
            }
          }
        }
      }),
      prisma.viajeOficio.count({ where })
    ]);

    return res.json({
      success: true,
      data: {
        viajes,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error al listar viajes:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al listar viajes',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * OBTENER VIAJE POR ID
 */
export const obtenerViaje = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const viaje = await prisma.viajeOficio.findUnique({
      where: { id: Number(id) },
      include: {
        provincia: true,
        estadoViaje: true,
        inspectores: {
          include: {
            inspector: {
              select: {
                id: true,
                nombrecompleto: true,
                codigo: true,
                correo: true
              }
            }
          }
        },
        creadoPor: {
          select: {
            id: true,
            nombrecompleto: true
          }
        },
        actasInspeccion: {
          include: {
            inspector: {
              select: {
                id: true,
                nombrecompleto: true
              }
            },
            empresa: {
              select: {
                id: true,
                nombreEmpresa: true,
                rnc: true
              }
            }
          }
        }
      }
    });

    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: 'Viaje no encontrado'
      });
    }

    return res.json({
      success: true,
      data: viaje
    });
  } catch (error) {
    console.error('Error al obtener viaje:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener viaje',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * CERRAR VIAJE (Subir informe general)
 */
export const cerrarViaje = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { observaciones } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Debe subir el informe general del viaje'
      });
    }

    const viaje = await prisma.viajeOficio.findUnique({
      where: { id: Number(id) }
    });

    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: 'Viaje no encontrado'
      });
    }

    // Verificar que el viaje esté ABIERTO
    const estadoAbierto = await prisma.estadoViajeOficio.findFirst({
      where: { nombre: 'ABIERTO' }
    });

    if (viaje.estadoViajeId !== estadoAbierto?.id) {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden cerrar viajes en estado ABIERTO'
      });
    }

    // Obtener estado CERRADO
    const estadoCerrado = await prisma.estadoViajeOficio.findFirst({
      where: { nombre: 'CERRADO' }
    });

    if (!estadoCerrado) {
      return res.status(500).json({
        success: false,
        message: 'Estado CERRADO no encontrado'
      });
    }

    // Actualizar viaje
    const viajeActualizado = await prisma.viajeOficio.update({
      where: { id: Number(id) },
      data: {
        estadoViajeId: estadoCerrado.id,
        fechaFin: new Date(),
        rutaInformeGeneral: file.path,
        observaciones: observaciones || viaje.observaciones
      },
      include: {
        provincia: true,
        estadoViaje: true,
        inspectores: {
          include: {
            inspector: {
              select: {
                id: true,
                nombrecompleto: true
              }
            }
          }
        }
      }
    });

    return res.json({
      success: true,
      message: 'Viaje cerrado exitosamente',
      data: viajeActualizado
    });
  } catch (error) {
    console.error('Error al cerrar viaje:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al cerrar viaje',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

/**
 * CANCELAR VIAJE
 */
export const cancelarViaje = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { motivoCancelacion } = req.body;

    const viaje = await prisma.viajeOficio.findUnique({
      where: { id: Number(id) }
    });

    if (!viaje) {
      return res.status(404).json({
        success: false,
        message: 'Viaje no encontrado'
      });
    }

    // Obtener estado CANCELADO
    const estadoCancelado = await prisma.estadoViajeOficio.findFirst({
      where: { nombre: 'CANCELADO' }
    });

    if (!estadoCancelado) {
      return res.status(500).json({
        success: false,
        message: 'Estado CANCELADO no encontrado'
      });
    }

    const viajeActualizado = await prisma.viajeOficio.update({
      where: { id: Number(id) },
      data: {
        estadoViajeId: estadoCancelado.id,
        observaciones: motivoCancelacion || viaje.observaciones
      },
      include: {
        provincia: true,
        estadoViaje: true
      }
    });

    return res.json({
      success: true,
      message: 'Viaje cancelado',
      data: viajeActualizado
    });
  } catch (error) {
    console.error('Error al cancelar viaje:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al cancelar viaje',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};
