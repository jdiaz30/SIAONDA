-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "fecha_fallecimiento" TIMESTAMP(3),
ADD COLUMN     "genero" VARCHAR(1),
ADD COLUMN     "movil" VARCHAR(50),
ADD COLUMN     "municipio" VARCHAR(100),
ADD COLUMN     "provincia" VARCHAR(100),
ADD COLUMN     "sector" VARCHAR(100),
ADD COLUMN     "seudonimo" VARCHAR(200),
ADD COLUMN     "tipo_identificacion" VARCHAR(20);

-- CreateTable
CREATE TABLE "visitas" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "fecha_entrada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_salida" TIMESTAMP(3),
    "tipo_visita" VARCHAR(100) NOT NULL,
    "departamento" VARCHAR(100),
    "persona_contacto" VARCHAR(200),
    "razon_visita" VARCHAR(500),
    "nota" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visitas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "visitas_cliente_id_idx" ON "visitas"("cliente_id");

-- CreateIndex
CREATE INDEX "visitas_fecha_entrada_idx" ON "visitas"("fecha_entrada");

-- AddForeignKey
ALTER TABLE "visitas" ADD CONSTRAINT "visitas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
