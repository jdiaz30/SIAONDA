# Backend Completado - SIAONDA V2

## Estado Actual

Backend completo implementado con todos los módulos principales del sistema.

## Módulos Implementados

### ✅ 1. Autenticación y Usuarios
**Archivo**: `backend/src/controllers/usuarios.controller.ts`
- Login con JWT
- Refresh tokens
- Gestión de usuarios
- 13 roles de usuario
- CRUD completo

### ✅ 2. Clientes/Autores
**Archivo**: `backend/src/controllers/clientes.controller.ts`
- CRUD completo de clientes
- Búsqueda por identificación
- Generación de código: `CLI-NNNNNN`
- Tipos de cliente (Física, Jurídica)
- Nacionalidades
- Upload de archivos adjuntos

### ✅ 3. Formularios (Obras)
**Archivo**: `backend/src/controllers/formularios.controller.ts`
- CRUD completo de formularios
- Generación de código: `00000000/DD/MM/YYYY` (8 dígitos + fecha)
- Estados: Pendiente, Asentado, Certificado
- Asociación de múltiples clientes (Autor, Titular, etc.)
- Asociación de múltiples productos/obras
- Campos dinámicos por producto
- Upload de archivos adjuntos (PDF, DOC, MP3, WAV, JPG, PNG, ZIP)
- Asentamiento de formularios
- Firma digital

**Endpoints**:
- `GET /api/formularios` - Listar con paginación y búsqueda
- `GET /api/formularios/:id` - Obtener detalle completo
- `POST /api/formularios` - Crear formulario
- `PUT /api/formularios/:id` - Actualizar observaciones y firma
- `POST /api/formularios/:id/asentar` - Asentar formulario
- `DELETE /api/formularios/:id` - Eliminar (solo si no está asentado)
- `POST /api/formularios/:id/archivos` - Subir archivos
- `DELETE /api/formularios/:id/archivos/:archivoId` - Eliminar archivo
- `GET /api/formularios/estados` - Listar estados

### ✅ 4. Certificados
**Archivo**: `backend/src/controllers/certificados.controller.ts`
- CRUD completo de certificados
- Generación de código: `00000000/DD/MM/YYYY` (8 dígitos + fecha)
- Estados: En Impresión, Disponible, Entregado
- Generación de PDF con formato exacto del sistema original
- Números de libro
- Entrega de certificados
- Solo se puede crear si el formulario está asentado

**Características del PDF**:
- Formato oficial de ONDA
- Texto en español formal
- MAYÚSCULAS para datos importantes
- Manejo de: fallecido, RNC, múltiples autores, sub-obras
- Fecha de emisión
- Firma del Director/a

**Endpoints**:
- `GET /api/certificados` - Listar con paginación
- `GET /api/certificados/:id` - Obtener detalle
- `POST /api/certificados` - Crear certificado
- `POST /api/certificados/:id/generar-pdf` - Descargar PDF
- `PUT /api/certificados/:id/estado` - Actualizar estado
- `POST /api/certificados/:id/entregar` - Registrar entrega
- `DELETE /api/certificados/:id` - Eliminar (solo si no está entregado)
- `GET /api/certificados/estados` - Listar estados

**Servicio PDF**: `backend/src/services/pdf.service.ts`
- Usa Puppeteer para generar PDFs
- Template HTML con estilos exactos del original
- Lógica compleja para manejo de casos especiales

### ✅ 5. Facturas
**Archivo**: `backend/src/controllers/facturas.controller.ts`
- CRUD completo de facturas
- Generación de código: `FAC-YYYYMMDD-NNNN`
- **NCF (Comprobantes Fiscales RD)**: Formato `E310000000001`
- Estados: Pendiente, Pagada, Anulada
- Múltiples items por factura
- Cálculo automático de subtotal, ITBIS (18%), total
- Métodos de pago
- Pago de facturas (asocia a caja)
- Anulación de facturas
- Reportes de ventas por rango de fechas

**Endpoints**:
- `GET /api/facturas` - Listar con filtros
- `GET /api/facturas/:id` - Obtener detalle
- `POST /api/facturas` - Crear factura
- `PUT /api/facturas/:id/pagar` - Registrar pago
- `PUT /api/facturas/:id/anular` - Anular factura
- `DELETE /api/facturas/:id` - Eliminar (solo si no está pagada)
- `GET /api/facturas/estados` - Listar estados
- `GET /api/facturas/reporte/ventas` - Reporte de ventas

**Lógica NCF**:
- Prefijo E31 (Factura con valor fiscal)
- Secuencia de 9 dígitos
- Control de rangos autorizados (TODO: integrar con DGII)

### ✅ 6. Cajas
**Archivo**: `backend/src/controllers/cajas.controller.ts`
- CRUD completo de cajas
- Generación de código: `CAJA-YYYYMMDD-NNNN`
- Estados: Abierta, Cerrada
- Apertura de caja (monto inicial)
- Cierre de caja (monto final, cálculo de diferencias)
- Control: un usuario solo puede tener una caja abierta
- Reporte de cierre con:
  - Resumen de montos
  - Detalle de facturas
  - Agrupación por método de pago
  - Diferencias (cuadre de caja)

**Endpoints**:
- `GET /api/cajas` - Listar con filtros
- `GET /api/cajas/:id` - Obtener detalle
- `POST /api/cajas/abrir` - Abrir caja
- `POST /api/cajas/:id/cerrar` - Cerrar caja
- `GET /api/cajas/:id/reporte` - Reporte de cierre
- `GET /api/cajas/usuario/activa` - Obtener caja activa del usuario
- `DELETE /api/cajas/:id` - Eliminar (solo si no tiene facturas)
- `GET /api/cajas/estados` - Listar estados

### ✅ 7. Productos
**Archivo**: `backend/src/controllers/productos.controller.ts` (ya existía)
- CRUD completo de productos
- Categorías (12 tipos de obras)
- Campos dinámicos configurables
- Costos por rango de cantidad
- Productos padre/hijo (obras con sub-obras)

## Servicios Auxiliares

### Upload Service
**Archivo**: `backend/src/middleware/upload.ts`
- Multer configurado
- Tipos permitidos: PDF, DOC, DOCX, MP3, WAV, JPG, PNG, ZIP
- Tamaño máximo: 10MB por archivo
- Máximo 10 archivos por request
- Carpetas organizadas: `/uploads/formularios/`, `/uploads/clientes/`, etc.

### PDF Service
**Archivo**: `backend/src/services/pdf.service.ts`
- Generación de certificados con Puppeteer
- Template HTML exacto del sistema original
- Manejo de casos especiales (fallecido, RNC, múltiples autores)

### Costos Service
**Archivo**: `backend/src/services/costos.service.ts`
- Cálculo de costos por cantidad
- Rangos de precios
- Cálculo de ITBIS (18%)
- Totales automáticos

## Middleware

### Auth Middleware
**Archivo**: `backend/src/middleware/auth.ts`
- JWT verification
- Refresh tokens
- AuthRequest con usuario

### Error Handler
**Archivo**: `backend/src/middleware/errorHandler.ts`
- AppError personalizado
- asyncHandler para try/catch automático
- Manejo de errores de Prisma

### Upload Middleware
**Archivo**: `backend/src/middleware/upload.ts`
- Multer configurado
- Validación de tipos de archivo
- Límites de tamaño

## Base de Datos

**Archivo**: `backend/prisma/schema.prisma`
- 36 tablas
- Relaciones complejas
- Indexes para performance

**Principales modelos**:
- Usuario (13 roles)
- Cliente
- Formulario, FormularioCliente, FormularioProducto, FormularioProductoCampo
- Certificado
- Factura, FacturaItem
- Caja
- Producto, ProductoCategoria, ProductoCosto, ProductoCampo

## Formatos de Códigos (Sistema Original)

✅ **Formularios**: `00000021/29/10/2025` (8 dígitos + /DD/MM/YYYY)
✅ **Certificados**: `00000021/29/10/2025` (8 dígitos + /DD/MM/YYYY)
✅ **Facturas**: `FAC-20251029-0001` (FAC-YYYYMMDD-NNNN)
✅ **NCF**: `E310000000001` (E31 + 9 dígitos)
✅ **Cajas**: `CAJA-20251029-0001` (CAJA-YYYYMMDD-NNNN)
✅ **Clientes**: `CLI-000001` (CLI-NNNNNN)

## Validaciones

Usando **Zod** para validación de schemas en todos los controladores:
- createFormularioSchema
- createCertificadoSchema
- createFacturaSchema
- abrirCajaSchema
- cerrarCajaSchema

## Autenticación

- JWT tokens
- Refresh tokens
- Middleware en todas las rutas (excepto /auth/login y /auth/refresh)
- Usuario en contexto de request (AuthRequest)

## Testing

Para probar los endpoints:
```bash
cd backend
npm run dev
```

Rutas disponibles:
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `/api/usuarios/*` - Usuarios
- `/api/clientes/*` - Clientes
- `/api/formularios/*` - Formularios
- `/api/certificados/*` - Certificados
- `/api/facturas/*` - Facturas
- `/api/cajas/*` - Cajas
- `/api/productos/*` - Productos

Usuario de prueba (seeds):
- Email: admin@onda.gob.do
- Password: admin123

## Próximos Pasos

1. ✅ Backend completado
2. 🔄 Frontend para los módulos implementados
3. 🔄 Dashboards por rol
4. 🔄 Reportes avanzados
5. 🔄 Sistema de permisos granular
6. 🔄 Notificaciones
7. 🔄 Auditoría de cambios

## Notas Importantes

- El módulo de **Almacén** está excluido de esta versión
- Todos los formatos siguen **EXACTAMENTE** el sistema original
- El certificado PDF usa el formato oficial de ONDA
- NCF cumple con normativas de DGII (República Dominicana)
- ITBIS fijo al 18% (ajustar si cambia la ley)
