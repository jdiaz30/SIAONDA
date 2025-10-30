# 🚀 Cómo Probar SIAONDA V2 Ahora Mismo

## Requisitos Previos

Asegúrate de tener instalado:
- Node.js 20+ → https://nodejs.org/
- PostgreSQL 16+ → https://www.postgresql.org/download/

## Paso 1: Crear la Base de Datos

Abre una terminal y ejecuta:

```bash
# Windows (Command Prompt o PowerShell)
createdb siaonda_v2

# Si createdb no funciona, usa psql:
psql -U postgres
CREATE DATABASE siaonda_v2;
\q
```

## Paso 2: Configurar el Backend

```bash
# Ir a la carpeta del backend
cd C:\Users\jelsy.diaz\Desktop\SIAONDA\SIAONDA-V2\backend

# Instalar dependencias
npm install

# Copiar archivo de configuración
copy .env.example .env
```

Ahora edita el archivo `.env` con tus credenciales de PostgreSQL:

```env
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/siaonda_v2"
PORT=3000
NODE_ENV=development
JWT_SECRET=mi_secreto_super_seguro_2024
JWT_REFRESH_SECRET=mi_refresh_secreto_2024
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

**IMPORTANTE:** Cambia `tu_password` por la contraseña de tu PostgreSQL.

## Paso 3: Ejecutar Migraciones y Seeds

```bash
# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones (crea las 36 tablas)
npx prisma migrate dev --name init

# Poblar base de datos con datos iniciales
npm run seed
```

Si todo salió bien, verás:
```
✅ Seeds completados exitosamente!

📌 Usuario administrador creado:
   Usuario: admin
   Contraseña: admin123
```

## Paso 4: Iniciar el Backend

```bash
# Iniciar servidor de desarrollo
npm run dev
```

Deberías ver:
```
🚀 SIAONDA V2 Backend corriendo en http://localhost:3000
📝 Ambiente: development
```

**¡Deja esta terminal abierta!**

## Paso 5: Configurar el Frontend

Abre una **NUEVA** terminal (deja la del backend corriendo):

```bash
# Ir a la carpeta del frontend
cd C:\Users\jelsy.diaz\Desktop\SIAONDA\SIAONDA-V2\frontend

# Instalar dependencias
npm install

# Copiar archivo de configuración
copy .env.example .env
```

El archivo `.env` del frontend ya tiene la configuración correcta:
```env
VITE_API_URL=http://localhost:3000/api
```

## Paso 6: Iniciar el Frontend

```bash
# Iniciar aplicación
npm run dev
```

Deberías ver:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

## Paso 7: ¡Probar el Sistema!

1. Abre tu navegador en: **http://localhost:5173**

2. Verás la página de login. Ingresa:
   - **Usuario:** `admin`
   - **Contraseña:** `admin123`

3. ¡Ya estás dentro! Explora:
   - **Dashboard** - Información de tu usuario
   - **Clientes** - Módulo completo (crear, editar, buscar, eliminar)
   - **Usuarios** (solo si eres admin) - Gestión de usuarios

## 🎯 Lo que Puedes Probar

### ✅ Módulo de Clientes (100% Funcional)

1. **Crear un cliente:**
   - Ve a "Clientes"
   - Click en "+ Nuevo Cliente"
   - Llena el formulario:
     - Identificación: 001-1234567-8
     - Nombre: Juan
     - Apellido: Pérez
     - Tipo: Autor
     - Nacionalidad: Dominicana
     - Teléfono: 809-555-1234
     - Email: juan@example.com
   - Click en "Guardar"

2. **Buscar clientes:**
   - Usa la barra de búsqueda
   - Busca por cédula, nombre, código

3. **Editar un cliente:**
   - Click en "Editar" en cualquier cliente
   - Modifica los datos
   - Guarda

4. **Eliminar un cliente:**
   - Click en "Eliminar"
   - Confirma

### ✅ Módulo de Usuarios (100% Funcional - Solo Admin)

1. **Crear usuario:**
   - Ve a "Usuarios"
   - Click en "+ Nuevo Usuario"
   - Llena datos
   - Selecciona tipo de usuario

2. **Cambiar contraseña:**
   - En el menú de usuario
   - "Cambiar Contraseña"

## 🐛 Solución de Problemas

### Error: "Cannot connect to database"

```bash
# Verificar que PostgreSQL esté corriendo
# Windows: Services → PostgreSQL
# O en terminal:
pg_isready
```

### Error: "Port 3000 already in use"

```bash
# Matar proceso en puerto 3000
# Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# O cambiar puerto en backend/.env:
PORT=3001
```

### Error: "Port 5173 already in use"

```bash
# Similar para puerto 5173
# O el frontend te sugerirá otro puerto automáticamente
```

### Error al ejecutar `npm install`

```bash
# Borrar node_modules y reinstalar
rm -rf node_modules
rm package-lock.json
npm install
```

### Error "Prisma Client not generated"

```bash
cd backend
npx prisma generate
```

## 📊 Verificar que Todo Funciona

### Probar el Backend Directamente

Abre Postman o usa curl:

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nombre":"admin","contrasena":"admin123"}'

# Deberías recibir:
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "usuario": { ... }
}

# 2. Listar clientes (usa el token del login)
curl -X GET http://localhost:3000/api/clientes \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

### Ver la Base de Datos

```bash
cd backend
npx prisma studio
```

Esto abrirá una interfaz web en http://localhost:5555 donde puedes ver todas las tablas y datos.

## 🎨 Explorar el Código

### Backend
- `backend/src/controllers/` - Lógica de negocio
- `backend/src/routes/` - Rutas de API
- `backend/prisma/schema.prisma` - Estructura de BD

### Frontend
- `frontend/src/pages/` - Páginas de la app
- `frontend/src/components/` - Componentes reutilizables
- `frontend/src/services/` - Llamadas a API

## ✅ Checklist de Funcionamiento

Verifica que puedes:
- [ ] Iniciar sesión con admin/admin123
- [ ] Ver el dashboard con tu información
- [ ] Navegar a la página de Clientes
- [ ] Crear un nuevo cliente
- [ ] Buscar clientes
- [ ] Editar un cliente existente
- [ ] Ver detalles de un cliente
- [ ] Cerrar sesión
- [ ] Volver a iniciar sesión

## 🎯 Próximos Pasos

Una vez que hayas probado el sistema, podemos continuar implementando:
1. Módulo de Formularios/Obras
2. Módulo de Certificados
3. Módulo de Facturas
4. Módulo de Cajas

## 💡 Consejos

- **Mantén ambas terminales abiertas** (backend y frontend)
- Revisa las consolas si algo no funciona
- Los cambios en el código se reflejan automáticamente (hot reload)
- Usa Prisma Studio para explorar la base de datos

## 📞 Si Algo No Funciona

1. Verifica que PostgreSQL esté corriendo
2. Verifica que los puertos 3000 y 5173 estén libres
3. Revisa los logs en las terminales
4. Verifica el archivo `.env` del backend
5. Asegúrate de haber ejecutado `npm install` en ambas carpetas

---

**¡Listo!** Ahora tienes un sistema funcional para probar. 🎉
