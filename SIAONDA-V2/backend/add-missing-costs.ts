import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addMissingCosts() {
  console.log('🔍 Buscando productos sin costos...');

  // Obtener todos los productos
  const productos = await prisma.producto.findMany({
    include: {
      costos: true
    }
  });

  let productosActualizados = 0;

  for (const producto of productos) {
    if (producto.costos.length === 0) {
      console.log(`📝 Agregando costo para: ${producto.nombre} (${producto.codigo})`);

      // Precio por defecto según categoría
      let precio = 1000.00;

      switch (producto.categoria) {
        case 'Musical':
          precio = 500.00;
          break;
        case 'Audiovisual':
          precio = 3000.00;
          break;
        case 'Escénica':
          precio = 1500.00;
          break;
        case 'Literaria':
          precio = 1500.00;
          break;
        case 'Artes Visuales':
          precio = 1000.00;
          break;
        case 'Arte Aplicado':
          precio = 1000.00;
          break;
        case 'Científica':
          precio = 5000.00;
          break;
        default:
          precio = 1000.00;
      }

      await prisma.productoCosto.create({
        data: {
          productoId: producto.id,
          precio,
          cantidadMin: 1,
          fechaInicio: new Date()
        }
      });

      productosActualizados++;
    }
  }

  console.log(`✅ ${productosActualizados} productos actualizados con costos`);
  console.log(`✅ Total productos: ${productos.length}`);
}

addMissingCosts()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
