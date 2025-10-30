# SIAONDA V2

Sistema Integral de la Oficina Nacional de Derecho de Autor - Versión 2

## Descripción

Reescritura completa y moderna del sistema SIAONDA, manteniendo 100% de la funcionalidad original pero con tecnologías actuales y mejores prácticas de desarrollo.

## Stack Tecnológico

### Backend
- **Node.js 20+** con **TypeScript**
- **Express.js** - Framework web
- **Prisma ORM** - Gestión de base de datos
- **PostgreSQL 16** - Base de datos
- **JWT** - Autenticación
- **bcrypt** - Hash de contraseñas

### Frontend
- **React 18** con **TypeScript**
- **Vite** - Build tool
- **TailwindCSS** - Estilos
- **shadcn/ui** - Componentes UI
- **React Router** - Enrutamiento
- **Zustand** - State management
- **React Query** - Data fetching

### Herramientas
- **PDFKit** / **Puppeteer** - Generación de PDFs
- **Nodemailer** - Envío de emails
- **date-fns** - Manejo de fechas
- **zod** - Validación de schemas

## Estructura del Proyecto

```
SIAONDA-V2/
├── backend/                 # API Node.js + Express
│   ├── src/
│   │   ├── config/         # Configuraciones
│   │   ├── controllers/    # Controladores
│   │   ├── routes/         # Rutas de API
│   │   ├── services/       # Lógica de negocio
│   │   ├── models/         # Modelos de datos
│   │   ├── middleware/     # Middleware (auth, validation)
│   │   ├── utils/          # Utilidades
│   │   └── index.ts        # Entry point
│   ├── prisma/
│   │   └── schema.prisma   # Schema de base de datos
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/          # Páginas/Vistas
│   │   ├── layouts/        # Layouts
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API calls
│   │   ├── store/          # State management
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utilidades
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── docs/                   # Documentación
│   ├── API.md             # Documentación de API
│   ├── DATABASE.md        # Estructura de BD
│   └── FLOWS.md           # Flujos de operaciones
│
└── README.md
```

## Características

### Módulos Principales

1. **Autenticación y Usuarios**
   - 13 roles de usuario (excluido Almacén)
   - JWT con refresh tokens
   - Gestión de permisos granular

2. **Gestión de Obras (Formularios)**
   - 12 tipos de obras
   - Campos dinámicos configurables
   - Firma digital
   - Archivos adjuntos

3. **Sistema de Cajas**
   - Apertura/cierre de caja
   - Control de efectivo
   - Reportes de cierre

4. **Certificados**
   - Generación automática
   - PDFs personalizados
   - Control de entrega

5. **Facturas y Pagos**
   - Facturación con NCF (Comprobantes Fiscales RD)
   - Múltiples métodos de pago
   - Conciliación automática

6. **Clientes/Autores**
   - Registro de personas físicas/jurídicas
   - Gestión de documentos
   - Historial completo

7. **Reportes**
   - Reportes en PDF y CSV
   - Dashboards analíticos
   - Exportación de datos

> **Nota**: El módulo de Almacén ha sido excluido de la versión 2

## Roles de Usuario

1. Cajero
2. Contable
3. Administrador
4. Servicio al Cliente
5. Admin Serv Cliente
6. Regional
7. Digitador
8. Recepcion Clientes
9. Asentamiento
10. Registro
11. Admin Registro
12. Administrativo
13. Inspectoria

> **Nota**: El rol "Almacén" ha sido excluido de esta versión

## Instalación

```bash
# Clonar repositorio
cd SIAONDA-V2

# Instalar dependencias del backend
cd backend
npm install

# Configurar variables de entorno
cp .env.example .env

# Ejecutar migraciones
npx prisma migrate dev

# Iniciar servidor de desarrollo
npm run dev

# En otra terminal, instalar frontend
cd ../frontend
npm install

# Iniciar aplicación
npm run dev
```

## Desarrollo

```bash
# Backend (http://localhost:3000)
cd backend
npm run dev

# Frontend (http://localhost:5173)
cd frontend
npm run dev
```

## Principios de Desarrollo

- **Fidelidad 100%**: Replicar exactamente la lógica de negocio del sistema original
- **Código limpio**: TypeScript, ESLint, Prettier
- **Seguridad**: Validación de inputs, protección CSRF, SQL injection prevention
- **Performance**: Optimización de queries, lazy loading, caché
- **UX moderna**: Diseño intuitivo, responsive, accesible
- **Documentación**: Código autodocumentado, comentarios donde sea necesario

## Licencia

Propiedad de la Oficina Nacional de Derecho de Autor (ONDA) - República Dominicana

---

**Versión**: 2.0.0
**Fecha de inicio**: 28 de octubre de 2025
**Estado**: En desarrollo
