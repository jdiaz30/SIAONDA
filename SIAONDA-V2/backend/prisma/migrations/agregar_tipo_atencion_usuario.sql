-- Agregar tipo de usuario "ATENCION_USUARIO" (Servicio al Cliente de SIAONDA V1)
-- Este rol tiene permisos para:
-- - Ver y crear formularios
-- - Ver certificados
-- - Registrar clientes/visitantes (Recepción)

INSERT INTO usuarios_tipos (nombre, descripcion)
VALUES ('ATENCION_USUARIO', 'Atención al usuario - Servicio al cliente')
ON CONFLICT (nombre) DO NOTHING;

-- Nota: Si ya existe el tipo, no hará nada (ON CONFLICT DO NOTHING)
