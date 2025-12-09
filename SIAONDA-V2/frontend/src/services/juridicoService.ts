import { api } from './api';

export interface CasoJuridico {
  id: number;
  casoInspeccionId: number;
  casoInspeccion: {
    id: number;
    codigo: string;
    empresa: {
      id: number;
      nombreEmpresa: string;
      rnc: string;
    };
    estadoCaso: {
      nombre: string;
    };
    inspectorAsignado?: {
      id: number;
      nombrecompleto: string;
    };
    actaInspeccion?: {
      id: number;
      numeroActa: string;
      rutaPdfActa: string;
      fechaCreacion: string;
    };
    actaInfraccion?: {
      id: number;
      numeroActa: string;
      rutaPdfActa: string;
      fechaCreacion: string;
    };
  };
  estadoJuridicoId: number;
  estadoJuridico: {
    id: number;
    nombre: string;
    descripcion: string;
  };
  fechaRecepcion: string;
  fechaCierre: string | null;
  recibidoPorId: number | null;
  recibidoPor?: {
    id: number;
    nombrecompleto: string;
  };
  observaciones: string | null;
}

export const listarCasosJuridicos = async (params?: {
  page?: number;
  limit?: number;
  estadoId?: number;
  search?: string;
}) => {
  const response = await api.get('/juridico/casos', { params });
  return response.data.data;
};

export const obtenerCasoJuridico = async (id: number): Promise<CasoJuridico> => {
  const response = await api.get(`/juridico/casos/${id}`);
  return response.data.data;
};

export const marcarEnAtencion = async (id: number): Promise<CasoJuridico> => {
  const response = await api.put(`/juridico/casos/${id}/en-atencion`);
  return response.data.data;
};

export const cerrarCasoJuridico = async (id: number, observaciones?: string): Promise<CasoJuridico> => {
  const response = await api.put(`/juridico/casos/${id}/cerrar`, { observaciones });
  return response.data.data;
};

export const obtenerEstados = async () => {
  const response = await api.get('/juridico/estados');
  return response.data.data;
};
