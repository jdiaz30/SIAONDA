import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Actualizando provincias de empresas existentes...\n');

  // Obtener todas las solicitudes con empresas y formularios
  const solicitudes = await prisma.solicitudRegistroInspeccion.findMany({
    where: {
      empresaId: { not: null },
      formulario: { isNot: null }
    },
    include: {
      empresa: true,
      formulario: {
        include: {
          productos: {
            include: {
              campos: {
                include: {
                  campo: true
                }
              }
            }
          }
        }
      }
    }
  });

  console.log(`Encontradas ${solicitudes.length} solicitudes con empresa\n`);

  let actualizadas = 0;

  for (const solicitud of solicitudes) {
    if (!solicitud.empresa || solicitud.empresa.provinciaId) {
      continue; // Ya tiene provincia
    }

    const formCampos = solicitud.formulario?.productos?.[0]?.campos || [];
    const provinciaNombre = formCampos.find(c => c.campo.campo === 'provincia')?.valor;

    if (!provinciaNombre) {
      console.log(`⚠️  Solicitud ${solicitud.codigo}: Sin provincia en formulario`);
      continue;
    }

    const provincia = await prisma.provincia.findFirst({
      where: { nombre: provinciaNombre }
    });

    if (!provincia) {
      console.log(`⚠️  Solicitud ${solicitud.codigo}: Provincia "${provinciaNombre}" no encontrada`);
      continue;
    }

    await prisma.empresaInspeccionada.update({
      where: { id: solicitud.empresa.id },
      data: { provinciaId: provincia.id }
    });

    console.log(`✅ ${solicitud.empresa.nombreEmpresa}: ${provinciaNombre} (ID: ${provincia.id})`);
    actualizadas++;
  }

  console.log(`\n✅ Actualizadas ${actualizadas} empresas`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
