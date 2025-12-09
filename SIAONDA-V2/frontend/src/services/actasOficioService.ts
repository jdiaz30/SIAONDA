import { api } from './api';

export interface ActaInspeccionOficio {
  id: number;
  numeroActa: string;
  viajeId: number;
  viaje?: {
    codigo: string;
    provincia: {
      nombre: string;
    };
  };
  inspectorId: number;
  inspector: {
    id: number;
    nombrecompleto: string;
    codigo: string;
  };
  empresaId: number;
  empresa: {
    id: number;
    nombreEmpresa: string;
    rnc: string;
  };
  rutaPdfActa: string;
  resultadoInspeccion: string;
  requiereSeguimiento: boolean;
  casoGeneradoId: number | null;
  casoGenerado?: {
    id: number;
    codigo: string;
    estadoCaso: {
      nombre: string;
    };
  };
  fechaInspeccion: string;
}

export const registrarActa = async (formData: FormData): Promise<ActaInspeccionOficio> => {
  const response = await api.post('/inspectoria/actas-oficio', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data.data;
};

export const listarActasDeViaje = async (viajeId: number): Promise<ActaInspeccionOficio[]> => {
  const response = await api.get(`/inspectoria/actas-oficio/viaje/${viajeId}`);
  return response.data.data;
};

export const obtenerActa = async (id: number): Promise<ActaInspeccionOficio> => {
  const response = await api.get(`/inspectoria/actas-oficio/${id}`);
  return response.data.data;
};

export const generarCasoDesdeActa = async (id: number) => {
  const response = await api.post(`/inspectoria/actas-oficio/${id}/generar-caso`);
  return response.data.data;
};
