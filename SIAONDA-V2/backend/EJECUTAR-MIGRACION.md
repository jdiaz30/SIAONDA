# Instrucciones para Ejecutar la Migración del Nuevo Flujo de Inspecciones

## Pasos a seguir:

### 1. Asegúrate de que PostgreSQL esté corriendo

Verifica que tu servidor PostgreSQL esté activo en Windows.

### 2. Abre PowerShell o CMD en Windows

Navega al directorio del backend:
```bash
cd C:\Users\jelsy.diaz\Desktop\SIAONDA\SIAONDA-V2\backend
```

### 3. Ejecuta la migración de Prisma

```bash
npx prisma migrate dev --name nuevo_flujo_inspecciones
```

Este comando:
- Creará las nuevas tablas en la base de datos
- Generará el cliente de Prisma actualizado

### 4. Ejecuta el seed de estados iniciales

Una vez que la migración se complete exitosamente, ejecuta:

```bash
npx ts-node seed-estados-nuevo-flujo.ts
```

Este script creará los estados iniciales para:
- **EstadoViajeOficio**: ABIERTO, CERRADO, CANCELADO
- **EstadoDenuncia**: PENDIENTE_PAGO, PAGADA, EN_PLANIFICACION, ASIGNADA, COMPLETADA, RECHAZADA
- **EstadoCasoJuridico**: RECIBIDO, EN_ATENCION, CERRADO

### 5. Verifica que todo funcionó correctamente

Si ambos comandos se ejecutan sin errores, la migración está completa.

## Nuevas Tablas Creadas:

1. **viajes_oficio** - Viajes de inspección de oficio
2. **estados_viaje_oficio** - Estados de los viajes
3. **viajes_oficio_inspectores** - Relación many-to-many de inspectores asignados a viajes
4. **actas_inspeccion_oficio** - Actas registradas de viajes de oficio
5. **denuncias** - Denuncias/Inspecciones de parte
6. **estados_denuncia** - Estados de las denuncias
7. **casos_juridico** - Casos tramitados al departamento jurídico
8. **estados_caso_juridico** - Estados de casos jurídicos

## En caso de error:

Si algo falla durante la migración:
1. Revisa el mensaje de error
2. Asegúrate de que la base de datos esté corriendo
3. Verifica que no haya cambios sin guardar en `schema.prisma`

## Siguiente paso después de la migración:

Una vez completada la migración, procederemos a implementar:
- Controllers del backend para el nuevo flujo
- Routes del backend
- Páginas del frontend
