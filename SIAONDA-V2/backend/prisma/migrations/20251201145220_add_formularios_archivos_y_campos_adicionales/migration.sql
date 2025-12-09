-- AlterTable
ALTER TABLE "formularios" ADD COLUMN     "fecha_asentamiento" TIMESTAMP(3),
ADD COLUMN     "fecha_devolucion" TIMESTAMP(3),
ADD COLUMN     "fecha_entrega" TIMESTAMP(3),
ADD COLUMN     "hoja" VARCHAR(50),
ADD COLUMN     "libro" VARCHAR(50),
ADD COLUMN     "mensaje_devolucion" TEXT,
ADD COLUMN     "monto_total" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "formularios_campos" ADD COLUMN     "grupo" VARCHAR(100),
ADD COLUMN     "placeholder" VARCHAR(255);

-- CreateTable
CREATE TABLE "formularios_archivos" (
    "id" SERIAL NOT NULL,
    "formulario_id" INTEGER NOT NULL,
    "formulario_producto_id" INTEGER,
    "campo_id" INTEGER,
    "nombre_original" VARCHAR(255) NOT NULL,
    "nombre_sistema" VARCHAR(255) NOT NULL,
    "ruta" VARCHAR(500) NOT NULL,
    "tamano" BIGINT NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "formularios_archivos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "formularios_archivos_nombre_sistema_key" ON "formularios_archivos"("nombre_sistema");

-- CreateIndex
CREATE INDEX "formularios_archivos_formulario_id_idx" ON "formularios_archivos"("formulario_id");

-- CreateIndex
CREATE INDEX "formularios_archivos_formulario_producto_id_idx" ON "formularios_archivos"("formulario_producto_id");

-- CreateIndex
CREATE INDEX "formularios_estado_id_idx" ON "formularios"("estado_id");

-- AddForeignKey
ALTER TABLE "formularios_archivos" ADD CONSTRAINT "formularios_archivos_formulario_id_fkey" FOREIGN KEY ("formulario_id") REFERENCES "formularios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formularios_archivos" ADD CONSTRAINT "formularios_archivos_formulario_producto_id_fkey" FOREIGN KEY ("formulario_producto_id") REFERENCES "formularios_productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formularios_archivos" ADD CONSTRAINT "formularios_archivos_campo_id_fkey" FOREIGN KEY ("campo_id") REFERENCES "formularios_campos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
