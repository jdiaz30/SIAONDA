# 📋 FORMATOS EXACTOS DEL SISTEMA SIAONDA

**Basado en análisis del código fuente original en `/ONDA`**

---

## 🎫 CERTIFICADOS

### Formato del Código
```
Código: NNNNNNNN/DD/MM/YYYY
Ejemplo: 00000021/10/10/2022
```
- 8 dígitos numéricos
- Fecha de recepción formato DD/MM/YYYY
- NO usa prefijo "CERT-"

### Contenido EXACTO del Certificado

```
[ENCABEZADO - Centrado]
CERTIFICADO DE REGISTRO


[CUERPO - Justificado]
Certifica que la [TIPO_OBRA] titulada, [TÍTULO DE LA OBRA EN MAYÚSCULAS] ([TRADUCCIÓN DEL TÍTULO SI TIENE])
cuyo [TIPO_RELACIÓN: autor/compositor/intérprete/etc] dice ser [NOMBRE COMPLETO DEL AUTOR EN MAYÚSCULAS] [(FALLECIDO) si aplica],
[nacionalidad/institución] [NACIONALIDAD EN MAYÚSCULAS], [cédula/pasaporte/rnc] No. [NÚMERO DE IDENTIFICACIÓN],
domiciliado en [DIRECCIÓN EN MAYÚSCULAS], del sector [SECTOR EN MAYÚSCULAS] de la provincia [PROVINCIA EN MAYÚSCULAS],
[conjuntamente con las personas que se describen aquí debajo, - si hay múltiples autores] ha sido inscrito en el
Registro de la Oficina Nacional de Derecho de Autor, el día [DD] del mes [MM] del año [YYYY], siendo la [HH:MM AM/PM],
bajo el número de registro [CÓDIGO DEL CERTIFICADO EN MAYÚSCULAS], en el libro No. [NÚMERO DE LIBRO], año [YYYY].


[CONCEPTO]
CONCEPTO: [TIPO DE OBRA EN MAYÚSCULAS]
[DESCRIPCIÓN DE LA OBRA]


[SI HAY MÚLTIPLES AUTORES]
AUTOR(ES):
[LISTA DE AUTORES CON DATOS COMPLETOS]


[SI HAY OBSERVACIONES]
OBSERVACIONES:
[COMENTARIOS/OBSERVACIONES]


[SI ES PRODUCCIÓN CON SUB-OBRAS]
[LISTADO DE SUB-OBRAS]


[SI HAY REPRESENTANTE (RNC o fallecido)]
[DATOS DEL REPRESENTANTE]


[CIERRE]
Se expide en Santo Domingo, Distrito Nacional, capital de la República Dominicana,
hoy día (DD) del mes de (MM) del año (YYYY).


[FIRMA Y SELLO]
[Espacio para firma del Director]
[Sello de ONDA]
```

### Campos Importantes del Certificado

1. **Código**: `00000021/10/10/2022`
2. **Libro**: Número de libro donde se registra
3. **Tipo de obra**: Musical, Literaria, Audiovisual, etc.
4. **Título**: En MAYÚSCULAS
5. **Traducción del título**: Si aplica, entre paréntesis
6. **Autor**: Nombre completo en MAYÚSCULAS
7. **Tipo identificación**: cédula, pasaporte, RNC
8. **Número identificación**: Cédula, pasaporte o RNC
9. **Nacionalidad**: País en MAYÚSCULAS
10. **Dirección completa**: Dirección, sector, provincia
11. **Fecha y hora de registro**: DD/MM/YYYY HH:MM AM/PM
12. **Concepto**: Descripción de la obra
13. **Autores adicionales**: Si hay más de un autor
14. **Representante**: Si es RNC o autor fallecido
15. **Observaciones**: Comentarios especiales
16. **Sub-obras**: Si es una producción con múltiples obras
17. **Fecha de expedición**: Fecha actual de generación del certificado

### Estados del Certificado
1. **Pendiente**: No generado aún
2. **Generado**: PDF creado
3. **Entregado**: Entregado al cliente

---

## 💰 FACTURAS

### Análisis pendiente del sistema original
(Necesito revisar los archivos de facturas en detalle)

Archivos a analizar:
- `/ONDA/OPER/C_Factura.php`
- `/ONDA/factura.php`
- `/ONDA/facturancf.php`

### Formato NCF (Comprobantes Fiscales DGII RD)

**Estructura:**
```
B01XXXXXXXX (11 dígitos)
```

**Tipos:**
- **B01**: Facturas de Crédito Fiscal
- **B02**: Facturas de Consumo
- **B14**: Facturas Gubernamentales
- **B15**: Comprobantes Especiales

**Reglas:**
1. Secuencial sin saltos
2. Controlado por DGII
3. No se puede repetir
4. Debe tener autorización de DGII

### Código de Factura Temporal
```
TEM-NNNNNN
```
Hasta que se asigne NCF

---

## 📝 FORMULARIOS

### Código de Formulario
(Pendiente de confirmar formato exacto del sistema original)

Probablemente:
```
NNNNNNNN (8 dígitos)
o
YYYY-NNNNNN (Año + secuencia)
```

### Campos por Tipo de Obra

#### OBRA MUSICAL
- Título
- Letra
- Música
- Género musical
- Duración
- Fecha de creación
- Archivos de audio
- Traducción del título (si aplica)

#### OBRA LITERARIA
- Título
- Género literario
- Número de páginas
- Editorial
- ISBN
- Resumen
- Archivo del manuscrito
- Traducción del título (si aplica)

#### OBRA AUDIOVISUAL
- Título
- Tipo (película, documental, video, etc.)
- Duración
- Género
- Sinopsis
- Director
- Productora
- Año de producción
- Archivo de video

#### OBRA FONOGRÁFICA
- Título
- Intérpretes
- Productora
- Año de grabación
- Duración
- Género
- Archivo de audio

#### OBRA PLÁSTICA
- Título
- Técnica
- Dimensiones
- Año de creación
- Fotografía de la obra

#### PROGRAMA/SOFTWARE
- Nombre del programa
- Versión
- Lenguaje de programación
- Descripción de funcionalidades
- Archivo del código fuente

---

## 🔑 CÓDIGOS Y SECUENCIAS

### Código de Cliente
```
CLI-NNNNNN (6 dígitos)
Ejemplo: CLI-000001
```

### Código de Producto
```
IRC001, IRC002, IRC003, etc.
```
- IRC: Prefijo para productos de registro
- 3 dígitos numéricos

### Código de Usuario
```
ADM001, CAJ001, REG001, etc.
```
- 3 letras del tipo de usuario
- 3 dígitos numéricos

---

## 📊 CAMPOS ADICIONALES IMPORTANTES

### Datos del Cliente/Autor
- **Identificación**: Cédula (DDD-DDDDDDD-D), Pasaporte, RNC (DDD-DDDDD-D)
- **Sector**: Barrio/Sector donde vive
- **Provincia**: Provincia de residencia
- **Fecha de fallecimiento**: Si el autor está fallecido
- **Representante legal**: Si aplica

### Datos del Formulario
- **Solicitante**: Persona que solicita el registro
- **Teléfono**: De contacto
- **Fecha de solicitud**: Cuándo se solicitó
- **Fecha de recepción**: Cuándo se recibió en ONDA
- **Registro físico**: Archivos adjuntos físicos
- **Firma**: Firma digital del solicitante

### Integrantes de una Obra
Una obra puede tener múltiples integrantes con diferentes roles:
- Autor (ID_tipo_cliente = 1)
- Compositor
- Intérprete
- Editor
- Productor
- Director
- etc.

---

## 🎯 VALIDACIONES CRÍTICAS

### Al Crear Formulario
1. ✅ Cliente debe existir
2. ✅ Todos los campos requeridos completos
3. ✅ Firma digital presente
4. ✅ Archivos válidos (tipo y tamaño)
5. ✅ No duplicar obra (mismo título + mismo autor)

### Al Generar Certificado
1. ✅ Formulario debe estar asentado
2. ✅ Factura debe estar pagada (si aplica)
3. ✅ Código de certificado único
4. ✅ Todos los datos completos

### Al Generar Factura con NCF
1. ✅ RNC válido (formato dominicano)
2. ✅ NCF secuencial sin saltos
3. ✅ NCF no repetido
4. ✅ Tipo de NCF correcto según cliente

---

## 📌 NOTAS IMPORTANTES

1. **Mayúsculas**: Los certificados usan MAYÚSCULAS para datos importantes (nombres, títulos, etc.)

2. **Fechas**: Formato DD/MM/YYYY en certificados (no YYYY-MM-DD)

3. **Hora**: Formato 12 horas con AM/PM (no 24 horas)

4. **Libro**: Cada certificado se registra en un "libro" físico

5. **Fallecidos**: Si el autor está fallecido, se marca como "(FALLECIDO)" y debe tener representante

6. **RNC**: Si el solicitante es empresa (RNC), cambia "nacionalidad" por "institución" y requiere representante

7. **Producciones**: Una producción puede tener múltiples sub-obras (ejemplo: álbum con varias canciones)

8. **Traducción**: Si la obra tiene título en otro idioma, se incluye la traducción

---

## 🚀 PRÓXIMOS PASOS

1. Confirmar formato exacto de códigos de formularios
2. Analizar formato completo de facturas
3. Obtener template real de certificado (con logo y diseño)
4. Confirmar todos los campos dinámicos por tipo de obra
5. Validar secuencias de NCF con DGII

---

**Última actualización:** 29 de octubre de 2025
**Analista:** Basado en código fuente `/ONDA/LEGACY_BACKUP_2025-01-01/prueba.php` y `/ONDA/OPER/C_Certificado.php`
