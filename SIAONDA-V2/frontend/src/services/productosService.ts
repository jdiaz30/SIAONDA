import { api } from './api';

export interface ProductoCosto {
  id: number;
  productoId: number;
  precio: number;
  cantidadMin: number;
  cantidadMax: number | null;
  fechaInicio: string;
  fechaFinal: string | null;
}

export interface Producto {
  id: number;
  codigo: string; // IRC001, IRC002, etc.
  nombre: string; // "Obra Musical", "Obra Literaria", etc.
  categoria: string; // "Musical", "Literaria", etc.
  descripcion: string | null;
  estadoId: number;
  estado: {
    id: number;
    nombre: string;
  };
  costos?: ProductoCosto[]; // Costos asociados
  creadoEn: string;
  actualizadoEn: string;
}

export interface ProductoEstado {
  id: number;
  nombre: string;
  descripcion: string | null;
}

export interface ProductoConPrecio extends Producto {
  precio: number; // Precio actual vigente
}

export const productosService = {
  /**
   * Obtener todos los productos activos con precios actuales
   */
  getProductosActivos: async (): Promise<ProductoConPrecio[]> => {
    const response = await api.get('/productos?activos=true&conPrecios=true');
    return response.data;
  },

  /**
   * Obtener todos los productos con precios actuales
   */
  getProductos: async (): Promise<ProductoConPrecio[]> => {
    const response = await api.get('/productos?conPrecios=true');
    return response.data;
  },

  /**
   * Obtener un producto por ID
   */
  getProducto: async (id: number): Promise<Producto> => {
    const response = await api.get(`/productos/${id}`);
    return response.data;
  },

  /**
   * Obtener estados de productos
   */
  getEstados: async (): Promise<ProductoEstado[]> => {
    const response = await api.get('/productos/estados');
    return response.data;
  },

  /**
   * Obtener productos por categoría
   */
  getProductosPorCategoria: async (categoria: string): Promise<Producto[]> => {
    const response = await api.get(`/productos/categoria/${encodeURIComponent(categoria)}`);
    return response.data;
  },
};

export default productosService;
