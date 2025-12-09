const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Leer la URL de la base de datos del .env
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

console.log('🔄 Conectando a la base de datos...');

const pool = new Pool({
  connectionString: connectionString,
});

async function ejecutarMigracion() {
  const client = await pool.connect();

  try {
    console.log('✅ Conectado a la base de datos');

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'prisma/migrations/update_asentamiento_fields.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Ejecutando migración...');
    console.log('-----------------------------------');

    // Ejecutar la migración
    await client.query(sql);

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

  } catch (error) {
    console.error('❌ Error ejecutando migración:', error.message);
    console.error('');
    console.error('Detalles del error:');
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

ejecutarMigracion();
