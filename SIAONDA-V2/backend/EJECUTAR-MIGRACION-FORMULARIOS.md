# Instrucciones para Ejecutar Migración de Formularios

## 📋 Prerrequisitos

1. **PostgreSQL debe estar corriendo**
   - En Windows: Inicia el servicio desde Services
   - O ejecuta: `net start postgresql-x64-14` (ajusta la versión)

2. **Verifica la conexión**
   ```bash
   cd backend
   npx prisma db pull
   ```

## 🔄 Paso 1: Ejecutar Migración

```bash
cd /mnt/c/Users/jelsy.diaz/Desktop/SIAONDA/SIAONDA-V2/backend

# Crear migración con los nuevos campos
npx prisma migrate dev --name add_formularios_archivos_y_campos_adicionales
```

Esto creará:
- Nueva tabla `formularios_archivos`
- Campos adicionales en `formularios` (libro, hoja, fechaAsentamiento, etc.)
- Campos adicionales en `formularios_campos` (placeholder, grupo)

## 🌱 Paso 2: Ejecutar Seed de Productos

```bash
# Ejecutar seed de productos/obras con precios oficiales
npx tsx prisma/seed-productos-obras.ts
```

Esto creará **86 productos** con sus precios:
- ✅ 5 Obras Musicales
- ✅ 5 Obras Audiovisuales
- ✅ 7 Obras Escénicas
- ✅ 5 Artes Visuales
- ✅ 8 Arte Aplicado
- ✅ 19 Obras Literarias
- ✅ 8 Obras Científicas
- ✅ 14 Colecciones y Compilaciones
- ✅ 15 Producciones

## 🌱 Paso 3: Crear Estados de Formularios

Crea el archivo `prisma/seed-estados-formularios.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creando estados de formularios...\n');

  const estados = [
    { nombre: 'Pendiente', descripcion: 'Formulario recién creado, pendiente de validación' },
    { nombre: 'Recibido', descripcion: 'Formulario validado y recibido por el sistema' },
    { nombre: 'Asentado', descripcion: 'Formulario registrado en libro físico' },
    { nombre: 'Devuelto', descripcion: 'Formulario devuelto para correcciones' },
    { nombre: 'Con Certificado', descripcion: 'Certificado generado, listo para entrega' },
    { nombre: 'Entregado', descripcion: 'Certificado entregado al cliente' },
  ];

  for (const estado of estados) {
    await prisma.formularioEstado.upsert({
      where: { nombre: estado.nombre },
      update: { descripcion: estado.descripcion },
      create: estado
    });
    console.log(`✅ Estado creado: ${estado.nombre}`);
  }

  console.log('\n✅ Seed de estados completado!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Luego ejecuta:
```bash
npx tsx prisma/seed-estados-formularios.ts
```

## ✅ Verificación

Verifica que todo se creó correctamente:

```bash
# Ver productos creados
npx prisma studio
```

Navega a:
- Tabla `productos` - Debe tener 86 registros (más los de IRC si existen)
- Tabla `productos_costos` - Debe tener 86 costos
- Tabla `formularios_estados` - Debe tener 6 estados
- Tabla `formularios_archivos` - Nueva tabla creada (vacía por ahora)

## 🚨 Si hay errores

### Error: "Can't reach database server"
```bash
# Inicia PostgreSQL en Windows
net start postgresql-x64-14
```

### Error: "Column already exists"
```bash
# Resetea la base de datos (¡CUIDADO! Borra todos los datos)
npx prisma migrate reset
npx prisma migrate deploy
```

### Error en seed
```bash
# Verifica que el archivo exista
ls -la prisma/seed-productos-obras.ts

# Verifica errores de sintaxis
npx tsc --noEmit prisma/seed-productos-obras.ts
```

## 📝 Notas Importantes

1. **Archivos grandes**: La columna `tamano` en `formularios_archivos` es tipo `BigInt` para soportar archivos de hasta 15GB

2. **Estados del workflow**:
   ```
   Pendiente → Recibido → Asentado → Con Certificado → Entregado
                    ↓
                Devuelto (puede volver a Recibido)
   ```

3. **Precios**: Todos los precios están en DOP (Pesos Dominicanos) según la tabla oficial de ONDA

4. **Categorías de productos**:
   - Artísticas - Musical
   - Artísticas - Audiovisual
   - Artísticas - Escénica
   - Artísticas - Artes Visuales
   - Artísticas - Arte Aplicado
   - Literarias
   - Científicas
   - Colecciones y Compilaciones
   - Producciones

## 🔜 Próximos Pasos

Después de ejecutar esto, continuaremos con:
1. Seed de campos dinámicos por tipo de obra
2. Implementación del backend (controllers + routes)
3. Implementación del frontend (flujo de creación paso a paso)
4. Sistema de firma digital
5. Sistema de carga de archivos grandes
