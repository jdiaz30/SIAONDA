import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { generateCertificadoPDF } from '../services/pdf.service';

// Schema de validación para crear certificado
const createCertificadoSchema = z.object({
  formularioId: z.number().int().positive(),
  libroNumero: z.number().int().positive(),
  observaciones: z.string().optional()
});

// Generar código de certificado: 8 dígitos + /DD/MM/YYYY
const generateCodigoCertificado = async (): Promise<string> => {
  const now = new Date();
  const count = await prisma.certificado.count();
  const numero = (count + 1).toString().padStart(8, '0');
  const dia = now.getDate().toString().padStart(2, '0');
  const mes = (now.getMonth() + 1).toString().padStart(2, '0');
  const año = now.getFullYear();
  return `${numero}/${dia}/${mes}/${año}`;
};

// GET /api/certificados
export const getCertificados = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const search = req.query.search as string;
  const estadoId = req.query.estadoId ? parseInt(req.query.estadoId as string) : undefined;

  const where: any = {};

  if (search) {
    where.OR = [
      { codigo: { contains: search, mode: 'insensitive' } },
      { formulario: { codigo: { contains: search, mode: 'insensitive' } } },
      { formulario: { clientes: { some: { cliente: { nombrecompleto: { contains: search, mode: 'insensitive' } } } } } }
    ];
  }

  if (estadoId) {
    where.estadoId = estadoId;
  }

  const [certificados, total] = await Promise.all([
    prisma.certificado.findMany({
      where,
      skip,
      take: limit,
      include: {
        estado: true,
        formulario: {
          include: {
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
              }
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
            }
          }
        },
        facturas: {
          include: {
            estado: true
          }
        }
      },
      orderBy: { fecha: 'desc' }
    }),
    prisma.certificado.count({ where })
  ]);

  res.json({
    certificados,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

// GET /api/certificados/:id
export const getCertificado = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const certificado = await prisma.certificado.findUnique({
    where: { id },
    include: {
      estado: true,
      formulario: {
        include: {
          clientes: {
            include: {
              cliente: {
                include: {
                  tipo: true,
                  nacionalidad: true
                }
              }
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
          },
          estado: true
        }
      },
      facturas: {
        include: {
          estado: true,
          items: true
        }
      }
    }
  });

  if (!certificado) {
    throw new AppError('Certificado no encontrado', 404);
  }

  res.json(certificado);
});

// POST /api/certificados
export const createCertificado = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.usuario) {
    throw new AppError('No autenticado', 401);
  }

  const data = createCertificadoSchema.parse(req.body);

  // Verificar que el formulario existe y está asentado
  const formulario = await prisma.formulario.findUnique({
    where: { id: data.formularioId },
    include: {
      estado: true,
      certificados: true,
      productos: {
        take: 1
      }
    }
  });

  if (!formulario) {
    throw new AppError('Formulario no encontrado', 404);
  }

  if (formulario.estado.nombre !== 'Asentado') {
    throw new AppError('El formulario debe estar asentado para crear un certificado', 400);
  }

  if (formulario.certificados.length > 0) {
    throw new AppError('Este formulario ya tiene un certificado', 400);
  }

  if (!formulario.productos || formulario.productos.length === 0) {
    throw new AppError('El formulario no tiene productos asociados', 400);
  }

  // Estado inicial: En Impresión
  const estadoEnImpresion = await prisma.certificadoEstado.findFirst({
    where: { nombre: 'En Impresión' }
  });

  if (!estadoEnImpresion) {
    throw new AppError('Estado "En Impresión" no configurado', 500);
  }

  // Generar código único
  const codigo = await generateCodigoCertificado();

  // Usar el primer producto del formulario
  const primerProducto = formulario.productos[0];

  // Crear certificado
  const certificado = await prisma.certificado.create({
    data: {
      codigo,
      fecha: new Date(),
      libroNumero: data.libroNumero,
      observaciones: data.observaciones || null,
      estadoId: estadoEnImpresion.id,
      formularioId: data.formularioId,
      formularioProductoId: primerProducto.id
    },
    include: {
      estado: true,
      formulario: {
        include: {
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
      }
    }
  });

  // Cambiar estado del formulario a Certificado
  const estadoCertificado = await prisma.formularioEstado.findFirst({
    where: { nombre: 'Certificado' }
  });

  if (estadoCertificado) {
    await prisma.formulario.update({
      where: { id: data.formularioId },
      data: { estadoId: estadoCertificado.id }
    });
  }

  res.status(201).json(certificado);
});

// POST /api/certificados/:id/generar-pdf
export const generarPDF = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const certificado = await prisma.certificado.findUnique({
    where: { id },
    include: {
      estado: true,
      formulario: {
        include: {
          clientes: {
            include: {
              cliente: {
                include: {
                  tipo: true,
                  nacionalidad: true
                }
              }
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
      }
    }
  });

  if (!certificado) {
    throw new AppError('Certificado no encontrado', 404);
  }

  // Generar PDF usando el servicio
  const pdfBuffer = await generateCertificadoPDF(certificado);

  // Configurar headers para descarga
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=certificado-${certificado.codigo.replace(/\//g, '-')}.pdf`);
  res.send(pdfBuffer);
});

// PUT /api/certificados/:id/estado
export const actualizarEstado = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { estadoId } = req.body;

  if (!estadoId) {
    throw new AppError('Estado requerido', 400);
  }

  const certificado = await prisma.certificado.findUnique({
    where: { id }
  });

  if (!certificado) {
    throw new AppError('Certificado no encontrado', 404);
  }

  const estado = await prisma.certificadoEstado.findUnique({
    where: { id: estadoId }
  });

  if (!estado) {
    throw new AppError('Estado no válido', 400);
  }

  const certificadoActualizado = await prisma.certificado.update({
    where: { id },
    data: { estadoId },
    include: {
      estado: true,
      formulario: {
        include: {
          clientes: {
            include: {
              cliente: true
            }
          }
        }
      }
    }
  });

  res.json(certificadoActualizado);
});

// POST /api/certificados/:id/entregar
export const entregarCertificado = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);

  if (!req.usuario) {
    throw new AppError('No autenticado', 401);
  }

  const certificado = await prisma.certificado.findUnique({
    where: { id },
    include: { estado: true }
  });

  if (!certificado) {
    throw new AppError('Certificado no encontrado', 404);
  }

  if (certificado.estado.nombre === 'Entregado') {
    throw new AppError('El certificado ya fue entregado', 400);
  }

  const estadoEntregado = await prisma.certificadoEstado.findFirst({
    where: { nombre: 'Entregado' }
  });

  if (!estadoEntregado) {
    throw new AppError('Estado "Entregado" no configurado', 500);
  }

  const certificadoActualizado = await prisma.certificado.update({
    where: { id },
    data: {
      estadoId: estadoEntregado.id,
      fechaEntrega: new Date()
    },
    include: {
      estado: true,
      formulario: {
        include: {
          clientes: {
            include: {
              cliente: true
            }
          }
        }
      }
    }
  });

  res.json({
    message: 'Certificado entregado exitosamente',
    certificado: certificadoActualizado
  });
});

// GET /api/certificados/estados
export const getEstadosCertificado = asyncHandler(async (req: Request, res: Response) => {
  const estados = await prisma.certificadoEstado.findMany({
    orderBy: { nombre: 'asc' }
  });

  res.json(estados);
});

// DELETE /api/certificados/:id
export const deleteCertificado = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const certificado = await prisma.certificado.findUnique({
    where: { id },
    include: {
      estado: true,
      facturas: true
    }
  });

  if (!certificado) {
    throw new AppError('Certificado no encontrado', 404);
  }

  if (certificado.estado.nombre === 'Entregado') {
    throw new AppError('No se puede eliminar un certificado entregado', 400);
  }

  if (certificado.facturas && certificado.facturas.length > 0) {
    throw new AppError('No se puede eliminar un certificado que ya tiene factura', 400);
  }

  await prisma.certificado.delete({ where: { id } });

  // Regresar formulario a estado Asentado
  const estadoAsentado = await prisma.formularioEstado.findFirst({
    where: { nombre: 'Asentado' }
  });

  if (estadoAsentado) {
    await prisma.formulario.update({
      where: { id: certificado.formularioId },
      data: { estadoId: estadoAsentado.id }
    });
  }

  res.json({ message: 'Certificado eliminado exitosamente' });
});
