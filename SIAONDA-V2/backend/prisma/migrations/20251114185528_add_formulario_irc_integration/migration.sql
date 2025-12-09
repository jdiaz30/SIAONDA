/*
  Warnings:

  - A unique constraint covering the columns `[solicitud_irc_id]` on the table `formularios` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "facturas" ADD COLUMN     "cierre_id" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "formularios" ADD COLUMN     "solicitud_irc_id" INTEGER;

-- CreateTable
CREATE TABLE "secuencias_ncf" (
    "id" SERIAL NOT NULL,
    "tipoComprobante" VARCHAR(3) NOT NULL,
    "serie" VARCHAR(1) NOT NULL,
    "numero_inicial" BIGINT NOT NULL,
    "numero_final" BIGINT NOT NULL,
    "numero_actual" BIGINT NOT NULL,
    "fecha_vencimiento" TIMESTAMP(3) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "secuencias_ncf_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empresas_inspeccionadas" (
    "id" SERIAL NOT NULL,
    "nombre_empresa" VARCHAR(255) NOT NULL,
    "nombre_comercial" VARCHAR(255),
    "rnc" VARCHAR(20) NOT NULL,
    "direccion" TEXT NOT NULL,
    "telefono" VARCHAR(50) NOT NULL,
    "fax" VARCHAR(50),
    "email" VARCHAR(255) NOT NULL,
    "pagina_web" VARCHAR(255),
    "categoria_irc_id" INTEGER NOT NULL,
    "tipoPersona" VARCHAR(10) NOT NULL,
    "nombre_propietario" VARCHAR(255),
    "cedula_propietario" VARCHAR(20),
    "descripcion_actividades" TEXT NOT NULL,
    "provincia_id" INTEGER,
    "persona_contacto" VARCHAR(255),
    "status_id" INTEGER NOT NULL,
    "estado_juridico_id" INTEGER,
    "conclusion_id" INTEGER,
    "status_externo_id" INTEGER,
    "registrado" BOOLEAN NOT NULL DEFAULT false,
    "existe_en_sistema" BOOLEAN NOT NULL DEFAULT false,
    "fecha_registro" TIMESTAMP(3),
    "fecha_renovacion" TIMESTAMP(3),
    "fecha_vencimiento" TIMESTAMP(3),
    "fecha_notificacion" TIMESTAMP(3),
    "fecha_acta_infraccion" TIMESTAMP(3),
    "comentario" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "creado_por_id" INTEGER NOT NULL,

    CONSTRAINT "empresas_inspeccionadas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consejo_administracion" (
    "id" SERIAL NOT NULL,
    "empresa_id" INTEGER NOT NULL,
    "cargo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "cedula" VARCHAR(20) NOT NULL,

    CONSTRAINT "consejo_administracion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes_empresa" (
    "id" SERIAL NOT NULL,
    "empresa_id" INTEGER NOT NULL,
    "nombre_cliente" VARCHAR(255) NOT NULL,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "clientes_empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos_empresa" (
    "id" SERIAL NOT NULL,
    "empresa_id" INTEGER NOT NULL,
    "tipo_documento" VARCHAR(50) NOT NULL,
    "nombre_archivo" VARCHAR(255) NOT NULL,
    "ruta_archivo" VARCHAR(500) NOT NULL,
    "tamano" INTEGER NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "cargado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cargado_por_id" INTEGER NOT NULL,

    CONSTRAINT "documentos_empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias_irc" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(10) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "categorias_irc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_inspeccion" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "status_inspeccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estados_juridicos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "estados_juridicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conclusiones" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "conclusiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_externos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "status_externos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provincias" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "codigo" VARCHAR(5),

    CONSTRAINT "provincias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitudes_registro_inspeccion" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "empresa_id" INTEGER,
    "tipo_solicitud" VARCHAR(50) NOT NULL,
    "nombre_empresa" VARCHAR(255),
    "nombre_comercial" VARCHAR(255),
    "rnc" VARCHAR(20) NOT NULL,
    "categoria_irc_id" INTEGER NOT NULL,
    "estado_id" INTEGER NOT NULL,
    "factura_id" INTEGER,
    "numero_asiento" VARCHAR(50),
    "libro_asiento" VARCHAR(50),
    "certificado_id" INTEGER,
    "recibido_por_id" INTEGER,
    "fecha_recepcion" TIMESTAMP(3),
    "validado_por_id" INTEGER,
    "fecha_validacion" TIMESTAMP(3),
    "fecha_pago" TIMESTAMP(3),
    "asentado_por_id" INTEGER,
    "fecha_asentamiento" TIMESTAMP(3),
    "firmado_por_id" INTEGER,
    "fecha_firma" TIMESTAMP(3),
    "entregado_por_id" INTEGER,
    "fecha_entrega" TIMESTAMP(3),
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitudes_registro_inspeccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estados_solicitud_inspeccion" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "estados_solicitud_inspeccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificados_inspeccion" (
    "id" SERIAL NOT NULL,
    "empresa_id" INTEGER NOT NULL,
    "numero_certificado" VARCHAR(50) NOT NULL,
    "numero_asiento" VARCHAR(50) NOT NULL,
    "factura_id" INTEGER NOT NULL,
    "fecha_emision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_vencimiento" TIMESTAMP(3) NOT NULL,
    "ruta_pdf" VARCHAR(500) NOT NULL,
    "ruta_pdf_firmado" VARCHAR(500),
    "emitido_por_id" INTEGER NOT NULL,
    "firmado_por_id" INTEGER,
    "fecha_firma" TIMESTAMP(3),
    "anulado" BOOLEAN NOT NULL DEFAULT false,
    "motivo_anulacion" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificados_inspeccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "casos_inspeccion" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "empresa_id" INTEGER NOT NULL,
    "tipo_caso" VARCHAR(50) NOT NULL,
    "origen_caso" VARCHAR(50),
    "estado_caso_id" INTEGER NOT NULL,
    "status_id" INTEGER NOT NULL,
    "prioridad" VARCHAR(20) NOT NULL DEFAULT 'MEDIA',
    "asignado_por_id" INTEGER,
    "inspector_asignado_id" INTEGER,
    "fecha_asignacion" TIMESTAMP(3),
    "factura_id" INTEGER,
    "denunciante_nombre" VARCHAR(255),
    "denunciante_telefono" VARCHAR(50),
    "denunciante_email" VARCHAR(255),
    "detalles_denuncia" TEXT,
    "operativo_id" INTEGER,
    "fecha_primera_visita" TIMESTAMP(3),
    "acta_inspeccion_id" INTEGER,
    "plazo_correccion_dias" INTEGER DEFAULT 10,
    "fecha_limite_correccion" TIMESTAMP(3),
    "fecha_segunda_visita" TIMESTAMP(3),
    "acta_infraccion_id" INTEGER,
    "resolucion" VARCHAR(50),
    "fecha_cierre" TIMESTAMP(3),
    "motivo_cierre" TEXT,
    "cerrado_por_id" INTEGER,
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "casos_inspeccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estados_caso_inspeccion" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "estados_caso_inspeccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actas_inspeccion" (
    "id" SERIAL NOT NULL,
    "numero_acta" VARCHAR(50) NOT NULL,
    "tipo_acta" VARCHAR(50) NOT NULL,
    "empresa_id" INTEGER NOT NULL,
    "fecha_visita" TIMESTAMP(3) NOT NULL,
    "hora_visita" VARCHAR(10),
    "inspector_id" INTEGER NOT NULL,
    "cumplimiento" BOOLEAN,
    "hallazgos" TEXT NOT NULL,
    "infracciones" TEXT,
    "plazo_correccion" INTEGER,
    "fecha_limite" TIMESTAMP(3),
    "evidencia_fotografica" TEXT,
    "documentos_adjuntos" TEXT,
    "ruta_pdf" VARCHAR(500) NOT NULL,
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actas_inspeccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operativos" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "fecha_planificada" TIMESTAMP(3) NOT NULL,
    "fecha_ejecucion" TIMESTAMP(3),
    "zona" VARCHAR(255),
    "objetivos" TEXT NOT NULL,
    "estado_operativo_id" INTEGER NOT NULL,
    "coordinador_id" INTEGER NOT NULL,
    "total_empresas" INTEGER DEFAULT 0,
    "total_infracciones" INTEGER DEFAULT 0,
    "reporte_final" VARCHAR(500),
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operativos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estados_operativo" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "estados_operativo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instituciones_operativo" (
    "id" SERIAL NOT NULL,
    "operativo_id" INTEGER NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "contacto" VARCHAR(255),
    "telefono" VARCHAR(50),

    CONSTRAINT "instituciones_operativo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspectores_operativo" (
    "id" SERIAL NOT NULL,
    "operativo_id" INTEGER NOT NULL,
    "inspector_id" INTEGER NOT NULL,
    "rol" VARCHAR(100),

    CONSTRAINT "inspectores_operativo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "secuencias_ncf_tipoComprobante_activo_idx" ON "secuencias_ncf"("tipoComprobante", "activo");

-- CreateIndex
CREATE UNIQUE INDEX "secuencias_ncf_tipoComprobante_serie_numero_inicial_key" ON "secuencias_ncf"("tipoComprobante", "serie", "numero_inicial");

-- CreateIndex
CREATE UNIQUE INDEX "empresas_inspeccionadas_rnc_key" ON "empresas_inspeccionadas"("rnc");

-- CreateIndex
CREATE INDEX "empresas_inspeccionadas_rnc_idx" ON "empresas_inspeccionadas"("rnc");

-- CreateIndex
CREATE INDEX "empresas_inspeccionadas_categoria_irc_id_idx" ON "empresas_inspeccionadas"("categoria_irc_id");

-- CreateIndex
CREATE INDEX "empresas_inspeccionadas_fecha_renovacion_idx" ON "empresas_inspeccionadas"("fecha_renovacion");

-- CreateIndex
CREATE INDEX "empresas_inspeccionadas_fecha_vencimiento_idx" ON "empresas_inspeccionadas"("fecha_vencimiento");

-- CreateIndex
CREATE INDEX "empresas_inspeccionadas_status_id_idx" ON "empresas_inspeccionadas"("status_id");

-- CreateIndex
CREATE INDEX "consejo_administracion_empresa_id_idx" ON "consejo_administracion"("empresa_id");

-- CreateIndex
CREATE INDEX "clientes_empresa_empresa_id_idx" ON "clientes_empresa"("empresa_id");

-- CreateIndex
CREATE INDEX "documentos_empresa_empresa_id_idx" ON "documentos_empresa"("empresa_id");

-- CreateIndex
CREATE INDEX "documentos_empresa_tipo_documento_idx" ON "documentos_empresa"("tipo_documento");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_irc_codigo_key" ON "categorias_irc"("codigo");

-- CreateIndex
CREATE INDEX "categorias_irc_codigo_idx" ON "categorias_irc"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "status_inspeccion_nombre_key" ON "status_inspeccion"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "estados_juridicos_nombre_key" ON "estados_juridicos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "conclusiones_nombre_key" ON "conclusiones"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "status_externos_nombre_key" ON "status_externos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "provincias_nombre_key" ON "provincias"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "solicitudes_registro_inspeccion_codigo_key" ON "solicitudes_registro_inspeccion"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "solicitudes_registro_inspeccion_factura_id_key" ON "solicitudes_registro_inspeccion"("factura_id");

-- CreateIndex
CREATE UNIQUE INDEX "solicitudes_registro_inspeccion_numero_asiento_key" ON "solicitudes_registro_inspeccion"("numero_asiento");

-- CreateIndex
CREATE UNIQUE INDEX "solicitudes_registro_inspeccion_certificado_id_key" ON "solicitudes_registro_inspeccion"("certificado_id");

-- CreateIndex
CREATE INDEX "solicitudes_registro_inspeccion_codigo_idx" ON "solicitudes_registro_inspeccion"("codigo");

-- CreateIndex
CREATE INDEX "solicitudes_registro_inspeccion_rnc_idx" ON "solicitudes_registro_inspeccion"("rnc");

-- CreateIndex
CREATE INDEX "solicitudes_registro_inspeccion_estado_id_idx" ON "solicitudes_registro_inspeccion"("estado_id");

-- CreateIndex
CREATE INDEX "solicitudes_registro_inspeccion_fecha_recepcion_idx" ON "solicitudes_registro_inspeccion"("fecha_recepcion");

-- CreateIndex
CREATE UNIQUE INDEX "estados_solicitud_inspeccion_nombre_key" ON "estados_solicitud_inspeccion"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "certificados_inspeccion_numero_certificado_key" ON "certificados_inspeccion"("numero_certificado");

-- CreateIndex
CREATE UNIQUE INDEX "certificados_inspeccion_numero_asiento_key" ON "certificados_inspeccion"("numero_asiento");

-- CreateIndex
CREATE UNIQUE INDEX "certificados_inspeccion_factura_id_key" ON "certificados_inspeccion"("factura_id");

-- CreateIndex
CREATE INDEX "certificados_inspeccion_empresa_id_idx" ON "certificados_inspeccion"("empresa_id");

-- CreateIndex
CREATE INDEX "certificados_inspeccion_numero_asiento_idx" ON "certificados_inspeccion"("numero_asiento");

-- CreateIndex
CREATE INDEX "certificados_inspeccion_fecha_vencimiento_idx" ON "certificados_inspeccion"("fecha_vencimiento");

-- CreateIndex
CREATE UNIQUE INDEX "casos_inspeccion_codigo_key" ON "casos_inspeccion"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "casos_inspeccion_factura_id_key" ON "casos_inspeccion"("factura_id");

-- CreateIndex
CREATE UNIQUE INDEX "casos_inspeccion_acta_inspeccion_id_key" ON "casos_inspeccion"("acta_inspeccion_id");

-- CreateIndex
CREATE UNIQUE INDEX "casos_inspeccion_acta_infraccion_id_key" ON "casos_inspeccion"("acta_infraccion_id");

-- CreateIndex
CREATE INDEX "casos_inspeccion_codigo_idx" ON "casos_inspeccion"("codigo");

-- CreateIndex
CREATE INDEX "casos_inspeccion_empresa_id_idx" ON "casos_inspeccion"("empresa_id");

-- CreateIndex
CREATE INDEX "casos_inspeccion_tipo_caso_idx" ON "casos_inspeccion"("tipo_caso");

-- CreateIndex
CREATE INDEX "casos_inspeccion_estado_caso_id_idx" ON "casos_inspeccion"("estado_caso_id");

-- CreateIndex
CREATE INDEX "casos_inspeccion_inspector_asignado_id_idx" ON "casos_inspeccion"("inspector_asignado_id");

-- CreateIndex
CREATE INDEX "casos_inspeccion_fecha_asignacion_idx" ON "casos_inspeccion"("fecha_asignacion");

-- CreateIndex
CREATE INDEX "casos_inspeccion_fecha_limite_correccion_idx" ON "casos_inspeccion"("fecha_limite_correccion");

-- CreateIndex
CREATE UNIQUE INDEX "estados_caso_inspeccion_nombre_key" ON "estados_caso_inspeccion"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "actas_inspeccion_numero_acta_key" ON "actas_inspeccion"("numero_acta");

-- CreateIndex
CREATE INDEX "actas_inspeccion_empresa_id_idx" ON "actas_inspeccion"("empresa_id");

-- CreateIndex
CREATE INDEX "actas_inspeccion_fecha_visita_idx" ON "actas_inspeccion"("fecha_visita");

-- CreateIndex
CREATE INDEX "actas_inspeccion_fecha_limite_idx" ON "actas_inspeccion"("fecha_limite");

-- CreateIndex
CREATE INDEX "actas_inspeccion_tipo_acta_idx" ON "actas_inspeccion"("tipo_acta");

-- CreateIndex
CREATE UNIQUE INDEX "operativos_codigo_key" ON "operativos"("codigo");

-- CreateIndex
CREATE INDEX "operativos_codigo_idx" ON "operativos"("codigo");

-- CreateIndex
CREATE INDEX "operativos_fecha_planificada_idx" ON "operativos"("fecha_planificada");

-- CreateIndex
CREATE INDEX "operativos_estado_operativo_id_idx" ON "operativos"("estado_operativo_id");

-- CreateIndex
CREATE UNIQUE INDEX "estados_operativo_nombre_key" ON "estados_operativo"("nombre");

-- CreateIndex
CREATE INDEX "instituciones_operativo_operativo_id_idx" ON "instituciones_operativo"("operativo_id");

-- CreateIndex
CREATE INDEX "inspectores_operativo_operativo_id_idx" ON "inspectores_operativo"("operativo_id");

-- CreateIndex
CREATE INDEX "inspectores_operativo_inspector_id_idx" ON "inspectores_operativo"("inspector_id");

-- CreateIndex
CREATE UNIQUE INDEX "inspectores_operativo_operativo_id_inspector_id_key" ON "inspectores_operativo"("operativo_id", "inspector_id");

-- CreateIndex
CREATE UNIQUE INDEX "formularios_solicitud_irc_id_key" ON "formularios"("solicitud_irc_id");

-- AddForeignKey
ALTER TABLE "formularios" ADD CONSTRAINT "formularios_solicitud_irc_id_fkey" FOREIGN KEY ("solicitud_irc_id") REFERENCES "solicitudes_registro_inspeccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empresas_inspeccionadas" ADD CONSTRAINT "empresas_inspeccionadas_categoria_irc_id_fkey" FOREIGN KEY ("categoria_irc_id") REFERENCES "categorias_irc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empresas_inspeccionadas" ADD CONSTRAINT "empresas_inspeccionadas_provincia_id_fkey" FOREIGN KEY ("provincia_id") REFERENCES "provincias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empresas_inspeccionadas" ADD CONSTRAINT "empresas_inspeccionadas_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status_inspeccion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empresas_inspeccionadas" ADD CONSTRAINT "empresas_inspeccionadas_estado_juridico_id_fkey" FOREIGN KEY ("estado_juridico_id") REFERENCES "estados_juridicos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empresas_inspeccionadas" ADD CONSTRAINT "empresas_inspeccionadas_conclusion_id_fkey" FOREIGN KEY ("conclusion_id") REFERENCES "conclusiones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empresas_inspeccionadas" ADD CONSTRAINT "empresas_inspeccionadas_status_externo_id_fkey" FOREIGN KEY ("status_externo_id") REFERENCES "status_externos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empresas_inspeccionadas" ADD CONSTRAINT "empresas_inspeccionadas_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consejo_administracion" ADD CONSTRAINT "consejo_administracion_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas_inspeccionadas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes_empresa" ADD CONSTRAINT "clientes_empresa_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas_inspeccionadas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_empresa" ADD CONSTRAINT "documentos_empresa_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas_inspeccionadas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_empresa" ADD CONSTRAINT "documentos_empresa_cargado_por_id_fkey" FOREIGN KEY ("cargado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_registro_inspeccion" ADD CONSTRAINT "solicitudes_registro_inspeccion_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas_inspeccionadas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_registro_inspeccion" ADD CONSTRAINT "solicitudes_registro_inspeccion_categoria_irc_id_fkey" FOREIGN KEY ("categoria_irc_id") REFERENCES "categorias_irc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_registro_inspeccion" ADD CONSTRAINT "solicitudes_registro_inspeccion_estado_id_fkey" FOREIGN KEY ("estado_id") REFERENCES "estados_solicitud_inspeccion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_registro_inspeccion" ADD CONSTRAINT "solicitudes_registro_inspeccion_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "facturas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_registro_inspeccion" ADD CONSTRAINT "solicitudes_registro_inspeccion_certificado_id_fkey" FOREIGN KEY ("certificado_id") REFERENCES "certificados_inspeccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_registro_inspeccion" ADD CONSTRAINT "solicitudes_registro_inspeccion_recibido_por_id_fkey" FOREIGN KEY ("recibido_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_registro_inspeccion" ADD CONSTRAINT "solicitudes_registro_inspeccion_validado_por_id_fkey" FOREIGN KEY ("validado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_registro_inspeccion" ADD CONSTRAINT "solicitudes_registro_inspeccion_asentado_por_id_fkey" FOREIGN KEY ("asentado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_registro_inspeccion" ADD CONSTRAINT "solicitudes_registro_inspeccion_firmado_por_id_fkey" FOREIGN KEY ("firmado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_registro_inspeccion" ADD CONSTRAINT "solicitudes_registro_inspeccion_entregado_por_id_fkey" FOREIGN KEY ("entregado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificados_inspeccion" ADD CONSTRAINT "certificados_inspeccion_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas_inspeccionadas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificados_inspeccion" ADD CONSTRAINT "certificados_inspeccion_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "facturas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificados_inspeccion" ADD CONSTRAINT "certificados_inspeccion_emitido_por_id_fkey" FOREIGN KEY ("emitido_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificados_inspeccion" ADD CONSTRAINT "certificados_inspeccion_firmado_por_id_fkey" FOREIGN KEY ("firmado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casos_inspeccion" ADD CONSTRAINT "casos_inspeccion_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas_inspeccionadas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casos_inspeccion" ADD CONSTRAINT "casos_inspeccion_estado_caso_id_fkey" FOREIGN KEY ("estado_caso_id") REFERENCES "estados_caso_inspeccion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casos_inspeccion" ADD CONSTRAINT "casos_inspeccion_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status_inspeccion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casos_inspeccion" ADD CONSTRAINT "casos_inspeccion_asignado_por_id_fkey" FOREIGN KEY ("asignado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casos_inspeccion" ADD CONSTRAINT "casos_inspeccion_inspector_asignado_id_fkey" FOREIGN KEY ("inspector_asignado_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casos_inspeccion" ADD CONSTRAINT "casos_inspeccion_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "facturas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casos_inspeccion" ADD CONSTRAINT "casos_inspeccion_operativo_id_fkey" FOREIGN KEY ("operativo_id") REFERENCES "operativos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casos_inspeccion" ADD CONSTRAINT "casos_inspeccion_acta_inspeccion_id_fkey" FOREIGN KEY ("acta_inspeccion_id") REFERENCES "actas_inspeccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casos_inspeccion" ADD CONSTRAINT "casos_inspeccion_acta_infraccion_id_fkey" FOREIGN KEY ("acta_infraccion_id") REFERENCES "actas_inspeccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casos_inspeccion" ADD CONSTRAINT "casos_inspeccion_cerrado_por_id_fkey" FOREIGN KEY ("cerrado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actas_inspeccion" ADD CONSTRAINT "actas_inspeccion_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas_inspeccionadas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actas_inspeccion" ADD CONSTRAINT "actas_inspeccion_inspector_id_fkey" FOREIGN KEY ("inspector_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operativos" ADD CONSTRAINT "operativos_estado_operativo_id_fkey" FOREIGN KEY ("estado_operativo_id") REFERENCES "estados_operativo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operativos" ADD CONSTRAINT "operativos_coordinador_id_fkey" FOREIGN KEY ("coordinador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instituciones_operativo" ADD CONSTRAINT "instituciones_operativo_operativo_id_fkey" FOREIGN KEY ("operativo_id") REFERENCES "operativos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspectores_operativo" ADD CONSTRAINT "inspectores_operativo_operativo_id_fkey" FOREIGN KEY ("operativo_id") REFERENCES "operativos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspectores_operativo" ADD CONSTRAINT "inspectores_operativo_inspector_id_fkey" FOREIGN KEY ("inspector_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
