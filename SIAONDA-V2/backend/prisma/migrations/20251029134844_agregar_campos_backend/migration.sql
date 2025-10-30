/*
  Warnings:

  - You are about to drop the column `costo` on the `productos_costos` table. All the data in the column will be lost.
  - Added the required column `libro_numero` to the `certificados` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itbis` to the `facturas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `facturas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `precio` to the `productos_costos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cajas" ADD COLUMN     "diferencia" DECIMAL(10,2),
ADD COLUMN     "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "hora_apertura" TIMESTAMP(3),
ADD COLUMN     "hora_cierre" TIMESTAMP(3),
ADD COLUMN     "monto_final" DECIMAL(10,2),
ADD COLUMN     "monto_inicial" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "observaciones" TEXT,
ADD COLUMN     "total_facturas" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "certificados" ADD COLUMN     "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "libro_numero" INTEGER NOT NULL,
ADD COLUMN     "observaciones" TEXT;

-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "fallecido" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rnc" VARCHAR(50);

-- AlterTable
ALTER TABLE "facturas" ADD COLUMN     "certificado_id" INTEGER,
ADD COLUMN     "fecha_pago" TIMESTAMP(3),
ADD COLUMN     "itbis" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "metodo_pago" VARCHAR(50),
ADD COLUMN     "observaciones" TEXT,
ADD COLUMN     "referencia_pago" VARCHAR(100),
ADD COLUMN     "subtotal" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "productos_costos" DROP COLUMN "costo",
ADD COLUMN     "precio" DECIMAL(10,2) NOT NULL;

-- CreateTable
CREATE TABLE "facturas_items" (
    "id" SERIAL NOT NULL,
    "factura_id" INTEGER NOT NULL,
    "concepto" VARCHAR(500) NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "itbis" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "facturas_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "facturas_items_factura_id_idx" ON "facturas_items"("factura_id");

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_certificado_id_fkey" FOREIGN KEY ("certificado_id") REFERENCES "certificados"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas_items" ADD CONSTRAINT "facturas_items_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "facturas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
