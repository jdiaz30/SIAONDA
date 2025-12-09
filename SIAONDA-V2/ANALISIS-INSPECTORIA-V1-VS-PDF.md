# Análisis Comparativo: Inspectoría V1 vs Especificación PDF

## Resumen Ejecutivo

Este documento compara la implementación actual de Inspectoría en SIAONDA V1 con los requerimientos establecidos en los documentos PDF oficiales para determinar brechas y planificar la implementación en SIAONDA V2.

**Fecha de análisis:** 2025-11-12
**Documentos analizados:**
- `/SIAONDA-V2/docs/FORMULARIOS Y CERTIFICADOS ONDA/FORMULARIOS/FORMULARIO DE INSPECTORIA/FORMULARIO_DE_LOS_IMPORTADORES_EDITABLE.pdf`
- `/SIAONDA-V2/docs/RESOLUCIN NM. 013-2023 MODIFICA RESOLUCION 003-2022 2 (1).pdf`
- `/SIAONDA-V2/docs/RESUMEN GENERAL DEL DEPT. DE INSPECTORÍA.pdf`

**Archivos V1 analizados:**
- `/ONDA/importydistri.php` - Formulario de registro
- `/ONDA/OPER/C_ImportyDistri.php` - Modelo de datos
- `/ONDA/Inspectoria.php` - Búsqueda de empresas

---

## 1. Estructura de Datos en V1

### Tabla: `t_importydistribuidor`

Según el código analizado, la tabla V1 contiene los siguientes campos:

```sql
CREATE TABLE t_importydistribuidor (
  ID INT PRIMARY KEY AUTO_INCREMENT,
  identificacion VARCHAR,              -- Cédula/RNC
  ID_tipoidentificacion INT,           -- 1=Cedula, 2=Pasaporte, 3=RNC, 5=Acta Nacimiento
  ID_tipoproducto INT,                 -- FK a productos (tipo de servicio)
  nombre VARCHAR,                      -- Nombre/Razón Social
  contacto VARCHAR,                    -- Persona de contacto
  ubicacion VARCHAR,                   -- Provincia
  direccion VARCHAR,                   -- Dirección completa
  telefono VARCHAR,                    -- Teléfono
  correoe VARCHAR,                     -- Correo electrónico

  -- Campos de estado/tracking interno
  ID_registrado INT,                   -- 1=(vacío), 2=REGISTRADO, 3=NO REGISTRADO
  ID_estadojuridico INT,               -- 1=STATUS OK, 2=INTIMADA, 3=REMITIDA DEP JURIDICO
  ID_conclusion INT,                   -- 1=VIGENTE, 2=PENDIENTE, 3=INACTIVA, 4=TRABAJADA, 5=NO CALIFICA, 6=NO APLICA, 7=NO EXISTE
  ID_status INT,                       -- 1=VISITADA, 2=NO NOTIFICADA, 3=NOTIF RENOVACION, 4=NOTIFICACION, 7=INTIMADA
  ID_statusexterno INT,                -- 5=AL DIA, 6=ATRASO, 7=PROCESO LEGAL, 8=NO APLICA
  ID_existencia INT,                   -- 3=NO EXISTE EN SISTEMA, 4=EXISTE EN SISTEMA

  -- Fechas de tracking
  fecha_notificacion DATE,             -- Fecha de notificación
  fechaactainfraccion DATE,            -- Fecha de acta de infracción
  fecha_registro DATE,                 -- Fecha de registro inicial
  fecha_renovacion DATE,               -- Fecha de renovación

  comentario TEXT                      -- Comentarios generales
);
```

### Vista: `v_importydistribuidor`

La vista incluye todos los campos de la tabla más los nombres legibles de los catálogos relacionados:
- `tipoidentificacion` (nombre del tipo)
- `producto` (nombre del tipo de servicio)
- `registrado` (nombre del estado)
- `estado_juridico` (nombre del estado)
- `conclusion` (nombre de la conclusión)
- `status` (nombre del status)
- `statusexterno` (nombre del status externo)
- `existencia` (nombre de la existencia)

---

## 2. Campos Requeridos según PDF del Formulario

### Sección: Tipo de Negocio
- **IRC-01 a IRC-15** (15 categorías de negocio)
  - IRC-01: Editores RD$ 30,000
  - IRC-02: Imprentas RD$ 30,000
  - IRC-03: Productores Fonogramas RD$ 30,000
  - IRC-04: Duplicadores RD$ 30,000
  - IRC-05: Fabricantes Equipos RD$ 50,000
  - IRC-06: Colecciones Videográficas RD$ 50,000
  - IRC-07: Importadores Soportes Vacíos RD$ 30,000
  - IRC-08: Importadores Música RD$ 30,000
  - IRC-09: Importadores Películas RD$ 30,000
  - IRC-10: Importadores Software RD$ 30,000
  - IRC-11: Importadores Libros/Revistas RD$ 30,000
  - IRC-12: Distribuidores Soportes Vacíos RD$ 10,000
  - IRC-13: Distribuidores Música RD$ 10,000
  - IRC-14: Distribuidores Películas RD$ 10,000
  - IRC-15: Distribuidores Software RD$ 3,000

### Sección: Datos de la Empresa
- **Nombre de la Empresa**
- **Nombre Comercial** ❌ *FALTA EN V1*
- **RNC** (en V1 está como "identificacion" genérica)
- **Dirección**
- **Teléfono**
- **Fax** ❌ *FALTA EN V1*
- **Email** (en V1 como "correoe")
- **Página Web** ❌ *FALTA EN V1*

### Sección: Persona Moral o Física
**❌ COMPLETAMENTE AUSENTE EN V1**

#### Si es Persona Moral:
- **Consejo de Administración:**
  - Presidente - Nombre, Cédula
  - Secretario - Nombre, Cédula
  - Tesorero - Nombre, Cédula
  - Vocal - Nombre, Cédula

#### Si es Persona Física:
- **Nombre del Propietario**
- **Cédula del Propietario**

### Sección: Descripción de Actividades
- **Descripción de las Actividades Comerciales de la Empresa** ❌ *FALTA EN V1*

### Sección: Principales Clientes
- **Lista de Principales Clientes (3 mínimo)** ❌ *FALTA EN V1*

### Sección: Documentos Adjuntos Requeridos
**❌ COMPLETAMENTE AUSENTE EN V1**
- Copia del RNC
- Copia de Cédula del Propietario o Presidente
- Copia del Registro Mercantil
- Relación de Facturas de Compra (últimos 12 meses)

---

## 3. Procedimientos según PDF de Inspectoría

### PR-DI-002: Registro y Certificación
**Estado en V1:** ❌ Implementación básica sin workflow completo

#### Flujo definido en PDF:
1. **AuU (Atención al Usuario)** - Recibe solicitud
2. **Inspectoría** - Revisa documentos y aprueba/rechaza
3. **Caja** - Recibe pago según categoría IRC
4. **Registro** - Emite certificado con número de asiento
5. **AuU** - Entrega certificado al cliente

#### Implementación V1:
- ✅ Formulario de registro básico existe
- ✅ Guarda datos de empresa
- ❌ No hay workflow entre departamentos
- ❌ No hay integración con Caja
- ❌ No hay generación automática de certificado
- ❌ No hay número de asiento
- ❌ No hay tracking de renovación anual

### PR-DI-001: Inspecciones de Oficio
**Estado en V1:** ⚠️ Parcialmente implementado

#### Flujo definido en PDF:
1. Inspector visita empresa
2. **1ra Visita:** Levanta Acta de Inspección (si todo OK, finaliza)
3. **Si hay infracción:** Notifica empresa (10 días para corregir)
4. **2da Visita:** Levanta Acta de Infracción (si no corrigió)
5. Remite a Departamento Jurídico

#### Implementación V1:
- ✅ Campos de tracking: `fecha_notificacion`, `fechaactainfraccion`
- ✅ Estados jurídicos: STATUS OK, INTIMADA, REMITIDA DEP JURIDICO
- ✅ Conclusiones: VIGENTE, PENDIENTE, INACTIVA, etc.
- ❌ No hay conteo automático de 10 días entre visitas
- ❌ No hay generación de actas (PDF)
- ❌ No hay workflow automático
- ❌ No hay cierre automático al recibir pago

### PR-DI-003: Inspecciones de Parte (Denuncias)
**Estado en V1:** ❌ No implementado

### PR-DI-004: Operativos Antipiratería
**Estado en V1:** ❌ No implementado

---

## 4. Brechas Identificadas (Gap Analysis)

### 🔴 Críticas (Obligatorias para cumplir con PDF)

1. **Persona Moral vs Física**
   - V1: No distingue
   - PDF: Campos obligatorios para Consejo de Administración o Propietario

2. **Categorías IRC (IRC-01 a IRC-15)**
   - V1: Usa tabla genérica de productos
   - PDF: 15 categorías específicas con precios establecidos

3. **Nombre Comercial**
   - V1: No existe
   - PDF: Campo obligatorio separado del nombre legal

4. **Descripción de Actividades**
   - V1: No existe
   - PDF: Campo de texto obligatorio

5. **Principales Clientes**
   - V1: No existe
   - PDF: Lista de al menos 3 clientes

6. **Documentos Adjuntos**
   - V1: Sistema de archivos no implementado
   - PDF: 4 documentos requeridos (RNC, Cédula, Registro Mercantil, Facturas)

### 🟡 Importantes (Para workflow completo)

7. **Integración con Caja**
   - V1: No existe
   - Requerido: Generar factura automática según categoría IRC

8. **Generación de Certificado**
   - V1: No existe
   - Requerido: Certificado con número de asiento al pagar

9. **Workflow entre Departamentos**
   - V1: No existe
   - Requerido: AuU → Inspectoría → Caja → Registro → AuU

10. **Renovación Anual Automática**
    - V1: Tiene `fecha_renovacion` pero sin alertas
    - Requerido: Alertas 1 mes antes, emails automáticos

11. **Generación de Actas (PDF)**
    - V1: No existe
    - Requerido: Acta de Inspección, Acta de Infracción

12. **Contador de 10 días**
    - V1: No existe
    - Requerido: Entre 1ra y 2da visita

### 🟢 Deseables (Mejoras)

13. **Campo Fax**
    - V1: No existe
    - PDF: Incluido en formulario

14. **Campo Página Web**
    - V1: No existe
    - PDF: Incluido en formulario

15. **Dashboard de Inspectoría**
    - V1: No existe
    - Deseable: Métricas, empresas por vencer, pendientes

---

## 5. Campos a Mantener de V1 (Útiles para tracking interno)

✅ **Mantener estos campos que NO están en PDF pero son valiosos:**

1. `ID_status` - VISITADA, NO NOTIFICADA, NOTIFICACION, INTIMADA
2. `ID_estadojuridico` - STATUS OK, INTIMADA, REMITIDA DEP JURIDICO
3. `ID_conclusion` - VIGENTE, PENDIENTE, INACTIVA, TRABAJADA, NO CALIFICA
4. `ID_statusexterno` - AL DIA, ATRASO, PROCESO LEGAL
5. `ID_existencia` - EXISTE/NO EXISTE EN SISTEMA
6. `ID_registrado` - REGISTRADO/NO REGISTRADO
7. `comentario` - Comentarios internos
8. `ubicacion` - Provincia (útil para reportes por región)

---

## 6. Propuesta de Modelo de Datos V2

### Tabla Principal: `empresas_inspeccionadas`

```prisma
model EmpresaInspeccionada {
  id                Int       @id @default(autoincrement())

  // Datos básicos de la empresa
  nombreEmpresa     String    @db.VarChar(255)
  nombreComercial   String?   @db.VarChar(255)
  rnc               String    @unique @db.VarChar(20)
  direccion         String    @db.Text
  telefono          String    @db.VarChar(50)
  fax               String?   @db.VarChar(50)
  email             String    @db.VarChar(255)
  paginaWeb         String?   @db.VarChar(255)

  // Categoría IRC (IRC-01 a IRC-15)
  categoriaIrcId    Int       @map("categoria_irc_id")
  categoriaIrc      CategoriaIrc @relation(fields: [categoriaIrcId], references: [id])

  // Tipo de persona
  tipoPersona       String    @db.VarChar(10) // 'MORAL' o 'FISICA'

  // Si es Persona Física
  nombrePropietario String?   @db.VarChar(255)
  cedulaPropietario String?   @db.VarChar(20)

  // Descripción de actividades
  descripcionActividades String @db.Text

  // Tracking V1 (mantener)
  provinciaId       Int?      @map("provincia_id")
  provincia         Provincia? @relation(fields: [provinciaId], references: [id])
  personaContacto   String?   @db.VarChar(255)

  // Estados y conclusiones (mantener de V1)
  statusId          Int       @map("status_id")
  status            StatusInspeccion @relation(fields: [statusId], references: [id])
  estadoJuridicoId  Int?      @map("estado_juridico_id")
  estadoJuridico    EstadoJuridico? @relation(fields: [estadoJuridicoId], references: [id])
  conclusionId      Int?      @map("conclusion_id")
  conclusion        Conclusion? @relation(fields: [conclusionId], references: [id])
  statusExternoId   Int?      @map("status_externo_id")
  statusExterno     StatusExterno? @relation(fields: [statusExternoId], references: [id])
  registrado        Boolean   @default(false)
  existeEnSistema   Boolean   @default(false)

  // Fechas importantes
  fechaRegistro     DateTime? @map("fecha_registro")
  fechaRenovacion   DateTime? @map("fecha_renovacion")
  fechaNotificacion DateTime? @map("fecha_notificacion")
  fechaActaInfraccion DateTime? @map("fecha_acta_infraccion")

  // Comentarios internos
  comentario        String?   @db.Text

  // Auditoría
  creadoEn          DateTime  @default(now()) @map("creado_en")
  actualizadoEn     DateTime  @updatedAt @map("actualizado_en")
  creadoPorId       Int       @map("creado_por_id")
  creadoPor         Usuario   @relation(fields: [creadoPorId], references: [id])

  // Relaciones
  consejoAdministracion ConsejoAdministracion[]
  principalesClientes   ClienteEmpresa[]
  documentos            DocumentoEmpresa[]
  certificados          CertificadoInspeccion[]
  facturas              Factura[]
  actasInspeccion       ActaInspeccion[]

  @@map("empresas_inspeccionadas")
  @@index([rnc])
  @@index([categoriaIrcId])
  @@index([fechaRenovacion])
}
```

### Tabla: `consejo_administracion`

```prisma
model ConsejoAdministracion {
  id          Int      @id @default(autoincrement())
  empresaId   Int      @map("empresa_id")
  empresa     EmpresaInspeccionada @relation(fields: [empresaId], references: [id])

  cargo       String   @db.VarChar(50) // 'PRESIDENTE', 'SECRETARIO', 'TESORERO', 'VOCAL'
  nombre      String   @db.VarChar(255)
  cedula      String   @db.VarChar(20)

  @@map("consejo_administracion")
  @@index([empresaId])
}
```

### Tabla: `clientes_empresa`

```prisma
model ClienteEmpresa {
  id          Int      @id @default(autoincrement())
  empresaId   Int      @map("empresa_id")
  empresa     EmpresaInspeccionada @relation(fields: [empresaId], references: [id])

  nombreCliente String @db.VarChar(255)
  orden       Int      // Para ordenar (cliente 1, 2, 3...)

  @@map("clientes_empresa")
  @@index([empresaId])
}
```

### Tabla: `documentos_empresa`

```prisma
model DocumentoEmpresa {
  id          Int      @id @default(autoincrement())
  empresaId   Int      @map("empresa_id")
  empresa     EmpresaInspeccionada @relation(fields: [empresaId], references: [id])

  tipoDocumento String @db.VarChar(50) // 'RNC', 'CEDULA', 'REGISTRO_MERCANTIL', 'FACTURAS'
  nombreArchivo String @db.VarChar(255)
  rutaArchivo   String @db.VarChar(500)
  tamano        Int    // En bytes
  mimeType      String @db.VarChar(100)

  cargadoEn     DateTime @default(now()) @map("cargado_en")
  cargadoPorId  Int      @map("cargado_por_id")
  cargadoPor    Usuario  @relation(fields: [cargadoPorId], references: [id])

  @@map("documentos_empresa")
  @@index([empresaId])
}
```

### Tabla: `categorias_irc`

```prisma
model CategoriaIrc {
  id          Int      @id @default(autoincrement())
  codigo      String   @unique @db.VarChar(10) // 'IRC-01' a 'IRC-15'
  nombre      String   @db.VarChar(255)
  descripcion String   @db.Text
  precio      Decimal  @db.Decimal(10, 2) // Precio según resolución
  activo      Boolean  @default(true)

  empresas    EmpresaInspeccionada[]

  @@map("categorias_irc")
}
```

### Tabla: `certificados_inspeccion`

```prisma
model CertificadoInspeccion {
  id              Int      @id @default(autoincrement())
  empresaId       Int      @map("empresa_id")
  empresa         EmpresaInspeccionada @relation(fields: [empresaId], references: [id])

  numeroCertificado String @unique @db.VarChar(50)
  numeroAsiento     String @unique @db.VarChar(50)

  facturaId       Int      @map("factura_id")
  factura         Factura  @relation(fields: [facturaId], references: [id])

  fechaEmision    DateTime @default(now()) @map("fecha_emision")
  fechaVencimiento DateTime @map("fecha_vencimiento") // 1 año después

  rutaPdf         String   @db.VarChar(500)

  emitidoPorId    Int      @map("emitido_por_id")
  emitidoPor      Usuario  @relation(fields: [emitidoPorId], references: [id])

  @@map("certificados_inspeccion")
  @@index([empresaId])
  @@index([fechaVencimiento])
}
```

### Tabla: `actas_inspeccion`

```prisma
model ActaInspeccion {
  id              Int      @id @default(autoincrement())
  empresaId       Int      @map("empresa_id")
  empresa         EmpresaInspeccionada @relation(fields: [empresaId], references: [id])

  numeroActa      String   @unique @db.VarChar(50)
  tipoActa        String   @db.VarChar(50) // 'INSPECCION' o 'INFRACCION'

  fechaVisita     DateTime @map("fecha_visita")
  inspectorId     Int      @map("inspector_id")
  inspector       Usuario  @relation(fields: [inspectorId], references: [id])

  observaciones   String   @db.Text
  infracciones    String?  @db.Text // Si hay infracciones encontradas

  plazoCorreccion Int?     // Días para corregir (normalmente 10)
  fechaLimite     DateTime? @map("fecha_limite") // fecha_visita + plazo

  rutaPdf         String   @db.VarChar(500)

  creadoEn        DateTime @default(now()) @map("creado_en")

  @@map("actas_inspeccion")
  @@index([empresaId])
  @@index([fechaVisita])
  @@index([fechaLimite])
}
```

---

## 7. Catálogos a Crear (Seed Data)

### Categorías IRC
```typescript
const categoriasIRC = [
  { codigo: 'IRC-01', nombre: 'Editores', precio: 30000 },
  { codigo: 'IRC-02', nombre: 'Imprentas', precio: 30000 },
  { codigo: 'IRC-03', nombre: 'Productores de Fonogramas', precio: 30000 },
  { codigo: 'IRC-04', nombre: 'Duplicadores', precio: 30000 },
  { codigo: 'IRC-05', nombre: 'Fabricantes de Equipos', precio: 50000 },
  { codigo: 'IRC-06', nombre: 'Colecciones Videográficas', precio: 50000 },
  { codigo: 'IRC-07', nombre: 'Importadores de Soportes Vacíos', precio: 30000 },
  { codigo: 'IRC-08', nombre: 'Importadores de Música', precio: 30000 },
  { codigo: 'IRC-09', nombre: 'Importadores de Películas', precio: 30000 },
  { codigo: 'IRC-10', nombre: 'Importadores de Software', precio: 30000 },
  { codigo: 'IRC-11', nombre: 'Importadores de Libros/Revistas', precio: 30000 },
  { codigo: 'IRC-12', nombre: 'Distribuidores de Soportes Vacíos', precio: 10000 },
  { codigo: 'IRC-13', nombre: 'Distribuidores de Música', precio: 10000 },
  { codigo: 'IRC-14', nombre: 'Distribuidores de Películas', precio: 10000 },
  { codigo: 'IRC-15', nombre: 'Distribuidores de Software', precio: 3000 },
];
```

### Status de Inspección (mantener de V1)
```typescript
const statusInspeccion = [
  { id: 1, nombre: 'VISITADA' },
  { id: 2, nombre: 'NO NOTIFICADA' },
  { id: 3, nombre: 'NOTIFICACION RENOVACION' },
  { id: 4, nombre: 'NOTIFICACION' },
  { id: 7, nombre: 'INTIMADA' },
];
```

### Estados Jurídicos (mantener de V1)
```typescript
const estadosJuridicos = [
  { id: 1, nombre: 'STATUS OK' },
  { id: 2, nombre: 'EMPRESA INTIMADA POR DEP. LEGAL' },
  { id: 3, nombre: 'EMPRESA REMITIDA DEP. JURIDICO' },
];
```

### Conclusiones (mantener de V1)
```typescript
const conclusiones = [
  { id: 1, nombre: 'VIGENTE' },
  { id: 2, nombre: 'PENDIENTE' },
  { id: 3, nombre: 'INACTIVA' },
  { id: 4, nombre: 'TRABAJADA' },
  { id: 5, nombre: 'NO CALIFICA' },
  { id: 6, nombre: 'NO APLICA' },
  { id: 7, nombre: 'NO EXISTE' },
];
```

### Status Externo (mantener de V1)
```typescript
const statusExterno = [
  { id: 5, nombre: 'AL DIA' },
  { id: 6, nombre: 'ATRASO EN RESPONSABILIDADES' },
  { id: 7, nombre: 'EN PROCESO LEGAL' },
  { id: 8, nombre: 'NO APLICA' },
];
```

---

## 8. Workflow Propuesto para V2

### Proceso: Registro/Certificación (PR-DI-002)

```
1. AuU recibe solicitud
   ↓
2. AuU crea registro en sistema (estado: PENDIENTE)
   ↓
3. Inspectoría revisa documentos adjuntos
   ↓
4. Inspectoría APRUEBA/RECHAZA
   ↓
   Si APRUEBA:
     ↓
   5. Sistema genera factura automáticamente según categoría IRC
      (se crea en estado ABIERTA)
   ↓
   6. Caja recibe pago
      (factura pasa a PAGADA)
   ↓
   7. Sistema genera certificado con número de asiento
      (se genera PDF automáticamente)
   ↓
   8. Registro emite certificado
   ↓
   9. AuU entrega certificado al cliente
      (estado final: CERTIFICADO)
```

### Proceso: Inspección de Oficio (PR-DI-001)

```
1. Inspector visita empresa
   ↓
2. Inspector levanta Acta de Inspección (PDF)
   ↓
   Si TODO OK:
     ↓
     Estado: VIGENTE
     FIN
   ↓
   Si HAY INFRACCIONES:
     ↓
   3. Sistema notifica empresa (correo automático)
      Status: NOTIFICADA
      Plazo: 10 días
      ↓
   4. Sistema muestra contador de días restantes
      ↓
   5. Después de 10 días, inspector hace 2da visita
      ↓
      Si CORRIGIÓ:
        ↓
        Estado: VIGENTE
        FIN
      ↓
      Si NO CORRIGIÓ:
        ↓
      6. Inspector levanta Acta de Infracción (PDF)
         ↓
      7. Sistema remite caso a Departamento Jurídico
         Estado Jurídico: REMITIDA DEP JURIDICO
         Status: INTIMADA
```

### Proceso: Renovación Anual

```
Sistema ejecuta diariamente:
  ↓
1. Buscar empresas con (fecha_vencimiento - 30 días)
   ↓
2. Enviar correo automático de recordatorio
   Status: NOTIFICACION RENOVACION
   ↓
3. Si paga renovación:
     ↓
     Generar nueva factura (mismo precio)
     ↓
     Generar nuevo certificado (nuevo número asiento)
     ↓
     Actualizar fecha_renovacion (+1 año)
     ↓
     Status: AL DIA
```

---

## 9. Integraciones Requeridas

### Con Módulo de Cajas
- Al aprobar empresa, crear factura automática
- Precio según `categorias_irc.precio`
- Al recibir pago, actualizar estado empresa
- Generar certificado automáticamente

### Con Módulo de Certificados
- Generar certificado con número de asiento
- PDF con datos de empresa y vigencia
- Almacenar en sistema de archivos
- Validar certificado por número

### Con Módulo de Facturas
- Crear factura tipo "REGISTRO_INSPECCION"
- Asociar factura con empresa
- Marcar factura pagada al recibir pago
- Generar NCF B02

### Con Módulo de Notificaciones
- Email de bienvenida al registrar
- Email de recordatorio 30 días antes vencimiento
- Email de notificación de infracción
- Email con certificado adjunto

---

## 10. Reportes Requeridos

1. **Empresas Registradas por Categoría IRC**
2. **Empresas por Vencer (próximos 30 días)**
3. **Empresas Vencidas**
4. **Empresas con Infracciones Pendientes**
5. **Empresas en Proceso Jurídico**
6. **Ingresos por Categoría IRC**
7. **Actas de Inspección por Período**
8. **Actas de Infracción por Período**
9. **Renovaciones del Mes**
10. **Empresas por Provincia**

---

## 11. Migración de Datos V1 → V2

### Script de migración propuesto:

```typescript
// Mapear campos V1 → V2
INSERT INTO empresas_inspeccionadas (
  nombreEmpresa,        -- V1: nombre
  rnc,                  -- V1: identificacion (si tipo=RNC)
  direccion,            -- V1: direccion
  telefono,             -- V1: telefono
  email,                -- V1: correoe
  categoriaIrcId,       -- Mapear V1.ID_tipoproducto → categorias_irc
  tipoPersona,          -- DEFAULT 'FISICA' (no existe en V1)
  personaContacto,      -- V1: contacto
  provinciaId,          -- V1: ubicacion
  statusId,             -- V1: ID_status
  estadoJuridicoId,     -- V1: ID_estadojuridico
  conclusionId,         -- V1: ID_conclusion
  statusExternoId,      -- V1: ID_statusexterno
  registrado,           -- V1: ID_registrado == 2
  existeEnSistema,      -- V1: ID_existencia == 4
  fechaRegistro,        -- V1: fecha_registro
  fechaRenovacion,      -- V1: fecha_renovacion
  fechaNotificacion,    -- V1: fecha_notificacion
  fechaActaInfraccion,  -- V1: fechaactainfraccion
  comentario            -- V1: comentario
)
SELECT ...
FROM t_importydistribuidor;

// NOTAS:
// - nombreComercial: NULL (no existe en V1)
// - fax: NULL (no existe en V1)
// - paginaWeb: NULL (no existe en V1)
// - nombrePropietario: NULL (extraer manualmente después)
// - cedulaPropietario: NULL (extraer manualmente después)
// - descripcionActividades: '' (llenar manualmente después)
```

---

## 12. Recomendaciones para Implementación V2

### Fase 1: Fundamentos (2-3 semanas)
1. ✅ Crear modelos Prisma completos
2. ✅ Seed de catálogos (IRC, status, etc.)
3. ✅ Backend: CRUD de empresas
4. ✅ Frontend: Formulario de registro completo (con todos campos PDF)
5. ✅ Upload de documentos (RNC, Cédula, etc.)

### Fase 2: Workflow Básico (2 semanas)
6. ✅ Integración con Cajas (generar factura automática)
7. ✅ Generación de certificados con número asiento
8. ✅ Dashboard de Inspectoría
9. ✅ Listado de empresas con filtros

### Fase 3: Inspecciones (2 semanas)
10. ✅ Generación de Actas de Inspección (PDF)
11. ✅ Generación de Actas de Infracción (PDF)
12. ✅ Contador de 10 días entre visitas
13. ✅ Workflow de 1ra y 2da visita

### Fase 4: Automatización (1-2 semanas)
14. ✅ Sistema de renovación anual
15. ✅ Emails automáticos (recordatorios, notificaciones)
16. ✅ Alertas de vencimiento (30 días antes)
17. ✅ Reportes completos

### Fase 5: Migración (1 semana)
18. ✅ Script de migración V1 → V2
19. ✅ Validación de datos migrados
20. ✅ Completar datos faltantes manualmente

---

## 13. Conclusiones

### Lo que V1 hace bien:
✅ Sistema de tracking interno robusto (status, estados jurídicos, conclusiones)
✅ Campos de fechas para seguimiento de procesos
✅ Búsqueda por RNC/nombre funciona bien
✅ Comentarios para notas internas

### Lo que FALTA en V1:
❌ 50% de campos del formulario PDF oficial
❌ Workflow completo entre departamentos
❌ Integración con Caja y Certificados
❌ Generación automática de documentos (actas, certificados)
❌ Sistema de renovación anual
❌ Categorías IRC oficiales con precios

### Prioridad de Implementación:
1. **ALTA:** Formulario completo según PDF + Categorías IRC
2. **ALTA:** Integración con Caja (facturación automática)
3. **ALTA:** Generación de certificados
4. **MEDIA:** Workflow completo de inspecciones
5. **MEDIA:** Renovación anual automática
6. **BAJA:** Reportes avanzados

---

**Próximo paso:** Implementar esquema Prisma completo con todos los modelos propuestos.
