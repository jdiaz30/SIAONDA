import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Agregando estado "Abierto" a CierreEstado...');

  // Verificar si ya existe
  const existente = await prisma.cierreEstado.findUnique({
    where: { nombre: 'Abierto' }
  });

  if (existente) {
    console.log('✅ Estado "Abierto" ya existe');
    return;
  }

  // Crear el estado
  const estado = await prisma.cierreEstado.create({
    data: {
      nombre: 'Abierto',
      descripcion: 'Cierre abierto (caja activa)'
    }
  });

  console.log(`✅ Estado creado: ${estado.nombre} (ID: ${estado.id})`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
