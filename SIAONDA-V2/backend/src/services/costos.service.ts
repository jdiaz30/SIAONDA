import { prisma } from '../config/database';

/**
 * Obtiene el costo de un producto basado en la cantidad
 * @param productoId - ID del producto
 * @param cantidad - Cantidad solicitada
 * @returns Precio unitario correspondiente a la cantidad
 */
export const obtenerCostoProducto = async (
  productoId: number,
  cantidad: number
): Promise<number> => {
  const now = new Date();

  // Buscar costos vigentes para el producto
  const costos = await prisma.productoCosto.findMany({
    where: {
      productoId,
      fechaInicio: { lte: now },
      OR: [
        { fechaFinal: null },
        { fechaFinal: { gte: now } }
      ]
    },
    orderBy: { cantidadMin: 'asc' }
  });

  if (costos.length === 0) {
    throw new Error(`No hay costos configurados para el producto ${productoId}`);
  }

  // Encontrar el rango de cantidad apropiado
  let costoAplicable = costos[0]; // Inicializar con el primero por defecto

  for (const costo of costos) {
    if (cantidad >= costo.cantidadMin) {
      if (costo.cantidadMax === null || cantidad <= costo.cantidadMax) {
        costoAplicable = costo;
        break;
      }
    }
  }

  return Number(costoAplicable.precio);
};

/**
 * Calcula el costo total de múltiples productos
 * @param productos - Array de productos con sus cantidades
 * @returns Total calculado
 */
export const calcularCostoTotal = async (
  productos: Array<{ productoId: number; cantidad: number }>
): Promise<{ subtotal: number; itbis: number; total: number; detalle: Array<any> }> => {
  let subtotal = 0;
  let itbis = 0;
  const detalle = [];

  for (const item of productos) {
    const precioUnitario = await obtenerCostoProducto(item.productoId, item.cantidad);
    const itemSubtotal = precioUnitario * item.cantidad;

    // ITBIS (18% en República Dominicana) - ajustar según configuración
    const TASA_ITBIS = 0.18;
    const itemItbis = itemSubtotal * TASA_ITBIS;

    subtotal += itemSubtotal;
    itbis += itemItbis;

    detalle.push({
      productoId: item.productoId,
      cantidad: item.cantidad,
      precioUnitario,
      subtotal: itemSubtotal,
      itbis: itemItbis,
      total: itemSubtotal + itemItbis
    });
  }

  return {
    subtotal,
    itbis,
    total: subtotal + itbis,
    detalle
  };
};

/**
 * Verifica si un producto tiene costos vigentes
 * @param productoId - ID del producto
 * @returns true si tiene costos vigentes, false si no
 */
export const tieneCostosVigentes = async (productoId: number): Promise<boolean> => {
  const now = new Date();

  const count = await prisma.productoCosto.count({
    where: {
      productoId,
      fechaInicio: { lte: now },
      OR: [
        { fechaFinal: null },
        { fechaFinal: { gte: now } }
      ]
    }
  });

  return count > 0;
};
