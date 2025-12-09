import { api } from './api';

export interface Denuncia {
  id: number;
  codigo: string;
  denuncianteNombre: string;
  denuncianteTelefono: string | null;
  denuncianteEmail: string | null;
  denuncianteDireccion: string | null;
  rutaCedulaDenunciante: string;
  rutaComunicacion: string;
  empresaDenunciada: string;
  direccionEmpresa: string | null;
  descripcionHechos: string;
  facturaId: number | null;
  factura?: {
    id: number;
    codigo: string;
    total: number;
    estadoId: number;
  };
  estadoDenunciaId: number;
  estadoDenuncia: {
    id: number;
    nombre: string;
    descripcion: string;
  };
  casoGeneradoId: number | null;
  casoGenerado?: {
    id: number;
    codigo: string;
    estadoCaso: {
      nombre: string;
    };
  };
  recibidoPorId: number;
  recibidoPor: {
    id: number;
    nombrecompleto: string;
  };
}

export const registrarDenuncia = async (formData: FormData): Promise<Denuncia> => {
  const response = await api.post('/denuncias', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data.data;
};

export const listarDenuncias = async (params?: {
  page?: number;
  limit?: number;
  estadoId?: number;
  search?: string;
}) => {
  const response = await api.get('/denuncias', { params });
  return response.data.data;
};

export const obtenerDenuncia = async (id: number): Promise<Denuncia> => {
  const response = await api.get(`/denuncias/${id}`);
  return response.data.data;
};

export const asociarFactura = async (id: number, facturaId: number): Promise<Denuncia> => {
  const response = await api.put(`/denuncias/${id}/asociar-factura`, { facturaId });
  return response.data.data;
};

export const asignarInspector = async (id: number, inspectorId: number) => {
  const response = await api.put(`/denuncias/${id}/asignar-inspector`, { inspectorId });
  return response.data.data;
};
