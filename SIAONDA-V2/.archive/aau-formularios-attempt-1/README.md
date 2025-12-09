# Archivo de Intento #1: Módulo AaU Formularios

**Fecha de archivo:** 2025-01-08
**Razón:** Reimplementación necesaria - enfoque demasiado complejo

## ¿Qué se archivó?

### Backend
- `/backend/src/controllers/aau/` (completo)
- `/backend/src/routes/aau/` (completo)
- `/backend/prisma/seed-campos-formularios.ts`
- `/backend/prisma/seed-campos-reales-onda.ts`
- `/backend/CAMPOS-EXACTOS-FORMULARIOS-ONDA.md`

### Frontend
- `/frontend/src/pages/aau/` (completo)
- `/frontend/src/services/aauFormulariosService.ts`

### Documentación
- `/PLAN-MODULO-FORMULARIOS.md`

## ¿Qué se CONSERVA? (No tocar)

### Inspectoría / IRC (COMPLETO Y FUNCIONAL)
- ✅ `/backend/src/controllers/inspectoria/` - Todos los controladores de Inspectoría
- ✅ `/backend/src/routes/inspectoria/` - Todas las rutas de Inspectoría
- ✅ `/frontend/src/pages/inspectoria/` - Todo el módulo frontend
- ✅ `/frontend/src/services/inspectoriaService.ts`
- ✅ Formularios IRC (FormularioIRCPage.tsx)
- ✅ Todas las migraciones relacionadas con Inspectoría
- ✅ Seeds de inspectoría

### Core del sistema de Formularios (Tabla base)
- ✅ `formularios.controller.ts` - Controlador principal (usado por IRC)
- ✅ `formularios.routes.ts` - Rutas principales (usadas por IRC)
- ✅ `formulariosService.ts` - Servicio frontend (usado por IRC)
- ✅ Tabla `Formulario` en schema.prisma
- ✅ Tablas relacionadas: `FormularioEstado`, `FormularioCliente`, `FormularioArchivo`
- ✅ `FormulariosPage.tsx` - Lista general de formularios

### Productos/Obras (Se conservan)
- ✅ Tabla `Producto` con los 87 productos y precios oficiales
- ✅ `/backend/prisma/seed-productos-obras.ts`
- ✅ Todos los códigos: MUS-01, AUD-01, LIT-01, etc.

## ¿Qué NO funcionó en este intento?

1. **Enfoque demasiado complejo:** Intentamos crear un wizard de 4 pasos con campos dinámicos
2. **Confusión conceptual:** Mezclamos formularios genéricos con formularios específicos de obras
3. **Datos de autor en campos dinámicos:** Error conceptual - los autores van en la tabla `clientes`
4. **965 campos creados:** Sobrecarga innecesaria en la BD

## Análisis válido que se conserva

✅ **CAMPOS-EXACTOS-FORMULARIOS-ONDA.md** - Contiene análisis correcto de PDFs oficiales
- Este documento es GOLD - tiene los campos exactos de cada formulario
- Se archiva pero debe consultarse para la nueva implementación

## Próximo intento - Enfoque correcto

1. **Formularios de Registro de Obras:**
   - Un formulario por tipo de obra (Musical, Audiovisual, Literaria, etc.)
   - Campos estáticos en el formulario (no dinámicos desde BD)
   - Datos de autor en tabla `clientes` como debe ser
   - Relación `FormularioProducto` para vincular formulario con productos

2. **Flujo simple:**
   - Paso 1: Datos del autor/solicitante
   - Paso 2: Datos de la obra (según tipo seleccionado)
   - Paso 3: Archivos adjuntos
   - Paso 4: Revisión y firma

3. **Sin campos dinámicos:**
   - Los campos están en el código del componente React
   - Solo se guarda el valor en `FormularioProductoCampo` cuando se llena
   - Más simple, más mantenible, más claro

## Tablas a limpiar en próxima sesión

- [ ] `FormularioCampo` - Eliminar todos los campos creados
- [ ] `FormularioCampoTipo` - Conservar, puede ser útil
- [ ] `FormularioProductoCampo` - Ya está limpia

## Referencias útiles

- Formularios IRC funcionan perfectamente - usar como referencia
- SIAONDA V1 tiene implementación más simple - revisar
- PDFs oficiales en `/docs/FORMULARIOS Y CERTIFICADOS ONDA/`
