-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "contrasena" VARCHAR(255) NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "nombrecompleto" VARCHAR(200) NOT NULL,
    "correo" VARCHAR(100),
    "tipo_id" INTEGER NOT NULL,
    "estado_id" INTEGER NOT NULL,
    "supervisor_id" INTEGER,
    "token" VARCHAR(255),
    "token_expiracion" TIMESTAMP(3),
    "intentos_fallidos" INTEGER NOT NULL DEFAULT 0,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios_tipos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "usuarios_tipos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios_estados" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "usuarios_estados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "identificacion" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "apellido" VARCHAR(200),
    "nombrecompleto" VARCHAR(400) NOT NULL,
    "direccion" TEXT,
    "telefono" VARCHAR(50),
    "correo" VARCHAR(100),
    "tipo_id" INTEGER NOT NULL,
    "nacionalidad_id" INTEGER NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes_tipos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "clientes_tipos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes_nacionalidades" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "codigo" VARCHAR(5),

    CONSTRAINT "clientes_nacionalidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes_archivos" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "ruta" VARCHAR(500) NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "tamano" INTEGER NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_archivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formularios" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "factura_id" INTEGER,
    "firma" TEXT,
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "formularios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formularios_estados" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "formularios_estados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formularios_productos" (
    "id" SERIAL NOT NULL,
    "formulario_id" INTEGER NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "producto_madre_id" INTEGER,
    "cantidad" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "formularios_productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formularios_productos_campos" (
    "id" SERIAL NOT NULL,
    "formulario_producto_id" INTEGER NOT NULL,
    "campo_id" INTEGER NOT NULL,
    "valor" TEXT NOT NULL,

    CONSTRAINT "formularios_productos_campos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formularios_clientes" (
    "id" SERIAL NOT NULL,
    "formulario_id" INTEGER NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "tipoRelacion" VARCHAR(50) NOT NULL,

    CONSTRAINT "formularios_clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formularios_campos" (
    "id" SERIAL NOT NULL,
    "producto_id" INTEGER,
    "tipo_id" INTEGER NOT NULL,
    "campo" VARCHAR(100) NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "descripcion" TEXT,
    "requerido" BOOLEAN NOT NULL DEFAULT false,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "formularios_campos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formularios_campos_tipos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "formularios_campos_tipos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "descripcion" TEXT,
    "categoria" VARCHAR(100) NOT NULL,
    "estado_id" INTEGER NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos_estados" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "productos_estados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos_costos" (
    "id" SERIAL NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "costo" DECIMAL(10,2) NOT NULL,
    "cantidad_min" INTEGER NOT NULL DEFAULT 1,
    "cantidad_max" INTEGER,
    "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_final" TIMESTAMP(3),

    CONSTRAINT "productos_costos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificados" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "formulario_id" INTEGER NOT NULL,
    "formulario_producto_id" INTEGER NOT NULL,
    "estado_id" INTEGER NOT NULL,
    "usuario_emision_id" INTEGER,
    "fecha_emision" TIMESTAMP(3),
    "fecha_entrega" TIMESTAMP(3),
    "archivo" VARCHAR(500),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificados_estados" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "certificados_estados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facturas" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "ncf" VARCHAR(50),
    "rnc" VARCHAR(20),
    "cliente_id" INTEGER NOT NULL,
    "caja_id" INTEGER,
    "estado_id" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" DECIMAL(10,2) NOT NULL,
    "pagado" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facturas_estados" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "facturas_estados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facturas_detalles" (
    "id" SERIAL NOT NULL,
    "factura_id" INTEGER NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "descripcion" VARCHAR(500) NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "costo_unidad" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "facturas_detalles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" SERIAL NOT NULL,
    "factura_id" INTEGER NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_id" INTEGER NOT NULL,
    "referencia" VARCHAR(100),

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cajas" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "descripcion" VARCHAR(200) NOT NULL,
    "estado_id" INTEGER NOT NULL,
    "sucursal_id" INTEGER,
    "usuario_id" INTEGER,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cajas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cajas_estados" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "cajas_estados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cierres" (
    "id" SERIAL NOT NULL,
    "caja_id" INTEGER NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_final" TIMESTAMP(3) NOT NULL,
    "estado_id" INTEGER NOT NULL,
    "total_esperado" DECIMAL(10,2) NOT NULL,
    "total_real" DECIMAL(10,2) NOT NULL,
    "diferencia" DECIMAL(10,2) NOT NULL,
    "reporte" VARCHAR(500),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cierres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cierres_estados" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "cierres_estados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sucursales" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "direccion" TEXT,
    "telefono" VARCHAR(50),
    "ciudad" VARCHAR(100),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sucursales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_nombre_key" ON "usuarios"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_codigo_key" ON "usuarios"("codigo");

-- CreateIndex
CREATE INDEX "usuarios_token_idx" ON "usuarios"("token");

-- CreateIndex
CREATE INDEX "usuarios_correo_idx" ON "usuarios"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_tipos_nombre_key" ON "usuarios_tipos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_estados_nombre_key" ON "usuarios_estados"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_codigo_key" ON "clientes"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_identificacion_key" ON "clientes"("identificacion");

-- CreateIndex
CREATE INDEX "clientes_identificacion_idx" ON "clientes"("identificacion");

-- CreateIndex
CREATE INDEX "clientes_nombrecompleto_idx" ON "clientes"("nombrecompleto");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_tipos_nombre_key" ON "clientes_tipos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_nacionalidades_nombre_key" ON "clientes_nacionalidades"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "formularios_codigo_key" ON "formularios"("codigo");

-- CreateIndex
CREATE INDEX "formularios_codigo_idx" ON "formularios"("codigo");

-- CreateIndex
CREATE INDEX "formularios_fecha_idx" ON "formularios"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "formularios_estados_nombre_key" ON "formularios_estados"("nombre");

-- CreateIndex
CREATE INDEX "formularios_productos_formulario_id_idx" ON "formularios_productos"("formulario_id");

-- CreateIndex
CREATE INDEX "formularios_productos_campos_formulario_producto_id_idx" ON "formularios_productos_campos"("formulario_producto_id");

-- CreateIndex
CREATE INDEX "formularios_clientes_formulario_id_idx" ON "formularios_clientes"("formulario_id");

-- CreateIndex
CREATE INDEX "formularios_clientes_cliente_id_idx" ON "formularios_clientes"("cliente_id");

-- CreateIndex
CREATE INDEX "formularios_campos_producto_id_idx" ON "formularios_campos"("producto_id");

-- CreateIndex
CREATE UNIQUE INDEX "formularios_campos_tipos_nombre_key" ON "formularios_campos_tipos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "productos_codigo_key" ON "productos"("codigo");

-- CreateIndex
CREATE INDEX "productos_categoria_idx" ON "productos"("categoria");

-- CreateIndex
CREATE UNIQUE INDEX "productos_estados_nombre_key" ON "productos_estados"("nombre");

-- CreateIndex
CREATE INDEX "productos_costos_producto_id_idx" ON "productos_costos"("producto_id");

-- CreateIndex
CREATE INDEX "productos_costos_fecha_inicio_fecha_final_idx" ON "productos_costos"("fecha_inicio", "fecha_final");

-- CreateIndex
CREATE UNIQUE INDEX "certificados_codigo_key" ON "certificados"("codigo");

-- CreateIndex
CREATE INDEX "certificados_codigo_idx" ON "certificados"("codigo");

-- CreateIndex
CREATE INDEX "certificados_formulario_id_idx" ON "certificados"("formulario_id");

-- CreateIndex
CREATE UNIQUE INDEX "certificados_estados_nombre_key" ON "certificados_estados"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "facturas_codigo_key" ON "facturas"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "facturas_ncf_key" ON "facturas"("ncf");

-- CreateIndex
CREATE INDEX "facturas_codigo_idx" ON "facturas"("codigo");

-- CreateIndex
CREATE INDEX "facturas_ncf_idx" ON "facturas"("ncf");

-- CreateIndex
CREATE INDEX "facturas_fecha_idx" ON "facturas"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "facturas_estados_nombre_key" ON "facturas_estados"("nombre");

-- CreateIndex
CREATE INDEX "facturas_detalles_factura_id_idx" ON "facturas_detalles"("factura_id");

-- CreateIndex
CREATE INDEX "pagos_factura_id_idx" ON "pagos"("factura_id");

-- CreateIndex
CREATE INDEX "pagos_fecha_idx" ON "pagos"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "cajas_codigo_key" ON "cajas"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "cajas_estados_nombre_key" ON "cajas_estados"("nombre");

-- CreateIndex
CREATE INDEX "cierres_caja_id_idx" ON "cierres"("caja_id");

-- CreateIndex
CREATE INDEX "cierres_fecha_inicio_fecha_final_idx" ON "cierres"("fecha_inicio", "fecha_final");

-- CreateIndex
CREATE UNIQUE INDEX "cierres_estados_nombre_key" ON "cierres_estados"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "sucursales_codigo_key" ON "sucursales"("codigo");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_tipo_id_fkey" FOREIGN KEY ("tipo_id") REFERENCES "usuarios_tipos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_estado_id_fkey" FOREIGN KEY ("estado_id") REFERENCES "usuarios_estados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_tipo_id_fkey" FOREIGN KEY ("tipo_id") REFERENCES "clientes_tipos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_nacionalidad_id_fkey" FOREIGN KEY ("nacionalidad_id") REFERENCES "clientes_nacionalidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes_archivos" ADD CONSTRAINT "clientes_archivos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formularios" ADD CONSTRAINT "formularios_estado_id_fkey" FOREIGN KEY ("estado_id") REFERENCES "formularios_estados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formularios" ADD CONSTRAINT "formularios_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formularios" ADD CONSTRAINT "formularios_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "facturas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formularios_productos" ADD CONSTRAINT "formularios_productos_formulario_id_fkey" FOREIGN KEY ("formulario_id") REFERENCES "formularios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formularios_productos" ADD CONSTRAINT "formularios_productos_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formularios_productos" ADD CONSTRAINT "formularios_productos_producto_madre_id_fkey" FOREIGN KEY ("producto_madre_id") REFERENCES "productos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formularios_productos_campos" ADD CONSTRAINT "formularios_productos_campos_formulario_producto_id_fkey" FOREIGN KEY ("formulario_producto_id") REFERENCES "formularios_productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formularios_productos_campos" ADD CONSTRAINT "formularios_productos_campos_campo_id_fkey" FOREIGN KEY ("campo_id") REFERENCES "formularios_campos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formularios_clientes" ADD CONSTRAINT "formularios_clientes_formulario_id_fkey" FOREIGN KEY ("formulario_id") REFERENCES "formularios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formularios_clientes" ADD CONSTRAINT "formularios_clientes_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formularios_campos" ADD CONSTRAINT "formularios_campos_tipo_id_fkey" FOREIGN KEY ("tipo_id") REFERENCES "formularios_campos_tipos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formularios_campos" ADD CONSTRAINT "formularios_campos_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_estado_id_fkey" FOREIGN KEY ("estado_id") REFERENCES "productos_estados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos_costos" ADD CONSTRAINT "productos_costos_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificados" ADD CONSTRAINT "certificados_formulario_id_fkey" FOREIGN KEY ("formulario_id") REFERENCES "formularios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificados" ADD CONSTRAINT "certificados_formulario_producto_id_fkey" FOREIGN KEY ("formulario_producto_id") REFERENCES "formularios_productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificados" ADD CONSTRAINT "certificados_estado_id_fkey" FOREIGN KEY ("estado_id") REFERENCES "certificados_estados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificados" ADD CONSTRAINT "certificados_usuario_emision_id_fkey" FOREIGN KEY ("usuario_emision_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_caja_id_fkey" FOREIGN KEY ("caja_id") REFERENCES "cajas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_estado_id_fkey" FOREIGN KEY ("estado_id") REFERENCES "facturas_estados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas_detalles" ADD CONSTRAINT "facturas_detalles_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "facturas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas_detalles" ADD CONSTRAINT "facturas_detalles_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "facturas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cajas" ADD CONSTRAINT "cajas_estado_id_fkey" FOREIGN KEY ("estado_id") REFERENCES "cajas_estados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cajas" ADD CONSTRAINT "cajas_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cajas" ADD CONSTRAINT "cajas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cierres" ADD CONSTRAINT "cierres_caja_id_fkey" FOREIGN KEY ("caja_id") REFERENCES "cajas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cierres" ADD CONSTRAINT "cierres_estado_id_fkey" FOREIGN KEY ("estado_id") REFERENCES "cierres_estados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
