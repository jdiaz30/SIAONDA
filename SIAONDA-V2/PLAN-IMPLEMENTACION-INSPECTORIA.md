# Plan de Implementación: Módulo General de Inspectoría

**SIAONDA V2** - Sistema Integral de Gestión de Inspectoría
**Fecha:** 2025-11-12

---

## 📋 Resumen Ejecutivo

Este documento detalla el plan completo de implementación del **Módulo General de Inspectoría** en SIAONDA V2, integrando:

1. **Flujo 1: Registro Físico y Certificación (PR-DI-002)**
   - Desde recepción hasta entrega de certificado
   - Integración: AuU → Inspectoría → Caja → Registro → AuU

2. **Flujo 2: Gestión de Casos de Inspección (PR-DI-001, PR-DI-003, PR-DI-004)**
   - Inspecciones de oficio, denuncias y operativos
   - Tracking de 1ra y 2da visita con contador de 10 días

---

## ✅ Estado Actual (Completado)

### 1. Esquema de Base de Datos

**✅ COMPLETADO** - Schema Prisma implementado con 21 modelos nuevos:

#### Modelos Principales:
- `EmpresaInspeccionada` - Datos completos según formulario PDF
- `ConsejoAdministracion` - Para Persona Moral
- `ClienteEmpresa` - Principales clientes
- `DocumentoEmpresa` - Documentos adjuntos requeridos
- `CategoriaIrc` - IRC-01 a IRC-15 con precios

#### Flujo 1 (PR-DI-002):
- `SolicitudRegistroInspeccion` - Workflow completo AuU → Caja → Registro
- `EstadoSolicitudInspeccion` - 8 estados del flujo
- `CertificadoInspeccion` - Certificados con número de asiento

#### Flujo 2 (PR-DI-001, PR-DI-003, PR-DI-004):
- `CasoInspeccion` - Casos de inspección (oficio, denuncia, operativo)
- `EstadoCasoInspeccion` - Estados del caso
- `ActaInspeccion` - Actas de 1ra y 2da visita
- `Operativo` - Operativos antipiratería
- `EstadoOperativo`, `InstitucionOperativo`, `InspectorOperativo`

#### Catálogos:
- `StatusInspeccion` - 5 status de V1
- `EstadoJuridico` - 3 estados jurídicos
- `Conclusion` - 7 conclusiones
- `StatusExterno` - 4 status externos
- `Provincia` - 32 provincias de RD

### 2. Seed Data

**✅ COMPLETADO** - Archivo `seed-inspectoria.ts` con:
- 15 Categorías IRC con precios oficiales
- 32 Provincias de República Dominicana
- Todos los catálogos de estados y status
- Total: 73 registros de catálogo

---

## 📅 Fases de Implementación

### **FASE 1: Backend Core (2 semanas)** 🔄 EN PROGRESO

**Objetivo:** APIs RESTful completas para ambos flujos

#### Semana 1: CRUD Básico

**1.1. Empresas Inspeccionadas** (2 días)
```
✅ Tareas:
- [ ] Controller: empresas.controller.ts
  - POST /api/inspectoria/empresas - Crear empresa
  - GET /api/inspectoria/empresas - Listar con filtros (RNC, categoría, provincia, status)
  - GET /api/inspectoria/empresas/:id - Obtener detalles
  - PUT /api/inspectoria/empresas/:id - Actualizar
  - DELETE /api/inspectoria/empresas/:id - Eliminar (soft delete)

- [ ] Endpoints especiales:
  - GET /api/inspectoria/empresas/buscar/:rnc - Búsqueda rápida por RNC
  - GET /api/inspectoria/empresas/vencidas - Empresas con registro vencido
  - GET /api/inspectoria/empresas/por-vencer - Próximas a vencer (30 días)

- [ ] Validaciones:
  - RNC único
  - Validar estructura RNC dominicano
  - Categoría IRC válida
  - Si Persona Moral → requiere consejo de administración
  - Si Persona Física → requiere propietario y cédula

📁 Archivo: /backend/src/controllers/inspectoria/empresas.controller.ts
📁 Archivo: /backend/src/routes/inspectoria/empresas.routes.ts
```

**1.2. Documentos de Empresa** (1 día)
```
✅ Tareas:
- [ ] Upload de documentos con multer
  - POST /api/inspectoria/empresas/:id/documentos - Upload
  - GET /api/inspectoria/empresas/:id/documentos - Listar
  - DELETE /api/inspectoria/empresas/:id/documentos/:docId - Eliminar

- [ ] Validar tipos permitidos: PDF, JPG, PNG
- [ ] Límite de tamaño: 10MB por archivo
- [ ] Almacenar en: /uploads/inspectoria/empresas/:rnc/

📁 Archivo: /backend/src/controllers/inspectoria/documentos.controller.ts
```

**1.3. Consejo de Administración y Clientes** (1 día)
```
✅ Tareas:
- [ ] CRUD de consejo de administración
  - POST /api/inspectoria/empresas/:id/consejo
  - PUT /api/inspectoria/empresas/:id/consejo/:miembroId
  - DELETE /api/inspectoria/empresas/:id/consejo/:miembroId

- [ ] CRUD de principales clientes
  - POST /api/inspectoria/empresas/:id/clientes
  - PUT /api/inspectoria/empresas/:id/clientes/:clienteId
  - DELETE /api/inspectoria/empresas/:id/clientes/:clienteId

📁 Archivo: /backend/src/controllers/inspectoria/empresa-relaciones.controller.ts
```

**1.4. Catálogos** (1 día)
```
✅ Tareas:
- [ ] Controller para todos los catálogos:
  - GET /api/inspectoria/categorias-irc - Lista de IRC-01 a IRC-15
  - GET /api/inspectoria/status - Status de inspección
  - GET /api/inspectoria/estados-juridicos
  - GET /api/inspectoria/conclusiones
  - GET /api/inspectoria/status-externos
  - GET /api/inspectoria/provincias

📁 Archivo: /backend/src/controllers/inspectoria/catalogos.controller.ts
```

#### Semana 2: Workflows

**2.1. Flujo de Registro (PR-DI-002)** (3 días)
```
✅ Tareas:
- [ ] Controller: solicitudes.controller.ts

PASO 1 - AuU RECEPCIÓN:
  - POST /api/inspectoria/solicitudes - Crear solicitud
    • Validar empresa (buscar por RNC)
    • Si no existe → crear empresa temporal
    • Si existe → vincular
    • Estado inicial: PENDIENTE
    • Asignar código: SOL-INSP-YYYY-NNNN

PASO 2 - INSPECTORÍA VALIDACIÓN:
  - PUT /api/inspectoria/solicitudes/:id/validar - Validar documentos
    • Cambiar estado a VALIDADA
    • Registrar validadoPorId y fechaValidacion

PASO 3 - CAJA PAGO (AUTOMÁTICO):
  - POST /api/inspectoria/solicitudes/:id/generar-factura
    • Buscar precio en categorias_irc
    • Crear factura con estado ABIERTA
    • Vincular factura a solicitud
    • Cambiar estado a PAGADA cuando se pague (webhook desde Cajas)

PASO 4 - INSPECTORÍA ASENTAMIENTO:
  - PUT /api/inspectoria/solicitudes/:id/asentar
    • Recibir numeroAsiento del Paralegal
    • Recibir libroAsiento (Ej: "Libro 5")
    • Cambiar estado a ASENTADA

PASO 5 - GENERACIÓN CERTIFICADO:
  - POST /api/inspectoria/solicitudes/:id/generar-certificado
    • Generar PDF con datos empresa + número asiento
    • Guardar en /uploads/certificados/inspeccion/YYYY/
    • Crear registro CertificadoInspeccion
    • Estado: PENDIENTE_FIRMA

PASO 6 - REGISTRO FIRMA:
  - POST /api/inspectoria/solicitudes/:id/firmar
    • Upload PDF firmado digitalmente
    • Actualizar rutaPdfFirmado
    • Estado: LISTA_ENTREGA

PASO 7 - AuU ENTREGA:
  - POST /api/inspectoria/solicitudes/:id/entregar
    • Registrar entregadoPorId y fechaEntrega
    • Estado: ENTREGADA
    • Actualizar empresa.fechaRegistro (si nuevo)
    • Actualizar empresa.fechaRenovacion (si renovación)
    • Calcular fechaVencimiento (+1 año)

📁 Archivo: /backend/src/controllers/inspectoria/solicitudes.controller.ts
📁 Archivo: /backend/src/services/inspectoria/certificado-generator.service.ts
```

**2.2. Flujo de Casos de Inspección (PR-DI-001, PR-DI-003, PR-DI-004)** (2 días)
```
✅ Tareas:
- [ ] Controller: casos.controller.ts

CREACIÓN DE CASOS:
  1. POR RENOVACIÓN VENCIDA (AUTOMÁTICO):
     - Job diario que busca empresas vencidas
     - Crea caso tipo OFICIO, origen ALERTA_VENCIMIENTO
     - Estado: PENDIENTE_ASIGNACION

  2. POR DENUNCIA (DESDE CAJA):
     - POST /api/inspectoria/casos/denuncia
     - Webhook cuando se paga "Inspección de Parte"
     - Crear caso tipo DENUNCIA
     - Estado: PENDIENTE_ASIGNACION

  3. POR OPERATIVO:
     - Desde operativo se crean múltiples casos
     - Tipo: OPERATIVO
     - Estado: ASIGNADO (inspector ya asignado)

ASIGNACIÓN:
  - PUT /api/inspectoria/casos/:id/asignar
    • Encargado asigna inspector
    • Registrar asignadoPorId, inspectorAsignadoId, fechaAsignacion
    • Estado: ASIGNADO

1RA VISITA:
  - POST /api/inspectoria/casos/:id/primera-visita
    • Inspector reporta visita
    • Upload acta de inspección (PDF)
    • Crear ActaInspeccion (tipoActa: INSPECCION)
    • Si hay infracciones:
      - Calcular fechaLimiteCorreccion (+10 días hábiles)
      - Estado: EN_PLAZO_GRACIA
    • Si todo OK:
      - Estado: CERRADO
      - Resolución: RESUELTO_CORRECCION

2DA VISITA:
  - POST /api/inspectoria/casos/:id/segunda-visita
    • Inspector reporta 2da visita
    • Upload acta de infracción (PDF)
    • Crear ActaInspeccion (tipoActa: INFRACCION)
    • Estado: REACTIVADO

TRAMITAR A JURÍDICO:
  - POST /api/inspectoria/casos/:id/tramitar-juridico
    • Encargado tramita caso
    • Compilar expediente completo
    • Estado: TRAMITADO_JURIDICO
    • Actualizar empresa.estadoJuridicoId = REMITIDA DEP JURIDICO

CIERRE AUTOMÁTICO POR PAGO:
  - Webhook desde Cajas cuando empresa paga renovación
  - Buscar caso abierto de esa empresa
  - POST /api/inspectoria/casos/:id/cerrar-automatico
    • Estado: CERRADO
    • Resolución: RESUELTO_PAGO

📁 Archivo: /backend/src/controllers/inspectoria/casos.controller.ts
📁 Archivo: /backend/src/services/inspectoria/actas-generator.service.ts
```

**2.3. Operativos Antipiratería** (1 día)
```
✅ Tareas:
- [ ] Controller: operativos.controller.ts
  - POST /api/inspectoria/operativos - Crear operativo
  - PUT /api/inspectoria/operativos/:id - Actualizar
  - POST /api/inspectoria/operativos/:id/instituciones - Agregar institución
  - POST /api/inspectoria/operativos/:id/inspectores - Asignar inspector
  - POST /api/inspectoria/operativos/:id/ejecutar - Marcar como ejecutado
  - POST /api/inspectoria/operativos/:id/completar - Completar operativo

📁 Archivo: /backend/src/controllers/inspectoria/operativos.controller.ts
```

**2.4. Dashboard y Reportes** (1 día)
```
✅ Tareas:
- [ ] GET /api/inspectoria/dashboard
  {
    "alertasRenovacion": {
      "vencidas": 15,
      "porVencer30Dias": 23
    },
    "solicitudesPendientes": {
      "validacion": 5,
      "asentamiento": 8,
      "firma": 3
    },
    "casosPendientes": {
      "pendientesAsignacion": 12,
      "enPlazoGracia": 7,
      "paraSegundaVisita": 4
    },
    "operativosActivos": 2
  }

- [ ] GET /api/inspectoria/reportes/empresas-por-categoria
- [ ] GET /api/inspectoria/reportes/empresas-por-provincia
- [ ] GET /api/inspectoria/reportes/casos-por-tipo
- [ ] GET /api/inspectoria/reportes/renovaciones-mes

📁 Archivo: /backend/src/controllers/inspectoria/dashboard.controller.ts
```

---

### **FASE 2: Frontend - Flujo 1 (PR-DI-002)** (2 semanas)

#### Semana 3: Formularios y Listados

**3.1. Formulario de Registro de Empresa** (3 días)
```
✅ Componente: FormularioEmpresaPage.tsx

SECCIONES DEL FORMULARIO (según PDF):

1. TIPO DE NEGOCIO:
   [ ] Select con IRC-01 a IRC-15
   [ ] Mostrar precio automáticamente

2. DATOS DE LA EMPRESA:
   [ ] Nombre de la Empresa *
   [ ] Nombre Comercial
   [ ] RNC * (con validación formato)
   [ ] Dirección *
   [ ] Provincia * (select)
   [ ] Teléfono *
   [ ] Fax
   [ ] Email *
   [ ] Página Web

3. TIPO DE PERSONA:
   [ ] Radio: Persona Moral / Persona Física

   SI PERSONA MORAL:
   [ ] Tabla de Consejo de Administración:
       - Presidente (nombre, cédula)
       - Secretario (nombre, cédula)
       - Tesorero (nombre, cédula)
       - Vocal (nombre, cédula)

   SI PERSONA FÍSICA:
   [ ] Nombre del Propietario *
   [ ] Cédula del Propietario *

4. DESCRIPCIÓN DE ACTIVIDADES:
   [ ] Textarea grande

5. PRINCIPALES CLIENTES:
   [ ] Lista dinámica (mínimo 3)

6. DOCUMENTOS REQUERIDOS:
   [ ] Upload RNC *
   [ ] Upload Cédula (propietario/presidente) *
   [ ] Upload Registro Mercantil *
   [ ] Upload Facturas (últimos 12 meses) *

VALIDACIONES:
- Campos obligatorios marcados con *
- RNC: formato XXX-XXXXX-X
- Cédula: formato XXX-XXXXXXX-X
- Email: formato válido
- Archivos: PDF, JPG, PNG, máx 10MB

📁 Archivo: /frontend/src/pages/inspectoria/FormularioEmpresaPage.tsx
📁 Archivo: /frontend/src/components/inspectoria/FormularioEmpresa.tsx
```

**3.2. Listado de Empresas** (2 días)
```
✅ Componente: EmpresasPage.tsx

CARACTERÍSTICAS:
[ ] Tabla con columnas:
    - RNC
    - Nombre Empresa
    - Categoría IRC
    - Provincia
    - Status
    - Fecha Registro
    - Fecha Vencimiento
    - Acciones

[ ] Filtros:
    - Búsqueda por RNC/Nombre
    - Categoría IRC
    - Provincia
    - Status
    - Vencidas / Por vencer

[ ] Badges de colores:
    - Rojo: Vencida
    - Naranja: Por vencer (30 días)
    - Verde: Vigente

[ ] Acciones por fila:
    - Ver detalles
    - Editar
    - Ver certificado
    - Ver casos asociados

📁 Archivo: /frontend/src/pages/inspectoria/EmpresasPage.tsx
```

**3.3. Workflow de Solicitud** (3 días)
```
✅ Componente: SolicitudWorkflowPage.tsx

VISTA POR ROL:

A) TÉCNICO AuU (RECEPCIÓN):
[ ] Crear nueva solicitud
[ ] Buscar empresa por RNC
[ ] Si no existe → llenar formulario completo
[ ] Si existe → confirmar datos y crear solicitud renovación
[ ] Ver documentos cargados
[ ] Enviar a validación

B) PARALEGAL INSPECTORÍA (VALIDACIÓN):
[ ] Bandeja de solicitudes PENDIENTES
[ ] Ver documentos adjuntos
[ ] Botones: VALIDAR / RECHAZAR
[ ] Si rechaza → campo motivo
[ ] Al validar → se genera factura automática

C) CAJERA (AUTOMÁTICO):
[ ] Al pagar factura → webhook actualiza solicitud
[ ] Estado cambia a PAGADA
[ ] Aparece en bandeja de Paralegal

D) PARALEGAL INSPECTORÍA (ASENTAMIENTO):
[ ] Bandeja de solicitudes PAGADAS
[ ] Formulario:
    - Número de Asiento *
    - Libro de Asiento *
[ ] Botón: GENERAR CERTIFICADO
[ ] Sistema genera PDF borrador

E) ENCARGADO REGISTRO (FIRMA):
[ ] Bandeja de certificados PENDIENTE_FIRMA
[ ] Descargar borrador
[ ] Firmar en portal GOB.DO (externo)
[ ] Upload PDF firmado
[ ] Estado cambia a LISTA_ENTREGA

F) AUXILIAR AuU (ENTREGA):
[ ] Bandeja de certificados LISTA_ENTREGA
[ ] Buscar por RNC/Nombre
[ ] Imprimir certificado firmado
[ ] Botón: MARCAR COMO ENTREGADO
[ ] Cliente firma libro físico de control

COMPONENTES COMUNES:
[ ] Timeline del workflow (mostrar progreso)
[ ] Historial de cambios
[ ] Comentarios internos

📁 Archivo: /frontend/src/pages/inspectoria/solicitudes/SolicitudWorkflowPage.tsx
📁 Archivo: /frontend/src/components/inspectoria/TimelineWorkflow.tsx
```

---

### **FASE 3: Frontend - Flujo 2 (Casos)** (2 semanas)

#### Semana 4: Dashboard y Casos

**4.1. Dashboard de Inspectoría** (2 días)
```
✅ Componente: DashboardInspectoriaPage.tsx

WIDGETS:

1. ALERTAS DE RENOVACIÓN:
   [ ] Card "Empresas Vencidas" (número en rojo)
   [ ] Card "Por Vencer (30 días)" (número en naranja)
   [ ] Botón: "Asignar Inspecciones Automáticas"

2. SOLICITUDES PENDIENTES:
   [ ] Card "Pendientes Validación" (Paralegal)
   [ ] Card "Pendientes Asentamiento" (Paralegal)
   [ ] Card "Pendientes Firma" (Registro)

3. CASOS DE INSPECCIÓN:
   [ ] Card "Pendientes Asignación" (Encargado)
   [ ] Card "En Plazo de Gracia" (10 días)
       - Mostrar contador de días
   [ ] Card "Para 2da Visita" (Inspector)

4. CASOS POR DENUNCIA:
   [ ] Lista de denuncias pagadas sin asignar

5. OPERATIVOS ACTIVOS:
   [ ] Lista de operativos en ejecución

6. GRÁFICAS:
   [ ] Empresas por Categoría IRC (pie chart)
   [ ] Casos por Mes (line chart)
   [ ] Casos por Tipo (bar chart)

📁 Archivo: /frontend/src/pages/inspectoria/DashboardInspectoriaPage.tsx
```

**4.2. Gestión de Casos** (3 días)
```
✅ Componente: CasosPage.tsx

VISTA ENCARGADO:
[ ] Tabla de casos pendientes asignación
[ ] Modal: Asignar Inspector
    - Select de inspectores disponibles
    - Prioridad (Alta/Media/Baja)
[ ] Botón: "Tramitar a Jurídico"

VISTA INSPECTOR:
[ ] "Mis Casos Asignados"
[ ] Filtros: Tipo, Prioridad, Estado
[ ] Card por caso mostrando:
    - Empresa (RNC, nombre)
    - Tipo de caso
    - Fecha asignación
    - Estado
    - Si EN_PLAZO_GRACIA → contador días restantes

MODAL 1RA VISITA:
[ ] Fecha y hora de visita
[ ] ¿Cumple con requisitos? (Sí/No)
[ ] Hallazgos (textarea)
[ ] Si NO cumple:
    - Infracciones encontradas
    - Upload acta de inspección (PDF/foto)
    - Plazo de corrección (default 10 días)

MODAL 2DA VISITA:
[ ] Fecha y hora de visita
[ ] ¿Corrigió infracciones? (Sí/No)
[ ] Hallazgos finales (textarea)
[ ] Upload acta de infracción (PDF/foto)

📁 Archivo: /frontend/src/pages/inspectoria/casos/CasosPage.tsx
📁 Archivo: /frontend/src/components/inspectoria/ModalPrimeraVisita.tsx
📁 Archivo: /frontend/src/components/inspectoria/ModalSegundaVisita.tsx
```

#### Semana 5: Operativos y Finales

**5.1. Operativos Antipiratería** (2 días)
```
✅ Componente: OperativosPage.tsx

CREAR OPERATIVO:
[ ] Formulario:
    - Nombre del operativo *
    - Fecha planificada *
    - Zona geográfica
    - Objetivos (textarea)
    - Instituciones colaboradoras (lista dinámica):
        - Nombre institución
        - Contacto
        - Teléfono
    - Inspectores asignados (multi-select):
        - Rol (Líder / Inspector)

EJECUTAR OPERATIVO:
[ ] Cambiar estado a EN_EJECUCION
[ ] Fecha de ejecución

RESULTADOS:
[ ] Total empresas visitadas
[ ] Total infracciones
[ ] Generar casos automáticos
[ ] Upload reporte final (PDF)

📁 Archivo: /frontend/src/pages/inspectoria/operativos/OperativosPage.tsx
```

**5.2. Reportes** (1 día)
```
✅ Componente: ReportesInspectoriaPage.tsx

REPORTES DISPONIBLES:
[ ] Empresas Registradas por Categoría IRC (PDF/Excel)
[ ] Empresas por Vencer (próximos 30 días) (PDF/Excel)
[ ] Empresas Vencidas (PDF/Excel)
[ ] Empresas con Infracciones Pendientes (PDF)
[ ] Empresas en Proceso Jurídico (PDF)
[ ] Ingresos por Categoría IRC (PDF/Excel)
[ ] Actas de Inspección por Período (PDF)
[ ] Renovaciones del Mes (PDF/Excel)
[ ] Empresas por Provincia (PDF/Excel)

FILTROS:
- Rango de fechas
- Categoría IRC
- Provincia
- Estado

📁 Archivo: /frontend/src/pages/inspectoria/ReportesInspectoriaPage.tsx
```

**5.3. Certificados** (1 día)
```
✅ Generación de PDFs:

CERTIFICADO DE INSPECTORÍA:
[ ] Template con:
    - Logo ONDA
    - Número de certificado
    - Número de asiento
    - Datos de empresa
    - Categoría IRC
    - Fecha emisión
    - Fecha vencimiento (1 año)
    - Firma digital
    - Código QR (validación)

ACTA DE INSPECCIÓN (1RA VISITA):
[ ] Template con:
    - Número de acta
    - Empresa
    - Inspector
    - Fecha y hora
    - Hallazgos
    - Infracciones (si hay)
    - Plazo de corrección

ACTA DE INFRACCIÓN (2DA VISITA):
[ ] Template con:
    - Número de acta
    - Empresa
    - Inspector
    - Fecha y hora
    - Infracciones persistentes
    - Firma digital

📁 Archivo: /backend/src/services/pdf/certificado-inspeccion.template.ts
📁 Archivo: /backend/src/services/pdf/acta-inspeccion.template.ts
```

---

### **FASE 4: Integraciones y Automatizaciones** (1 semana)

#### Semana 6: Automatizaciones

**6.1. Jobs Automáticos** (2 días)
```
✅ Tareas:

JOB 1: VERIFICAR RENOVACIONES (DIARIO - 6:00 AM)
[ ] Buscar empresas con fechaVencimiento < HOY
[ ] Si no tiene caso abierto → crear caso OFICIO
[ ] Enviar email de alerta a Encargado
[ ] Crear notificación en sistema

JOB 2: ALERTAS 30 DÍAS (DIARIO - 6:00 AM)
[ ] Buscar empresas con fechaVencimiento entre HOY y +30 días
[ ] Enviar email a empresa recordando renovación
[ ] Actualizar status a NOTIFICACION_RENOVACION

JOB 3: REACTIVAR CASOS (DIARIO - 8:00 AM)
[ ] Buscar casos EN_PLAZO_GRACIA con fechaLimite < HOY
[ ] Cambiar estado a REACTIVADO
[ ] Notificar inspector asignado

JOB 4: LIMPIAR ARCHIVOS TEMPORALES (SEMANAL)
[ ] Eliminar uploads temporales mayores a 30 días

📁 Archivo: /backend/src/jobs/inspectoria.jobs.ts
```

**6.2. Webhooks e Integraciones** (2 días)
```
✅ Tareas:

WEBHOOK: PAGO DE FACTURA (desde Cajas)
[ ] Al marcar factura como PAGADA:
    1. Si es factura de SolicitudInspeccion:
       - Actualizar estado a PAGADA
       - Registrar fechaPago
       - Notificar Paralegal

    2. Si empresa tiene caso abierto:
       - Buscar CasoInspeccion activo de esa empresa
       - Cerrar caso automáticamente
       - Resolucion: RESUELTO_PAGO
       - Notificar inspector

WEBHOOK: CREACIÓN DE DENUNCIA (desde Cajas)
[ ] Al pagar "Inspección de Parte (PR-DI-003)":
    - Crear CasoInspeccion tipo DENUNCIA
    - Vincular factura
    - Estado: PENDIENTE_ASIGNACION
    - Notificar Encargado

INTEGRACIÓN: GENERACIÓN DE NCF
[ ] Al generar factura de inspectoría:
    - Usar tipo B02
    - Incluir RNC de empresa
    - Detalles: "Registro Inspectoría - [Categoría]"

📁 Archivo: /backend/src/webhooks/cajas-inspectoria.webhook.ts
```

**6.3. Notificaciones por Email** (1 día)
```
✅ Plantillas de Email:

1. RECORDATORIO RENOVACIÓN (30 días antes):
   Asunto: Renovación de Registro - ONDA
   Contenido:
   - Datos empresa
   - Fecha vencimiento
   - Monto a pagar
   - Documentos a actualizar
   - Link al sistema

2. ALERTA VENCIMIENTO (día del vencimiento):
   Similar al anterior, tono urgente

3. NOTIFICACIÓN INFRACCIÓN (1ra visita):
   Contenido:
   - Infracciones encontradas
   - Plazo de 10 días
   - Consecuencias de no corregir

4. INTIMACIÓN (2da visita):
   Contenido:
   - Acta de infracción adjunta
   - Remisión a Dep. Jurídico

📁 Archivo: /backend/src/services/email/inspectoria-templates.ts
```

---

### **FASE 5: Testing y Deployment** (1 semana)

#### Semana 7: Testing y Ajustes

**7.1. Testing Unitario** (2 días)
```
✅ Tests:
[ ] Validaciones de RNC y Cédula
[ ] Cálculo de fechas de vencimiento
[ ] Contador de 10 días hábiles
[ ] Generación de códigos (SOL-INSP, CASO-INSP, etc.)
[ ] Webhooks de pago
[ ] Jobs automáticos

📁 Archivo: /backend/tests/inspectoria/*.test.ts
```

**7.2. Testing de Integración** (2 días)
```
✅ Flows completos:
[ ] Flujo 1: Nueva empresa → Pago → Certificado → Entrega
[ ] Flujo 2: Caso de oficio → 1ra visita → 10 días → 2da visita → Jurídico
[ ] Cierre automático por pago
[ ] Creación de caso por denuncia
[ ] Operativo completo

📁 Archivo: /backend/tests/inspectoria/flows/*.test.ts
```

**7.3. Migración de Datos V1** (1 día)
```
✅ Script de migración:
[ ] Leer t_importydistribuidor de V1
[ ] Mapear a EmpresaInspeccionada
[ ] Asignar categoría IRC (desde ID_tipoproducto)
[ ] Asignar provincia (desde ubicacion)
[ ] Crear registros históricos
[ ] Validar datos migrados

📁 Archivo: /backend/prisma/migrate-inspectoria-v1.ts
```

---

## 🎯 Entregables Finales

### Documentación
- [ ] Manual de Usuario - Flujo de Registro
- [ ] Manual de Usuario - Gestión de Casos
- [ ] Manual de Usuario - Operativos
- [ ] Guía del Administrador
- [ ] Documentación Técnica de APIs

### Capacitación
- [ ] Video: Flujo completo de registro (15 min)
- [ ] Video: Gestión de casos de inspección (20 min)
- [ ] Video: Dashboard y reportes (10 min)
- [ ] Sesión presencial con usuarios clave (4 horas)

---

## 📊 Métricas de Éxito

### Funcionales
- ✅ 100% de campos del formulario PDF implementados
- ✅ Workflow completo de 7 pasos funcional
- ✅ Contador de 10 días hábiles preciso
- ✅ Cierre automático de casos por pago
- ✅ Generación automática de certificados con número asiento

### Performance
- ⏱️ Tiempo de carga de listados < 2 segundos
- ⏱️ Generación de PDF < 3 segundos
- ⏱️ Upload de documentos < 5 segundos

### Adopción
- 👥 80% de usuarios capacitados en primera semana
- 👥 90% de empresas registradas en sistema después de 1 mes
- 👥 Reducción de 60% en tiempo de proceso de certificado

---

## ⚠️ Riesgos y Mitigaciones

### Riesgo 1: Firma Digital Externa
**Problema:** Dependencia de portal GOB.DO para firma
**Mitigación:** Implementar workflow alternativo con firma física escaneada

### Riesgo 2: Cálculo de Días Hábiles
**Problema:** Feriados y días no laborables
**Mitigación:** Mantener tabla de feriados dominicanos actualizada

### Riesgo 3: Volumen de Notificaciones
**Problema:** Miles de emails si muchas empresas vencen
**Mitigación:** Rate limiting de emails, agrupación semanal

---

## 🚀 Siguientes Pasos Inmediatos

### Esta Semana:
1. ✅ Aplicar schema Prisma: `npx prisma db push`
2. ✅ Ejecutar seed: `npx ts-node prisma/seed-inspectoria.ts`
3. 🔄 Crear controllers de empresas y catálogos
4. 🔄 Crear primeras rutas de API
5. 🔄 Testing básico con Postman/Insomnia

### Próxima Semana:
- Implementar workflow completo de solicitudes
- Crear formulario frontend
- Integrar con módulo de Cajas

---

**Última actualización:** 2025-11-12
**Responsable:** Equipo de Desarrollo SIAONDA V2
**Aprobado por:** [Pendiente]
