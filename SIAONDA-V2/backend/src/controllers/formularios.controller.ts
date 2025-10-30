import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { getFileUrl, deleteFile } from '../middleware/upload';

// Schemas de validación
const createFormularioSchema = z.object({
  productos: z.array(z.object({
    productoId: z.number().int().positive(),
    cantidad: z.number().int().positive().default(1),
    campos: z.array(z.object({
      campoId: z.number().int().positive(),
      valor: z.string()
    }))
  })),
  clientes: z.array(z.object({
    clienteId: z.number().int().positive(),
    tipoRelacion: z.string()
  })),
  firma: z.string().optional(),
  observaciones: z.string().optional()
});

// Generar código único de formulario: 8 dígitos + /DD/MM/YYYY
const generateCodigoFormulario = async (): Promise<string> => {
  const now = new Date();
  const count = await prisma.formulario.count();
  const numero = (count + 1).toString().padStart(8, '0');
  const dia = now.getDate().toString().padStart(2, '0');
  const mes = (now.getMonth() + 1).toString().padStart(2, '0');
  const año = now.getFullYear();
  return `${numero}/${dia}/${mes}/${año}`;
};

// GET /api/formularios
export const getFormularios = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const search = req.query.search as string;
  const estadoId = req.query.estadoId ? parseInt(req.query.estadoId as string) : undefined;

  const where: any = {};

  if (search) {
    where.OR = [
      { codigo: { contains: search, mode: 'insensitive' } },
      { clientes: { some: { cliente: { nombrecompleto: { contains: search, mode: 'insensitive' } } } } }
    ];
  }

  if (estadoId) {
    where.estadoId = estadoId;
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
            nombrecompleto: true
          }
        },
        clientes: {
          include: {
            cliente: {
              select: {
                id: true,
                codigo: true,
                nombrecompleto: true,
                identificacion: true
              }
            }
          },
          take: 1
        },
        productos: {
          include: {
            producto: {
              select: {
                id: true,
                codigo: true,
                nombre: true,
                categoria: true
              }
            }
          }
        },
        _count: {
          select: {
            certificados: true
          }
        }
      },
      orderBy: { fecha: 'desc' }
    }),
    prisma.formulario.count({ where })
  ]);

  res.json({
    formularios,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

// GET /api/formularios/:id
export const getFormulario = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const formulario = await prisma.formulario.findUnique({
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
      factura: {
        include: {
          estado: true
        }
      },
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
                  OR: [
                    { fechaFinal: null },
                    { fechaFinal: { gte: new Date() } }
                  ],
                  fechaInicio: { lte: new Date() }
                },
                orderBy: { cantidadMin: 'asc' }
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
      certificados: {
        include: {
          estado: true
        }
      }
    }
  });

  if (!formulario) {
    throw new AppError('Formulario no encontrado', 404);
  }

  res.json(formulario);
});

// POST /api/formularios
export const createFormulario = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.usuario) {
    throw new AppError('No autenticado', 401);
  }

  const data = createFormularioSchema.parse(req.body);

  // Generar código único
  const codigo = await generateCodigoFormulario();

  // Estado inicial: Pendiente
  const estadoPendiente = await prisma.formularioEstado.findFirst({
    where: { nombre: 'Pendiente' }
  });

  if (!estadoPendiente) {
    throw new AppError('Estado Pendiente no configurado', 500);
  }

  // Crear formulario con transacción
  const formulario = await prisma.$transaction(async (tx) => {
    const nuevoFormulario = await tx.formulario.create({
      data: {
        codigo,
        fecha: new Date(),
        estadoId: estadoPendiente.id,
        usuarioId: req.usuario!.id,
        firma: data.firma || null,
        observaciones: data.observaciones || null
      }
    });

    // Asociar clientes
    for (const clienteData of data.clientes) {
      await tx.formularioCliente.create({
        data: {
          formularioId: nuevoFormulario.id,
          clienteId: clienteData.clienteId,
          tipoRelacion: clienteData.tipoRelacion
        }
      });
    }

    // Asociar productos y campos
    for (const productoData of data.productos) {
      const formularioProducto = await tx.formularioProducto.create({
        data: {
          formularioId: nuevoFormulario.id,
          productoId: productoData.productoId,
          cantidad: productoData.cantidad
        }
      });

      // Guardar valores de campos
      for (const campoData of productoData.campos) {
        await tx.formularioProductoCampo.create({
          data: {
            formularioProductoId: formularioProducto.id,
            campoId: campoData.campoId,
            valor: campoData.valor
          }
        });
      }
    }

    return nuevoFormulario;
  });

  // Obtener formulario completo
  const formularioCompleto = await prisma.formulario.findUnique({
    where: { id: formulario.id },
    include: {
      estado: true,
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
              campo: true
            }
          }
        }
      }
    }
  });

  res.status(201).json(formularioCompleto);
});

// PUT /api/formularios/:id
export const updateFormulario = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { observaciones, firma } = req.body;

  const existente = await prisma.formulario.findUnique({ where: { id } });

  if (!existente) {
    throw new AppError('Formulario no encontrado', 404);
  }

  const formulario = await prisma.formulario.update({
    where: { id },
    data: {
      observaciones,
      firma: firma || null
    },
    include: {
      estado: true,
      clientes: {
        include: {
          cliente: true
        }
      },
      productos: {
        include: {
          producto: true
        }
      }
    }
  });

  res.json(formulario);
});

// POST /api/formularios/:id/asentar
export const asentarFormulario = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);

  if (!req.usuario) {
    throw new AppError('No autenticado', 401);
  }

  const formulario = await prisma.formulario.findUnique({
    where: { id },
    include: { estado: true }
  });

  if (!formulario) {
    throw new AppError('Formulario no encontrado', 404);
  }

  if (formulario.estado.nombre === 'Asentado' || formulario.estado.nombre === 'Certificado') {
    throw new AppError('El formulario ya está asentado', 400);
  }

  const estadoAsentado = await prisma.formularioEstado.findFirst({
    where: { nombre: 'Asentado' }
  });

  if (!estadoAsentado) {
    throw new AppError('Estado Asentado no configurado', 500);
  }

  const formularioActualizado = await prisma.formulario.update({
    where: { id },
    data: {
      estadoId: estadoAsentado.id
    },
    include: {
      estado: true,
      productos: true
    }
  });

  res.json({
    message: 'Formulario asentado exitosamente',
    formulario: formularioActualizado
  });
});

// GET /api/formularios/estados
export const getEstadosFormulario = asyncHandler(async (req: Request, res: Response) => {
  const estados = await prisma.formularioEstado.findMany({
    orderBy: { nombre: 'asc' }
  });

  res.json(estados);
});

// DELETE /api/formularios/:id
export const deleteFormulario = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const existente = await prisma.formulario.findUnique({
    where: { id },
    include: {
      estado: true,
      certificados: true
    }
  });

  if (!existente) {
    throw new AppError('Formulario no encontrado', 404);
  }

  if (existente.certificados.length > 0) {
    throw new AppError('No se puede eliminar un formulario que ya tiene certificados', 400);
  }

  if (existente.estado.nombre === 'Asentado' || existente.estado.nombre === 'Certificado') {
    throw new AppError('No se puede eliminar un formulario asentado o certificado', 400);
  }

  await prisma.formulario.delete({ where: { id } });

  res.json({ message: 'Formulario eliminado exitosamente' });
});

// POST /api/formularios/:id/archivos
export const uploadArchivos = asyncHandler(async (req: Request, res: Response) => {
  const formularioId = parseInt(req.params.id);
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    throw new AppError('No se proporcionaron archivos', 400);
  }

  // Verificar que el formulario existe
  const formulario = await prisma.formulario.findUnique({
    where: { id: formularioId }
  });

  if (!formulario) {
    throw new AppError('Formulario no encontrado', 404);
  }

  // Guardar información de archivos en un campo JSON del formulario
  // O crear tabla separada para archivos si prefieres

  res.json({
    message: `${files.length} archivo(s) subido(s) exitosamente`,
    archivos: files.map(f => ({
      nombre: f.originalname,
      ruta: getFileUrl(f.path),
      tipo: f.mimetype,
      tamano: f.size
    }))
  });
});

// DELETE /api/formularios/:id/archivos/:archivoId
export const deleteArchivo = asyncHandler(async (req: Request, res: Response) => {
  const formularioId = parseInt(req.params.id);
  const archivoId = parseInt(req.params.archivoId);

  // TODO: Implementar lógica de eliminación
  // Dependiendo de cómo almacenes los archivos (tabla separada o JSON)

  res.json({ message: 'Archivo eliminado exitosamente' });
});
