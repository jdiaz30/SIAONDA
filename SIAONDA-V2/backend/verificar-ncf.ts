import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando secuencias NCF...\n');

  const secuencias = await prisma.secuenciaNcf.findMany({
    orderBy: { tipoComprobante: 'asc' }
  });

  if (secuencias.length === 0) {
    console.log('⚠️  NO HAY SECUENCIAS NCF EN LA BASE DE DATOS\n');
    console.log('Necesitas crear secuencias NCF para poder generar facturas.\n');
    return;
  }

  console.log(`Total de secuencias: ${secuencias.length}\n`);

  console.log('Tipo | Serie | Actual    | Final     | Vencimiento    | Activo');
  console.log('-----|-------|-----------|-----------|----------------|-------');

  for (const sec of secuencias) {
    const vencimiento = sec.fechaVencimiento.toISOString().split('T')[0];
    const vencida = sec.fechaVencimiento < new Date();
    const disponible = sec.numeroActual < sec.numeroFinal;

    console.log(
      `${sec.tipoComprobante.padEnd(5)}| ${sec.serie.padEnd(6)}| ${sec.numeroActual.toString().padStart(10)}| ${sec.numeroFinal.toString().padStart(10)}| ${vencimiento} | ${sec.activo ? '✅' : '❌'}${vencida ? ' (VENCIDA)' : ''}${!disponible ? ' (AGOTADA)' : ''}`
    );
  }

  console.log('\n📊 Estado de secuencias B02 (Factura de Consumo):');
  const b02 = secuencias.find(s => s.tipoComprobante === 'B02');

  if (!b02) {
    console.log('❌ No existe secuencia B02');
  } else {
    const disponibles = b02.numeroFinal - b02.numeroActual;
    const vencida = b02.fechaVencimiento < new Date();

    console.log(`   - Estado: ${b02.activo ? 'Activa' : 'Inactiva'}`);
    console.log(`   - Comprobantes disponibles: ${disponibles}`);
    console.log(`   - Vencimiento: ${b02.fechaVencimiento.toISOString().split('T')[0]}${vencida ? ' ⚠️ VENCIDA' : ''}`);

    if (!b02.activo) {
      console.log('\n⚠️  La secuencia B02 está INACTIVA');
    }
    if (vencida) {
      console.log('\n⚠️  La secuencia B02 está VENCIDA');
    }
    if (disponibles <= 0) {
      console.log('\n⚠️  La secuencia B02 está AGOTADA');
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
