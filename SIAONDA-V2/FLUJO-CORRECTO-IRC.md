# Flujo Correcto del Proceso de Certificación IRC

## 🔄 Proceso Actualizado (Sin Validación Intermedia)

### PASO 1: Recepción en AuU
**Actor**: Técnico de AuU
**Estado**: `RECEPCIONADO`

1. Cliente llega con documentos
2. Técnico AuU llena formulario IRC en el sistema
3. Sistema genera código automáticamente: `00000XXX/MM/YYYY`
4. Sistema crea solicitud vinculada al formulario
5. Cliente recibe código de formulario

**Salida**: Formulario IRC creado + Solicitud en estado RECEPCIONADO

---

### PASO 2: Pago en Caja
**Actor**: Cajero
**Estado**: `RECEPCIONADO` → `PAGADA`

1. Cliente va a Caja con código de formulario
2. Cajero busca la solicitud IRC pendiente
3. Cliente paga el monto según categoría IRC
4. Sistema genera factura con NCF (opcional)
5. Se imprime recibo de pago

**Salida**: Solicitud pasa a estado PAGADA + Factura generada

---

### PASO 3: Asentamiento (Validación + Registro)
**Actor**: Paralegal de Inspectoría
**Estado**: `PAGADA` → `ASENTADA` o `DEVUELTA`

#### 3A. Paralegal Revisa el Formulario Completo

1. Paralegal accede a "Registros para Asentamiento"
2. Ve lista de solicitudes PAGADAS
3. Click en "Ver Formulario" para revisar todos los datos
4. Evalúa si los datos son correctos:

   **✅ SI ESTÁ CORRECTO**:
   - Click en "Asentar"
   - Ingresa: Número de Libro (ej: "5")
   - Ingresa: Número de Hoja (ej: "145")
   - Sistema usa el código del formulario como Número de Registro
   - Estado cambia a `ASENTADA`

   **❌ SI HAY ERRORES**:
   - Click en "Devolver a AuU"
   - Ingresa motivo detallado de la devolución
   - Estado cambia a `DEVUELTA`
   - AuU debe corregir el formulario
   - Cliente NO paga nuevamente (a menos que cambie categoría IRC con precio diferente)
   - Una vez corregido, vuelve a PAGADA para nuevo intento de asentamiento

**Salida**: Solicitud ASENTADA (con libro/hoja) o DEVUELTA (para corrección)

---

### PASO 4: Generación de Certificado
**Actor**: Paralegal de Inspectoría
**Estado**: `ASENTADA` → `PENDIENTE_FIRMA`

1. Paralegal accede a solicitudes ASENTADAS
2. Sistema genera certificado PDF automáticamente
3. Certificado incluye:
   - Número de Registro (código del formulario)
   - Datos de la empresa
   - Categoría IRC
   - Fecha de emisión
   - Fecha de vencimiento (1 año después)
4. Estado cambia a `PENDIENTE_FIRMA`

**Salida**: Certificado PDF generado sin firma

---

### PASO 5: Firma Digital
**Actor**: Encargado de Registro
**Estado**: `PENDIENTE_FIRMA` → `LISTA_ENTREGA`

1. Encargado revisa certificados pendientes
2. Aplica firma digital al PDF
3. Certifica la validez del documento
4. Estado cambia a `LISTA_ENTREGA`

**Salida**: Certificado PDF firmado y listo

---

### PASO 6: Entrega al Cliente
**Actor**: Auxiliar de AuU
**Estado**: `LISTA_ENTREGA` → `ENTREGADA`

1. Cliente llega a retirar certificado
2. Auxiliar verifica identidad
3. Imprime certificado firmado (o envía digital)
4. Cliente firma recepción
5. Estado cambia a `ENTREGADA`
6. Sistema actualiza:
   - `empresa.registrado = true`
   - `empresa.fechaRegistro` o `empresa.fechaRenovacion`
   - `empresa.fechaVencimiento` (1 año después)

**Salida**: Empresa certificada y activa por 1 año

---

## 📊 Estados del Proceso

| Estado | Descripción | Actor Responsable |
|--------|-------------|-------------------|
| `RECEPCIONADO` | Formulario creado en AuU | Cliente debe pagar |
| `PAGADA` | Pago realizado | Paralegal debe asentar |
| `DEVUELTA` | Devuelta por errores | AuU debe corregir |
| `ASENTADA` | Registrado en libro físico | Sistema genera certificado |
| `PENDIENTE_FIRMA` | Certificado generado | Encargado debe firmar |
| `LISTA_ENTREGA` | Certificado firmado | Cliente puede retirar |
| `ENTREGADA` | Proceso completado | Empresa activa |

---

## ❌ LO QUE SE ELIMINÓ

### Estado "VALIDADA" (Redundante)
**Por qué se eliminó**:
- La validación no es un paso separado
- El Paralegal valida AL MOMENTO de asentar
- Si hay errores, se devuelve directamente a AuU
- No tiene sentido tener un estado intermedio

**Antes (Incorrecto)**:
```
RECEPCIONADO → VALIDADA → PAGADA → ASENTADA
```

**Ahora (Correcto)**:
```
RECEPCIONADO → PAGADA → ASENTADA
                    ↓
                DEVUELTA (si hay errores)
```

---

## 🔑 Puntos Clave

1. **No hay paso de validación separado**: El Paralegal valida mientras asienta
2. **Devolución sin nuevo pago**: Si se devuelve por errores, cliente NO paga de nuevo (excepto cambio de categoría)
3. **Número de Registro = Código de Formulario**: No se genera nuevo número
4. **Libro y Hoja**: Son los únicos datos que ingresa el Paralegal manualmente
5. **Flujo lineal**: Cada paso avanza directamente al siguiente (excepto devoluciones)

---

## 📱 Dashboard de Inspectoría Actualizado

### Sección "Proceso de Certificación IRC"

1. **Pendientes Asentamiento** (azul)
   - Estado: PAGADA
   - Acción: Paralegal revisa y asienta
   - Link: `/inspectoria/solicitudes/pagadas`

2. **Pendientes Certificado** (verde)
   - Estado: ASENTADA
   - Acción: Sistema genera certificado
   - Link: `/inspectoria/solicitudes?estado=4`

3. **Pendientes Firma** (morado)
   - Estado: PENDIENTE_FIRMA
   - Acción: Encargado firma
   - Link: `/inspectoria/solicitudes?estado=5`

---

## ✅ Resumen de Cambios

- ❌ Eliminado: Estado "VALIDADA" y tarjeta "Pendientes Validación"
- ✅ Agregado: Estado "DEVUELTA" para correcciones
- ✅ Mejorado: Modal "Ver Formulario" con categorización
- ✅ Actualizado: Dashboard con flujo correcto
- ✅ Simplificado: Validación integrada en el asentamiento
