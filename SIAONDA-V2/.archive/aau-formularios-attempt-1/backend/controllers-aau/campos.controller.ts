import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Obtener campos dinámicos por producto
export const getCamposByProducto = async (req: AuthRequest, res: Response) => {
  try {
    const { productoId } = req.params;

    const campos = await prisma.formularioCampo.findMany({
      where: {
        productoId: Number(productoId),
        activo: true
      },
      include: {
        tipo: true
      },
      orderBy: {
        orden: 'asc'
      }
    });

    res.json({
      success: true,
      data: campos
    });
  } catch (error) {
    console.error('Error al obtener campos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener campos del producto'
    });
  }
};

// Obtener todos los tipos de campos
export const getTiposCampos = async (req: AuthRequest, res: Response) => {
  try {
    const tipos = await prisma.formularioCampoTipo.findMany({
      orderBy: {
        nombre: 'asc'
      }
    });

    res.json({
      success: true,
      data: tipos
    });
  } catch (error) {
    console.error('Error al obtener tipos de campos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tipos de campos'
    });
  }
};

// Obtener campos globales (no asociados a un producto específico)
export const getCamposGlobales = async (req: AuthRequest, res: Response) => {
  try {
    const campos = await prisma.formularioCampo.findMany({
      where: {
        productoId: null,
        activo: true
      },
      include: {
        tipo: true
      },
      orderBy: {
        orden: 'asc'
      }
    });

    res.json({
      success: true,
      data: campos
    });
  } catch (error) {
    console.error('Error al obtener campos globales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener campos globales'
    });
  }
};

// Crear nuevo campo dinámico (solo admin)
export const createCampo = async (req: AuthRequest, res: Response) => {
  try {
    const { productoId, tipoId, campo, titulo, descripcion, placeholder, requerido, orden, grupo } = req.body;

    // Validaciones
    if (!tipoId || !campo || !titulo) {
      return res.status(400).json({
        success: false,
        message: 'Los campos tipoId, campo y titulo son requeridos'
      });
    }

    // Verificar si el campo ya existe para ese producto
    const existeCampo = await prisma.formularioCampo.findFirst({
      where: {
        productoId: productoId || null,
        campo
      }
    });

    if (existeCampo) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un campo con ese nombre para este producto'
      });
    }

    const nuevoCampo = await prisma.formularioCampo.create({
      data: {
        productoId: productoId || null,
        tipoId,
        campo,
        titulo,
        descripcion: descripcion || null,
        placeholder: placeholder || null,
        requerido: requerido || false,
        orden: orden || 0,
        grupo: grupo || null,
        activo: true
      },
      include: {
        tipo: true,
        producto: {
          select: {
            codigo: true,
            nombre: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Campo creado exitosamente',
      data: nuevoCampo
    });
  } catch (error) {
    console.error('Error al crear campo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear campo'
    });
  }
};

// Actualizar campo dinámico
export const updateCampo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, placeholder, requerido, orden, activo, grupo } = req.body;

    const campoExistente = await prisma.formularioCampo.findUnique({
      where: { id: Number(id) }
    });

    if (!campoExistente) {
      return res.status(404).json({
        success: false,
        message: 'Campo no encontrado'
      });
    }

    const data: any = {};
    if (titulo !== undefined) data.titulo = titulo;
    if (descripcion !== undefined) data.descripcion = descripcion;
    if (placeholder !== undefined) data.placeholder = placeholder;
    if (requerido !== undefined) data.requerido = requerido;
    if (orden !== undefined) data.orden = orden;
    if (activo !== undefined) data.activo = activo;
    if (grupo !== undefined) data.grupo = grupo;

    const campoActualizado = await prisma.formularioCampo.update({
      where: { id: Number(id) },
      data,
      include: {
        tipo: true,
        producto: {
          select: {
            codigo: true,
            nombre: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Campo actualizado exitosamente',
      data: campoActualizado
    });
  } catch (error) {
    console.error('Error al actualizar campo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar campo'
    });
  }
};

// Eliminar campo (soft delete - marcar como inactivo)
export const deleteCampo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const campoExistente = await prisma.formularioCampo.findUnique({
      where: { id: Number(id) }
    });

    if (!campoExistente) {
      return res.status(404).json({
        success: false,
        message: 'Campo no encontrado'
      });
    }

    // Verificar si el campo tiene valores guardados
    const tieneValores = await prisma.formularioProductoCampo.count({
      where: { campoId: Number(id) }
    });

    if (tieneValores > 0) {
      // Si tiene valores, solo marcar como inactivo
      await prisma.formularioCampo.update({
        where: { id: Number(id) },
        data: { activo: false }
      });

      return res.json({
        success: true,
        message: 'Campo marcado como inactivo (tiene valores guardados)'
      });
    }

    // Si no tiene valores, eliminar físicamente
    await prisma.formularioCampo.delete({
      where: { id: Number(id) }
    });

    res.json({
      success: true,
      message: 'Campo eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar campo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar campo'
    });
  }
};
