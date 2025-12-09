import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📋 Verificando productos y sus precios...\n');

  const productos = await prisma.producto.findMany({
    include: {
      costos: {
        where: {
          fechaFinal: null // Solo costos activos
        },
        orderBy: {
          fechaInicio: 'desc'
        }
      }
    },
    orderBy: {
      codigo: 'asc'
    }
  });

  console.log(`Total de productos: ${productos.length}\n`);

  let conPrecio = 0;
  let sinPrecio = 0;

  console.log('Código    | Nombre                                      | Precio Actual');
  console.log('----------|---------------------------------------------|---------------');

  for (const producto of productos) {
    const costoActivo = producto.costos[0];
    const precio = costoActivo ? Number(costoActivo.precio).toLocaleString('es-DO', { minimumFractionDigits: 2 }) : 'SIN PRECIO';

    if (costoActivo) {
      conPrecio++;
    } else {
      sinPrecio++;
    }

    const nombreTruncado = producto.nombre.length > 43 ? producto.nombre.substring(0, 40) + '...' : producto.nombre;
    console.log(`${producto.codigo.padEnd(10)}| ${nombreTruncado.padEnd(44)}| RD$ ${precio}`);
  }

  console.log('\n📊 Resumen:');
  console.log(`   - Productos con precio: ${conPrecio}`);
  console.log(`   - Productos sin precio: ${sinPrecio}`);
  console.log(`   - Total: ${productos.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
