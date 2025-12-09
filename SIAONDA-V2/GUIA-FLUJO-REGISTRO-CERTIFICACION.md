# Guía Completa: Flujo de Registro y Certificación (PR-DI-002)

## 📋 Descripción General

Este flujo permite registrar nuevas empresas o procesar renovaciones desde la solicitud inicial hasta la entrega del certificado firmado. El proceso tiene **7 pasos** que involucran diferentes departamentos.

---

## 🔄 Flujo Completo (7 Pasos)

### PASO 1: Recepción (AuU - Atención al Usuario)
**Responsable:** Técnico de AuU
**Acción:**
1. Ir a: `http://localhost:5173/inspectoria/solicitudes/nueva`
2. Seleccionar tipo:
   - **Registro Nuevo**: Para empresas que se registran por primera vez
   - **Renovación**: Para empresas ya registradas
3. Si es Renovación:
   - Buscar empresa por RNC
   - Sistema carga datos automáticamente
4. Si es Registro Nuevo:
   - Crear perfil básico de empresa (nombre, RNC, categoría IRC)
5. Click en "Crear Solicitud"
6. **Resultado:** Se crea solicitud con código `SOL-INSP-YYYY-NNNN` en estado "PENDIENTE"

---

### PASO 2: Validación (Inspectoría)
**Responsable:** Personal de Inspectoría
**Acción:**
1. Ir a: `http://localhost:5173/inspectoria/solicitudes?estado=1`
2. Ver solicitudes pendientes de validación
3. Click en la solicitud para abrir el workflow
4. Revisar documentos de la empresa
5. Click en "Validar y Generar Factura"
6. **Resultado:**
   - Solicitud pasa a estado "VALIDADA"
   - Se genera automáticamente una factura con:
     - Código: `FACT-INSP-YYYY-NNNN`
     - Monto: Precio de categoría IRC + 18% ITBIS
   - Factura se envía al módulo de Cajas
   - Solicitud pasa automáticamente a estado "PAGADA" (esperando pago)

---

### PASO 3: Pago (Caja)
**Responsable:** Cajero/a
**Acción:**
1. Ir a: `http://localhost:5173/cajas/operaciones`
2. Abrir caja del día
3. Ver facturas abiertas pendientes de pago
4. Buscar factura `FACT-INSP-YYYY-NNNN`
5. Click en "Pagar Factura"
6. Seleccionar método de pago (Efectivo, Tarjeta, Transferencia, Cheque)
7. Si requiere referencia, ingresar código
8. Confirmar pago
9. **Resultado:**
   - Factura se marca como "PAGADA"
   - 🔗 **WEBHOOK**: Sistema llama automáticamente a `/api/inspectoria/solicitudes/webhook/pago`
   - Solicitud se actualiza automáticamente a estado "PAGADA"
   - Si la empresa tenía un caso de inspección abierto por renovación vencida, **se cierra automáticamente**
   - Se imprime el recibo de pago

---

### PASO 4: Asentamiento (Paralegal de Inspectoría)
**Responsable:** Paralegal
**Acción:**
1. Ir a: `http://localhost:5173/inspectoria/solicitudes?estado=3`
2. Ver solicitudes pendientes de asentamiento
3. Click en la solicitud para abrir el workflow
4. **Acción Física**: Tomar el libro de asiento físico y escribir el registro
5. **Acción en SIAONDA**:
   - Ingresar "Número de Asiento" (ej: 2025-0001)
   - Ingresar "Libro" (ej: Libro I - Tomo 5)
6. Click en "Asentar Solicitud"
7. **Resultado:**
   - Se guarda el número de asiento en la base de datos
   - Solicitud pasa a estado "ASENTADA"
   - Número de asiento se mostrará en el certificado

---

### PASO 5: Generación de Certificado (Paralegal/Sistema)
**Responsable:** Paralegal de Inspectoría
**Acción:**
1. Ir a: `http://localhost:5173/inspectoria/solicitudes` (solicitudes en estado 4)
2. Click en la solicitud asentada
3. Click en "Generar Certificado PDF"
4. **Resultado:**
   - Sistema genera certificado PDF con:
     - Datos de la empresa
     - Número de asiento (del paso 4)
     - Categoría IRC
     - Fecha de emisión
   - Se crea registro en tabla `CertificadoInspeccion`
   - Solicitud pasa a estado "CERTIFICADO_GENERADO"
   - Solicitud aparece en bandeja del Departamento de Registro

---

### PASO 6: Firma Digital (Departamento de Registro)
**Responsable:** Encargado de Registro
**Acción:**
1. Ir a: `http://localhost:5173/certificados-pendientes`
2. Ver lista de certificados pendientes de firma
3. Click en "Ver Certificado" para descargar el PDF
4. **Acción Externa**:
   - Ir al portal GOB.DO
   - Firmar digitalmente el certificado
5. **Acción en SIAONDA**:
   - Click en "Marcar como Firmado"
6. **Resultado:**
   - Solicitud pasa a estado "FIRMADA"
   - Se registra fecha de firma y usuario que firmó
   - Certificado listo para entrega

---

### PASO 7: Entrega (AuU - Atención al Usuario)
**Responsable:** Auxiliar de AuU
**Acción:**
1. Cliente llega a solicitar su certificado
2. Ir a: `http://localhost:5173/inspectoria/solicitudes?estado=6`
3. Buscar la solicitud del cliente (por RNC o nombre)
4. Abrir el workflow de la solicitud
5. Imprimir el certificado firmado desde el PDF
6. Mostrar al cliente para validación
7. **Acción Física**: Cliente firma libro récord de control de entrega
8. **Acción en SIAONDA**:
   - Click en "Confirmar Entrega al Cliente"
9. **Resultado:**
   - Solicitud pasa a estado "ENTREGADA"
   - Se actualiza registro de la empresa:
     - Si es registro nuevo: `registrado = true`, `fechaRegistro = hoy`
     - Si es renovación: `fechaUltimaRenovacion = hoy`, `fechaVencimiento = hoy + 1 año`
   - Proceso completado ✅

---

## 🎯 Resumen de Estados

| Paso | Estado | Orden | Responsable | Acción Principal |
|------|--------|-------|-------------|------------------|
| 1 | PENDIENTE | 1 | AuU | Crear solicitud |
| 2 | VALIDADA | 2 | Inspectoría | Validar y generar factura |
| 3 | PAGADA | 3 | Caja | Registrar pago (automático vía webhook) |
| 4 | ASENTADA | 4 | Paralegal | Ingresar número de libro |
| 5 | CERTIFICADO_GENERADO | 5 | Paralegal | Generar PDF |
| 6 | FIRMADA | 6 | Registro | Firmar digitalmente (GOB.DO) |
| 7 | ENTREGADA | 7 | AuU | Entregar al cliente |

---

## 🔗 Integraciones Automáticas

### 1. Webhook de Pago (Caja → Inspectoría)
**Cuando:** Se paga una factura `FACT-INSP-*`
**Acción:**
- Actualiza solicitud de estado 2 (VALIDADA) a estado 3 (PAGADA)
- Cierra casos de inspección abiertos para esa empresa (si los hay)

### 2. Cierre Automático de Casos
**Cuando:** Empresa paga su renovación
**Acción:**
- Si existe un caso de inspección tipo "OFICIO" abierto para esa empresa
- El caso se cierra automáticamente con estado "Resuelto - Pago Recibido"
- Se notifica al inspector asignado

---

## 📊 Datos de Ejemplo para Pruebas

### Crear Empresa de Prueba
```
Nombre: Empresa Demo SRL
RNC: 123-45678-9
Categoría IRC: IRC-05 (Productora Audiovisual) - RD$ 5,000
Tipo Persona: Moral
Provincia: Distrito Nacional
Teléfono: 809-555-1234
```

### Crear Solicitud
```
Tipo: Registro Nuevo
Empresa: Empresa Demo SRL
Observaciones: Solicitud de prueba para validar flujo completo
```

### Proceso de Pago
```
Factura: FACT-INSP-2025-0001
Monto: RD$ 5,900 (5,000 + 18% ITBIS)
Método Pago: Efectivo
```

### Asentamiento
```
Número de Asiento: 2025-0001
Libro: Libro I - Tomo 1
```

---

## ✅ Checklist de Verificación

- [ ] **PASO 1**: Solicitud creada con código único
- [ ] **PASO 2**: Factura generada automáticamente con monto correcto
- [ ] **PASO 3**: Webhook funciona y actualiza estado tras pago
- [ ] **PASO 4**: Número de asiento se guarda correctamente
- [ ] **PASO 5**: Certificado PDF se genera con todos los datos
- [ ] **PASO 6**: Sistema marca como firmado correctamente
- [ ] **PASO 7**: Fechas de empresa se actualizan tras entrega
- [ ] **WEBHOOK**: Caso de inspección se cierra al pagar renovación

---

## 🚨 Problemas Comunes

### "No puedo validar la solicitud"
- Verifica que tu usuario tenga rol de Administrador
- La solicitud debe estar en estado "PENDIENTE" (orden 1)

### "El webhook no funciona al pagar"
- Verifica que el backend esté corriendo en `http://localhost:3000`
- Verifica en la consola del navegador si hay errores
- El código de factura debe empezar con `FACT-INSP-`

### "No veo el botón de asentamiento"
- La solicitud debe estar en estado "PAGADA" (orden 3)
- Debes tener rol adecuado (Administrador o Paralegal)

---

## 📞 Soporte

Si encuentras algún error o comportamiento inesperado durante el flujo, revisa:
1. Consola del navegador (F12 → Console)
2. Consola del backend (PowerShell donde corre `npm run dev`)
3. Estado actual de la solicitud en el timeline visual

---

**Última actualización:** 2025-01-14
**Versión del módulo:** 2.0
