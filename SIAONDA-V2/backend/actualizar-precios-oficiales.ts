import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Precios oficiales según Resolución 013-2023
const preciosOficiales: { [key: string]: number } = {
  // I. Obras Artísticas
  // A. Obras Musicales y Afines
  'MUS-01': 500.00,
  'MUS-02': 500.00,
  'MUS-03': 1500.00,
  'MUS-04': 500.00,
  'MUS-05': 500.00,

  // B. Obras Audiovisuales
  'AUD-01': 7000.00,
  'AUD-02': 5000.00,
  'AUD-03': 3000.00,
  'AUD-04': 4000.00,
  'AUD-05': 2000.00,

  // C. Obras Escénicas
  'ESC-01': 1500.00,
  'ESC-02': 3000.00,
  'ESC-03': 1500.00,
  'ESC-04': 1500.00,
  'ESC-05': 1000.00,
  'ESC-06': 1000.00,
  'ESC-07': 1000.00,

  // D. Obras de Artes Visuales
  'AP-01': 1000.00,
  'AP-02': 1000.00,
  'AP-03': 1000.00,
  'AP-04': 1000.00,
  'AP-05': 500.00,

  // E. Obras de Arte Aplicado
  'AA-01': 1000.00,
  'AA-02': 1000.00,
  'AA-03': 1000.00,
  'AA-04': 1000.00,
  'AA-05': 1000.00,
  'AA-06': 1000.00,
  'AA-07': 5000.00,
  'AA-08': 3000.00,

  // II. Obras Literarias
  'LIT-01': 500.00,
  'LIT-02': 500.00,
  'LIT-03': 3000.00,
  'LIT-04': 3000.00,
  'LIT-05': 2000.00,
  'LIT-06': 500.00,
  'LIT-07': 2000.00,
  'LIT-08': 1000.00,
  'LIT-09': 5000.00,
  'LIT-10': 1000.00,
  'LIT-11': 1000.00,
  'LIT-12': 1500.00,
  'LIT-13': 1500.00,
  'LIT-14': 1500.00,
  'LIT-15': 2000.00,
  'LIT-16': 1000.00,
  'LIT-17': 1000.00,
  'LIT-18': 3000.00,
  'LIT-19': 2000.00,

  // III. Obras Científicas
  'OC-01': 10000.00,
  'OC-02': 5000.00,
  'OC-03': 5000.00,
  'OC-04': 1500.00,
  'OC-05': 5000.00,
  'OC-06': 10000.00,
  'OC-07': 3000.00,
  'OC-08': 2000.00,

  // IV. Colección y Compilación
  'CC-01': 3000.00,
  'CC-02': 3000.00,
  'CC-03': 3000.00,
  'CC-04': 3000.00,
  'CC-05': 3000.00,
  'CC-06': 3000.00,
  'CC-07': 3000.00,
  'CC-08': 3000.00,
  'CC-09': 3000.00,
  'CC-10': 3000.00,
  'CC-11': 3000.00,
  'CC-12': 3000.00,
  'CC-13': 3000.00,
  'CC-14': 13000.00,

  // V. Producciones (6-15)
  'MUS-01-P': 3000.00,
  'MUS-02-P': 3000.00,
  'MUS-03-P': 6000.00,
  'MUS-04-P': 3000.00,
  'LIT-01-P': 3000.00,
  'LIT-02-P': 3000.00,
  'AP-01-P': 3000.00,
  'AP-02-P': 3000.00,
  'AP-03-P': 5000.00,
  'AP-04-P': 5000.00,
  'AP-05-P': 3000.00,
  'AA-05-P': 3000.00,
  'AA-06-P': 4000.00,
  'PRO-05': 3000.00,
  'PRO-13': 4000.00,

  // VI. Actos o Contratos
  'AC-01': 2000.00,
  // 'AC-02': Varía según valor (1% del valor si > RD$200,000)
  'AC-03': 10000.00,
  'AC-04': 2000.00,
  'AC-05': 2000.00,
  'AC-06': 1000.00,
  'AC-07': 100.00,
  'SONDA055': 1000.00,

  // VII. Consulta Técnica y Otros Servicios
  'CTS-01': 3000.00,
  'CTS-02': 5000.00,
  'CTS-03': 8000.00,
  'CTS-04': 4500.00,
  'CTS-05': 4500.00,
  'CTS-06': 6000.00,

  // VIII. Inscripción de Sociedades de Gestión Colectiva
  'ISG-01': 10000.00,
  'ISG-02': 40000.00,

  // IX. Inscripción y Renovación de Importadores, Distribuidores y Comercializadores
  'IRC-01': 3000.00,
  'IRC-02': 3000.00,
  'IRC-03': 3000.00,
  'IRC-04': 10000.00, // Grande (también existe Mediana: 5000, Pequeña: 3000)
  'IRC-05': 10000.00, // Grande (también existe Mediana: 5000, Pequeña: 3000)
  'IRC-06': 3000.00,
  'IRC-07': 15000.00,
  'IRC-08': 5000.00,
  'IRC-09': 50000.00, // Tipo A (T.N) - Existen otros tipos: B: 15000, C: 10000, D: 7000
  'IRC-10': 15000.00,
  'IRC-11': 10000.00,
  'IRC-11-1': 5000.00,
  'IRC-12': 7500.00,
  'IRC-13': 5000.00,
  'IRC-14': 3000.00,
  'IRC-15': 5000.00,
};

async function main() {
  console.log('🔄 Actualizando precios oficiales de productos ONDA...\n');

  let actualizados = 0;
  let noEncontrados = 0;
  let sinCambios = 0;

  for (const [codigo, precioOficial] of Object.entries(preciosOficiales)) {
    try {
      // Buscar el producto con su costo actual
      const producto = await prisma.producto.findUnique({
        where: { codigo },
        include: {
          costos: {
            where: {
              fechaFinal: null // Precio activo (sin fecha final)
            }
          }
        }
      });

      if (!producto) {
        console.log(`⚠️  Producto ${codigo} no encontrado en la base de datos`);
        noEncontrados++;
        continue;
      }

      const costoActual = producto.costos[0];

      // Verificar si el precio ya es correcto
      if (costoActual && Number(costoActual.precio) === precioOficial) {
        console.log(`✅ ${codigo}: RD$ ${precioOficial.toLocaleString('es-DO', { minimumFractionDigits: 2 })} (sin cambios)`);
        sinCambios++;
        continue;
      }

      // Si existe un costo actual, cerrarlo (poner fecha final)
      if (costoActual) {
        await prisma.productoCosto.update({
          where: { id: costoActual.id },
          data: { fechaFinal: new Date() }
        });
      }

      // Crear nuevo costo con el precio oficial
      await prisma.productoCosto.create({
        data: {
          productoId: producto.id,
          precio: precioOficial,
          cantidadMin: 1,
          cantidadMax: null,
          fechaInicio: new Date(),
          fechaFinal: null
        }
      });

      const precioAnterior = costoActual ? Number(costoActual.precio) : 0;
      console.log(`✏️  ${codigo}: RD$ ${precioAnterior.toLocaleString('es-DO', { minimumFractionDigits: 2 })} → RD$ ${precioOficial.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`);
      actualizados++;
    } catch (error) {
      console.error(`❌ Error actualizando ${codigo}:`, error);
    }
  }

  console.log(`\n📊 Resumen:`);
  console.log(`   - Productos actualizados: ${actualizados}`);
  console.log(`   - Productos sin cambios: ${sinCambios}`);
  console.log(`   - Productos no encontrados: ${noEncontrados}`);
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
