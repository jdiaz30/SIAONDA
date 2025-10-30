import { api } from './api';

export interface ClienteArchivo {
  id: number;
  clienteId: number;
  nombre: string;
  ruta: string;
  tipo: string;
  tamano: number;
  creadoEn: string;
}

export const archivosService = {
  uploadArchivoCliente: async (
    clienteId: number,
    archivo: File
  ): Promise<ClienteArchivo> => {
    const formData = new FormData();
    formData.append('archivo', archivo);

    const response = await api.post(`/clientes/${clienteId}/archivos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteArchivoCliente: async (clienteId: number, archivoId: number): Promise<void> => {
    await api.delete(`/clientes/${clienteId}/archivos/${archivoId}`);
  },

  getArchivoUrl: (ruta: string): string => {
    // El backend sirve los archivos estáticos desde /uploads
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    // Si la ruta ya incluye 'uploads', no la duplicamos
    if (ruta.startsWith('uploads/')) {
      return `${baseUrl}/${ruta}`;
    }

    return `${baseUrl}/uploads/${ruta}`;
  },
};
