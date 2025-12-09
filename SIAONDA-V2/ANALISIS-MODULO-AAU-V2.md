# 📋 Análisis Completo - Módulo de Atención al Usuario (AaU) V2

**Fecha:** 2025-01-08
**Enfoque:** Simple, práctico, basado en flujo real de ONDA

---

## 🎯 Objetivo del Módulo

El Departamento de Atención al Usuario es el **punto de entrada** para todos los ciudadanos que desean:
1. **Registrar obras** (derecho de autor)
2. **Solicitar inscripciones IRC** (certificados de Inspectoría)
3. **Otros servicios** (duplicados, consultas, etc.)

---

## 👥 Roles Involucrados

1. **Auxiliar de Atención al Usuario (AaU)**
   - Recibe formularios físicos o digitales
   - Carga datos al sistema
   - Revisa documentación
   - Entrega formularios a Registro

2. **Departamento de Registro**
   - Revisa formularios
   - Asenta en libro físico
   - Devuelve si hay errores (SIN pasar por caja nuevamente)
   - Aprueba para certificación

3. **Ciudadano/Cliente**
   - Llena formulario
   - Paga en caja
   - Recibe certificado

---

## 🔄 Flujo General (Obras y Servicios)

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO ATENCIÓN AL USUARIO                │
└─────────────────────────────────────────────────────────────┘

1. RECEPCIÓN (AaU)
   ├─ Cliente entrega formulario físico o llena digital
   ├─ AaU verifica documentación
   └─ AaU carga al sistema
          ↓
2. PAGO (Cajas)
   ├─ Se genera factura
   ├─ Cliente paga
   └─ Estado: PAGADO
          ↓
3. ENVÍO A REGISTRO (AaU)
   ├─ AaU revisa que esté completo
   ├─ Envía a Registro
   └─ Estado: EN_REVISION_REGISTRO
          ↓
4. REVISIÓN (Registro)
   ├─ Registro revisa datos
   ├─ ¿Correcto?
   │   ├─ SÍ → ASENTADO → CERTIFICADO
   │   └─ NO → DEVUELTO (sin pasar por caja)
   │              ↓
   │         5. CORRECCIÓN (AaU)
   │            ├─ AaU corrige errores
   │            ├─ Reenvía a Registro
   │            └─ Estado: EN_REVISION_REGISTRO (nuevamente)
   │                   ↓
   │              Vuelve al paso 4
          ↓
6. ASENTAMIENTO (Registro)
   ├─ Registra en libro físico
   ├─ Asigna: Libro, Hoja, Fecha
   └─ Estado: ASENTADO
          ↓
7. CERTIFICACIÓN
   ├─ Se genera certificado
   └─ Estado: CERTIFICADO
          ↓
8. ENTREGA (AaU)
   ├─ Cliente recoge
   └─ Estado: ENTREGADO
```

---

## 📊 Estados de Formularios (AaU)

### Estados Principales:

| Estado | Descripción | Acción AaU | Puede Corregir |
|--------|-------------|------------|----------------|
| `PENDIENTE` | Recién creado, sin pagar | Espera pago | ✅ Sí (antes de pagar) |
| `PAGADO` | Cliente pagó, listo para enviar | Enviar a Registro | ✅ Sí (antes de enviar) |
| `EN_REVISION_REGISTRO` | Enviado a Registro | Esperar respuesta | ❌ No |
| `DEVUELTO` | Registro rechazó por errores | **CORREGIR Y REENVIAR** | ✅ **SÍ** (sin pagar) |
| `ASENTADO` | Registro asentó en libro | Generar certificado | ❌ No |
| `CERTIFICADO` | Certificado generado | Entregar | ❌ No |
| `ENTREGADO` | Cliente recogió | Archivar | ❌ No |
| `CANCELADO` | Cancelado por cliente | Archivar | ❌ No |

### Estados Especiales para Corrección:

**CLAVE:** Cuando un formulario está en estado `DEVUELTO`:
- ✅ AaU puede editar todos los campos
- ✅ NO pasa por caja nuevamente
- ✅ Cambio de estado: `DEVUELTO` → `EN_REVISION_REGISTRO` (reenvío)
- ✅ Se registra en historial: quién corrigió, qué cambió, cuándo

---

## 🏠 Dashboard de Atención al Usuario

### Diseño del Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  📋 ATENCIÓN AL USUARIO - Dashboard                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📊 RESUMEN GENERAL                                          │
│  ┌──────────────┬──────────────┬──────────────┬────────────┐│
│  │ Pendientes   │ En Revisión  │ Devueltos    │ Certificados││
│  │   12         │    8         │    3 ⚠️      │    45       ││
│  └──────────────┴──────────────┴──────────────┴────────────┘│
│                                                              │
│  🎯 ACCIONES RÁPIDAS                                         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ ➕ Nuevo Registro de Obra                               ││
│  │ 🏢 Nueva Solicitud IRC (Inspectoría)                    ││
│  │ 📄 Otros Servicios (Duplicados, Consultas, etc.)       ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  📋 GESTIÓN DE FORMULARIOS                                   │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 📝 Todos los Registros                                  ││
│  │    └─ Ver lista completa con filtros                   ││
│  │                                                          ││
│  │ ⚠️  Formularios Devueltos (3)                           ││
│  │    └─ REQUIEREN CORRECCIÓN URGENTE                     ││
│  │                                                          ││
│  │ 📤 Enviados a Registro (8)                              ││
│  │    └─ En espera de revisión                            ││
│  │                                                          ││
│  │ ✅ Certificados Pendientes de Entrega (45)             ││
│  │    └─ Listos para que cliente recoja                   ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  📊 ESTADÍSTICAS DEL MES                                     │
│  ┌──────────────┬──────────────┬──────────────┬────────────┐│
│  │ Recibidos    │ Asentados    │ Entregados   │ Devueltos  ││
│  │   156        │    142       │    138       │    8       ││
│  └──────────────┴──────────────┴──────────────┴────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Secciones del Dashboard

### 1. **Nuevo Registro de Obra** (Botón Principal)

Al hacer clic, muestra un selector de categoría:

```
┌──────────────────────────────────────────────────┐
│  Seleccione el tipo de obra a registrar         │
├──────────────────────────────────────────────────┤
│                                                  │
│  🎵 OBRAS MUSICALES                              │
│     - Obras con letra o sin ella                │
│     - Arreglos musicales                        │
│                                                  │
│  🎬 OBRAS AUDIOVISUALES                          │
│     - Cinematográficas                          │
│     - Documentales                              │
│     - Series, Videoclips                        │
│                                                  │
│  🎭 OBRAS ESCÉNICAS                              │
│     - Teatro, coreografías                      │
│     - Espectáculos                              │
│                                                  │
│  🎨 OBRAS PLÁSTICAS Y FOTOGRAFÍAS                │
│     - Pinturas, dibujos                         │
│     - Fotografías, esculturas                   │
│                                                  │
│  ✨ ARTES APLICADAS                              │
│     - Diseño, artesanía                         │
│                                                  │
│  📚 OBRAS LITERARIAS                             │
│     - Libros, poemas, guiones                   │
│                                                  │
│  🔬 OBRAS CIENTÍFICAS                            │
│     - Planos, software, bases de datos          │
│                                                  │
│  📦 COLECCIONES Y COMPILACIONES                  │
│                                                  │
│  💿 DERECHOS CONEXOS                             │
│     - Fonogramas                                │
│     - Interpretaciones                          │
│     - Emisiones de radiodifusión                │
│                                                  │
└──────────────────────────────────────────────────┘
```

Cada opción redirige a su formulario específico:
- `/aau/formularios/musical/nuevo`
- `/aau/formularios/audiovisual/nuevo`
- `/aau/formularios/escenica/nuevo`
- etc.

---

### 2. **Nueva Solicitud IRC** (Botón)

Redirige a: `/inspectoria/solicitudes/nueva`

**Nota:** Este formulario YA EXISTE y está 100% funcional en el módulo de Inspectoría.
AaU puede crear solicitudes IRC desde aquí, simplificando el acceso.

---

### 3. **Otros Servicios** (Futuro)

Menú desplegable con:
- Duplicados de certificados
- Consultas técnicas
- Inscripción de decisiones judiciales
- Registro de contratos
- Etc.

---

### 4. **Todos los Registros** (Lista Principal)

Tabla completa con filtros:

```
┌──────────────────────────────────────────────────────────────────────────┐
│  📋 TODOS LOS REGISTROS                                                  │
├──────────────────────────────────────────────────────────────────────────┤
│  Filtros:                                                                │
│  [Estado: Todos ▼] [Tipo: Todos ▼] [Fecha: ━━━━━ a ━━━━━] [Buscar: ___]│
├─────────┬──────────────┬───────────────────┬─────────────┬──────────────┤
│ Código  │ Cliente      │ Tipo              │ Estado      │ Acciones     │
├─────────┼──────────────┼───────────────────┼─────────────┼──────────────┤
│ FORM-001│ Juan Pérez   │ Obra Musical      │ 🔴 DEVUELTO │ [Corregir]   │
│ FORM-002│ María López  │ Obra Audiovisual  │ 🟡 Pagado   │ [Ver] [Enviar]│
│ FORM-003│ Pedro Gómez  │ Solicitud IRC     │ 🟢 Asentado │ [Ver] [Cert] │
│ FORM-004│ Ana Martínez │ Obra Literaria    │ 🟠 En Revisión│ [Ver]       │
└─────────┴──────────────┴───────────────────┴─────────────┴──────────────┘
```

**Acciones por Estado:**
- `PENDIENTE` → Ver, Editar, Eliminar
- `PAGADO` → Ver, Editar, Enviar a Registro
- `EN_REVISION_REGISTRO` → Ver (solo lectura)
- `DEVUELTO` → **Corregir** (botón destacado), Ver historial
- `ASENTADO` → Ver, Generar Certificado
- `CERTIFICADO` → Ver, Descargar PDF, Registrar Entrega
- `ENTREGADO` → Ver (archivo)

---

### 5. **Formularios Devueltos** (Vista Especial) ⚠️

**CRÍTICO:** Vista dedicada para formularios que Registro devolvió.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ⚠️ FORMULARIOS DEVUELTOS - REQUIEREN CORRECCIÓN                         │
├──────────────────────────────────────────────────────────────────────────┤
│  Total: 3 formularios                                                    │
├─────────┬──────────────┬───────────────────┬──────────────┬─────────────┤
│ Código  │ Cliente      │ Tipo              │ Motivo       │ Acciones    │
├─────────┼──────────────┼───────────────────┼──────────────┼─────────────┤
│ FORM-001│ Juan Pérez   │ Obra Musical      │ Falta firma  │ [CORREGIR]  │
│         │              │                   │ del autor    │ [Ver Motivo]│
│         │              │                   │ Devuelto el: │             │
│         │              │                   │ 05/01/2025   │             │
├─────────┼──────────────┼───────────────────┼──────────────┼─────────────┤
│ FORM-015│ Pedro Soto   │ Obra Literaria    │ Título       │ [CORREGIR]  │
│         │              │                   │ incompleto   │ [Ver Motivo]│
└─────────┴──────────────┴───────────────────┴──────────────┴─────────────┘
```

**Al hacer clic en "CORREGIR":**
1. Abre el formulario en modo edición
2. Muestra el mensaje de devolución en rojo
3. Permite editar campos
4. Al guardar: estado cambia a `EN_REVISION_REGISTRO` automáticamente
5. NO pasa por caja
6. Se registra en historial

---

### 6. **Enviados a Registro** (Vista Filtrada)

Lista de formularios en estado `EN_REVISION_REGISTRO`.

**Solo lectura** - esperando respuesta de Registro.

---

### 7. **Certificados Pendientes de Entrega**

Lista de formularios en estado `CERTIFICADO` que el cliente no ha recogido.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ✅ CERTIFICADOS PENDIENTES DE ENTREGA                                   │
├──────────────────────────────────────────────────────────────────────────┤
│  Total: 45 certificados listos                                           │
├─────────┬──────────────┬───────────────────┬──────────────┬─────────────┤
│ Código  │ Cliente      │ Tipo              │ Cert. Desde  │ Acciones    │
├─────────┼──────────────┼───────────────────┼──────────────┼─────────────┤
│ FORM-003│ Pedro Gómez  │ Solicitud IRC     │ 03/01/2025   │[Ver][Entregar]│
│ FORM-020│ Ana Castro   │ Obra Musical      │ 02/01/2025   │[Ver][Entregar]│
└─────────┴──────────────┴───────────────────┴──────────────┴─────────────┘
```

**Acción "Entregar":**
- Registra fecha y hora de entrega
- Opcionalmente: Firma del cliente
- Cambia estado a `ENTREGADO`

---

## 🔧 Funcionalidad de Corrección de Formularios Devueltos

### Flujo Detallado:

```
1. REGISTRO DEVUELVE FORMULARIO
   ├─ Registro marca formulario como DEVUELTO
   ├─ Escribe motivo de devolución
   └─ Notifica a AaU

2. AAU RECIBE NOTIFICACIÓN
   ├─ Aparece en dashboard "Formularios Devueltos"
   ├─ Contador se actualiza
   └─ Email/notificación a AaU (opcional)

3. AAU ABRE FORMULARIO DEVUELTO
   ├─ Ve mensaje de devolución en rojo
   ├─ Formulario en modo edición
   └─ Campos editables

4. AAU CORRIGE ERRORES
   ├─ Modifica datos necesarios
   ├─ Puede subir nuevos archivos
   ├─ Puede modificar firma (si es necesario)
   └─ NO pasa por caja

5. AAU REENVÍA A REGISTRO
   ├─ Botón: "Guardar y Reenviar a Registro"
   ├─ Estado: DEVUELTO → EN_REVISION_REGISTRO
   ├─ Se registra en historial:
   │   - Fecha/hora de corrección
   │   - Usuario que corrigió
   │   - Campos modificados
   └─ Contador de "veces devuelto" aumenta

6. REGISTRO REVISA NUEVAMENTE
   ├─ Ve historial de devoluciones
   ├─ Revisa correcciones
   └─ Decide: Asentar o Devolver nuevamente
```

### Tabla de Historial:

Cada formulario tiene un historial de cambios:

```sql
CREATE TABLE formulario_historial (
  id SERIAL PRIMARY KEY,
  formulario_id INT REFERENCES formularios(id),
  usuario_id INT REFERENCES usuarios(id),
  accion VARCHAR(50), -- 'CREADO', 'DEVUELTO', 'CORREGIDO', 'REENVIADO', 'ASENTADO'
  estado_anterior VARCHAR(50),
  estado_nuevo VARCHAR(50),
  mensaje TEXT, -- Motivo de devolución o comentarios
  campos_modificados JSON, -- Lista de campos que cambiaron
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Vista del Historial para AaU:**

```
┌──────────────────────────────────────────────────────────────┐
│  Historial de FORM-001                                       │
├──────────────────────────────────────────────────────────────┤
│  🟢 08/01/2025 10:30 - Reenvío a Registro (Juan AaU)         │
│      └─ Corregido: firma añadida                            │
│                                                              │
│  🔴 05/01/2025 14:20 - Devuelto por Registro (Ana Reg)      │
│      └─ Motivo: "Falta firma del autor en página 3"         │
│                                                              │
│  🟡 04/01/2025 09:15 - Enviado a Registro (Juan AaU)         │
│                                                              │
│  🟢 03/01/2025 16:45 - Pagado (Caja #2)                      │
│      └─ Monto: RD$ 500.00 - NCF: B0100000123               │
│                                                              │
│  🔵 03/01/2025 16:30 - Creado (Juan AaU)                     │
│      └─ Cliente: Juan Pérez - Obra Musical                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎨 Componentes de UI Necesarios

### 1. **DashboardAauPage.tsx** (Principal)
- Resumen con tarjetas de estadísticas
- Accesos rápidos (botones grandes)
- Alertas de formularios devueltos

### 2. **FormulariosListPage.tsx** (Lista General)
- Tabla con filtros avanzados
- Badges de estado con colores
- Acciones contextuales por estado

### 3. **FormulariosDevueltosPage.tsx** (Vista Especial)
- Solo formularios en estado DEVUELTO
- Botón "CORREGIR" destacado
- Muestra motivo de devolución

### 4. **FormularioCorreccionPage.tsx** (Corrección)
- Formulario en modo edición
- Banner rojo con motivo de devolución
- Botón "Guardar y Reenviar"
- Historial visible en sidebar

### 5. **CertificadosPendientesPage.tsx** (Ya existe parcialmente)
- Lista de certificados listos
- Modal de entrega con firma

### 6. **SelectorCategoriaPage.tsx** (Nuevo)
- Grid de categorías de obras
- Iconos grandes y descriptivos
- Redirige a formulario específico

---

## 📂 Estructura de Archivos

```
frontend/src/
├── pages/
│   └── aau/
│       ├── DashboardAauPage.tsx           ⭐ Principal
│       ├── SelectorCategoriaPage.tsx      🆕 Selector de obras
│       ├── FormulariosListPage.tsx        📋 Lista general
│       ├── FormulariosDevueltosPage.tsx   ⚠️  Devueltos
│       ├── FormularioCorreccionPage.tsx   ✏️  Corrección
│       ├── CertificadosPendientesPage.tsx ✅ Entregas
│       ├── EntregasPage.tsx               📦 (Ya existe)
│       ├── DenunciasPage.tsx              📢 (Ya existe)
│       └── formularios/                   🆕 Formularios por categoría
│           ├── FormularioMusicalPage.tsx
│           ├── FormularioAudiovisualPage.tsx
│           ├── FormularioEscenicaPage.tsx
│           ├── FormularioPlasticaPage.tsx
│           ├── FormularioArteAplicadoPage.tsx
│           ├── FormularioLiterariaPage.tsx
│           ├── FormularioCientificaPage.tsx
│           ├── FormularioColeccionPage.tsx
│           └── FormularioDerechosConexosPage.tsx
│
├── services/
│   └── aauService.ts                      🔌 API calls
│
└── components/
    └── aau/
        ├── EstadoBadge.tsx                🎨 Badge de estado
        ├── HistorialTimeline.tsx          📜 Timeline historial
        ├── MotivoDevolucionBanner.tsx     ⚠️  Banner rojo
        └── EntregaModal.tsx               📦 Modal entrega
```

---

## 🔌 API Endpoints Necesarios

### Formularios:
```typescript
GET    /api/aau/formularios              // Lista con filtros
GET    /api/aau/formularios/:id          // Detalle
POST   /api/aau/formularios              // Crear
PUT    /api/aau/formularios/:id          // Actualizar
DELETE /api/aau/formularios/:id          // Eliminar

// Acciones especiales:
POST   /api/aau/formularios/:id/enviar-registro     // Enviar a registro
POST   /api/aau/formularios/:id/devolver            // Devolver (Registro)
POST   /api/aau/formularios/:id/corregir-reenviar   // Corregir y reenviar
POST   /api/aau/formularios/:id/entregar            // Marcar como entregado

// Filtros especiales:
GET    /api/aau/formularios/devueltos               // Solo devueltos
GET    /api/aau/formularios/pendientes-entrega      // Solo certificados
GET    /api/aau/formularios/en-revision             // Solo en revisión
```

### Historial:
```typescript
GET    /api/aau/formularios/:id/historial           // Historial completo
POST   /api/aau/formularios/:id/historial           // Agregar entrada
```

### Estadísticas:
```typescript
GET    /api/aau/estadisticas/dashboard              // Resumen dashboard
GET    /api/aau/estadisticas/mes                    // Stats del mes
```

---

## ✅ Validaciones y Reglas de Negocio

### Estados y Transiciones Permitidas:

```
PENDIENTE → PAGADO (cuando paga en caja)
          ↓
PAGADO → EN_REVISION_REGISTRO (AaU envía a Registro)
       ↓
EN_REVISION_REGISTRO → DEVUELTO (Registro rechaza)
                      ↓
                    DEVUELTO → EN_REVISION_REGISTRO (AaU corrige y reenvía)
                               ↓
                             EN_REVISION_REGISTRO → ASENTADO (Registro aprueba)
                                                     ↓
                                                   ASENTADO → CERTIFICADO
                                                             ↓
                                                           CERTIFICADO → ENTREGADO
```

### Reglas:

1. **Solo AaU puede:**
   - Crear formularios
   - Enviar a Registro
   - Corregir formularios devueltos
   - Registrar entregas

2. **Solo Registro puede:**
   - Devolver formularios
   - Asentar formularios
   - Ver formularios en revisión

3. **Correcciones sin pago:**
   - Formularios en estado DEVUELTO no requieren pago nuevamente
   - Mismo código de formulario
   - Se mantiene la factura original

4. **Límite de devoluciones:**
   - Máximo 3 devoluciones por formulario
   - Después de 3, requiere aprobación supervisor

---

## 📊 Prioridad de Implementación

### Fase 1 (Inmediata):
1. ✅ Dashboard AaU básico con estadísticas
2. ✅ Lista general de formularios
3. ✅ Vista de formularios devueltos
4. ✅ Funcionalidad de corrección

### Fase 2:
5. ⏳ Selector de categorías
6. ⏳ Primer formulario (Musical - PRUEBA)
7. ⏳ Historial de cambios

### Fase 3:
8. ⏳ Resto de formularios (10 categorías)
9. ⏳ Certificados pendientes mejorado
10. ⏳ Reportes y estadísticas

---

## 🎯 Próximo Paso

**Implementar Fase 1:**
- Crear DashboardAauPage.tsx
- Crear FormulariosListPage.tsx
- Crear FormulariosDevueltosPage.tsx
- Crear backend: aau.controller.ts con endpoints básicos

¿Procedemos con la Fase 1?
