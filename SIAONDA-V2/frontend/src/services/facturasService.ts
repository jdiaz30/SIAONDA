import { api } from './api';

export interface FacturaEstado {
  id: number;
  nombre: string;
  descripcion: string | null;
}

export interface FacturaItem {
  id: number;
  concepto: string;
  cantidad: number;
  precioUnitario: number;
  itbis: number;
  subtotal: number;
  total: number;
}

export interface Factura {
  id: number;
  codigo: string;
  ncf: string | null;
  fecha: string;
  subtotal: number;
  itbis: number;
  total: number;
  pagado: number;
  metodoPago: string | null;
  fechaPago: string | null;
  referenciaPago: string | null;
  observaciones: string | null;
  estadoId: number;
  clienteId: number;
  cajaId: number | null;
  estado: FacturaEstado;
  cliente: {
    id: number;
    codigo: string;
    nombrecompleto: string;
    identificacion: string;
    rnc: string | null;
  };
  items: FacturaItem[];
  caja?: {
    id: number;
    codigo: string;
  };
}

const facturasService = {
  // Obtener todas las facturas con paginación y filtros
  getFacturas: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    estadoId?: number;
    fechaInicio?: string;
    fechaFin?: string;
  }) => {
    const response = await api.get('/facturas', { params });
    return response.data;
  },

  // Obtener una factura por ID
  getFactura: async (id: number): Promise<Factura> => {
    const response = await api.get(`/facturas/${id}`);
    return response.data;
  },

  // Crear factura desde certificado
  createFactura: async (data: {
    certificadoId: number;
    clienteId: number;
    items: {
      concepto: string;
      cantidad: number;
      precioUnitario: number;
      itbis: number;
    }[];
    metodoPago: string;
    ncf?: string;
    observaciones?: string;
  }) => {
    const response = await api.post('/facturas', data);
    return response.data;
  },

  // Crear factura desde formulario (estado: ABIERTA, sin pagar)
  // Según flujo SIAONDA V1
  createFacturaDesdeFormulario: async (data: {
    formularioId: number;
    solicitarNCF?: boolean;
    rnc?: string;
    descuentoPorcentaje?: number; // 0, 80 o 100
    observaciones?: string;
  }) => {
    const response = await api.post('/facturas/desde-formulario', data);
    return response.data;
  },

  // Pagar una factura abierta (según flujo SIAONDA V1)
  pagarFactura: async (facturaId: number, data: {
    metodoPago: string;
    referenciaPago?: string;
  }) => {
    const response = await api.put(`/facturas/${facturaId}/pagar`, data);
    return response.data;
  },

  // Obtener métodos de pago disponibles
  getMetodosPago: async () => {
    const response = await api.get('/facturas/metodos-pago');
    return response.data;
  },

  // Anular factura
  anularFactura: async (id: number, motivo: string) => {
    const response = await api.put(`/facturas/${id}/anular`, { motivo });
    return response.data;
  },

  // Obtener estados de factura
  getEstadosFactura: async (): Promise<FacturaEstado[]> => {
    const response = await api.get('/facturas/estados');
    return response.data;
  },

  // Obtener reporte de ventas
  getReporteVentas: async (params?: {
    fechaInicio?: string;
    fechaFin?: string;
  }) => {
    const response = await api.get('/facturas/reporte/ventas', { params });
    return response.data;
  },

  // Eliminar factura
  deleteFactura: async (id: number) => {
    const response = await api.delete(`/facturas/${id}`);
    return response.data;
  }
};

export default facturasService;
