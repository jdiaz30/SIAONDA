import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function crearInspectores() {
  console.log('🔧 Creando registros de inspectores de campo...\n');
  console.log('ℹ️  Los inspectores son personal de campo que no requiere acceso al sistema.\n');

  // Buscar el tipo "Inspector"
  let tipoInspector = await prisma.usuarioTipo.findFirst({
    where: { nombre: 'Inspector' }
  });

  if (!tipoInspector) {
    console.log('⚠️  Tipo "Inspector" no existe. Creándolo...');
    tipoInspector = await prisma.usuarioTipo.create({
      data: {
        nombre: 'Inspector',
        descripcion: 'Inspector de campo de Inspectoría (sin acceso al sistema)'
      }
    });
    console.log('✅ Tipo "Inspector" creado\n');
  }

  // Buscar el estado "Activo"
  let estadoActivo = await prisma.usuarioEstado.findFirst({
    where: { nombre: 'Activo' }
  });

  if (!estadoActivo) {
    console.log('⚠️  Estado "Activo" no existe. Creándolo...');
    estadoActivo = await prisma.usuarioEstado.create({
      data: {
        nombre: 'Activo',
        descripcion: 'Usuario activo en el sistema'
      }
    });
    console.log('✅ Estado "Activo" creado\n');
  }

  // Inspectores a crear (solo para trazabilidad, no para login)
  const inspectores = [
    {
      codigo: 'INSP-001',
      nombrecompleto: 'Hector Ramirez Peña',
      correo: 'hector.ramirez@onda.gob.do'
    },
    {
      codigo: 'INSP-002',
      nombrecompleto: 'Isabel Valdez Martinez',
      correo: 'isabel.valdez@onda.gob.do'
    },
    {
      codigo: 'INSP-003',
      nombrecompleto: 'Jorge Suarez Gomez',
      correo: 'jorge.suarez@onda.gob.do'
    },
    {
      codigo: 'INSP-004',
      nombrecompleto: 'Felix Santos Rodriguez',
      correo: 'felix.santos@onda.gob.do'
    }
  ];

  for (const inspector of inspectores) {
    // Verificar si ya existe
    const existe = await prisma.usuario.findFirst({
      where: { codigo: inspector.codigo }
    });

    if (existe) {
      console.log(`⏭️  Inspector ${inspector.codigo} (${inspector.nombrecompleto}) ya existe`);
      continue;
    }

    // Crear inspector sin credenciales de acceso
    // Usamos un username único basado en el código y una contraseña aleatoria que nunca se usará
    const nuevoInspector = await prisma.usuario.create({
      data: {
        nombre: `inspector_${inspector.codigo.toLowerCase()}`, // username único
        contrasena: `$2a$10$${Math.random().toString(36).substring(2, 15)}`, // hash dummy
        codigo: inspector.codigo,
        nombrecompleto: inspector.nombrecompleto,
        correo: inspector.correo,
        tipoId: tipoInspector.id,
        estadoId: estadoActivo.id
      }
    });

    console.log(`✅ Inspector creado: ${nuevoInspector.codigo} - ${nuevoInspector.nombrecompleto}`);
  }

  console.log('\n✅ Proceso completado!');
  console.log('\n📋 Inspectores registrados para trazabilidad de viajes:');
  inspectores.forEach(i => {
    console.log(`   ${i.codigo} - ${i.nombrecompleto}`);
  });
  console.log('\nℹ️  Estos registros son solo para asignar inspectores a viajes, no tienen acceso al sistema.');
}

crearInspectores()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
