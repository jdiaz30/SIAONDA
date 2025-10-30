import { api } from './api';

export interface Visita {
  id: number;
  clienteId: number;
  fechaEntrada: string;
  fechaSalida: string | null;
  tipoVisita: string;
  departamento: string | null;
  personaContacto: string | null;
  razonVisita: string | null;
  nota: string | null;
  creadoEn: string;
  actualizadoEn: string;
  cliente: {
    id: number;
    codigo: string;
    nombrecompleto: string;
    identificacion: string;
  };
}

export interface CreateVisitaDto {
  clienteId: number;
  fechaEntrada?: string;
  tipoVisita: string;
  departamento?: string;
  personaContacto?: string;
  razonVisita?: string;
  nota?: string;
}

export interface UpdateVisitaDto extends Partial<CreateVisitaDto> {
  fechaSalida?: string;
}

export const visitasService = {
  getVisitas: async (params?: {
    page?: number;
    limit?: number;
    clienteId?: number;
    activas?: boolean;
  }) => {
    const response = await api.get('/visitas', { params });
    return response.data;
  },

  getVisita: async (id: number): Promise<Visita> => {
    const response = await api.get(`/visitas/${id}`);
    return response.data;
  },

  createVisita: async (data: CreateVisitaDto): Promise<Visita> => {
    const response = await api.post('/visitas', data);
    return response.data;
  },

  updateVisita: async (id: number, data: UpdateVisitaDto): Promise<Visita> => {
    const response = await api.put(`/visitas/${id}`, data);
    return response.data;
  },

  registrarSalida: async (id: number): Promise<Visita> => {
    const response = await api.post(`/visitas/${id}/registrar-salida`);
    return response.data;
  },

  deleteVisita: async (id: number): Promise<void> => {
    await api.delete(`/visitas/${id}`);
  },
};
