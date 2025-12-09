import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function buscarEmpresa() {
  try {
    const rnc = '130-46789-2';

    console.log(`\n=== Buscando empresa con RNC: ${rnc} ===\n`);

    // Buscar directamente en la base de datos
    const empresa = await prisma.empresaInspeccionada.findFirst({
      where: { rnc: rnc }
    });

    if (empresa) {
      console.log('✅ EMPRESA ENCONTRADA EN LA BASE DE DATOS:\n');
      console.log(JSON.stringify(empresa, null, 2));
    } else {
      console.log('❌ NO se encontró la empresa en la base de datos');
    }

    // Buscar sin guiones por si acaso
    const rncSinGuiones = rnc.replace(/-/g, '');
    const empresaSinGuiones = await prisma.empresaInspeccionada.findFirst({
      where: { rnc: rncSinGuiones }
    });

    if (empresaSinGuiones) {
      console.log('\n✅ EMPRESA ENCONTRADA SIN GUIONES:\n');
      console.log(JSON.stringify(empresaSinGuiones, null, 2));
    }

    // Listar todas las empresas para ver qué hay
    console.log('\n=== TODAS LAS EMPRESAS EN LA BASE DE DATOS ===\n');
    const todasEmpresas = await prisma.empresaInspeccionada.findMany();

    console.log(`Total: ${todasEmpresas.length}\n`);

    for (const emp of todasEmpresas) {
      console.log(`ID: ${emp.id} | RNC: "${emp.rnc}" | ${emp.nombreEmpresa}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

buscarEmpresa();
