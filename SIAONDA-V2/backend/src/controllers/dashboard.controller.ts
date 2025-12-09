import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Obtener estadísticas del dashboard
 */
export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    // Fecha de hoy (inicio y fin del día)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const mañana = new Date(hoy);
    mañana.setDate(mañana.getDate() + 1);

    // Contar formularios creados hoy
    const formulariosHoy = await prisma.formulario.count({
      where: {
        creadoEn: {
          gte: hoy,
          lt: mañana
        }
      }
    });

    // Contar formularios pendientes
    const estadoPendiente = await prisma.formularioEstado.findFirst({
      where: { nombre: 'PENDIENTE' }
    });

    const formulariosPendientes = estadoPendiente
      ? await prisma.formulario.count({
          where: { estadoId: estadoPendiente.id }
        })
      : 0;

    // Contar certificados emitidos hoy
    const certificadosHoy = await prisma.certificado.count({
      where: {
        fechaEmision: {
          gte: hoy,
          lt: mañana
        }
      }
    });

    // Calcular monto facturado hoy
    const facturasHoy = await prisma.factura.aggregate({
      where: {
        fecha: {
          gte: hoy,
          lt: mañana
        }
      },
      _sum: {
        total: true
      },
      _count: true
    });

    const montoHoy = Number(facturasHoy._sum?.total || 0);
    const cantidadFacturasHoy = facturasHoy._count;

    // Verificar si el usuario tiene una caja abierta
    const estadoAbierta = await prisma.cajaEstado.findFirst({
      where: { nombre: 'Abierta' }
    });

    const cajaAbierta = estadoAbierta
      ? await prisma.caja.findFirst({
          where: {
            usuarioId: usuarioId,
            estadoId: estadoAbierta.id
          }
        })
      : null;

    return res.json({
      success: true,
      data: {
        formulariosHoy,
        formulariosPendientes,
        certificadosHoy,
        facturasHoy: cantidadFacturasHoy,
        montoHoy: `RD$ ${montoHoy.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        cajaAbierta: !!cajaAbierta
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};
