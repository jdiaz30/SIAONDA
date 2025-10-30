-- Script para crear usuario administrador manualmente
-- Ejecutar con: psql -U postgres -d siaonda_v2 -f crear-usuario.sql

-- 1. Crear estados de usuario si no existen
INSERT INTO "UsuarioEstado" (nombre, descripcion)
VALUES ('Activo', 'Usuario activo en el sistema')
ON CONFLICT (nombre) DO NOTHING;

-- 2. Crear tipo de usuario Administrador si no existe
INSERT INTO "UsuarioTipo" (nombre, descripcion)
VALUES ('Administrador', 'Gestión completa del sistema')
ON CONFLICT (nombre) DO NOTHING;

-- 3. Crear usuario admin
-- Contraseña: admin123 (hash bcrypt)
INSERT INTO "Usuario" (
  nombre,
  contrasena,
  codigo,
  nombrecompleto,
  correo,
  "tipoId",
  "estadoId"
)
SELECT
  'admin',
  '$2b$10$YourBcryptHashHere',
  'ADM001',
  'Administrador del Sistema',
  'admin@onda.gob.do',
  (SELECT id FROM "UsuarioTipo" WHERE nombre = 'Administrador'),
  (SELECT id FROM "UsuarioEstado" WHERE nombre = 'Activo')
WHERE NOT EXISTS (
  SELECT 1 FROM "Usuario" WHERE nombre = 'admin'
);

-- Mostrar el usuario creado
SELECT id, nombre, codigo, nombrecompleto, correo
FROM "Usuario"
WHERE nombre = 'admin';
