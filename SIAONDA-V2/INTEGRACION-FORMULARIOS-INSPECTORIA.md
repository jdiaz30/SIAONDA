# Integración: Formularios ↔ Inspectoría

## 🎯 Objetivo

Integrar el módulo de **Formularios (AuU)** con el módulo de **Inspectoría** para que:
- AuU registre las solicitudes IRC desde Formularios
- Se genere automáticamente la solicitud en Inspectoría
- El flujo completo sea: **AuU → Caja → Inspectoría → Registro → AuU**

---

## 📊 Estado Actual

### ✅ Ya Implementado:
- Módulo de Formularios funcional (para registro de obras)
- Módulo de Inspectoría completo (empresas, solicitudes, casos)
- SolicitudWorkflowPage con 7 pasos
- Webhook de pago (Caja → Inspectoría)

### ❌ Falta Implementar:
- Tipo de producto "Solicitud IRC" en catálogo de productos
- Formulario específico para Solicitud IRC en AuU
- Creación automática de SolicitudRegistroInspeccion al crear formulario IRC
- Actualización de formulario cuando se entrega el certificado

---

## 🔄 Flujo Correcto (PR-DI-002)

### PASO 1: Recepción en AuU
**Responsable:** Técnico de Atención al Usuario
**Ubicación:** `/formularios/nuevo`

**Acciones:**
1. Cliente llega a AuU con documentos
2. Técnico busca o crea perfil del cliente
3. Técnico selecciona producto: **"Solicitud de Registro IRC"**
4. Técnico completa campos:
   - Datos de la empresa (nombre, RNC, categoría IRC)
   - Tipo de solicitud (Registro Nuevo / Renovación)
   - Documentos adjuntos
5. Cliente firma digitalmente
6. Sistema genera formulario con código `FORM-YYYY-NNNN`

**Backend (automático):**
```typescript
// Al crear formulario tipo "IRC":
// 1. Crear empresa en tabla EmpresaInspeccionada
// 2. Crear solicitud en tabla SolicitudRegistroInspeccion
// 3. Vincular formulario.solicitudIrcId = solicitud.id
```

---

### PASO 2: Envío a Caja (desde AuU)
**Responsable:** Técnico de AuU
**Ubicación:** `/formularios`

**Acciones:**
1. Técnico completa validación de documentos
2. Click en "Enviar a Caja"
3. Sistema genera factura automáticamente
4. Formulario pasa a estado "Pendiente de Pago"

---

### PASO 3: Pago en Caja
**Responsable:** Cajero/a
**Ubicación:** `/cajas/operaciones`

**Acciones:**
1. Cajera abre caja del día
2. Busca factura del formulario
3. Registra pago (efectivo, tarjeta, etc.)
4. Sistema imprime recibo

**Backend (webhook):**
```typescript
// Al pagar factura:
// 1. Actualizar estado de Formulario → "Pagado"
// 2. Actualizar SolicitudRegistroInspeccion → Estado "PAGADA"
// 3. Notificar a Inspectoría
```

---

### PASO 4-6: Proceso en Inspectoría
**Responsables:** Inspector, Paralegal, Registro
**Ubicación:** `/inspectoria/solicitudes/:id`

(Ya implementado en SolicitudWorkflowPage)
- Validación
- Asentamiento
- Generación de certificado
- Firma digital

---

### PASO 7: Entrega en AuU
**Responsable:** Auxiliar de AuU
**Ubicación:** `/formularios/:id`

**Acciones:**
1. Cliente regresa a retirar certificado
2. Auxiliar busca el formulario
3. Sistema muestra que certificado está listo
4. Auxiliar imprime certificado firmado
5. Cliente firma libro de control físico
6. Click en "Marcar como Entregado"

**Backend:**
```typescript
// Al marcar como entregado:
// 1. Actualizar Formulario → Estado "Certificado"
// 2. Actualizar SolicitudRegistroInspeccion → Estado "ENTREGADA"
// 3. Actualizar fechas de empresa (fechaRegistro o fechaRenovacion)
```

---

## 🛠️ Tareas de Implementación

### Tarea 1: Agregar Producto "Solicitud IRC"
**Archivo:** `/backend/prisma/seed.ts`

```typescript
// Agregar producto IRC
await prisma.producto.create({
  data: {
    codigo: 'PROD-IRC',
    nombre: 'Solicitud de Registro IRC (Inspectoría)',
    categoria: 'REGISTRO',
    descripcion: 'Registro o renovación de empresa ante Inspectoría',
    activo: true,
    campos: {
      create: [
        {
          campo: 'tipoSolicitud',
          titulo: 'Tipo de Solicitud',
          tipo: 'select',
          opciones: 'REGISTRO_NUEVO,RENOVACION',
          requerido: true,
          orden: 1
        },
        {
          campo: 'nombreEmpresa',
          titulo: 'Nombre de la Empresa',
          tipo: 'text',
          requerido: true,
          orden: 2
        },
        {
          campo: 'rnc',
          titulo: 'RNC',
          tipo: 'text',
          requerido: true,
          orden: 3
        },
        {
          campo: 'categoriaIrcId',
          titulo: 'Categoría IRC',
          tipo: 'select_categoria_irc',
          requerido: true,
          orden: 4
        }
        // ... más campos
      ]
    }
  }
});
```

### Tarea 2: Crear Webhook en Formularios
**Archivo:** `/backend/src/controllers/formularios.controller.ts`

```typescript
// Al crear formulario tipo IRC
export const crearFormulario = async (req, res) => {
  // ... código existente ...

  // Si el producto es tipo IRC
  const producto = await prisma.producto.findUnique({
    where: { id: productoId }
  });

  if (producto.codigo === 'PROD-IRC') {
    // Extraer datos del formulario
    const tipoSolicitud = campos.find(c => c.campo === 'tipoSolicitud')?.valor;
    const nombreEmpresa = campos.find(c => c.campo === 'nombreEmpresa')?.valor;
    const rnc = campos.find(c => c.campo === 'rnc')?.valor;

    // Crear empresa si no existe
    let empresa = await prisma.empresaInspeccionada.findUnique({
      where: { rnc }
    });

    if (!empresa) {
      empresa = await prisma.empresaInspeccionada.create({
        data: {
          nombreEmpresa,
          rnc,
          categoriaIrcId: campos.find(c => c.campo === 'categoriaIrcId')?.valor,
          // ... más datos
        }
      });
    }

    // Crear solicitud de inspectoría
    const solicitud = await prisma.solicitudRegistroInspeccion.create({
      data: {
        codigo: generarCodigoSolicitud(),
        empresaId: empresa.id,
        tipoSolicitud,
        estadoId: 1, // PENDIENTE
        recibidoPorId: req.usuario.id
      }
    });

    // Vincular formulario con solicitud
    formulario.solicitudIrcId = solicitud.id;
  }
};
```

### Tarea 3: Actualizar UI de Formularios
**Archivo:** `/frontend/src/pages/formularios/FormularioFormPage.tsx`

Agregar sección específica para mostrar estado de solicitud IRC:

```typescript
{formulario.solicitudIrcId && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <h3 className="font-semibold text-blue-900">Estado en Inspectoría</h3>
    <Link to={`/inspectoria/solicitudes/${formulario.solicitudIrcId}`}>
      Ver progreso del certificado →
    </Link>
  </div>
)}
```

---

## 📝 Resumen de Cambios Necesarios

1. **Backend:**
   - [ ] Agregar producto "Solicitud IRC" en seed
   - [ ] Agregar webhook en creación de formulario IRC
   - [ ] Agregar campo `solicitudIrcId` a tabla `Formulario`
   - [ ] Actualizar endpoint de pago para notificar a formulario

2. **Frontend:**
   - [ ] Mostrar estado de inspectoría en detalle de formulario
   - [ ] Agregar botón "Ver Certificado" cuando esté listo
   - [ ] Agregar opción "Marcar como Entregado" en formularios IRC

3. **Documentación:**
   - [ ] Actualizar guía de flujo PR-DI-002
   - [ ] Crear manual para AuU sobre solicitudes IRC

---

## ✅ Ventajas de esta Integración

1. **AuU como punto único de contacto** - Cliente solo trata con AuU
2. **Trazabilidad completa** - Desde formulario hasta entrega
3. **Automatización** - Menos pasos manuales
4. **Consistencia** - Mismo flujo para todos los servicios

---

**Última actualización:** 2025-01-14
