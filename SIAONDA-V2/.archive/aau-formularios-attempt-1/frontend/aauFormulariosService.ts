import { api } from './api';

export interface Formulario {
  id: number;
  codigo: string;
  fecha: string;
  estadoId: number;
  usuarioId: number;
  facturaId?: number;
  firma?: string;
  observaciones?: string;
  libro?: string;
  hoja?: string;
  fechaAsentamiento?: string;
  fechaDevolucion?: string;
  mensajeDevolucion?: string;
  fechaEntrega?: string;
  montoTotal: number;
  creadoEn: string;
  actualizadoEn: string;
  estado: {
    id: number;
    nombre: string;
    descripcion?: string;
  };
  usuario: {
    nombrecompleto: string;
    codigo: string;
  };
  clientes: Array<{
    id: number;
    formularioId: number;
    clienteId: number;
    tipoRelacion: string;
    cliente: {
      id: number;
      codigo: string;
      identificacion: string;
      nombrecompleto: string;
      telefono?: string;
      correo?: string;
    };
  }>;
  productos: Array<{
    id: number;
    formularioId: number;
    productoId: number;
    cantidad: number;
    producto: {
      id: number;
      codigo: string;
      nombre: string;
      categoria: string;
    };
  }>;
  factura?: {
    id: number;
    codigo: string;
    total: number;
    estadoId: number;
  };
}

export interface FormularioEstadisticas {
  totalFormularios: number;
  formulariosHoy: number;
  estadosPendientes: number;
  estadosRecibidos: number;
  estadosAsentados: number;
  estadosConCertificado: number;
}

export interface CampoFormulario {
  id: number;
  productoId?: number;
  tipoId: number;
  campo: string;
  titulo: string;
  descripcion?: string;
  placeholder?: string;
  requerido: boolean;
  orden: number;
  activo: boolean;
  grupo?: string;
  tipo: {
    id: number;
    nombre: string;
    descripcion?: string;
  };
}

export interface CreateFormularioData {
  clientes: Array<{
    clienteId: number;
    tipoRelacion: string;
  }>;
  productos: Array<{
    productoId: number;
    cantidad: number;
    campos: Array<{
      campoId: number;
      valor: string;
    }>;
  }>;
  firma?: string;
  observaciones?: string;
}

const aauFormulariosService = {
  // Listar formularios con filtros
  async getFormularios(params?: {
    estado?: string;
    fechaInicio?: string;
    fechaFin?: string;
    codigo?: string;
    clienteId?: number;
  }) {
    const response = await api.get('/aau/formularios', { params });
    return response.data;
  },

  // Obtener formulario por ID
  async getFormularioById(id: number) {
    const response = await api.get(`/aau/formularios/${id}`);
    return response.data;
  },

  // Crear nuevo formulario
  async createFormulario(data: CreateFormularioData) {
    const response = await api.post('/aau/formularios', data);
    return response.data;
  },

  // Actualizar estado del formulario
  async updateEstadoFormulario(
    id: number,
    data: {
      estadoNombre: string;
      libro?: string;
      hoja?: string;
      fechaAsentamiento?: string;
      mensajeDevolucion?: string;
      fechaEntrega?: string;
    }
  ) {
    const response = await api.put(`/aau/formularios/${id}/estado`, data);
    return response.data;
  },

  // Eliminar formulario (solo Pendiente)
  async deleteFormulario(id: number) {
    const response = await api.delete(`/aau/formularios/${id}`);
    return response.data;
  },

  // Obtener estadísticas
  async getEstadisticas() {
    const response = await api.get('/aau/formularios/estadisticas');
    return response.data;
  },

  // Obtener campos dinámicos por producto
  async getCamposByProducto(productoId: number) {
    const response = await api.get(`/aau/campos/producto/${productoId}`);
    return response.data;
  },

  // Obtener tipos de campos
  async getTiposCampos() {
    const response = await api.get('/aau/campos/tipos');
    return response.data;
  },

  // Subir archivo
  async uploadArchivo(formData: FormData, onProgress?: (progressEvent: any) => void) {
    const response = await api.post('/aau/archivos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: onProgress
    });
    return response.data;
  },

  // Obtener archivos de un formulario
  async getArchivosByFormulario(formularioId: number) {
    const response = await api.get(`/aau/archivos/formulario/${formularioId}`);
    return response.data;
  },

  // Descargar archivo
  getDownloadUrl(archivoId: number): string {
    return `${api.defaults.baseURL}/aau/archivos/${archivoId}/descargar`;
  },

  // Ver archivo
  getViewUrl(archivoId: number): string {
    return `${api.defaults.baseURL}/aau/archivos/${archivoId}/ver`;
  },

  // Eliminar archivo
  async deleteArchivo(archivoId: number) {
    const response = await api.delete(`/aau/archivos/${archivoId}`);
    return response.data;
  }
};

export default aauFormulariosService;
