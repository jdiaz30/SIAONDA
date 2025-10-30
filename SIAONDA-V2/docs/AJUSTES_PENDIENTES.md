# Ajustes Pendientes - Backend SIAONDA V2

## Estado Actual

El backend está funcionalmente completo pero requiere ajustes en el schema de Prisma para coincidir con los controladores implementados.

## Problemas Detectados

### 1. Modelo Caja

**Schema Actual**:
```prisma
model Caja {
  id            Int       @id @default(autoincrement())
  codigo        String    @unique
  descripcion   String
  estadoId      Int
  sucursalId    Int?
  usuarioId     Int?
  creadoEn      DateTime  @default(now())

  cierres       Cierre[]
  facturas      Factura[]
}

model Cierre {
  id              Int       @id
  cajaId          Int
  fechaInicio     DateTime
  fechaFinal      DateTime
  estadoId        Int
  totalEsperado   Decimal
  totalReal       Decimal
  diferencia      Decimal
}
```

**Solución 1 (Recomendada)**: Agregar campos al modelo Caja
```prisma
model Caja {
  // Campos existentes...

  // Agregar:
  fecha           DateTime  @default(now())
  horaApertura    DateTime?
  horaCierre      DateTime?
  montoInicial    Decimal   @default(0) @db.Decimal(10,2)
  montoFinal      Decimal?  @db.Decimal(10,2)
  totalFacturas   Decimal?  @db.Decimal(10,2)
  diferencia      Decimal?  @db.Decimal(10,2)
  observaciones   String?   @db.Text
}
```

**Solución 2**: Mantener modelo Cierre pero ajustar controladores para usar relación Caja → Cierre

### 2. Modelo Factura

**Schema Actual**:
```prisma
model Factura {
  id          Int       @id
  codigo      String    @unique
  estadoId    Int
  creadoEn    DateTime  @default(now())
  total       Decimal   @db.Decimal(10,2)
  fecha       DateTime
  clienteId   Int
  ncf         String?
  rnc         String?
  cajaId      Int?
  pagado      Decimal   @default(0) @db.Decimal(10,2)
}
```

**Campos faltantes**:
```prisma
model Factura {
  // Campos existentes...

  // Agregar:
  subtotal        Decimal   @db.Decimal(10,2)
  itbis           Decimal   @db.Decimal(10,2)
  metodoPago      String?   @db.VarChar(50)
  fechaPago       DateTime?
  referenciaPago  String?   @db.VarChar(100)
  observaciones   String?   @db.Text
  certificadoId   Int?

  certificado     Certificado? @relation(fields: [certificadoId], references: [id])
  items           FacturaItem[]
}
```

### 3. Modelo ProductoCosto

**Schema Actual** usa `costo` pero el controlador espera `precio`:
```prisma
model ProductoCosto {
  id            Int       @id
  productoId    Int
  cantidadMin   Int
  cantidadMax   Int?
  costo         Decimal   @db.Decimal(10,2)  // Cambiar a "precio"
  fechaInicio   DateTime
  fechaFinal    DateTime?
}
```

**Solución**: Cambiar `costo` por `precio` o ajustar el servicio `costos.service.ts`

### 4. Modelo Cliente

**Campos faltantes**:
```prisma
model Cliente {
  // Campos existentes...

  // Agregar:
  rnc         String?   @db.VarChar(50)
  fallecido   Boolean   @default(false)
}
```

## Migraciones Requeridas

### Opción A: Actualizar Schema (Recomendado)

1. Actualizar `schema.prisma` con los campos faltantes
2. Ejecutar:
```bash
npx prisma migrate dev --name agregar_campos_cajas_facturas
npx prisma generate
```

### Opción B: Ajustar Controladores

1. Modificar controladores para usar el schema actual
2. Usar modelo `Cierre` para apertura/cierre de cajas
3. Ajustar lógica de facturas

## Prioridad

🔴 **ALTA**:
- Campos de Caja (fecha, montos, horas)
- Campos de Factura (subtotal, itbis, metodoPago)
- Cliente (rnc, fallecido)

🟡 **MEDIA**:
- ProductoCosto (costo → precio)

## Instalación de Dependencias Faltantes

Instalar Puppeteer y date-fns:
```bash
cd backend
npm install puppeteer date-fns
npm install -D @types/multer
```

## Siguiente Paso

**Recomendación**: Actualizar el schema de Prisma para incluir todos los campos necesarios y ejecutar las migraciones. Esto es más limpio que ajustar todos los controladores.

### Script de Migración

Crear archivo `backend/prisma/migrations/xxxx_ajustes_backend/migration.sql`:

```sql
-- Agregar campos a Caja
ALTER TABLE "cajas" ADD COLUMN "fecha" TIMESTAMP DEFAULT NOW();
ALTER TABLE "cajas" ADD COLUMN "hora_apertura" TIMESTAMP;
ALTER TABLE "cajas" ADD COLUMN "hora_cierre" TIMESTAMP;
ALTER TABLE "cajas" ADD COLUMN "monto_inicial" DECIMAL(10,2) DEFAULT 0;
ALTER TABLE "cajas" ADD COLUMN "monto_final" DECIMAL(10,2);
ALTER TABLE "cajas" ADD COLUMN "total_facturas" DECIMAL(10,2);
ALTER TABLE "cajas" ADD COLUMN "diferencia" DECIMAL(10,2);
ALTER TABLE "cajas" ADD COLUMN "observaciones" TEXT;

-- Agregar campos a Factura
ALTER TABLE "facturas" ADD COLUMN "subtotal" DECIMAL(10,2) DEFAULT 0;
ALTER TABLE "facturas" ADD COLUMN "itbis" DECIMAL(10,2) DEFAULT 0;
ALTER TABLE "facturas" ADD COLUMN "metodo_pago" VARCHAR(50);
ALTER TABLE "facturas" ADD COLUMN "fecha_pago" TIMESTAMP;
ALTER TABLE "facturas" ADD COLUMN "referencia_pago" VARCHAR(100);
ALTER TABLE "facturas" ADD COLUMN "observaciones" TEXT;
ALTER TABLE "facturas" ADD COLUMN "certificado_id" INTEGER REFERENCES "certificados"(id);

-- Agregar campos a Cliente
ALTER TABLE "clientes" ADD COLUMN "rnc" VARCHAR(50);
ALTER TABLE "clientes" ADD COLUMN "fallecido" BOOLEAN DEFAULT FALSE;

-- Renombrar campo en ProductoCosto
ALTER TABLE "productos_costos" RENAME COLUMN "costo" TO "precio";
```

## Archivos Implementados y Listos

✅ Controladores completados:
- `controllers/formularios.controller.ts`
- `controllers/certificados.controller.ts`
- `controllers/facturas.controller.ts`
- `controllers/cajas.controller.ts`
- `controllers/clientes.controller.ts`

✅ Servicios completados:
- `services/pdf.service.ts`
- `services/costos.service.ts`
- `middleware/upload.ts`

✅ Rutas actualizadas:
- Todas las rutas están correctamente configuradas

## Testing Post-Ajuste

Una vez aplicados los ajustes:

```bash
# 1. Regenerar cliente de Prisma
npx prisma generate

# 2. Verificar compilación
npx tsc --noEmit

# 3. Iniciar backend
npm run dev

# 4. Probar endpoints
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@onda.gob.do","password":"admin123"}'
```
