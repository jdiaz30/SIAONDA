/*
  Warnings:

  - You are about to drop the column `numero_asiento` on the `certificados_inspeccion` table. All the data in the column will be lost.
  - You are about to drop the column `libro_asiento` on the `solicitudes_registro_inspeccion` table. All the data in the column will be lost.
  - You are about to drop the column `numero_asiento` on the `solicitudes_registro_inspeccion` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[numero_registro]` on the table `certificados_inspeccion` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[numero_registro]` on the table `solicitudes_registro_inspeccion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `numero_registro` to the `certificados_inspeccion` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "certificados_inspeccion_numero_asiento_idx";

-- DropIndex
DROP INDEX "certificados_inspeccion_numero_asiento_key";

-- DropIndex
DROP INDEX "solicitudes_registro_inspeccion_numero_asiento_key";

-- AlterTable
ALTER TABLE "certificados_inspeccion" DROP COLUMN "numero_asiento",
ADD COLUMN     "numero_hoja" VARCHAR(50),
ADD COLUMN     "numero_libro" VARCHAR(50),
ADD COLUMN     "numero_registro" VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE "solicitudes_registro_inspeccion" DROP COLUMN "libro_asiento",
DROP COLUMN "numero_asiento",
ADD COLUMN     "numero_hoja" VARCHAR(50),
ADD COLUMN     "numero_libro" VARCHAR(50),
ADD COLUMN     "numero_registro" VARCHAR(50);

-- CreateTable
CREATE TABLE "viajes_oficio" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "provincia_id" INTEGER NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3),
    "estado_viaje_id" INTEGER NOT NULL,
    "ruta_informe_general" VARCHAR(500),
    "observaciones" TEXT,
    "creado_por_id" INTEGER NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "viajes_oficio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estados_viaje_oficio" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "estados_viaje_oficio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "viajes_oficio_inspectores" (
    "id" SERIAL NOT NULL,
    "viaje_id" INTEGER NOT NULL,
    "inspector_id" INTEGER NOT NULL,

    CONSTRAINT "viajes_oficio_inspectores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actas_inspeccion_oficio" (
    "id" SERIAL NOT NULL,
    "numero_acta" VARCHAR(50) NOT NULL,
    "viaje_id" INTEGER NOT NULL,
    "inspector_id" INTEGER NOT NULL,
    "empresa_id" INTEGER NOT NULL,
    "ruta_pdf_acta" VARCHAR(500) NOT NULL,
    "resultado_inspeccion" TEXT NOT NULL,
    "requiere_seguimiento" BOOLEAN NOT NULL DEFAULT false,
    "caso_generado_id" INTEGER,
    "fecha_inspeccion" TIMESTAMP(3) NOT NULL,
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actas_inspeccion_oficio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "denuncias" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "denunciante_nombre" VARCHAR(255) NOT NULL,
    "denunciante_telefono" VARCHAR(50),
    "denunciante_email" VARCHAR(255),
    "denunciante_direccion" TEXT,
    "ruta_cedula_denunciante" VARCHAR(500) NOT NULL,
    "ruta_comunicacion" VARCHAR(500) NOT NULL,
    "empresa_denunciada" VARCHAR(255) NOT NULL,
    "direccion_empresa" TEXT,
    "descripcion_hechos" TEXT NOT NULL,
    "factura_id" INTEGER,
    "estado_denuncia_id" INTEGER NOT NULL,
    "caso_generado_id" INTEGER,
    "recibido_por_id" INTEGER NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "denuncias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estados_denuncia" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "estados_denuncia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "casos_juridico" (
    "id" SERIAL NOT NULL,
    "caso_inspeccion_id" INTEGER NOT NULL,
    "estado_juridico_id" INTEGER NOT NULL,
    "fecha_recepcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_cierre" TIMESTAMP(3),
    "recibido_por_id" INTEGER,
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "casos_juridico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estados_caso_juridico" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "estados_caso_juridico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "viajes_oficio_codigo_key" ON "viajes_oficio"("codigo");

-- CreateIndex
CREATE INDEX "viajes_oficio_codigo_idx" ON "viajes_oficio"("codigo");

-- CreateIndex
CREATE INDEX "viajes_oficio_provincia_id_idx" ON "viajes_oficio"("provincia_id");

-- CreateIndex
CREATE INDEX "viajes_oficio_estado_viaje_id_idx" ON "viajes_oficio"("estado_viaje_id");

-- CreateIndex
CREATE INDEX "viajes_oficio_fecha_inicio_idx" ON "viajes_oficio"("fecha_inicio");

-- CreateIndex
CREATE UNIQUE INDEX "estados_viaje_oficio_nombre_key" ON "estados_viaje_oficio"("nombre");

-- CreateIndex
CREATE INDEX "viajes_oficio_inspectores_viaje_id_idx" ON "viajes_oficio_inspectores"("viaje_id");

-- CreateIndex
CREATE INDEX "viajes_oficio_inspectores_inspector_id_idx" ON "viajes_oficio_inspectores"("inspector_id");

-- CreateIndex
CREATE UNIQUE INDEX "viajes_oficio_inspectores_viaje_id_inspector_id_key" ON "viajes_oficio_inspectores"("viaje_id", "inspector_id");

-- CreateIndex
CREATE UNIQUE INDEX "actas_inspeccion_oficio_numero_acta_key" ON "actas_inspeccion_oficio"("numero_acta");

-- CreateIndex
CREATE UNIQUE INDEX "actas_inspeccion_oficio_caso_generado_id_key" ON "actas_inspeccion_oficio"("caso_generado_id");

-- CreateIndex
CREATE INDEX "actas_inspeccion_oficio_viaje_id_idx" ON "actas_inspeccion_oficio"("viaje_id");

-- CreateIndex
CREATE INDEX "actas_inspeccion_oficio_empresa_id_idx" ON "actas_inspeccion_oficio"("empresa_id");

-- CreateIndex
CREATE INDEX "actas_inspeccion_oficio_inspector_id_idx" ON "actas_inspeccion_oficio"("inspector_id");

-- CreateIndex
CREATE INDEX "actas_inspeccion_oficio_numero_acta_idx" ON "actas_inspeccion_oficio"("numero_acta");

-- CreateIndex
CREATE UNIQUE INDEX "denuncias_codigo_key" ON "denuncias"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "denuncias_factura_id_key" ON "denuncias"("factura_id");

-- CreateIndex
CREATE UNIQUE INDEX "denuncias_caso_generado_id_key" ON "denuncias"("caso_generado_id");

-- CreateIndex
CREATE INDEX "denuncias_codigo_idx" ON "denuncias"("codigo");

-- CreateIndex
CREATE INDEX "denuncias_estado_denuncia_id_idx" ON "denuncias"("estado_denuncia_id");

-- CreateIndex
CREATE INDEX "denuncias_denunciante_nombre_idx" ON "denuncias"("denunciante_nombre");

-- CreateIndex
CREATE UNIQUE INDEX "estados_denuncia_nombre_key" ON "estados_denuncia"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "casos_juridico_caso_inspeccion_id_key" ON "casos_juridico"("caso_inspeccion_id");

-- CreateIndex
CREATE INDEX "casos_juridico_caso_inspeccion_id_idx" ON "casos_juridico"("caso_inspeccion_id");

-- CreateIndex
CREATE INDEX "casos_juridico_estado_juridico_id_idx" ON "casos_juridico"("estado_juridico_id");

-- CreateIndex
CREATE UNIQUE INDEX "estados_caso_juridico_nombre_key" ON "estados_caso_juridico"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "certificados_inspeccion_numero_registro_key" ON "certificados_inspeccion"("numero_registro");

-- CreateIndex
CREATE INDEX "certificados_inspeccion_numero_registro_idx" ON "certificados_inspeccion"("numero_registro");

-- CreateIndex
CREATE UNIQUE INDEX "solicitudes_registro_inspeccion_numero_registro_key" ON "solicitudes_registro_inspeccion"("numero_registro");

-- AddForeignKey
ALTER TABLE "viajes_oficio" ADD CONSTRAINT "viajes_oficio_provincia_id_fkey" FOREIGN KEY ("provincia_id") REFERENCES "provincias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viajes_oficio" ADD CONSTRAINT "viajes_oficio_estado_viaje_id_fkey" FOREIGN KEY ("estado_viaje_id") REFERENCES "estados_viaje_oficio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viajes_oficio" ADD CONSTRAINT "viajes_oficio_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viajes_oficio_inspectores" ADD CONSTRAINT "viajes_oficio_inspectores_viaje_id_fkey" FOREIGN KEY ("viaje_id") REFERENCES "viajes_oficio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viajes_oficio_inspectores" ADD CONSTRAINT "viajes_oficio_inspectores_inspector_id_fkey" FOREIGN KEY ("inspector_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actas_inspeccion_oficio" ADD CONSTRAINT "actas_inspeccion_oficio_viaje_id_fkey" FOREIGN KEY ("viaje_id") REFERENCES "viajes_oficio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actas_inspeccion_oficio" ADD CONSTRAINT "actas_inspeccion_oficio_inspector_id_fkey" FOREIGN KEY ("inspector_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actas_inspeccion_oficio" ADD CONSTRAINT "actas_inspeccion_oficio_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas_inspeccionadas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actas_inspeccion_oficio" ADD CONSTRAINT "actas_inspeccion_oficio_caso_generado_id_fkey" FOREIGN KEY ("caso_generado_id") REFERENCES "casos_inspeccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "denuncias" ADD CONSTRAINT "denuncias_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "facturas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "denuncias" ADD CONSTRAINT "denuncias_estado_denuncia_id_fkey" FOREIGN KEY ("estado_denuncia_id") REFERENCES "estados_denuncia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "denuncias" ADD CONSTRAINT "denuncias_caso_generado_id_fkey" FOREIGN KEY ("caso_generado_id") REFERENCES "casos_inspeccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "denuncias" ADD CONSTRAINT "denuncias_recibido_por_id_fkey" FOREIGN KEY ("recibido_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casos_juridico" ADD CONSTRAINT "casos_juridico_caso_inspeccion_id_fkey" FOREIGN KEY ("caso_inspeccion_id") REFERENCES "casos_inspeccion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casos_juridico" ADD CONSTRAINT "casos_juridico_estado_juridico_id_fkey" FOREIGN KEY ("estado_juridico_id") REFERENCES "estados_caso_juridico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casos_juridico" ADD CONSTRAINT "casos_juridico_recibido_por_id_fkey" FOREIGN KEY ("recibido_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
