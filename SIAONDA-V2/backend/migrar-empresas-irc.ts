import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrarEmpresasIRC() {
  try {
    console.log('Iniciando migración de empresas IRC...\n');

    // Buscar solicitudes VALIDADAS/PAGADAS/ASENTADAS que NO tienen empresa asociada
    const solicitudesAsentadas = await prisma.solicitudRegistroInspeccion.findMany({
      where: {
        tipoSolicitud: 'REGISTRO_NUEVO',
        empresaId: null,
        estadoId: { gte: 2 } // VALIDADA (2) o mayor
      },
      include: {
        formulario: true,
        categoriaIrc: true
      }
    });

    console.log(`✓ Encontradas ${solicitudesAsentadas.length} solicitudes sin empresa asociada\n`);

    let creadas = 0;
    let errores = 0;

    for (const solicitud of solicitudesAsentadas) {
      try {
        // Verificar si ya existe una empresa con ese RNC
        const empresaExistente = await prisma.empresaInspeccionada.findFirst({
          where: { rnc: solicitud.rnc }
        });

        if (empresaExistente) {
          // Si ya existe, solo asociarla
          await prisma.solicitudRegistroInspeccion.update({
            where: { id: solicitud.id },
            data: { empresaId: empresaExistente.id }
          });
          console.log(`⚠️  Empresa ya existe (RNC: ${solicitud.rnc}), solo asociada a solicitud ${solicitud.codigo}`);
          continue;
        }

        // Crear la empresa
        const fechaBase = solicitud.fechaAsentamiento || new Date();
        const fechaVenc = new Date(fechaBase);
        fechaVenc.setFullYear(fechaVenc.getFullYear() + 1);

        const nuevaEmpresa = await prisma.empresaInspeccionada.create({
          data: {
            nombreEmpresa: solicitud.nombreEmpresa || '',
            nombreComercial: solicitud.nombreComercial,
            rnc: solicitud.rnc,
            direccion: 'Pendiente de actualizar',
            telefono: 'N/A',
            email: 'pendiente@onda.gov.do',
            categoriaIrcId: solicitud.categoriaIrcId,
            tipoPersona: 'MORAL', // Por defecto
            descripcionActividades: 'Importador/Distribuidor de obras protegidas',
            registrado: solicitud.estadoId >= 4, // true si está ASENTADA o mayor
            fechaRegistro: fechaBase,
            fechaVencimiento: fechaVenc,
            statusId: 1, // ACTIVA
            creadoPorId: 1 // Usuario sistema
          }
        });

        // Asociar la empresa a la solicitud
        await prisma.solicitudRegistroInspeccion.update({
          where: { id: solicitud.id },
          data: { empresaId: nuevaEmpresa.id }
        });

        creadas++;
        console.log(`✓ Creada empresa: ${nuevaEmpresa.nombreEmpresa} (RNC: ${nuevaEmpresa.rnc}) - Solicitud: ${solicitud.codigo}`);
      } catch (error) {
        errores++;
        console.error(`✗ Error procesando solicitud ${solicitud.codigo}:`, error);
      }
    }

    console.log(`\n========================================`);
    console.log(`Migración completada:`);
    console.log(`  - Empresas creadas: ${creadas}`);
    console.log(`  - Errores: ${errores}`);
    console.log(`========================================\n`);
  } catch (error) {
    console.error('Error en la migración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrarEmpresasIRC();
