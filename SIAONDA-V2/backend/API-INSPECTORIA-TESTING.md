# Testing API de Inspectoría - SIAONDA V2

## 🚀 Inicio Rápido

### 1. Iniciar el servidor

```bash
cd C:\Users\jelsy.diaz\Desktop\SIAONDA\SIAONDA-V2\backend
npm run dev
```

El servidor debería estar corriendo en: `http://localhost:3000`

---

## 📋 Endpoints Disponibles

### **CATÁLOGOS**

Base URL: `http://localhost:3000/api/inspectoria/catalogos`

#### 1. Obtener TODOS los catálogos (Recomendado)

```http
GET /api/inspectoria/catalogos/todos
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "categoriasIRC": [...],
    "statusInspeccion": [...],
    "estadosJuridicos": [...],
    "conclusiones": [...],
    "statusExternos": [...],
    "provincias": [...],
    "estadosSolicitud": [...],
    "estadosCaso": [...]
  }
}
```

#### 2. Obtener Categorías IRC (IRC-01 a IRC-15)

```http
GET /api/inspectoria/catalogos/categorias-irc
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "codigo": "IRC-01",
      "nombre": "Editores",
      "descripcion": "Editores de obras literarias, musicales y audiovisuales",
      "precio": "30000.00",
      "activo": true
    },
    ...
  ]
}
```

#### 3. Obtener una Categoría IRC específica

```http
GET /api/inspectoria/catalogos/categorias-irc/IRC-01
```

O por ID:

```http
GET /api/inspectoria/catalogos/categorias-irc/1
```

#### 4. Otros Catálogos

```http
GET /api/inspectoria/catalogos/status-inspeccion
GET /api/inspectoria/catalogos/estados-juridicos
GET /api/inspectoria/catalogos/conclusiones
GET /api/inspectoria/catalogos/status-externos
GET /api/inspectoria/catalogos/provincias
GET /api/inspectoria/catalogos/estados-solicitud
GET /api/inspectoria/catalogos/estados-caso
```

---

### **EMPRESAS INSPECCIONADAS**

Base URL: `http://localhost:3000/api/inspectoria/empresas`

#### 1. Crear Nueva Empresa (Persona Moral)

```http
POST /api/inspectoria/empresas
Content-Type: application/json
```

**Body:**
```json
{
  "nombreEmpresa": "DISTRIBUIDORA TECH DOMINICANA SRL",
  "nombreComercial": "TechDom",
  "rnc": "131-50234-5",
  "direccion": "Av. Winston Churchill #123, Piantini",
  "telefono": "809-555-1234",
  "fax": "809-555-1235",
  "email": "info@techdom.com.do",
  "paginaWeb": "https://techdom.com.do",
  "categoriaIrcId": 15,
  "tipoPersona": "MORAL",
  "descripcionActividades": "Distribución de software empresarial y licencias de productos tecnológicos a nivel nacional.",
  "provinciaId": 1,
  "personaContacto": "Juan Pérez",
  "consejoAdministracion": [
    {
      "cargo": "PRESIDENTE",
      "nombre": "María Elena Rodríguez",
      "cedula": "001-1234567-8"
    },
    {
      "cargo": "SECRETARIO",
      "nombre": "Carlos Alberto Martínez",
      "cedula": "001-2345678-9"
    },
    {
      "cargo": "TESORERO",
      "nombre": "Ana Patricia Gómez",
      "cedula": "001-3456789-0"
    }
  ],
  "principalesClientes": [
    {
      "nombreCliente": "Banco Popular Dominicano"
    },
    {
      "nombreCliente": "Grupo Ramos"
    },
    {
      "nombreCliente": "Ministerio de Educación"
    }
  ]
}
```

#### 2. Crear Nueva Empresa (Persona Física)

```http
POST /api/inspectoria/empresas
Content-Type: application/json
```

**Body:**
```json
{
  "nombreEmpresa": "IMPORTADORA MUSICA DEL CARIBE",
  "nombreComercial": "Música Caribe",
  "rnc": "131-60345-7",
  "direccion": "Calle El Conde #456, Zona Colonial",
  "telefono": "809-687-5555",
  "email": "contacto@musicacaribe.com",
  "categoriaIrcId": 8,
  "tipoPersona": "FISICA",
  "nombrePropietario": "Pedro Antonio Santos",
  "cedulaPropietario": "001-0987654-3",
  "descripcionActividades": "Importación y distribución de música internacional y nacional en formatos físicos y digitales.",
  "provinciaId": 1,
  "principalesClientes": [
    {
      "nombreCliente": "Cadena de Tiendas La Sirena"
    },
    {
      "nombreCliente": "Supermercados Nacional"
    },
    {
      "nombreCliente": "Tiendas de Música Independientes"
    }
  ]
}
```

#### 3. Listar Empresas (con filtros)

```http
GET /api/inspectoria/empresas?page=1&limit=20
```

**Filtros disponibles:**
- `search` - Buscar por RNC, nombre o nombre comercial
- `categoriaIrcId` - Filtrar por categoría
- `provinciaId` - Filtrar por provincia
- `statusId` - Filtrar por status
- `vencidas=true` - Solo empresas vencidas
- `porVencer=true` - Empresas por vencer (próximos 30 días)

**Ejemplos:**

```http
# Buscar empresas con "tech" en el nombre
GET /api/inspectoria/empresas?search=tech

# Empresas de categoría IRC-15 (Distribuidores de Software)
GET /api/inspectoria/empresas?categoriaIrcId=15

# Empresas del Distrito Nacional
GET /api/inspectoria/empresas?provinciaId=1

# Empresas vencidas
GET /api/inspectoria/empresas?vencidas=true

# Empresas por vencer en los próximos 30 días
GET /api/inspectoria/empresas?porVencer=true
```

#### 4. Buscar Empresa por RNC

```http
GET /api/inspectoria/empresas/buscar/rnc/131-50234-5
```

También funciona sin guiones:

```http
GET /api/inspectoria/empresas/buscar/rnc/131502345
```

#### 5. Obtener Empresa por ID

```http
GET /api/inspectoria/empresas/1
```

**Respuesta incluye:**
- Datos completos de la empresa
- Consejo de administración
- Principales clientes
- Documentos adjuntos
- Últimos 5 certificados
- Últimas 5 solicitudes de registro
- Últimos 5 casos de inspección

#### 6. Actualizar Empresa

```http
PUT /api/inspectoria/empresas/1
Content-Type: application/json
```

**Body (campos a actualizar):**
```json
{
  "telefono": "809-555-9999",
  "email": "nuevo@techdom.com.do",
  "statusId": 1
}
```

#### 7. Obtener Empresas Vencidas

```http
GET /api/inspectoria/empresas/vencidas
```

#### 8. Obtener Empresas Por Vencer (30 días)

```http
GET /api/inspectoria/empresas/por-vencer
```

---

## 🧪 Testing con cURL

### Ejemplo 1: Obtener Todos los Catálogos

```bash
curl -X GET http://localhost:3000/api/inspectoria/catalogos/todos
```

### Ejemplo 2: Crear Empresa Persona Moral

```bash
curl -X POST http://localhost:3000/api/inspectoria/empresas \
  -H "Content-Type: application/json" \
  -d '{
    "nombreEmpresa": "DISTRIBUIDORA TECH DOMINICANA SRL",
    "nombreComercial": "TechDom",
    "rnc": "131-50234-5",
    "direccion": "Av. Winston Churchill #123, Piantini",
    "telefono": "809-555-1234",
    "email": "info@techdom.com.do",
    "categoriaIrcId": 15,
    "tipoPersona": "MORAL",
    "descripcionActividades": "Distribución de software empresarial",
    "provinciaId": 1,
    "consejoAdministracion": [
      {
        "cargo": "PRESIDENTE",
        "nombre": "María Elena Rodríguez",
        "cedula": "001-1234567-8"
      }
    ],
    "principalesClientes": [
      {"nombreCliente": "Banco Popular"},
      {"nombreCliente": "Grupo Ramos"},
      {"nombreCliente": "Ministerio de Educación"}
    ]
  }'
```

### Ejemplo 3: Buscar por RNC

```bash
curl -X GET http://localhost:3000/api/inspectoria/empresas/buscar/rnc/131-50234-5
```

### Ejemplo 4: Listar con Filtros

```bash
curl -X GET "http://localhost:3000/api/inspectoria/empresas?search=tech&limit=10"
```

---

## 🧪 Testing con Postman / Insomnia

### Importar Colección

Puedes crear una colección con estos endpoints:

**Colección: SIAONDA V2 - Inspectoría**

**Variables de Entorno:**
- `base_url`: `http://localhost:3000`
- `api_path`: `/api/inspectoria`

---

## ✅ Validaciones Implementadas

### RNC (Registro Nacional de Contribuyentes)
- Formato: `XXX-XXXXX-X` o `XXXXXXXXX`
- Debe ser único en el sistema
- Se normaliza automáticamente (se quitan los guiones)

### Tipo de Persona
- **MORAL**: Requiere al menos 1 miembro del Consejo de Administración
- **FISICA**: Requiere nombre y cédula del propietario

### Categorías IRC
- Debe existir en el catálogo
- Solo se muestran categorías activas

---

## 📊 Estructura de Respuesta

### Éxito

```json
{
  "success": true,
  "data": { ... },
  "message": "Operación exitosa" // opcional
}
```

### Error

```json
{
  "success": false,
  "message": "Descripción del error",
  "error": "Detalles técnicos" // en desarrollo
}
```

### Paginación

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

---

## 🚨 Errores Comunes

### 1. Puerto ya en uso

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solución:** Matar el proceso que usa el puerto 3000 o cambiar el puerto en `.env`

### 2. Base de datos no conecta

```
Error: Can't reach database server at localhost:5432
```

**Solución:** Verificar que PostgreSQL esté corriendo

### 3. RNC inválido

```json
{
  "success": false,
  "message": "RNC inválido. Formato esperado: XXX-XXXXX-X"
}
```

**Solución:** Usar formato correcto: `131-50234-5`

### 4. RNC duplicado

```json
{
  "success": false,
  "message": "Ya existe una empresa registrada con este RNC"
}
```

**Solución:** Usar un RNC diferente o buscar la empresa existente

---

## 📝 Próximos Pasos

Una vez que confirmes que estas APIs funcionan correctamente, continuaremos con:

1. ✅ **Controller de Documentos** - Upload de archivos (RNC, Cédula, etc.)
2. ✅ **Controller de Solicitudes** - Flujo completo PR-DI-002
3. ✅ **Controller de Casos** - Flujo de inspecciones PR-DI-001, PR-DI-003
4. ✅ **Integración con Cajas** - Webhooks para pago automático

---

**Fecha:** 2025-11-12
**Versión:** 1.0
**Backend corriendo:** `http://localhost:3000`
