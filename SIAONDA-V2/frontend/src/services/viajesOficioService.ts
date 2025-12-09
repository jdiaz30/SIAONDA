import { api } from './api';

export interface ViajeOficio {
  id: number;
  codigo: string;
  provinciaId: number;
  provincia: {
    id: number;
    nombre: string;
  };
  fechaInicio: string;
  fechaFin: string | null;
  estadoViajeId: number;
  estadoViaje: {
    id: number;
    nombre: string;
    descripcion: string;
  };
  rutaInformeGeneral: string | null;
  observaciones: string | null;
  creadoPorId: number;
  creadoPor: {
    id: number;
    nombrecompleto: string;
  };
  inspectores: Array<{
    id: number;
    inspectorId: number;
    inspector: {
      id: number;
      nombrecompleto: string;
      codigo: string;
    };
  }>;
  actasInspeccion?: any[];
  _count?: {
    actasInspeccion: number;
  };
}

export interface CrearViajeData {
  provinciaId: number;
  fechaInicio: string;
  fechaFin?: string;
  inspectoresIds: number[];
  observaciones?: string;
}

export const crearViaje = async (data: CrearViajeData): Promise<ViajeOficio> => {
  const response = await api.post('/inspectoria/viajes-oficio', data);
  return response.data.data;
};

export const listarViajes = async (params?: {
  page?: number;
  limit?: number;
  estadoId?: number;
  provinciaId?: number;
  search?: string;
}) => {
  const response = await api.get('/inspectoria/viajes-oficio', { params });
  return response.data.data;
};

export const obtenerViaje = async (id: number): Promise<ViajeOficio> => {
  const response = await api.get(`/inspectoria/viajes-oficio/${id}`);
  return response.data.data;
};

export const cerrarViaje = async (id: number, formData: FormData): Promise<ViajeOficio> => {
  const response = await api.put(`/inspectoria/viajes-oficio/${id}/cerrar`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data.data;
};

export const cancelarViaje = async (id: number, motivoCancelacion: string): Promise<ViajeOficio> => {
  const response = await api.put(`/inspectoria/viajes-oficio/${id}/cancelar`, {
    motivoCancelacion
  });
  return response.data.data;
};
