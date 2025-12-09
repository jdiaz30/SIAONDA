import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarSolicitudes() {
  try {
    console.log('=== DIAGNÓSTICO DE SOLICITUDES IRC ===\n');

    // Contar todas las solicitudes
    const totalSolicitudes = await prisma.solicitudRegistroInspeccion.count();
    console.log(`Total de solicitudes en el sistema: ${totalSolicitudes}\n`);

    // Obtener solicitudes con sus estados
    const solicitudes = await prisma.solicitudRegistroInspeccion.findMany({
      include: {
        estado: true,
        empresa: true
      },
      orderBy: { id: 'desc' },
      take: 20 // Últimas 20
    });

    console.log('=== ÚLTIMAS 20 SOLICITUDES ===\n');

    if (solicitudes.length === 0) {
      console.log('❌ No hay solicitudes en el sistema\n');
    } else {
      for (const sol of solicitudes) {
        console.log(`ID: ${sol.id} | Código: ${sol.codigo}`);
        console.log(`  RNC: ${sol.rnc}`);
        console.log(`  Empresa: ${sol.nombreEmpresa}`);
        console.log(`  Tipo: ${sol.tipoSolicitud}`);
        console.log(`  Estado: ${sol.estado.nombre} (ID: ${sol.estadoId})`);
        console.log(`  Tiene empresa asociada: ${sol.empresaId ? 'SÍ (ID: ' + sol.empresaId + ')' : 'NO'}`);
        console.log(`  Nombre empresa asociada: ${sol.empresa?.nombreEmpresa || 'N/A'}`);
        console.log('  ---');
      }
    }

    console.log('\n=== CONTEO POR ESTADO ===\n');

    // Estados: 1=PENDIENTE, 2=VALIDADA, 3=PAGADA, 4=ASENTADA, etc.
    const estados = await prisma.estadoSolicitudInspeccion.findMany({
      include: {
        _count: {
          select: { solicitudes: true }
        }
      }
    });

    for (const estado of estados) {
      console.log(`${estado.nombre}: ${estado._count.solicitudes}`);
    }

    console.log('\n=== EMPRESAS EN TABLA EMPRESAINSPECCIONADA ===\n');

    const empresas = await prisma.empresaInspeccionada.findMany({
      take: 10,
      orderBy: { id: 'desc' }
    });

    console.log(`Total de empresas: ${empresas.length}\n`);

    for (const emp of empresas) {
      console.log(`ID: ${emp.id} | RNC: ${emp.rnc} | ${emp.nombreEmpresa}`);
      console.log(`  Registrada: ${emp.registrado ? 'SÍ' : 'NO'}`);
      console.log(`  Fecha vencimiento: ${emp.fechaVencimiento?.toLocaleDateString() || 'N/A'}`);
      console.log('  ---');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarSolicitudes();
