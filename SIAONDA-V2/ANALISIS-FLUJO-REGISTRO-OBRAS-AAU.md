# Análisis: Flujo de Registro de Obras - Atención al Usuario

## 1. FLUJO COMPLETO DEL PROCESO

```
┌─────────────────┐
│   RECEPCIÓN     │ → Registra cliente con cédula y datos básicos
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ DASHBOARD AaU   │ → Usuario selecciona "Nuevo Registro de Obra"
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ SELECTOR TIPO   │ → Elige categoría (Musical, Literaria, Audiovisual, etc.)
│   DE OBRA       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ SELECTOR        │ → Elige producto específico (ej: MUS-01 Obra Musical)
│  PRODUCTO       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  FORMULARIO     │ → 1. Busca clientes por nombre/cédula
│   DE OBRA       │   2. Asigna roles (Autor Principal, Coautor, Intérprete)
│                 │   3. Llena campos específicos de la obra
│                 │   4. Sube archivos adjuntos
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     CAJA        │ → Genera factura automáticamente con precio del producto
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    REGISTRO     │ → Revisa y asentación
└─────────────────┘
```

## 2. MÓDULOS A IMPLEMENTAR

### 2.1 RECEPCIÓN (Nuevo)
**Propósito:** Punto de entrada para registrar clientes nuevos

**Campos del formulario:**
- Tipo de identificación (Cédula, Pasaporte, RNC, Acta de Nacimiento)
- Número de identificación
- Nombre
- Apellido
- Género (M/F)
- Teléfono/Móvil
- Correo electrónico
- Dirección completa (Sector, Municipio, Provincia)
- Nacionalidad
- Tipo de cliente (Autor, Compositor, Intérprete, Editor, etc.)

**Funcionalidades:**
- Validación de cédula dominicana (11 dígitos)
- Búsqueda de cliente existente por cédula antes de crear duplicado
- Generación automática de código de cliente (CLI-YYYY-NNNN)
- Carga de foto/documento de identidad (opcional)

### 2.2 SELECTOR DE CATEGORÍAS
**Ubicación:** `/aau/formularios/selector`

**Categorías de obras:**
1. Obras Musicales (5 productos)
2. Obras Audiovisuales (5 productos)
3. Obras Escénicas (7 productos)
4. Artes Visuales (5 productos)
5. Arte Aplicado (8 productos)
6. Obras Literarias (19 productos)
7. Obras Científicas (8 productos)
8. Colecciones y Compilaciones (14 productos)
9. Producciones de Obras (15 productos)
10. Actos y Contratos (8 productos)
11. Consulta Técnica y Otros (6 productos)
12. Sociedades de Gestión (2 productos)

**UI:** Cards con iconos por categoría

### 2.3 SELECTOR DE PRODUCTOS
**Ubicación:** `/aau/formularios/categoria/:categoriaId/selector`

**Muestra:** Lista de productos dentro de la categoría seleccionada
- Código del producto
- Nombre completo
- Precio (RD$)
- Botón "Seleccionar"

### 2.4 FORMULARIO DINÁMICO DE OBRA
**Ubicación:** `/aau/formularios/:productoId/nuevo`

#### Sección 1: Información de Clientes/Autores
**Componente de búsqueda:**
```typescript
interface ClienteSearch {
  query: string; // Nombre o cédula
  resultados: Cliente[];
  seleccionados: ClienteFormulario[];
}

interface ClienteFormulario {
  cliente: Cliente;
  tipoRelacion: string; // 'AUTOR_PRINCIPAL' | 'COAUTOR' | 'INTERPRETE' | 'COMPOSITOR' | etc.
  orden: number; // Para definir quién es el principal
}
```

**Roles disponibles:**
- AUTOR_PRINCIPAL (solo uno, obligatorio)
- COAUTOR (múltiples)
- COMPOSITOR (múltiples)
- INTERPRETE (múltiples)
- EDITOR
- PRODUCTOR
- ARREGLISTA
- DIRECTOR
- OTROS (especificar)

**Funcionalidad:**
1. Input de búsqueda (nombre o cédula)
2. Resultados en dropdown
3. Al seleccionar → Asignar rol
4. Lista de clientes seleccionados con sus roles
5. Posibilidad de editar/eliminar
6. Validación: Debe haber al menos 1 AUTOR_PRINCIPAL

#### Sección 2: Datos de la Obra
**Campos comunes (todas las categorías):**
- Título de la obra (obligatorio)
- Subtítulo (opcional)
- Año de creación (obligatorio)
- Descripción (opcional)
- País de origen (obligatorio)

**Campos específicos por categoría:**

**OBRAS MUSICALES (MUS-01 a MUS-05):**
- Género musical (dropdown: Merengue, Bachata, Salsa, Pop, Rock, etc.)
- Duración (minutos:segundos)
- Letra incluida (Sí/No)
- Idioma de la letra
- [Si MUS-03 Fonograma] Intérpretes (relación con clientes)
- [Si MUS-03 Fonograma] Sello discográfico

**OBRAS AUDIOVISUALES (AUD-01 a AUD-05):**
- Género (Documental, Ficción, Animación, etc.)
- Duración total
- Formato (4K, HD, SD)
- Cantidad de capítulos (si aplica)
- Productora
- Director(es)

**OBRAS LITERARIAS (LIT-01 a LIT-19):**
- Género literario (Novela, Poesía, Ensayo, etc.)
- ISBN (si aplica)
- Editorial (si aplica)
- Número de páginas
- Idioma
- [Si LIT-03 Libro] Cantidad de ejemplares primera edición

**OBRAS CIENTÍFICAS (OC-01 a OC-08):**
- Área de aplicación
- [Si OC-01/OC-02 Arquitectónico] Metros cuadrados
- [Si OC-06 Programa] Lenguaje de programación
- [Si OC-06 Programa] Versión
- [Si OC-07 Web] URL (si está publicada)

#### Sección 3: Archivos Adjuntos
**Tipos de archivos según categoría:**

**MUSICALES:**
- Partitura (PDF)
- Audio de la obra (MP3, WAV, FLAC)
- Letra (PDF/DOC) - si aplica

**AUDIOVISUALES:**
- Guion (PDF)
- Trailer o demo (MP4, MOV)
- Sinopsis (PDF)

**LITERARIAS:**
- Manuscrito completo (PDF)
- Portada (JPG, PNG)
- Capítulo de muestra (PDF)

**CIENTÍFICAS:**
- Planos (PDF, DWG)
- Memoria técnica (PDF)
- Código fuente (ZIP) - si aplica

**Validaciones:**
- Tamaño máximo por archivo: 50MB
- Formatos permitidos según tipo
- Al menos 1 archivo adjunto obligatorio

#### Sección 4: Revisión y Envío
- Resumen de todos los datos ingresados
- Lista de clientes/autores con sus roles
- Lista de archivos adjuntos
- Monto total a pagar (calculado automáticamente desde producto)
- Checkbox de aceptación de términos
- Botón "Guardar y Enviar a Caja"

## 3. FLUJO DE ESTADOS

```
PENDIENTE → (Cliente paga) → PAGADO → (AaU envía) → EN_REVISION_REGISTRO
                                                              ↓
                                                    (Registro aprueba)
                                                              ↓
                                                         ASENTADO
                                                              ↓
                                                    (Certificado generado)
                                                              ↓
                                                        CERTIFICADO
                                                              ↓
                                                    (Cliente recoge)
                                                              ↓
                                                         ENTREGADO

                                              (Si Registro rechaza)
                                                              ↓
                                                         DEVUELTO
                                                              ↓
                                            (AaU corrige y reenvía SIN PAGO)
                                                              ↓
                                                    EN_REVISION_REGISTRO
```

## 4. INTEGRACIÓN CON CAJA

### Al guardar formulario (estado PENDIENTE):
```typescript
// Backend: formularios.controller.ts
export const crearFormulario = async (req, res) => {
  // 1. Crear formulario
  const formulario = await prisma.formulario.create({
    data: {
      codigo: generarCodigo(),
      estadoId: ESTADO_PENDIENTE,
      usuarioId: req.user.id,
      // ... otros campos
    }
  });

  // 2. Crear productos del formulario
  for (const productoData of req.body.productos) {
    await prisma.formularioProducto.create({
      data: {
        formularioId: formulario.id,
        productoId: productoData.productoId,
        cantidad: productoData.cantidad || 1,
        precio: productoData.precio, // Desde ProductoCosto
      }
    });
  }

  // 3. Vincular clientes/autores
  for (const clienteData of req.body.clientes) {
    await prisma.formularioCliente.create({
      data: {
        formularioId: formulario.id,
        clienteId: clienteData.clienteId,
        tipoRelacion: clienteData.tipoRelacion, // AUTOR_PRINCIPAL, COAUTOR, etc.
      }
    });
  }

  // 4. Calcular monto total
  const montoTotal = calcularMontoTotal(formulario.id);

  await prisma.formulario.update({
    where: { id: formulario.id },
    data: { montoTotal }
  });

  // 5. NO crear factura aún (solo cuando el usuario vaya a Caja)

  return res.json(formulario);
};
```

### Cuando el usuario va a Caja:
```typescript
// Backend: cajas.controller.ts
export const generarFacturaDesdeFormulario = async (req, res) => {
  const { formularioId } = req.params;

  // 1. Obtener formulario con sus productos
  const formulario = await prisma.formulario.findUnique({
    where: { id: formularioId },
    include: {
      productos: {
        include: { producto: true }
      },
      clientes: {
        include: { cliente: true }
      }
    }
  });

  // 2. Obtener cliente principal (AUTOR_PRINCIPAL)
  const clientePrincipal = formulario.clientes.find(
    fc => fc.tipoRelacion === 'AUTOR_PRINCIPAL'
  );

  // 3. Crear factura
  const factura = await prisma.factura.create({
    data: {
      codigo: generarCodigoFactura(),
      clienteId: clientePrincipal.clienteId,
      usuarioId: req.user.id,
      cajaId: req.caja.id,
      tipoComprobanteId: TIPO_NCF_CONSUMIDOR, // o según cliente
      estadoId: ESTADO_PENDIENTE,
      subtotal: formulario.montoTotal,
      itbis: 0, // Servicios ONDA exentos
      descuento: 0,
      total: formulario.montoTotal,
      detalles: {
        create: formulario.productos.map(fp => ({
          productoId: fp.productoId,
          descripcion: fp.producto.nombre,
          cantidad: fp.cantidad,
          precio: fp.precio,
          subtotal: fp.cantidad * fp.precio,
          itbis: 0,
          total: fp.cantidad * fp.precio,
        }))
      }
    }
  });

  // 4. Vincular factura al formulario
  await prisma.formulario.update({
    where: { id: formularioId },
    data: { facturaId: factura.id }
  });

  return res.json(factura);
};
```

### Cuando el cliente paga:
```typescript
// Backend: cajas.controller.ts
export const procesarPagoFactura = async (req, res) => {
  const { facturaId } = req.params;
  const { metodoPagoId, monto, referencia } = req.body;

  // 1. Registrar pago
  const pago = await prisma.pago.create({
    data: {
      facturaId,
      metodoPagoId,
      monto,
      referencia,
      usuarioId: req.user.id,
      cajaId: req.caja.id,
    }
  });

  // 2. Actualizar estado de factura a PAGADA
  await prisma.factura.update({
    where: { id: facturaId },
    data: { estadoId: ESTADO_PAGADA }
  });

  // 3. Actualizar estado del formulario a PAGADO
  const factura = await prisma.factura.findUnique({
    where: { id: facturaId },
    include: { formularios: true }
  });

  await prisma.formulario.update({
    where: { id: factura.formularios[0].id },
    data: { estadoId: ESTADO_PAGADO }
  });

  return res.json({ pago, mensaje: 'Pago procesado exitosamente' });
};
```

## 5. PLAN DE IMPLEMENTACIÓN

### FASE 1: Recepción y Clientes ✅
- [ ] Página de Recepción (`/recepcion`)
- [ ] Formulario de registro de cliente
- [ ] Búsqueda de clientes existentes
- [ ] Service de clientes (clientesService.ts)
- [ ] Backend: Controller de clientes con búsqueda

### FASE 2: Selector de Obras
- [ ] Página selector de categorías (`/aau/formularios/selector`)
- [ ] Página selector de productos (`/aau/formularios/categoria/:id/selector`)
- [ ] Service de productos (productosService.ts)
- [ ] Backend: Endpoint para listar productos por categoría

### FASE 3: Formulario Dinámico (Empezar con MUSICAL)
- [ ] Componente de búsqueda de clientes
- [ ] Componente de asignación de roles
- [ ] Formulario de obra musical (MUS-01)
- [ ] Componente de carga de archivos
- [ ] Página de revisión pre-envío
- [ ] Backend: Controller para crear formulario completo

### FASE 4: Integración con Caja
- [ ] Endpoint: Generar factura desde formulario
- [ ] Endpoint: Procesar pago y actualizar estados
- [ ] Vista en Caja: Lista de formularios PENDIENTES
- [ ] Vista en Caja: Generar factura y cobrar

### FASE 5: Expansión a Otras Categorías
- [ ] Formulario de obras literarias (LIT-01 a LIT-19)
- [ ] Formulario de obras audiovisuales (AUD-01 a AUD-05)
- [ ] Formulario de obras científicas (OC-01 a OC-08)
- [ ] Resto de categorías...

## 6. ESTRUCTURA DE ARCHIVOS

```
frontend/src/
├── pages/
│   ├── recepcion/
│   │   ├── RecepcionPage.tsx              # Dashboard de recepción
│   │   └── ClienteFormPage.tsx            # Formulario de cliente
│   └── aau/
│       ├── DashboardAauPage.tsx           # ✅ Ya existe
│       ├── FormulariosListPage.tsx        # ✅ Ya existe
│       ├── FormulariosDevueltosPage.tsx   # ✅ Ya existe
│       ├── SelectorCategoriasPage.tsx     # Nuevo: Selector de categorías
│       ├── SelectorProductosPage.tsx      # Nuevo: Selector de productos
│       └── formularios/
│           ├── FormularioObraPage.tsx     # Wrapper del formulario dinámico
│           ├── musical/
│           │   └── FormularioMusicalPage.tsx
│           ├── literaria/
│           │   └── FormularioLiterariaPage.tsx
│           └── audiovisual/
│               └── FormularioAudiovisualPage.tsx
├── components/
│   ├── aau/
│   │   ├── EstadoBadge.tsx                # ✅ Ya existe
│   │   ├── ClienteSearch.tsx              # Nuevo: Búsqueda de clientes
│   │   ├── ClienteRolAssign.tsx           # Nuevo: Asignar roles
│   │   ├── FileUpload.tsx                 # Nuevo: Carga de archivos
│   │   └── FormularioResumen.tsx          # Nuevo: Resumen pre-envío
└── services/
    ├── aauService.ts                      # ✅ Ya existe
    ├── clientesService.ts                 # Nuevo: CRUD clientes
    ├── productosService.ts                # Nuevo: Listar productos
    └── formulariosService.ts              # ✅ Ya existe (ampliar)

backend/src/
├── controllers/
│   ├── aau.controller.ts                  # ✅ Ya existe
│   ├── clientes.controller.ts             # Nuevo: CRUD clientes
│   ├── productos.controller.ts            # Nuevo: Listar productos
│   └── formularios.controller.ts          # ✅ Ampliar (crear formulario completo)
└── routes/
    ├── aau.routes.ts                      # ✅ Ya existe
    ├── clientes.routes.ts                 # Nuevo
    └── productos.routes.ts                # Nuevo
```

## 7. PRÓXIMOS PASOS

1. **Comenzar con FASE 1**: Crear módulo de Recepción
2. **Probar flujo completo** con una categoría (Musical) antes de expandir
3. **Iterar** basado en feedback del usuario
4. **Documentar** campos específicos de cada categoría de obra
