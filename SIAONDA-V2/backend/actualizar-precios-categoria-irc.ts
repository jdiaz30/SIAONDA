import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Precios oficiales de categorías IRC según Resolución 013-2023
const preciosIRC: { [key: string]: number } = {
  'IRC-01': 3000.00,   // Clubes o Tiendas de video juegos
  'IRC-02': 3000.00,   // Importadores y Distribuidores de Audiovisuales
  'IRC-03': 3000.00,   // Importadores y Distribuidores de Fonogramas
  'IRC-04': 10000.00,  // Programas/Dispositivos (Grande)
  'IRC-05': 10000.00,  // Obras gráficas (Grande)
  'IRC-06': 3000.00,   // Soportes de reproducción
  'IRC-07': 15000.00,  // Equipos electrónicos/señales satelitales
  'IRC-08': 5000.00,   // Galerías de Arte
  'IRC-09': 50000.00,  // Estaciones Transmisión (Tipo A - T.N)
  'IRC-10': 15000.00,  // Radiodifusión Televisiva Abierta
  'IRC-11': 10000.00,  // Radiodifusión Televisiva Cerrada
  'IRC-12': 7500.00,   // Radiodifusión Sonora F.M.
  'IRC-13': 5000.00,   // Radiodifusión Sonora A.M.
  'IRC-14': 3000.00,   // Radiodifusión por Internet
  'IRC-15': 5000.00,   // Empresa de Telecable (sin operación)
};

async function main() {
  console.log('🔄 Actualizando precios de categorías IRC...\n');

  let actualizados = 0;
  let noEncontrados = 0;
  let sinCambios = 0;

  for (const [codigo, precioOficial] of Object.entries(preciosIRC)) {
    try {
      const categoria = await prisma.categoriaIrc.findUnique({
        where: { codigo }
      });

      if (!categoria) {
        console.log(`⚠️  Categoría ${codigo} no encontrada`);
        noEncontrados++;
        continue;
      }

      const precioActual = Number(categoria.precio);

      if (precioActual === precioOficial) {
        console.log(`✅ ${codigo}: RD$ ${precioOficial.toLocaleString('es-DO', { minimumFractionDigits: 2 })} (sin cambios)`);
        sinCambios++;
        continue;
      }

      await prisma.categoriaIrc.update({
        where: { codigo },
        data: { precio: precioOficial }
      });

      console.log(`✏️  ${codigo}: RD$ ${precioActual.toLocaleString('es-DO', { minimumFractionDigits: 2 })} → RD$ ${precioOficial.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`);
      actualizados++;
    } catch (error) {
      console.error(`❌ Error actualizando ${codigo}:`, error);
    }
  }

  console.log(`\n📊 Resumen:`);
  console.log(`   - Categorías actualizadas: ${actualizados}`);
  console.log(`   - Categorías sin cambios: ${sinCambios}`);
  console.log(`   - Categorías no encontradas: ${noEncontrados}`);
  console.log(`\n✅ Proceso completado`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
