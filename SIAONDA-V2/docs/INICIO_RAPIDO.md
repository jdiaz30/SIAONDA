# 🚀 Inicio Rápido - SIAONDA V2

## Requisitos Previos

- Node.js 20+
- PostgreSQL 16+
- npm

## Instalación en 5 Pasos

### 1️⃣ Crear Base de Datos

```bash
createdb siaonda_v2
```

### 2️⃣ Configurar Backend

```bash
cd backend
npm install
cp .env.example .env
```

Editar `.env` con tus credenciales de PostgreSQL:
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/siaonda_v2"
```

### 3️⃣ Ejecutar Migraciones y Seeds

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run seed
```

### 4️⃣ Configurar Frontend

```bash
cd ../frontend
npm install
cp .env.example .env
```

### 5️⃣ Iniciar Aplicación

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

## 🎉 Listo!

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

**Credenciales:**
- Usuario: `admin`
- Contraseña: `admin123`

## 📚 Documentación

- [README completo](./README.md)
- [Guía de instalación detallada](./docs/INSTALACION.md)
- [Resumen del proyecto](./docs/RESUMEN_PROYECTO.md)

## ⚠️ Importante

- Cambia la contraseña del administrador después del primer login
- El sistema está en desarrollo. Módulos completos:
  - ✅ Autenticación
  - ✅ Usuarios (solo administradores)
  - 🚧 Clientes (en desarrollo)
  - 🚧 Formularios (en desarrollo)
  - 🚧 Certificados (en desarrollo)
  - 🚧 Facturas (en desarrollo)
  - 🚧 Cajas (en desarrollo)

## 🐛 Problemas Comunes

**Error de conexión a PostgreSQL:**
```bash
sudo service postgresql start
```

**Puerto en uso:**
```bash
# Matar proceso en puerto 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Matar proceso en puerto 5173
lsof -i :5173 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

**Error de Prisma:**
```bash
cd backend
rm -rf node_modules
npm install
npx prisma generate
```
