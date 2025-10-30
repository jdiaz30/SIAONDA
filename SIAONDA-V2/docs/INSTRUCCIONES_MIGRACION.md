# Instrucciones para Aplicar Migración del Backend

## Cambios Realizados en el Schema

Se han agregado los siguientes campos al schema de Prisma:

### Cliente
- `rnc` (String): RNC para clientes jurídicos
- `fallecido` (Boolean): Indica si el autor está fallecido

### Factura
- `subtotal` (Decimal): Subtotal antes de impuestos
- `itbis` (Decimal): ITBIS (18%)
- `metodoPago` (String): Método de pago usado
- `fechaPago` (DateTime): Fecha en que se pagó
- `referenciaPago` (String): Referencia del pago
- `observaciones` (Text): Observaciones
- `certificadoId` (Int): Relación con certificado

### FacturaItem (Nuevo modelo)
Modelo adicional para items de factura con:
- `concepto`, `cantidad`, `precioUnitario`, `subtotal`, `itbis`, `total`

### Caja
- `fecha` (DateTime): Fecha de la caja
- `horaApertura` (DateTime): Hora de apertura
- `horaCierre` (DateTime): Hora de cierre
- `montoInicial` (Decimal): Monto inicial
- `montoFinal` (Decimal): Monto final
- `totalFacturas` (Decimal): Total de facturas procesadas
- `diferencia` (Decimal): Diferencia en el cuadre
- `observaciones` (Text): Observaciones

### Certificado
- `fecha` (DateTime): Fecha del certificado
- `libroNumero` (Int): Número de libro
- `observaciones` (Text): Observaciones

### ProductoCosto
- Renombrado: `costo` → `precio`

## Pasos para Aplicar la Migración

### 1. Iniciar PostgreSQL

```bash
# Asegúrate de que PostgreSQL esté corriendo
# En Windows con WSL, puedes usar:
sudo service postgresql start

# O si usas Docker:
docker start postgres
```

### 2. Generar Cliente de Prisma

```bash
cd backend
npx prisma generate
```

### 3. Ejecutar Migración

```bash
npx prisma migrate dev --name agregar_campos_backend
```

Este comando:
- Creará una nueva migración con los cambios del schema
- Aplicará la migración a la base de datos
- Regenerará el cliente de Prisma

### 4. Verificar Compilación

```bash
npx tsc --noEmit
```

Si hay errores, ejecútalos y revisamos.

### 5. Iniciar Backend

```bash
npm run dev
```

El backend debería iniciar sin errores en `http://localhost:3000`

## Si la Base de Datos No Existe

Si la base de datos `siaonda_v2` no existe:

```bash
# Crear la base de datos
sudo -u postgres psql -c "CREATE DATABASE siaonda_v2;"

# O si tienes el usuario configurado:
createdb siaonda_v2
```

Luego ejecuta:

```bash
npx prisma migrate dev --name inicial
```

Esto creará todas las tablas desde cero.

## Ejecutar Seeds (Datos Iniciales)

Después de la migración:

```bash
npx prisma db seed
```

Esto cargará:
- Estados (formularios, certificados, facturas, cajas, etc.)
- Roles de usuario (13 tipos)
- Usuario admin (admin@onda.gob.do / admin123)
- Categorías de productos (12 tipos de obras)
- Nacionalidades
- Tipos de cliente

## Verificar que Todo Está OK

```bash
# Test de conexión
curl http://localhost:3000/health

# Test de login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@onda.gob.do","password":"admin123"}'
```

Deberías recibir un token JWT.

## Troubleshooting

### Error: "Can't reach database server"
- Verifica que PostgreSQL esté corriendo
- Verifica las credenciales en `.env`
- Verifica que el puerto 5432 esté disponible

### Error: "Database does not exist"
- Crea la base de datos: `createdb siaonda_v2`
- O usa: `sudo -u postgres psql -c "CREATE DATABASE siaonda_v2;"`

### Error: TypeScript compilation errors
- Ejecuta `npx prisma generate` de nuevo
- Borra `node_modules` y ejecuta `npm install`

### Error: Missing dependencies
```bash
npm install puppeteer date-fns
npm install -D @types/multer
```

## Resumen de Comandos

```bash
# 1. Iniciar PostgreSQL
sudo service postgresql start

# 2. Ir al directorio backend
cd /mnt/c/Users/jelsy.diaz/Desktop/SIAONDA/SIAONDA-V2/backend

# 3. Generar cliente Prisma
npx prisma generate

# 4. Ejecutar migración
npx prisma migrate dev --name agregar_campos_backend

# 5. Ejecutar seeds (opcional, solo si es necesario)
npx prisma db seed

# 6. Verificar compilación
npx tsc --noEmit

# 7. Iniciar backend
npm run dev
```

## Estado Actual

✅ Schema de Prisma actualizado
✅ Dependencias instaladas (puppeteer, date-fns)
✅ Controladores implementados
✅ Servicios implementados
⏳ Pendiente: Ejecutar migración (requiere PostgreSQL)
⏳ Pendiente: Probar endpoints

Una vez ejecutes estos pasos, el backend estará 100% funcional.
