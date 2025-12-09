import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Listar todos los formularios con filtros
export const getFormularios = async (req: AuthRequest, res: Response) => {
  try {
    const { estado, fechaInicio, fechaFin, codigo, clienteId } = req.query;

    const where: any = {};

    if (estado) {
      const estadoRecord = await prisma.formularioEstado.findFirst({
        where: { nombre: String(estado) }
      });
      if (estadoRecord) {
        where.estadoId = estadoRecord.id;
      }
    }

    if (fechaInicio || fechaFin) {
      where.fecha = {};
      if (fechaInicio) where.fecha.gte = new Date(String(fechaInicio));
      if (fechaFin) where.fecha.lte = new Date(String(fechaFin));
    }

    if (codigo) {
      where.codigo = { contains: String(codigo), mode: 'insensitive' };
    }

    if (clienteId) {
      where.clientes = {
        some: { clienteId: Number(clienteId) }
      };
    }

    const formularios = await prisma.formulario.findMany({
      where,
      include: {
        estado: true,
        usuario: { select: { nombrecompleto: true, codigo: true } },
        clientes: {
          include: {
            cliente: { select: { nombrecompleto: true, identificacion: true } }
          }
        },
        productos: {
          include: {
            producto: { select: { nombre: true, codigo: true, categoria: true } }
          }
        },
        factura: { select: { codigo: true, total: true, estadoId: true } }
      },
      orderBy: { creadoEn: 'desc' }
    });

    res.json({
      success: true,
      data: formularios
    });
  } catch (error) {
    console.error('Error al listar formularios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al listar formularios'
    });
  }
};

// Obtener un formulario por ID con todos los detalles
export const getFormularioById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const formulario = await prisma.formulario.findUnique({
      where: { id: Number(id) },
      include: {
        estado: true,
        usuario: { select: { nombrecompleto: true, codigo: true } },
        clientes: {
          include: {
            cliente: true
          }
        },
        productos: {
          include: {
            producto: {
              include: {
                costos: {
                  where: {
                    fechaInicio: { lte: new Date() },
                    OR: [
                      { fechaFinal: null },
                      { fechaFinal: { gte: new Date() } }
                    ]
                  },
                  orderBy: { fechaInicio: 'desc' },
                  take: 1
                }
              }
            },
            campos: {
              include: {
                campo: {
                  include: {
                    tipo: true
                  }
                }
              }
            }
          }
        },
        archivos: true,
        factura: {
          include: {
            estado: true
          }
        }
      }
    });

    if (!formulario) {
      return res.status(404).json({
        success: false,
        message: 'Formulario no encontrado'
      });
    }

    res.json({
      success: true,
      data: formulario
    });
  } catch (error) {
    console.error('Error al obtener formulario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener formulario'
    });
  }
};

// Crear nuevo formulario
export const createFormulario = async (req: AuthRequest, res: Response) => {
  try {
    const { clientes, productos, firma, observaciones } = req.body;
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    // Validaciones
    if (!clientes || !Array.isArray(clientes) || clientes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debe incluir al menos un cliente/autor'
      });
    }

    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debe incluir al menos un producto/obra'
      });
    }

    // Obtener estado "Pendiente"
    const estadoPendiente = await prisma.formularioEstado.findFirst({
      where: { nombre: 'Pendiente' }
    });

    if (!estadoPendiente) {
      return res.status(500).json({
        success: false,
        message: 'Estado "Pendiente" no encontrado en el sistema'
      });
    }

    // Generar código único del formulario
    const año = new Date().getFullYear();
    const ultimoFormulario = await prisma.formulario.findFirst({
      where: {
        codigo: { startsWith: `FORM-${año}-` }
      },
      orderBy: { codigo: 'desc' }
    });

    let nuevoNumero = 1;
    if (ultimoFormulario) {
      const match = ultimoFormulario.codigo.match(/FORM-\d{4}-(\d+)/);
      if (match) {
        nuevoNumero = parseInt(match[1]) + 1;
      }
    }

    const codigo = `FORM-${año}-${String(nuevoNumero).padStart(4, '0')}`;

    // Calcular monto total
    let montoTotal = 0;
    for (const producto of productos) {
      const productoCosto = await prisma.productoCosto.findFirst({
        where: {
          productoId: producto.productoId,
          fechaInicio: { lte: new Date() },
          OR: [
            { fechaFinal: null },
            { fechaFinal: { gte: new Date() } }
          ]
        },
        orderBy: { fechaInicio: 'desc' }
      });

      if (productoCosto) {
        montoTotal += Number(productoCosto.precio) * (producto.cantidad || 1);
      }
    }

    // Crear formulario con transacción
    const formulario = await prisma.$transaction(async (tx) => {
      // Crear formulario
      const nuevoFormulario = await tx.formulario.create({
        data: {
          codigo,
          fecha: new Date(),
          estadoId: estadoPendiente.id,
          usuarioId,
          firma: firma || null,
          observaciones: observaciones || null,
          montoTotal
        }
      });

      // Crear relaciones con clientes
      for (const cliente of clientes) {
        await tx.formularioCliente.create({
          data: {
            formularioId: nuevoFormulario.id,
            clienteId: cliente.clienteId,
            tipoRelacion: cliente.tipoRelacion || 'Autor'
          }
        });
      }

      // Crear productos con sus campos
      for (const producto of productos) {
        const formularioProducto = await tx.formularioProducto.create({
          data: {
            formularioId: nuevoFormulario.id,
            productoId: producto.productoId,
            cantidad: producto.cantidad || 1
          }
        });

        // Guardar valores de campos dinámicos
        if (producto.campos && Array.isArray(producto.campos)) {
          for (const campo of producto.campos) {
            await tx.formularioProductoCampo.create({
              data: {
                formularioProductoId: formularioProducto.id,
                campoId: campo.campoId,
                valor: campo.valor || ''
              }
            });
          }
        }
      }

      return nuevoFormulario;
    });

    // Obtener formulario completo
    const formularioCompleto = await prisma.formulario.findUnique({
      where: { id: formulario.id },
      include: {
        estado: true,
        usuario: { select: { nombrecompleto: true, codigo: true } },
        clientes: {
          include: {
            cliente: true
          }
        },
        productos: {
          include: {
            producto: true,
            campos: {
              include: {
                campo: {
                  include: {
                    tipo: true
                  }
                }
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Formulario creado exitosamente',
      data: formularioCompleto
    });
  } catch (error) {
    console.error('Error al crear formulario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear formulario'
    });
  }
};

// Actualizar estado de formulario
export const updateEstadoFormulario = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { estadoNombre, libro, hoja, fechaAsentamiento, mensajeDevolucion, fechaEntrega } = req.body;

    const formulario = await prisma.formulario.findUnique({
      where: { id: Number(id) }
    });

    if (!formulario) {
      return res.status(404).json({
        success: false,
        message: 'Formulario no encontrado'
      });
    }

    const nuevoEstado = await prisma.formularioEstado.findFirst({
      where: { nombre: estadoNombre }
    });

    if (!nuevoEstado) {
      return res.status(404).json({
        success: false,
        message: `Estado "${estadoNombre}" no encontrado`
      });
    }

    const data: any = {
      estadoId: nuevoEstado.id
    };

    // Campos específicos según el estado
    if (estadoNombre === 'Asentado') {
      data.libro = libro;
      data.hoja = hoja;
      data.fechaAsentamiento = fechaAsentamiento ? new Date(fechaAsentamiento) : new Date();
    }

    if (estadoNombre === 'Devuelto') {
      data.mensajeDevolucion = mensajeDevolucion;
      data.fechaDevolucion = new Date();
    }

    if (estadoNombre === 'Entregado') {
      data.fechaEntrega = fechaEntrega ? new Date(fechaEntrega) : new Date();
    }

    const formularioActualizado = await prisma.formulario.update({
      where: { id: Number(id) },
      data,
      include: {
        estado: true,
        usuario: { select: { nombrecompleto: true } },
        clientes: {
          include: {
            cliente: { select: { nombrecompleto: true } }
          }
        }
      }
    });

    res.json({
      success: true,
      message: `Formulario actualizado a estado "${estadoNombre}"`,
      data: formularioActualizado
    });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado del formulario'
    });
  }
};

// Eliminar formulario (solo si está en estado Pendiente)
export const deleteFormulario = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const formulario = await prisma.formulario.findUnique({
      where: { id: Number(id) },
      include: { estado: true }
    });

    if (!formulario) {
      return res.status(404).json({
        success: false,
        message: 'Formulario no encontrado'
      });
    }

    if (formulario.estado.nombre !== 'Pendiente') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden eliminar formularios en estado Pendiente'
      });
    }

    await prisma.formulario.delete({
      where: { id: Number(id) }
    });

    res.json({
      success: true,
      message: 'Formulario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar formulario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar formulario'
    });
  }
};

// Obtener estadísticas de formularios
export const getEstadisticas = async (req: AuthRequest, res: Response) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const mañana = new Date(hoy);
    mañana.setDate(mañana.getDate() + 1);

    const [
      totalFormularios,
      formulariosHoy,
      estadosPendientes,
      estadosRecibidos,
      estadosAsentados,
      estadosConCertificado
    ] = await Promise.all([
      prisma.formulario.count(),
      prisma.formulario.count({
        where: {
          creadoEn: { gte: hoy, lt: mañana }
        }
      }),
      prisma.formulario.count({
        where: {
          estado: { nombre: 'Pendiente' }
        }
      }),
      prisma.formulario.count({
        where: {
          estado: { nombre: 'Recibido' }
        }
      }),
      prisma.formulario.count({
        where: {
          estado: { nombre: 'Asentado' }
        }
      }),
      prisma.formulario.count({
        where: {
          estado: { nombre: 'Con Certificado' }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalFormularios,
        formulariosHoy,
        estadosPendientes,
        estadosRecibidos,
        estadosAsentados,
        estadosConCertificado
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
};
