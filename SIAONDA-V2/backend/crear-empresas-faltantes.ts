import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Buscando solicitudes asentadas sin empresa vinculada...');

  // Buscar solicitudes ASENTADAS o superiores que no tienen empresa
  const solicitudesSinEmpresa = await prisma.solicitudRegistroInspeccion.findMany({
    where: {
      empresaId: null,
      estadoId: { gte: 4 } // ASENTADA o superior
    },
    include: {
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

  console.log(`📋 Encontradas ${solicitudesSinEmpresa.length} solicitudes sin empresa`);

  if (solicitudesSinEmpresa.length === 0) {
    console.log('✅ No hay solicitudes pendientes de crear empresa');
    return;
  }

  // Obtener status ACTIVA
  const statusActiva = await prisma.statusInspeccion.findFirst({
    where: { nombre: 'ACTIVA' }
  });

  if (!statusActiva) {
    console.error('❌ No se encontró el status ACTIVA. Ejecuta el seed primero.');
    process.exit(1);
  }

  for (const solicitud of solicitudesSinEmpresa) {
    console.log(`\n📝 Procesando solicitud: ${solicitud.codigo}`);
    console.log(`   Tipo: ${solicitud.tipoSolicitud}`);
    console.log(`   Empresa: ${solicitud.nombreEmpresa}`);
    console.log(`   RNC: ${solicitud.rnc}`);

    const formCampos = solicitud?.formulario?.productos?.[0]?.campos || [];
    const getCampoValue = (campoNombre: string) => {
      const campo = formCampos.find(c => c.campo.campo === campoNombre);
      return campo?.valor || null;
    };

    const fechaVenc = new Date();
    fechaVenc.setFullYear(fechaVenc.getFullYear() + 1);

    let empresaId: number | null = null;

    if (solicitud.tipoSolicitud === 'REGISTRO_NUEVO') {
      // Verificar si ya existe por RNC
      const empresaExistente = await prisma.empresaInspeccionada.findFirst({
        where: { rnc: solicitud.rnc }
      });

      if (empresaExistente) {
        console.log(`   ⚠️  Empresa ya existe (ID: ${empresaExistente.id}), vinculando...`);
        empresaId = empresaExistente.id;
      } else {
        // Crear nueva empresa
        try {
          const empresaCreada = await prisma.empresaInspeccionada.create({
            data: {
              nombreEmpresa: solicitud.nombreEmpresa!,
              nombreComercial: solicitud.nombreComercial || null,
              rnc: solicitud.rnc,
              direccion: getCampoValue('direccion') || 'N/A',
              telefono: getCampoValue('telefono') || 'N/A',
              fax: getCampoValue('fax'),
              email: getCampoValue('email') || 'N/A',
              paginaWeb: getCampoValue('paginaWeb'),
              categoriaIrcId: solicitud.categoriaIrcId,
              tipoPersona: getCampoValue('tipoPersona') || 'MORAL',
              nombrePropietario: getCampoValue('nombrePropietario'),
              cedulaPropietario: getCampoValue('cedulaPropietario'),
              descripcionActividades: getCampoValue('descripcionActividades') || 'N/A',
              provinciaId: getCampoValue('provincia') ? parseInt(getCampoValue('provincia')!) : null,
              personaContacto: getCampoValue('representanteLegal'),
              statusId: statusActiva.id,
              creadoPorId: 1, // Admin
              registrado: true,
              existeEnSistema: true,
              fechaRegistro: solicitud.fechaAsentamiento || new Date(),
              fechaVencimiento: fechaVenc
            }
          });
          empresaId = empresaCreada.id;
          console.log(`   ✅ Empresa creada (ID: ${empresaCreada.id})`);
        } catch (error) {
          console.error(`   ❌ Error al crear empresa:`, error);
          continue;
        }
      }
    } else if (solicitud.tipoSolicitud === 'RENOVACION') {
      // Buscar empresa por RNC
      const empresaExistente = await prisma.empresaInspeccionada.findFirst({
        where: { rnc: solicitud.rnc }
      });

      if (empresaExistente) {
        empresaId = empresaExistente.id;
        // Actualizar renovación
        await prisma.empresaInspeccionada.update({
          where: { id: empresaId },
          data: {
            fechaRenovacion: solicitud.fechaAsentamiento || new Date(),
            fechaVencimiento: fechaVenc,
            statusId: statusActiva.id
          }
        });
        console.log(`   ✅ Empresa renovada (ID: ${empresaId})`);
      } else {
        console.log(`   ⚠️  No se encontró empresa para renovar`);
      }
    }

    // Vincular empresa a la solicitud
    if (empresaId) {
      await prisma.solicitudRegistroInspeccion.update({
        where: { id: solicitud.id },
        data: { empresaId }
      });
      console.log(`   🔗 Empresa vinculada a solicitud`);
    }
  }

  console.log('\n✅ Proceso completado');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
