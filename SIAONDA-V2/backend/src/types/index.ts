// Tipos compartidos para el backend

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Roles del sistema (replicado del sistema original)
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
