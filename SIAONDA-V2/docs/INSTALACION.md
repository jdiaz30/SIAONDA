# Guía de Instalación - SIAONDA V2

## Requisitos Previos

- **Node.js** 20+ (LTS recomendado)
- **PostgreSQL** 16+
- **npm** o **yarn**
- **Git**

## Instalación Paso a Paso

### 1. Clonar el Repositorio

```bash
cd /ruta/a/tu/proyecto
cd SIAONDA-V2
```

### 2. Configurar PostgreSQL

```bash
# Crear base de datos
createdb siaonda_v2

# O usando psql
psql -U postgres
CREATE DATABASE siaonda_v2;
\q
```

### 3. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Copiar archivo de entorno
cp .env.example .env

# Editar .env con tus credenciales
nano .env
```

Configurar el archivo `.env`:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/siaonda_v2"
PORT=3000
NODE_ENV=development
JWT_SECRET=tu_secreto_super_seguro_cambiar_en_produccion
JWT_REFRESH_SECRET=tu_secreto_refresh_super_seguro
CORS_ORIGIN=http://localhost:5173
```

### 4. Ejecutar Migraciones de Base de Datos

```bash
# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev --name init

# Opcional: Ver la base de datos con Prisma Studio
npx prisma studio
```

### 5. Poblar Base de Datos con Datos Iniciales

```bash
# Ejecutar seeds
npm run seed
```

Esto creará:
- Estados de usuario (Activo, Inactivo)
- Tipos de usuario (13 roles)
- Usuario administrador por defecto
- Estados de formularios, certificados, facturas, cajas
- Productos iniciales
- Tipos de campos de formularios

### 6. Iniciar Backend

```bash
# Modo desarrollo
npm run dev

# El servidor estará en http://localhost:3000
```

### 7. Configurar Frontend

```bash
# En otra terminal
cd ../frontend

# Instalar dependencias
npm install

# Copiar archivo de entorno
cp .env.example .env

# Editar si es necesario
nano .env
```

Contenido de `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

### 8. Iniciar Frontend

```bash
# Modo desarrollo
npm run dev

# La aplicación estará en http://localhost:5173
```

## Credenciales por Defecto

Después de ejecutar los seeds, puedes iniciar sesión con:

- **Usuario:** `admin`
- **Contraseña:** `admin123`

**IMPORTANTE:** Cambia esta contraseña inmediatamente en producción.

## Verificar Instalación

1. Abre tu navegador en `http://localhost:5173`
2. Inicia sesión con las credenciales por defecto
3. Deberías ver el dashboard del sistema

## Problemas Comunes

### Error de conexión a PostgreSQL

```bash
# Verificar que PostgreSQL esté corriendo
sudo service postgresql status

# Iniciar PostgreSQL
sudo service postgresql start
```

### Puerto ya en uso

```bash
# Backend (puerto 3000)
lsof -i :3000
kill -9 <PID>

# Frontend (puerto 5173)
lsof -i :5173
kill -9 <PID>
```

### Problemas con Prisma

```bash
# Limpiar y regenerar
cd backend
rm -rf node_modules
rm -rf prisma/migrations
npm install
npx prisma generate
npx prisma migrate dev --name init
```

## Compilación para Producción

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
# Los archivos estarán en dist/
```

## Siguiente Paso

Ver la [Guía de Uso](./USO.md) para aprender a utilizar el sistema.
