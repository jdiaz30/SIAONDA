-- Migration para actualizar campos de asentamiento
-- De: numeroAsiento, libroAsiento
-- A: numeroRegistro, numeroLibro, numeroHoja

-- ============================================
-- TABLA: solicitudes_registro_inspeccion
-- ============================================

-- Renombrar columnas existentes
ALTER TABLE solicitudes_registro_inspeccion
  RENAME COLUMN numero_asiento TO numero_registro;

ALTER TABLE solicitudes_registro_inspeccion
  RENAME COLUMN libro_asiento TO numero_libro;

-- Agregar nueva columna para número de hoja
ALTER TABLE solicitudes_registro_inspeccion
  ADD COLUMN numero_hoja VARCHAR(50);

-- Actualizar comentarios
COMMENT ON COLUMN solicitudes_registro_inspeccion.numero_registro IS 'Número de registro (código del formulario): 00000000/MM/YYYY';
COMMENT ON COLUMN solicitudes_registro_inspeccion.numero_libro IS 'Número del libro físico donde se asienta';
COMMENT ON COLUMN solicitudes_registro_inspeccion.numero_hoja IS 'Número de hoja del libro donde se asienta';

-- ============================================
-- TABLA: certificados_inspeccion
-- ============================================

-- Renombrar columna numero_asiento a numero_registro
ALTER TABLE certificados_inspeccion
  RENAME COLUMN numero_asiento TO numero_registro;

-- Agregar columnas numero_libro y numero_hoja
ALTER TABLE certificados_inspeccion
  ADD COLUMN numero_libro VARCHAR(50);

ALTER TABLE certificados_inspeccion
  ADD COLUMN numero_hoja VARCHAR(50);

-- Actualizar índice
DROP INDEX IF EXISTS certificados_inspeccion_numero_asiento_idx;
CREATE UNIQUE INDEX certificados_inspeccion_numero_registro_key ON certificados_inspeccion(numero_registro);
CREATE INDEX certificados_inspeccion_numero_registro_idx ON certificados_inspeccion(numero_registro);

-- Actualizar comentarios
COMMENT ON COLUMN certificados_inspeccion.numero_certificado IS 'Número de certificado (código del formulario): formato 00000000/MM/YYYY';
COMMENT ON COLUMN certificados_inspeccion.numero_registro IS 'Número de registro (código del formulario): formato 00000000/MM/YYYY';
COMMENT ON COLUMN certificados_inspeccion.numero_libro IS 'Número del libro físico donde está asentado';
COMMENT ON COLUMN certificados_inspeccion.numero_hoja IS 'Número de hoja del libro donde está asentado';
