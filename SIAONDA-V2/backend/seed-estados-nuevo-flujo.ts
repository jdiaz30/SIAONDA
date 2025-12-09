/**
 * Script para crear los estados iniciales del nuevo flujo de inspecciones
 *
 * Ejecutar con: npx ts-node seed-estados-nuevo-flujo.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de estados para nuevo flujo de inspecciones...\n');

  // ============================================
  // ESTADOS DE VIAJE DE OFICIO
  // ============================================
  console.log('📋 Creando estados de viaje de oficio...');

  const estadosViaje = [
    { nombre: 'ABIERTO', descripcion: 'Viaje en curso, inspectores en campo' },
    { nombre: 'CERRADO', descripcion: 'Viaje finalizado, actas registradas' },
    { nombre: 'CANCELADO', descripcion: 'Viaje cancelado antes de finalizar' }
  ];

  for (const estado of estadosViaje) {
    await prisma.estadoViajeOficio.upsert({
      where: { nombre: estado.nombre },
      update: {},
      create: estado
    });
    console.log(`  ✓ ${estado.nombre}`);
  }

  // ============================================
  // ESTADOS DE DENUNCIA
  // ============================================
  console.log('\n📋 Creando estados de denuncia...');

  const estadosDenuncia = [
    { nombre: 'PENDIENTE_PAGO', descripcion: 'Denuncia recibida, esperando pago de RD$3,000' },
    { nombre: 'PAGADA', descripcion: 'Pago recibido, lista para planificación' },
    { nombre: 'EN_PLANIFICACION', descripcion: 'Planificando inspección' },
    { nombre: 'ASIGNADA', descripcion: 'Inspector asignado, pendiente de ejecución' },
    { nombre: 'COMPLETADA', descripcion: 'Inspección realizada, acta registrada' },
    { nombre: 'RECHAZADA', descripcion: 'Denuncia rechazada o sin mérito' }
  ];

  for (const estado of estadosDenuncia) {
    await prisma.estadoDenuncia.upsert({
      where: { nombre: estado.nombre },
      update: {},
      create: estado
    });
    console.log(`  ✓ ${estado.nombre}`);
  }

  // ============================================
  // ESTADOS DE CASO JURÍDICO
  // ============================================
  console.log('\n📋 Creando estados de caso jurídico...');

  const estadosJuridico = [
    { nombre: 'RECIBIDO', descripcion: 'Caso recibido en Jurídico, pendiente de asignación' },
    { nombre: 'EN_ATENCION', descripcion: 'Caso en proceso por departamento jurídico' },
    { nombre: 'CERRADO', descripcion: 'Caso jurídico cerrado' }
  ];

  for (const estado of estadosJuridico) {
    await prisma.estadoCasoJuridico.upsert({
      where: { nombre: estado.nombre },
      update: {},
      create: estado
    });
    console.log(`  ✓ ${estado.nombre}`);
  }

  console.log('\n✅ Seed completado exitosamente\n');

  // Mostrar resumen
  const countViaje = await prisma.estadoViajeOficio.count();
  const countDenuncia = await prisma.estadoDenuncia.count();
  const countJuridico = await prisma.estadoCasoJuridico.count();

  console.log('📊 Resumen:');
  console.log(`  - Estados de Viaje de Oficio: ${countViaje}`);
  console.log(`  - Estados de Denuncia: ${countDenuncia}`);
  console.log(`  - Estados de Caso Jurídico: ${countJuridico}`);
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
