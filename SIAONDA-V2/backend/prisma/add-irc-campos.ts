import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Agregando campos faltantes al producto IRC-01...');

  // Buscar producto IRC-01
  const productoIRC = await prisma.producto.findUnique({
    where: { codigo: 'IRC-01' }
  });

  if (!productoIRC) {
    console.error('❌ Producto IRC-01 no encontrado');
    return;
  }

  console.log(`✅ Producto encontrado: ${productoIRC.nombre} (ID: ${productoIRC.id})`);

  // Buscar tipos de campo
  const tipoTexto = await prisma.formularioCampoTipo.findUnique({ where: { nombre: 'texto' } });
  const tipoFecha = await prisma.formularioCampoTipo.findUnique({ where: { nombre: 'fecha' } });

  if (!tipoTexto || !tipoFecha) {
    console.error('❌ Tipos de campo no encontrados');
    return;
  }

  // Campos a agregar (solo los que no son requeridos o que pueden faltar)
  const camposAAgregar = [
    { campo: 'nombreComercial', titulo: 'Nombre Comercial', tipoId: tipoTexto.id, requerido: false, orden: 22 },
    { campo: 'fechaInicioOperaciones', titulo: 'Fecha de Inicio de Operaciones', tipoId: tipoFecha.id, requerido: false, orden: 23 },
    { campo: 'principalesClientes', titulo: 'Principales Clientes', tipoId: tipoTexto.id, requerido: false, orden: 24 },
    { campo: 'provincia', titulo: 'Provincia', tipoId: tipoTexto.id, requerido: false, orden: 31 },
    { campo: 'sector', titulo: 'Sector', tipoId: tipoTexto.id, requerido: false, orden: 32 },
    { campo: 'telefonoSecundario', titulo: 'Teléfono Secundario', tipoId: tipoTexto.id, requerido: false, orden: 34 },
    { campo: 'tipoPersona', titulo: 'Tipo de Persona', tipoId: tipoTexto.id, requerido: true, orden: 42 },
    { campo: 'descripcionActividades', titulo: 'Descripción de Actividades', tipoId: tipoTexto.id, requerido: true, orden: 43 },

    // Persona MORAL - Presidente
    { campo: 'presidenteNombre', titulo: 'Nombre del Presidente', tipoId: tipoTexto.id, requerido: false, orden: 50 },
    { campo: 'presidenteCedula', titulo: 'Cédula del Presidente', tipoId: tipoTexto.id, requerido: false, orden: 51 },
    { campo: 'presidenteDomicilio', titulo: 'Domicilio del Presidente', tipoId: tipoTexto.id, requerido: false, orden: 52 },
    { campo: 'presidenteTelefono', titulo: 'Teléfono del Presidente', tipoId: tipoTexto.id, requerido: false, orden: 53 },
    { campo: 'presidenteCelular', titulo: 'Celular del Presidente', tipoId: tipoTexto.id, requerido: false, orden: 54 },
    { campo: 'presidenteEmail', titulo: 'Email del Presidente', tipoId: tipoTexto.id, requerido: false, orden: 55 },

    // Persona MORAL - Otros miembros
    { campo: 'vicepresidente', titulo: 'Vicepresidente', tipoId: tipoTexto.id, requerido: false, orden: 56 },
    { campo: 'secretario', titulo: 'Secretario', tipoId: tipoTexto.id, requerido: false, orden: 57 },
    { campo: 'tesorero', titulo: 'Tesorero', tipoId: tipoTexto.id, requerido: false, orden: 58 },
    { campo: 'administrador', titulo: 'Administrador', tipoId: tipoTexto.id, requerido: false, orden: 59 },
    { campo: 'domicilioConsejo', titulo: 'Domicilio del Consejo', tipoId: tipoTexto.id, requerido: false, orden: 60 },
    { campo: 'telefonoConsejo', titulo: 'Teléfono del Consejo', tipoId: tipoTexto.id, requerido: false, orden: 61 },
    { campo: 'fechaConstitucion', titulo: 'Fecha de Constitución', tipoId: tipoFecha.id, requerido: false, orden: 62 },

    // Persona FISICA - Propietario
    { campo: 'nombrePropietario', titulo: 'Nombre del Propietario', tipoId: tipoTexto.id, requerido: false, orden: 70 },
    { campo: 'cedulaPropietario', titulo: 'Cédula del Propietario', tipoId: tipoTexto.id, requerido: false, orden: 71 },
    { campo: 'domicilioPropietario', titulo: 'Domicilio del Propietario', tipoId: tipoTexto.id, requerido: false, orden: 72 },
    { campo: 'telefonoPropietario', titulo: 'Teléfono del Propietario', tipoId: tipoTexto.id, requerido: false, orden: 73 },
    { campo: 'celularPropietario', titulo: 'Celular del Propietario', tipoId: tipoTexto.id, requerido: false, orden: 74 },
    { campo: 'emailPropietario', titulo: 'Email del Propietario', tipoId: tipoTexto.id, requerido: false, orden: 75 },

    // Persona FISICA - Administrador
    { campo: 'nombreAdministrador', titulo: 'Nombre del Administrador', tipoId: tipoTexto.id, requerido: false, orden: 76 },
    { campo: 'cedulaAdministrador', titulo: 'Cédula del Administrador', tipoId: tipoTexto.id, requerido: false, orden: 77 },
    { campo: 'telefonoAdministrador', titulo: 'Teléfono del Administrador', tipoId: tipoTexto.id, requerido: false, orden: 78 },
    { campo: 'fechaInicioActividades', titulo: 'Fecha de Inicio de Actividades', tipoId: tipoFecha.id, requerido: false, orden: 79 },
  ];

  let agregados = 0;
  let omitidos = 0;

  for (const campoData of camposAAgregar) {
    try {
      // Verificar si ya existe
      const existente = await prisma.formularioCampo.findFirst({
        where: {
          productoId: productoIRC.id,
          campo: campoData.campo
        }
      });

      if (existente) {
        console.log(`⏭️  Campo "${campoData.campo}" ya existe, omitiendo...`);
        omitidos++;
        continue;
      }

      // Crear campo
      await prisma.formularioCampo.create({
        data: {
          productoId: productoIRC.id,
          campo: campoData.campo,
          titulo: campoData.titulo,
          tipoId: campoData.tipoId,
          requerido: campoData.requerido,
          orden: campoData.orden,
          activo: true
        }
      });

      console.log(`✅ Campo "${campoData.campo}" agregado`);
      agregados++;
    } catch (error) {
      console.error(`❌ Error agregando campo "${campoData.campo}":`, error);
    }
  }

  console.log(`\n📊 Resumen:`);
  console.log(`   - Campos agregados: ${agregados}`);
  console.log(`   - Campos omitidos (ya existían): ${omitidos}`);
  console.log(`\n✅ Proceso completado`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
