import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { AppError, asyncHandler } from '../middleware/errorHandler';

// Schemas de validación
const createVisitaSchema = z.object({
  clienteId: z.number().int().positive(),
  fechaEntrada: z.string().optional(),
  tipoVisita: z.string().min(1, 'Tipo de visita requerido'),
  departamento: z.string().optional(),
  personaContacto: z.string().optional(),
  razonVisita: z.string().optional(),
  nota: z.string().optional()
});

const updateVisitaSchema = createVisitaSchema.partial().extend({
  fechaSalida: z.string().optional()
});

// GET /api/visitas
export const getVisitas = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const clienteId = req.query.clienteId ? parseInt(req.query.clienteId as string) : undefined;
  const activas = req.query.activas === 'true';

  const where: any = {};
  if (clienteId) {
    where.clienteId = clienteId;
  }
  if (activas) {
    where.fechaSalida = null;
  }

  const [visitas, total] = await Promise.all([
    prisma.visita.findMany({
      where,
      skip,
      take: limit,
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
      orderBy: { fechaEntrada: 'desc' }
    }),
    prisma.visita.count({ where })
  ]);

  res.json({
    visitas,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

// GET /api/visitas/:id
export const getVisita = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const visita = await prisma.visita.findUnique({
    where: { id },
    include: {
      cliente: {
        include: {
          tipo: true,
          nacionalidad: true
        }
      }
    }
  });

  if (!visita) {
    throw new AppError('Visita no encontrada', 404);
  }

  res.json(visita);
});

// POST /api/visitas
export const createVisita = asyncHandler(async (req: Request, res: Response) => {
  const data = createVisitaSchema.parse(req.body);

  // Verificar que el cliente existe
  const cliente = await prisma.cliente.findUnique({
    where: { id: data.clienteId }
  });

  if (!cliente) {
    throw new AppError('Cliente no encontrado', 404);
  }

  const visita = await prisma.visita.create({
    data: {
      ...data,
      fechaEntrada: data.fechaEntrada ? new Date(data.fechaEntrada) : new Date()
    },
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
  });

  res.status(201).json(visita);
});

// PUT /api/visitas/:id
export const updateVisita = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const data = updateVisitaSchema.parse(req.body);

  // Verificar que existe
  const existente = await prisma.visita.findUnique({ where: { id } });

  if (!existente) {
    throw new AppError('Visita no encontrada', 404);
  }

  const visita = await prisma.visita.update({
    where: { id },
    data: {
      ...data,
      fechaEntrada: data.fechaEntrada ? new Date(data.fechaEntrada) : undefined,
      fechaSalida: data.fechaSalida ? new Date(data.fechaSalida) : undefined
    },
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
  });

  res.json(visita);
});

// POST /api/visitas/:id/registrar-salida
export const registrarSalida = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const visita = await prisma.visita.findUnique({ where: { id } });

  if (!visita) {
    throw new AppError('Visita no encontrada', 404);
  }

  if (visita.fechaSalida) {
    throw new AppError('La visita ya tiene fecha de salida registrada', 400);
  }

  const visitaActualizada = await prisma.visita.update({
    where: { id },
    data: {
      fechaSalida: new Date()
    },
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
  });

  res.json(visitaActualizada);
});

// DELETE /api/visitas/:id
export const deleteVisita = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const visita = await prisma.visita.findUnique({ where: { id } });

  if (!visita) {
    throw new AppError('Visita no encontrada', 404);
  }

  await prisma.visita.delete({ where: { id } });

  res.json({ message: 'Visita eliminada exitosamente' });
});
