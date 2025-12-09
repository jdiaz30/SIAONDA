# PLAN DE IMPLEMENTACIÓN: MÓDULO COMPLETO DE FORMULARIOS - SIAONDA V2

## OBJETIVO
Replicar COMPLETAMENTE el módulo de Atención al Usuario / Formularios de SIAONDA V1 en SIAONDA V2, con TODOS los tipos de formularios funcionando.

## TIPOS DE FORMULARIOS A IMPLEMENTAR (11 TOTAL)

### 1. **OBRAS MUSICALES** (MUS-01, MUS-02, MUS-03)
- ✅ MUS-01: Obra Musical con letra o sin ella
- ✅ MUS-02: Arreglo Musical
- ✅ MUS-03: Fonograma / Producción Fonográfica

### 2. **OBRAS AUDIOVISUALES** (AUD-01, AUD-02)
- ✅ AUD-01: Obra Cinematográfica
- ✅ AUD-02: Obra Audiovisual General

### 3. **OBRAS ESCÉNICAS** (ESC-01, ESC-02)
- ✅ ESC-01: Obra Dramática
- ✅ ESC-02: Obra Coreográfica

### 4. **OBRAS LITERARIAS** (LIT-01 a LIT-03)
- ✅ LIT-03: Libro

### 5. **OBRAS PLÁSTICAS** (PLA-01 a PLA-03)
- ⏳ PLA-01: Dibujo
- ⏳ PLA-02: Pintura
- ⏳ PLA-03: Fotografía

### 6. **OBRAS CIENTÍFICAS** (OC-01 a OC-06)
- ✅ OC-01: Plano o Proyecto Arquitectónico
- ✅ OC-06: Programa de Computadora

### 7. **INTERPRETACIONES** (INT-01)
- ⏳ INT-01: Interpretación o Ejecución Artística

### 8. **EMISIONES** (RAD-01)
- ⏳ RAD-01: Emisiones de Radiodifusión

### 9. **TRANSFERENCIAS** (TRA-01)
- ⏳ TRA-01: Transferencia de Derechos

### 10. **CONVENIOS** (CON-01)
- ⏳ CON-01: Convenios

### 11. **DECISIONES** (DEC-01)
- ⏳ DEC-01: Decisiones

---

## FASES DE IMPLEMENTACIÓN

### **FASE 1: ESTRUCTURA DE DATOS** ✅ (COMPLETADO)
- ✅ Tablas en Prisma Schema
- ✅ Tipos de formularios
- ✅ Estados de formularios
- ✅ Productos oficiales ONDA
- ⏳ Campos dinámicos para TODOS los tipos

### **FASE 2: SEED COMPLETO** 🔄 (EN PROGRESO)
- ✅ Campos globales (compartidos por todos)
- ✅ Campos específicos para 8 tipos de obras
- ⏳ Campos específicos para los 46 tipos restantes
- ⏳ Relación productos ↔ formularios

### **FASE 3: BACKEND API** ⏳ (PENDIENTE)
- ⏳ Controladores para cada tipo de formulario
- ⏳ Endpoints CRUD completos
- ⏳ Validaciones server-side
- ⏳ Upload de archivos
- ⏳ Generación de certificados

### **FASE 4: FRONTEND WIZARD** ⏳ (PENDIENTE)
- ⏳ Paso 1: Selección de cliente/autor
- ⏳ Paso 2: Selección de tipo de obra (modal con TODOS los 54 productos)
- ⏳ Paso 3: Renderizado dinámico de campos según tipo
- ⏳ Paso 4: Upload de archivos requeridos
- ⏳ Paso 5: Firma digital (Canvas HTML5)
- ⏳ Paso 6: Resumen y envío

### **FASE 5: GESTIÓN DE FORMULARIOS** ⏳ (PENDIENTE)
- ⏳ Listado con filtros
- ⏳ Búsqueda avanzada
- ⏳ Cambio de estados
- ⏳ Asent Human: continua