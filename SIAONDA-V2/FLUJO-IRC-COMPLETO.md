# 📋 Flujo Completo IRC - Inspectoría de Registro y Certificación

**Fecha:** 2025-12-09
**Estado:** ✅ Implementado y Funcional

---

## 🎯 Dos Formas de Registro IRC

### **Opción 1: Registro Nuevo (Primera vez)**
**URL:** `http://localhost:5173/inspectoria/empresas/nueva`

**Cuándo usar:**
- Empresa que nunca ha estado registrada en ONDA
- Primera vez que solicita certificado IRC

**Proceso:**
1. Se llena formulario completo desde cero:
   - Nombre de la empresa
   - Nombre comercial
   - RNC
   - Categoría IRC
   - Tipo de persona (Física/Moral)
   - Provincia
   - Dirección completa
   - Teléfono, email
   - Representante legal
   - Descripción de actividades

2. Se crea la empresa en el sistema
3. Se genera automáticamente una solicitud de registro
4. **Vigencia:** 1 año desde la fecha de emisión

---

### **Opción 2: Renovación (Empresa Existente)**
**URL:** `http://localhost:5173/inspectoria/solicitudes/nueva`

**Cuándo usar:**
- Empresa ya registrada que necesita renovar su certificado IRC
- El certificado anterior está por vencer o ya venció
- La vigencia de 1 año está cumplida

**Proceso:**
1. **Seleccionar tipo:** "Renovación"
2. **Buscar empresa por RNC:**
   - Ingresar el RNC
   - Click en "Buscar"
3. **Sistema carga automáticamente:**
   - ✅ Nombre de la empresa
   - ✅ Nombre comercial
   - ✅ Categoría IRC anterior
   - ✅ Todos los datos de registro previo
4. **Opcional: Actualizar datos** si hay cambios:
   - Cambio de dirección
   - Cambio de representante legal
   - Cambio de categoría IRC
   - Actualizar teléfono/email
5. **Crear solicitud**
6. **Vigencia:** 1 año adicional desde la nueva fecha de emisión

---

## 🔄 Flujo Completo del Proceso

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO IRC (7 PASOS)                       │
└─────────────────────────────────────────────────────────────┘

PASO 1: RECEPCIÓN (AuU)
├─ Opción A: Empresa nueva → /inspectoria/empresas/nueva
├─ Opción B: Renovación → /inspectoria/solicitudes/nueva
└─ Estado: PENDIENTE
       ↓
PASO 2: VALIDACIÓN (Inspectoría)
├─ Revisar documentación
├─ Validar datos
└─ Estado: VALIDADA + Factura generada automáticamente
       ↓
PASO 3: PAGO (Caja)
├─ Cliente paga en caja
├─ WEBHOOK automático actualiza estado
└─ Estado: PAGADA
       ↓
PASO 4: ASENTAMIENTO (Paralegal)
├─ Anotar en libro físico
├─ Ingresar número de asiento y libro en sistema
└─ Estado: ASENTADA
       ↓
PASO 5: GENERACIÓN DE CERTIFICADO (Sistema)
├─ Click en "Generar Certificado PDF"
├─ Sistema crea PDF con todos los datos
└─ Estado: CERTIFICADO_GENERADO
       ↓
PASO 6: FIRMA DIGITAL (Departamento de Registro)
├─ Descargar PDF
├─ Firmar digitalmente en GOB.DO
├─ Marcar como firmado en sistema
└─ Estado: FIRMADA
       ↓
PASO 7: ENTREGA (AuU)
├─ Cliente recoge certificado
├─ Firma libro de control
├─ Confirmar entrega en sistema
└─ Estado: ENTREGADA
       ↓
✅ PROCESO COMPLETADO
```

---

## 📊 Diferencias entre Registro Nuevo y Renovación

| Aspecto | Registro Nuevo | Renovación |
|---------|---------------|------------|
| **URL** | `/inspectoria/empresas/nueva` | `/inspectoria/solicitudes/nueva` |
| **Formulario** | Completo desde cero | Datos pre-cargados, editables |
| **Búsqueda RNC** | No aplica | ✅ Obligatorio |
| **Crea empresa** | ✅ Sí | ❌ No (usa existente) |
| **Puede cambiar categoría** | N/A | ✅ Sí (si es necesario) |
| **Precio** | Según categoría IRC | Mismo precio de categoría |
| **Vigencia anterior** | N/A | Se muestra en el sistema |
| **Nueva vigencia** | 1 año desde emisión | 1 año desde nueva emisión |

---

## 🔍 Validaciones del Sistema

### **Para Renovación:**
1. ✅ La empresa debe existir en el sistema
2. ✅ La empresa debe estar registrada (`registrado = true`)
3. ✅ Si no existe, muestra mensaje: "Use Registro Nuevo"
4. ✅ Si existe pero no está registrada, rechaza renovación

### **Para Registro Nuevo:**
1. ✅ RNC no debe existir previamente
2. ✅ RNC debe tener formato válido: `XXX-XXXXX-X`
3. ✅ Nombre de empresa obligatorio
4. ✅ Categoría IRC obligatoria

---

## 🗄️ Datos Guardados en BD

### **Empresa (EmpresaInspeccionada)**
```typescript
{
  nombreEmpresa: string
  nombreComercial?: string
  rnc: string
  categoriaIrcId: number
  tipoPersona: 'FISICA' | 'MORAL'
  provinciaId: number
  direccion: string
  telefono?: string
  email?: string
  representanteLegal?: string
  cedulaRepresentante?: string
  descripcionActividades?: string

  // Control de registro
  registrado: boolean              // false al crear, true tras entregar certificado
  fechaRegistro?: Date             // Primera vez que se registró
  fechaUltimaRenovacion?: Date     // Última renovación
  fechaVencimiento?: Date          // Fecha de vencimiento actual
}
```

### **Solicitud (SolicitudRegistroInspeccion)**
```typescript
{
  codigo: string                   // SOL-INSP-2025-0001
  tipoSolicitud: 'REGISTRO_NUEVO' | 'RENOVACION'
  empresaId: number
  estadoId: number
  recibidoPorId: number           // Usuario de AuU que recibió

  // Trazabilidad
  validadoPorId?: number          // Inspector que validó
  asentadoPorId?: number          // Paralegal que asentó
  firmadoPorId?: number           // Usuario de Registro que firmó
  entregadoPorId?: number         // Usuario de AuU que entregó

  // Datos de asentamiento
  numeroAsiento?: string
  libro?: string

  // Fechas
  fechaValidacion?: Date
  fechaPago?: Date
  fechaAsentamiento?: Date
  fechaFirma?: Date
  fechaEntrega?: Date
}
```

---

## ⚠️ Reglas de Negocio

### **Vigencia de 1 Año**
- Calculada desde `fechaEmision` del certificado
- `fechaVencimiento = fechaEmision + 1 año`
- Al renovar, se establece nueva `fechaVencimiento`

### **Casos de Inspección Automáticos**
- Si una empresa no renueva a tiempo, Inspectoría puede crear un caso de oficio
- Al pagar la renovación, el caso se cierra automáticamente (WEBHOOK)

### **No se puede Renovar si:**
- La empresa no está registrada
- No existe en el sistema
- Ya hay una solicitud de renovación en proceso

---

## 🧪 Cómo Probar

### **Escenario 1: Registro Nuevo**
1. Ir a `http://localhost:5173/inspectoria/empresas/nueva`
2. Llenar formulario completo
3. Asignar categoría IRC (ej: IRC-05 Productora Audiovisual)
4. Guardar
5. Sistema crea empresa + solicitud automáticamente
6. Seguir flujo de 7 pasos hasta entregar certificado
7. Al entregar: `registrado = true`, `fechaRegistro` se establece

### **Escenario 2: Renovación**
1. Ir a `http://localhost:5173/inspectoria/solicitudes/nueva`
2. Seleccionar "Renovación"
3. Ingresar RNC de empresa ya registrada
4. Click "Buscar"
5. Verificar que carga todos los datos
6. Opcional: Modificar datos si es necesario
7. Crear solicitud
8. Seguir flujo de 7 pasos
9. Al entregar: `fechaUltimaRenovacion` se actualiza, nueva `fechaVencimiento`

---

## 📝 Notas Importantes

### **Diferencia entre AaU y Registro**
- **AaU (Atención al Usuario):** Maneja 2 tipos de servicios
  1. Registro de Obras (nuevo módulo implementado)
  2. Solicitudes IRC (ya existente)

- **Registro (Departamento):** Solo maneja firma de certificados

### **URLs del Sistema**
- Dashboard AaU: `/aau`
- Nuevo Registro de Obra: `/aau/formularios/nuevo`
- Lista de Formularios: `/aau/formularios`
- Solicitud IRC (Nueva/Renovación): `/inspectoria/solicitudes/nueva`
- Empresa Nueva (IRC): `/inspectoria/empresas/nueva`
- Lista Solicitudes IRC: `/inspectoria/solicitudes`

---

## ✅ Sistema Completamente Funcional

Ambos flujos están implementados y funcionando:
- ✅ **Registro de Obras** (nuevo, implementado hoy)
- ✅ **Solicitudes IRC** (ya existente, renovación funcional)

**El usuario de AaU puede:**
1. Registrar nuevas obras de derecho de autor
2. Crear solicitudes IRC (nuevas o renovaciones)
3. Gestionar formularios devueltos
4. Entregar certificados

---

**¿Todo claro sobre el flujo IRC? 🎉**
