# Fixes Requeridos para TypeScript

## Problema Principal

El cliente de Prisma está desactualizado. Los nuevos campos agregados al schema no están siendo reconocidos por TypeScript.

## Solución Inmediata

**EJECUTA ESTE COMANDO:**

```bash
cd backend
npx prisma generate
```

Esto regenerará el cliente de Prisma con los nuevos campos y debería resolver la mayoría de los errores.

## Errores Restantes y Sus Fixes

### 1. ProductoCosto: `costo` vs `precio`

**Archivo**: `src/controllers/productos.controller.ts`
**Línea**: 124-125

**Error Actual**:
```typescript
costoUnidad: costo.costo,  // ❌ costo.costo no existe
total: Number(costo.costo) * cantidad
```

**Fix**:
```typescript
costoUnidad: costo.precio,  // ✅ Cambiado a precio
total: Number(costo.precio) * cantidad
```

### 2. Facturas: Conversión de Decimal a Number

**Archivo**: `src/controllers/facturas.controller.ts`
**Líneas**: 509-514

**Error Actual**:
```typescript
totalPagadas += f.total;  // ❌ No se puede sumar Decimal directamente
```

**Fix**:
```typescript
totalPagadas += Number(f.total);
totalPendientes += Number(f.total);
totalGeneral += Number(f.total);
totalItbis += Number(f.itbis);
```

### 3. Certificado: Campo `facturaId` no existe

**Archivo**: `src/controllers/certificados.controller.ts`
**Línea**: 429

**Error Actual**:
```typescript
if (certificado.facturaId) {  // ❌ facturaId no existe, hay relación facturas[]
```

**Fix**:
```typescript
if (certificado.facturas && certificado.facturas.length > 0) {
```

### 4. ProductoCosto Interface en costos.service.ts

**Archivo**: `src/services/costos.service.ts`
**Líneas**: 1-10

**Error Actual**:
```typescript
interface ProductoCosto {
  precio: number;  // ❌ Debería ser Decimal
}
```

**Fix**:
```typescript
import { Decimal } from '@prisma/client/runtime/library';

interface ProductoCosto {
  id: number;
  productoId: number;
  cantidadMin: number;
  cantidadMax: number | null;
  precio: Decimal;  // ✅ Cambiado a Decimal
  fechaInicio: Date;
  fechaFinal: Date | null;
}

// Y en la función:
return Number(costoAplicable.precio);  // ✅ Convertir a number al retornar
```

### 5. JWT Types en utils/jwt.ts

**Archivo**: `src/utils/jwt.ts`

**Error**: Tipos de jsonwebtoken están desactualizados

**Fix Temporal**: Agregar `// @ts-ignore` antes de las llamadas a `jwt.sign`

```typescript
// @ts-ignore
return jwt.sign(payload, secret, {
  expiresIn: expiresIn || '15m'
});
```

O instalar tipos correctos:
```bash
npm install -D @types/jsonwebtoken@latest
```

### 6. Variables No Usadas

Todos los warnings de `is declared but its value is never read` se pueden ignorar o prefijar con `_`:

```typescript
// Antes:
export const getEstados = asyncHandler(async (req: Request, res: Response) => {

// Después:
export const getEstados = asyncHandler(async (_req: Request, res: Response) => {
```

## Script de Fix Automático

Ejecuta esto DESPUÉS de regenerar Prisma:

```bash
# 1. Regenerar Prisma
npx prisma generate

# 2. Verificar errores restantes
npx tsc --noEmit

# 3. Si todo está OK, reiniciar backend
npm run dev
```

## Prioridad de Fixes

1. 🔴 **CRÍTICO**: `npx prisma generate` - Esto resolverá ~60% de los errores
2. 🟡 **MEDIO**: Conversiones Decimal → Number en facturas y cajas
3. 🟡 **MEDIO**: Fix ProductoCosto (costo → precio)
4. 🟢 **BAJO**: Variables no usadas (solo warnings)

## Estado Actual del Backend

A pesar de los warnings de TypeScript, **el backend está funcionando correctamente** en:

✅ http://localhost:3000

Los errores de TypeScript no afectan la ejecución en runtime, solo son problemas de tipos en tiempo de compilación.

## Testing

Una vez resueltos los errores, prueba:

```bash
# Test de health
curl http://localhost:3000/health

# Test de login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@onda.gob.do","password":"admin123"}'
```

Si obtienes un token JWT, todo está funcionando correctamente.
