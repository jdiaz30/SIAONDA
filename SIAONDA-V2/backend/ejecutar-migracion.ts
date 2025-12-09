import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function ejecutarMigracion() {
  try {
    console.log('🔄 Conectando a la base de datos...');

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'prisma/migrations/update_asentamiento_fields.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('✅ Conectado a la base de datos');
    console.log('📄 Ejecutando migración...');
    console.log('-----------------------------------');

    // Ejecutar la migración usando Prisma raw query
    await prisma.$executeRawUnsafe(sql);

    console.log('-----------------------------------');
    console.log('✅ Migración ejecutada exitosamente');
    console.log('');
    console.log('Cambios realizados:');
    console.log('  ✓ solicitudes_registro_inspeccion:');
    console.log('    - numero_asiento → numero_registro');
    console.log('    - libro_asiento → numero_libro');
    console.log('    - Agregado: numero_hoja');
    console.log('');
    console.log('  ✓ certificados_inspeccion:');
    console.log('    - numero_asiento → numero_registro');
    console.log('    - Agregado: numero_libro');
    console.log('    - Agregado: numero_hoja');
    console.log('');
    console.log('🚀 Puedes reiniciar el servidor backend ahora');

  } catch (error: any) {
    console.error('❌ Error ejecutando migración:', error.message);
    console.error('');
    console.error('Detalles del error:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

ejecutarMigracion();
