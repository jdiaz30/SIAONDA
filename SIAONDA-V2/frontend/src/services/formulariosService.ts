import { api } from './api';

export interface Formulario {
  id: number;
  codigo: string;
  clienteId: number;
  tipoId: number;
  estadoId: number;
  usuarioId: number;
  subtotal: string;
  itbis: string;
  descuento: string;
  total: string;
  observaciones: string | null;
  asentado: boolean;
  asentadoEn: string | null;
  asentadoPor: number | null;
  cliente: {
    id: number;
    codigo: string;
    nombrecompleto: string;
    identificacion: string;
  };
  tipo: {
    id: number;
    nombre: string;
  };
  estado: {
    id: number;
    nombre: string;
    color: string;
  };
  usuario: {
    id: number;
    nombrecompleto: string;
  };
  campos: FormularioCampo[];
  archivos: FormularioArchivo[];
  creadoEn: string;
  actualizadoEn: string;
}

export interface FormularioCampo {
  id: number;
  formularioId: number;
  campoId: number;
  valor: string;
  campo: {
    id: number;
    campo: string;
    titulo: string;
    tipo: {
      id: number;
      nombre: string;
    };
  };
}

export interface FormularioArchivo {
  id: number;
  formularioId: number;
  nombre: string;
  ruta: string;
  tipo: string;
  tamano: number;
  creadoEn: string;
}

export interface FormularioTipo {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: string;
  campos: FormularioCampo[];
}

export interface FormularioEstado {
  id: number;
  nombre: string;
  descripcion: string | null;
  color: string;
}

export interface CreateFormularioDto {
  clienteId: number;
  tipoId: number;
  observaciones?: string;
  campos: Array<{
    campoId: number;
    valor: string;
  }>;
}

export interface UpdateFormularioDto extends Partial<CreateFormularioDto> {
  estadoId?: number;
}

export const formulariosService = {
  getFormularios: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    estadoId?: number;
    tipoId?: number;
  }) => {
    const response = await api.get('/formularios', { params });
    return response.data;
  },

  getFormulario: async (id: number): Promise<Formulario> => {
    const response = await api.get(`/formularios/${id}`);
    return response.data;
  },

  createFormulario: async (data: CreateFormularioDto): Promise<Formulario> => {
    const response = await api.post('/formularios', data);
    return response.data;
  },

  updateFormulario: async (id: number, data: UpdateFormularioDto): Promise<Formulario> => {
    const response = await api.put(`/formularios/${id}`, data);
    return response.data;
  },

  deleteFormulario: async (id: number): Promise<void> => {
    await api.delete(`/formularios/${id}`);
  },

  asentarFormulario: async (id: number): Promise<Formulario> => {
    const response = await api.post(`/formularios/${id}/asentar`);
    return response.data;
  },

  getTipos: async (): Promise<FormularioTipo[]> => {
    const response = await api.get('/formularios/tipos');
    return response.data;
  },

  getEstados: async (): Promise<FormularioEstado[]> => {
    const response = await api.get('/formularios/estados');
    return response.data;
  },

  uploadArchivos: async (id: number, files: File[]): Promise<FormularioArchivo[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('archivos', file);
    });
    const response = await api.post(`/formularios/${id}/archivos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteArchivo: async (formularioId: number, archivoId: number): Promise<void> => {
    await api.delete(`/formularios/${formularioId}/archivos/${archivoId}`);
  },
};
