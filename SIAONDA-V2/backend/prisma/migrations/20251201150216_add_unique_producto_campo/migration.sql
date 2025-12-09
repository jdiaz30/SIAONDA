/*
  Warnings:

  - A unique constraint covering the columns `[producto_id,campo]` on the table `formularios_campos` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "formularios_campos_producto_id_campo_key" ON "formularios_campos"("producto_id", "campo");
