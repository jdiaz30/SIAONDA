-- Script para agregar campos faltantes del formulario IRC
-- Ejecutar esto después de levantar la base de datos

-- Obtener IDs necesarios
DO $$
DECLARE
    producto_irc_id INT;
    tipo_texto_id INT;
BEGIN
    -- Obtener ID del producto IRC-01
    SELECT id INTO producto_irc_id FROM "Producto" WHERE codigo = 'IRC-01';
    
    -- Obtener ID del tipo de campo Texto
    SELECT id INTO tipo_texto_id FROM "FormularioCampoTipo" WHERE tipo = 'texto';
    
    IF producto_irc_id IS NOT NULL AND tipo_texto_id IS NOT NULL THEN
        -- Insertar campos faltantes
        INSERT INTO "FormularioCampo" ("productoId", campo, titulo, "tipoId", requerido, orden, activo, descripcion, "createdAt", "updatedAt")
        VALUES
        -- Campos básicos adicionales
        (producto_irc_id, 'nombreComercial', 'Nombre Comercial', tipo_texto_id, false, 22, true, NULL, NOW(), NOW()),
        (producto_irc_id, 'fechaInicioOperaciones', 'Fecha Inicio Operaciones', tipo_texto_id, false, 25, true, NULL, NOW(), NOW()),
        (producto_irc_id, 'principalesClientes', 'Principales Clientes', tipo_texto_id, false, 26, true, NULL, NOW(), NOW()),
        
        -- Ubicación adicional
        (producto_irc_id, 'provincia', 'Provincia', tipo_texto_id, false, 31, true, NULL, NOW(), NOW()),
        (producto_irc_id, 'sector', 'Sector', tipo_texto_id, false, 32, true, NULL, NOW(), NOW()),
        (producto_irc_id, 'telefonoSecundario', 'Teléfono Secundario', tipo_texto_id, false, 34, true, NULL, NOW(), NOW()),
        
        -- Tipo de persona y descripción
        (producto_irc_id, 'tipoPersona', 'Tipo de Persona', tipo_texto_id, true, 45, true, 'MORAL o FISICA', NOW(), NOW()),
        (producto_irc_id, 'descripcionActividades', 'Descripción de Actividades', tipo_texto_id, false, 46, true, NULL, NOW(), NOW()),
        
        -- Persona FISICA - Propietario
        (producto_irc_id, 'nombrePropietario', 'Nombre del Propietario', tipo_texto_id, false, 50, true, NULL, NOW(), NOW()),
        (producto_irc_id, 'cedulaPropietario', 'Cédula del Propietario', tipo_texto_id, false, 51, true, NULL, NOW(), NOW()),
        (producto_irc_id, 'domicilioPropietario', 'Domicilio del Propietario', tipo_texto_id, false, 52, true, NULL, NOW(), NOW()),
        (producto_irc_id, 'telefonoPropietario', 'Teléfono del Propietario', tipo_texto_id, false, 53, true, NULL, NOW(), NOW()),
        (producto_irc_id, 'celularPropietario', 'Celular del Propietario', tipo_texto_id, false, 54, true, NULL, NOW(), NOW()),
        (producto_irc_id, 'emailPropietario', 'Email del Propietario', tipo_texto_id, false, 55, true, NULL, NOW(), NOW()),
        
        -- Persona FISICA - Administrador
        (producto_irc_id, 'nombreAdministrador', 'Nombre del Administrador', tipo_texto_id, false, 60, true, NULL, NOW(), NOW()),
        (producto_irc_id, 'cedulaAdministrador', 'Cédula del Administrador', tipo_texto_id, false, 61, true, NULL, NOW(), NOW()),
        (producto_irc_id, 'telefonoAdministrador', 'Teléfono del Administrador', tipo_texto_id, false, 62, true, NULL, NOW(), NOW()),
        (producto_irc_id, 'fechaInicioActividades', 'Fecha Inicio Actividades', tipo_texto_id, false, 63, true, NULL, NOW(), NOW()),
        
        -- Persona MORAL - Presidente
        (producto_irc_id, 'presidenteNombre', 'Nombre del Presidente', tipo_texto_id, false, 70, true, NULL, NOW(), NOW()),
        (producto_irc_id, 'presidenteCedula', 'Cédula del Presidente', tipo_texto_id, false, 71, true, NULL, NOW(), NOW()),
        (producto_irc_id, 'presidenteDomicilio', 'Domicilio del Presidente', tipo_texto_id, false, 72, true, NULL, NOW(), NOW()),
        (producto_irc_id, 'presidenteTelefono', 'Teléfono del Presidente', tipo_texto_id, false, 73, true, NULL, NOW(), NOW()),
        (producto_irc_id, 'presidenteCelular', 'Celular del Presidente', tipo_texto_id, false, 74, true, NULL, NOW(), NOW()),
        (producto_irc_id, 'presidenteEmail', 'Email del Presidente', tipo_texto_id, false, 75, true, NULL, NOW(), NOW()),
        
        -- Persona MORAL - Otros miembros
        (producto_irc_id, 'vicepresidente', 'Vicepresidente', tipo_texto_id, false, 80, true, NULL, NOW(), NOW()),
        (producto_irc_id, 'secretario', 'Secretario', tipo_texto_id, false, 81, true, NULL, NOW(), NOW()),
        (producto_irc_id, 'tesorero', 'Tesorero', tipo_texto_id, false, 82, true, NULL, NOW(), NOW()),
        (producto_irc_id, 'administrador', 'Administrador', tipo_texto_id, false, 83, true, NULL, NOW(), NOW()),
        (producto_irc_id, 'domicilioConsejo', 'Domicilio del Consejo', tipo_texto_id, false, 84, true, NULL, NOW(), NOW()),
        (producto_irc_id, 'telefonoConsejo', 'Teléfono del Consejo', tipo_texto_id, false, 85, true, NULL, NOW(), NOW()),
        (producto_irc_id, 'fechaConstitucion', 'Fecha Constitución', tipo_texto_id, false, 86, true, NULL, NOW(), NOW())
        ON CONFLICT (campo, "productoId") DO NOTHING;
        
        RAISE NOTICE 'Campos IRC agregados exitosamente';
    ELSE
        RAISE NOTICE 'No se encontró el producto IRC-01 o el tipo texto';
    END IF;
END $$;
