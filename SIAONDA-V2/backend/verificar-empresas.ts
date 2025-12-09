import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Verificando empresas IRC...\n');

  const empresas = await prisma.empresaInspeccionada.findMany({
    include: {
      categoriaIrc: true,
      provincia: true,
      status: true
    },
    orderBy: { id: 'desc' },
    take: 5
  });

  console.log(`Total de empresas: ${empresas.length}\n`);

  if (empresas.length === 0) {
    console.log('NO HAY EMPRESAS EN LA BASE DE DATOS\n');
  }

  empresas.forEach((emp) => {
    console.log(`ID: ${emp.id}`);
    console.log(`RNC: ${emp.rnc}`);
    console.log(`Nombre: ${emp.nombreEmpresa}`);
    console.log(`Registrado: ${emp.registrado}`);
    console.log(`Fecha Registro: ${emp.fechaRegistro}`);
    console.log('---');
  });

  console.log('\nVerificando solicitudes sin empresa...\n');

  const solicitudesSinEmpresa = await prisma.solicitudRegistroInspeccion.findMany({
    where: {
      empresaId: null,
      estadoId: { gte: 4 }
    },
    include: {
      estado: true
    },
    take: 5
  });

  console.log(`Solicitudes asentadas sin empresa: ${solicitudesSinEmpresa.length}\n`);

  solicitudesSinEmpresa.forEach((sol) => {
    console.log(`Codigo: ${sol.codigo}`);
    console.log(`Empresa: ${sol.nombreEmpresa}`);
    console.log(`RNC: ${sol.rnc}`);
    console.log('---');
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
