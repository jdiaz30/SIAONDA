import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simular lo que hace el endpoint GET /api/inspectoria/empresas
async function testEndpoint() {
  try {
    const rnc = '130-46789-2';

    console.log(`\n=== Simulando: GET /api/inspectoria/empresas?rnc=${rnc} ===\n`);

    // Esto es lo que debería hacer el endpoint
    const where: any = {};
    where.rnc = rnc;

    const empresas = await prisma.empresaInspeccionada.findMany({
      where,
      include: {
        categoriaIrc: true,
        provincia: true,
        status: true
      },
      take: 10
    });

    console.log(`Empresas encontradas: ${empresas.length}\n`);

    if (empresas.length > 0) {
      console.log('✅ RESULTADO:\n');
      console.log(JSON.stringify(empresas, null, 2));
    } else {
      console.log('❌ No se encontraron empresas con ese RNC');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testEndpoint();
