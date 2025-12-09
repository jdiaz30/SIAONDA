import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Eliminando campos existentes...');
  
  // Eliminar todos los campos dinámicos
  await prisma.formularioCampo.deleteMany({});
  
  console.log('✅ Campos eliminados. Ahora ejecuta: npx tsx prisma/seed.ts');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
