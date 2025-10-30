import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeds...');

  // 1. Estados de Usuario
  console.log('📝 Creando estados de usuario...');
  const estadoActivo = await prisma.usuarioEstado.upsert({
    where: { nombre: 'Activo' },
    update: {},
    create: {
      nombre: 'Activo',
      descripcion: 'Usuario activo en el sistema'
    }
  });

  const estadoInactivo = await prisma.usuarioEstado.upsert({
    where: { nombre: 'Inactivo' },
    update: {},
    create: {
      nombre: 'Inactivo',
      descripcion: 'Usuario inactivo'
    }
  });

  // 2. Tipos de Usuario (14 roles - Réplica de SIAONDA V1)
  console.log('👥 Creando tipos de usuario...');
  const roles = [
    { nombre: 'SUPERUSUARIO', descripcion: 'Acceso total al sistema' },
    { nombre: 'ADMINISTRADOR', descripcion: 'Gestión completa del sistema' },
    { nombre: 'SUPERVISOR', descripcion: 'Supervisión de operaciones' },
    { nombre: 'COORDINADOR', descripcion: 'Coordinación de áreas' },
    { nombre: 'CAJERO', descripcion: 'Manejo de cajas, pagos y facturación' },
    { nombre: 'REGISTRADOR', descripcion: 'Registro de obras y certificados' },
    { nombre: 'CERTIFICADOR', descripcion: 'Emisión de certificados' },
    { nombre: 'DIGITADOR', descripcion: 'Ingreso y digitalización de datos' },
    { nombre: 'FACTURADOR', descripcion: 'Generación de facturas' },
    { nombre: 'ATENCION_USUARIO', descripcion: 'Atención al público y servicio al cliente' },
    { nombre: 'RECEPCION', descripcion: 'Recepción de documentos y clientes' },
    { nombre: 'REGIONAL', descripcion: 'Gestión de sucursales regionales' },
    { nombre: 'CONTABLE', descripcion: 'Revisión contable y reportes financieros' },
    { nombre: 'INSPECTORIA', descripcion: 'Inspección y auditoría' }
  ];

  const tiposUsuario = [];
  for (const rol of roles) {
    const tipo = await prisma.usuarioTipo.upsert({
      where: { nombre: rol.nombre },
      update: {},
      create: rol
    });
    tiposUsuario.push(tipo);
  }

  // 3. Usuario Administrador
  console.log('🔐 Creando usuario administrador...');
  const tipoAdmin = tiposUsuario.find(t => t.nombre === 'ADMINISTRADOR')!;
  const passwordHash = await bcrypt.hash('admin123', 10);

  await prisma.usuario.upsert({
    where: { nombre: 'admin' },
    update: {},
    create: {
      nombre: 'admin',
      contrasena: passwordHash,
      codigo: 'ADM001',
      nombrecompleto: 'Administrador del Sistema',
      correo: 'admin@onda.gob.do',
      tipoId: tipoAdmin.id,
      estadoId: estadoActivo.id
    }
  });

  // 4. Estados de Formulario
  console.log('📋 Creando estados de formulario...');
  const estadosFormulario = [
    { nombre: 'Pendiente', descripcion: 'Formulario pendiente de procesamiento' },
    { nombre: 'Recibido', descripcion: 'Formulario recibido' },
    { nombre: 'En Proceso', descripcion: 'Formulario en proceso' },
    { nombre: 'Asentado', descripcion: 'Formulario asentado' },
    { nombre: 'Certificado', descripcion: 'Formulario certificado' }
  ];

  for (const estado of estadosFormulario) {
    await prisma.formularioEstado.upsert({
      where: { nombre: estado.nombre },
      update: {},
      create: estado
    });
  }

  // 5. Estados de Certificado
  console.log('📜 Creando estados de certificado...');
  const estadosCertificado = [
    { nombre: 'Pendiente', descripcion: 'Certificado pendiente de generación' },
    { nombre: 'Generado', descripcion: 'Certificado generado' },
    { nombre: 'Entregado', descripcion: 'Certificado entregado al cliente' }
  ];

  for (const estado of estadosCertificado) {
    await prisma.certificadoEstado.upsert({
      where: { nombre: estado.nombre },
      update: {},
      create: estado
    });
  }

  // 6. Estados de Factura
  console.log('💰 Creando estados de factura...');
  const estadosFactura = [
    { nombre: 'Pendiente', descripcion: 'Factura pendiente de pago' },
    { nombre: 'Pagada', descripcion: 'Factura pagada completamente' },
    { nombre: 'Anulada', descripcion: 'Factura anulada' }
  ];

  for (const estado of estadosFactura) {
    await prisma.facturaEstado.upsert({
      where: { nombre: estado.nombre },
      update: {},
      create: estado
    });
  }

  // 7. Estados de Caja
  console.log('🏦 Creando estados de caja...');
  const estadosCaja = [
    { nombre: 'Abierta', descripcion: 'Caja abierta y operativa' },
    { nombre: 'Cerrada', descripcion: 'Caja cerrada' },
    { nombre: 'En Proceso', descripcion: 'Caja en proceso de cierre' }
  ];

  for (const estado of estadosCaja) {
    await prisma.cajaEstado.upsert({
      where: { nombre: estado.nombre },
      update: {},
      create: estado
    });
  }

  // 8. Estados de Cierre
  console.log('📊 Creando estados de cierre...');
  const estadosCierre = [
    { nombre: 'En Proceso', descripcion: 'Cierre en proceso' },
    { nombre: 'Completado', descripcion: 'Cierre completado' }
  ];

  for (const estado of estadosCierre) {
    await prisma.cierreEstado.upsert({
      where: { nombre: estado.nombre },
      update: {},
      create: estado
    });
  }

  // 9. Estados de Producto
  console.log('📦 Creando estados de producto...');
  const estadoProductoActivo = await prisma.productoEstado.upsert({
    where: { nombre: 'Activo' },
    update: {},
    create: {
      nombre: 'Activo',
      descripcion: 'Producto activo y disponible'
    }
  });

  // 10. Tipos de Campos de Formulario
  console.log('🔤 Creando tipos de campos...');
  const tiposCampo = [
    { nombre: 'texto', descripcion: 'Campo de texto libre' },
    { nombre: 'numerico', descripcion: 'Campo numérico' },
    { nombre: 'listado', descripcion: 'Lista desplegable' },
    { nombre: 'fecha', descripcion: 'Selector de fecha' },
    { nombre: 'archivo', descripcion: 'Subida de archivo' },
    { nombre: 'checkbox', descripcion: 'Casilla de verificación' },
    { nombre: 'divisor', descripcion: 'Divisor visual' }
  ];

  for (const tipo of tiposCampo) {
    await prisma.formularioCampoTipo.upsert({
      where: { nombre: tipo.nombre },
      update: {},
      create: tipo
    });
  }

  // 11. Productos Básicos (Tipos de Obras)
  console.log('🎨 Creando productos básicos...');
  const productos = [
    { codigo: 'IRC001', nombre: 'Obra Musical', categoria: 'Musical' },
    { codigo: 'IRC002', nombre: 'Obra Literaria', categoria: 'Literaria' },
    { codigo: 'IRC003', nombre: 'Obra Audiovisual', categoria: 'Audiovisual' },
    { codigo: 'IRC004', nombre: 'Obra Fonográfica', categoria: 'Fonografica' },
    { codigo: 'IRC005', nombre: 'Obra Dramática', categoria: 'Dramatica' },
    { codigo: 'IRC006', nombre: 'Obra Plástica', categoria: 'Plastica' },
    { codigo: 'IRC007', nombre: 'Programa/Software', categoria: 'Software' },
    { codigo: 'IRC008', nombre: 'Interpretación', categoria: 'Interpretacion' },
    { codigo: 'IRC009', nombre: 'Radiodifusión', categoria: 'Radiodifusion' },
    { codigo: 'IRC010', nombre: 'Transferencia', categoria: 'Transferencia' },
    { codigo: 'IRC011', nombre: 'Convenio', categoria: 'Convenio' },
    { codigo: 'IRC012', nombre: 'Decisión', categoria: 'Decision' }
  ];

  for (const prod of productos) {
    await prisma.producto.upsert({
      where: { codigo: prod.codigo },
      update: {},
      create: {
        ...prod,
        descripcion: `Registro de ${prod.nombre}`,
        estadoId: estadoProductoActivo.id
      }
    });
  }

  // 12. Tipos de Cliente
  console.log('👤 Creando tipos de cliente...');
  const tiposCliente = [
    { nombre: 'Autor', descripcion: 'Autor de obra' },
    { nombre: 'Compositor', descripcion: 'Compositor musical' },
    { nombre: 'Intérprete', descripcion: 'Intérprete o ejecutante' },
    { nombre: 'Editor', descripcion: 'Editor de obras' },
    { nombre: 'Productor', descripcion: 'Productor' },
    { nombre: 'Solicitante', descripcion: 'Solicitante general' }
  ];

  for (const tipo of tiposCliente) {
    await prisma.clienteTipo.upsert({
      where: { nombre: tipo.nombre },
      update: {},
      create: tipo
    });
  }

  // 13. Nacionalidades
  console.log('🌎 Creando nacionalidades...');
  const nacionalidades = [
    { nombre: 'Dominicana', codigo: 'DO' },
    { nombre: 'Estadounidense', codigo: 'US' },
    { nombre: 'Española', codigo: 'ES' },
    { nombre: 'Mexicana', codigo: 'MX' },
    { nombre: 'Otra', codigo: null }
  ];

  for (const nac of nacionalidades) {
    await prisma.clienteNacionalidad.upsert({
      where: { nombre: nac.nombre },
      update: {},
      create: nac
    });
  }

  console.log('✅ Seeds completados exitosamente!');
  console.log('\n📌 Usuario administrador creado:');
  console.log('   Usuario: admin');
  console.log('   Contraseña: admin123');
  console.log('\n⚠️  IMPORTANTE: Cambia la contraseña en producción!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando seeds:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
