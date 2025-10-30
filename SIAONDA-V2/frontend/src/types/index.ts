// Tipos compartidos para el frontend

export interface Usuario {
  id: number;
  nombre: string;
  nombrecompleto: string;
  codigo: string;
  tipo: string;
  correo: string | null;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Roles del sistema
export enum UserRole {
  CAJERO = 'Cajero',
  CONTABLE = 'Contable',
  ADMINISTRADOR = 'Administrador',
  SERVICIO_CLIENTE = 'Servicio al Cliente',
  ADMIN_SERVICIO_CLIENTE = 'Admin Serv Cliente',
  REGIONAL = 'Regional',
  DIGITADOR = 'Digitador',
  RECEPCION_CLIENTES = 'Recepcion Clientes',
  ASENTAMIENTO = 'Asentamiento',
  REGISTRO = 'Registro',
  ADMIN_REGISTRO = 'Admin Registro',
  ADMINISTRATIVO = 'Administrativo',
  INSPECTORIA = 'Inspectoria'
}
