-- DropForeignKey
ALTER TABLE "facturas" DROP CONSTRAINT "facturas_cliente_id_fkey";

-- AlterTable
ALTER TABLE "facturas" ALTER COLUMN "cliente_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
