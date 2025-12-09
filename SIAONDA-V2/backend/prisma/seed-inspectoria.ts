import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Inspectoría data...');

  // 1. CATEGORÍAS IRC (IRC-01 a IRC-15) según Resolución 013-2023
  console.log('📋 Seeding Categorías IRC...');

  const categoriasIRC = [
    { codigo: 'IRC-01', nombre: 'Clubes o Tiendas de video juegos', descripcion: 'Clubes o Tiendas de video juegos', precio: 30000 },
    { codigo: 'IRC-02', nombre: 'Importadores y Distribuidores de Audiovisuales', descripcion: 'Importadores y Distribuidores de Audiovisuales', precio: 30000 },
    { codigo: 'IRC-03', nombre: 'Importadores y Distribuidores de Fonogramas', descripcion: 'Importadores y Distribuidores de Fonogramas', precio: 30000 },
    { codigo: 'IRC-04', nombre: 'Importadores, Distribuidores y Fabricantes de Programas de Computadoras o Dispositivos Grabadores Digitales', descripcion: 'Importadores, Distribuidores y Fabricantes de Programas de Computadoras o Dispositivos Grabadores Digitales', precio: 30000 },
    { codigo: 'IRC-05', nombre: 'Importadores, Distribuidores y Fabricantes de Ejemplares de Obras expresadas en forma gráfica (Editoras, Imprentas, etc)', descripcion: 'Importadores, Distribuidores y Fabricantes de Ejemplares de Obras expresadas en forma gráfica (Editoras, Imprentas, etc)', precio: 30000 },
    { codigo: 'IRC-06', nombre: 'Importadores, Distribuidores y Fabricantes de soportes destinados a la fijación o reproducción de Obras protegidas y Fonogramas', descripcion: 'Importadores, Distribuidores y Fabricantes de soportes destinados a la fijación o reproducción de Obras protegidas y Fonogramas', precio: 30000 },
    { codigo: 'IRC-07', nombre: 'Importadores, Fabricantes y Comerciantes o Distribuidores de equipos electrónicos o aparatos señales satelitales', descripcion: 'Importadores, Fabricantes y Comerciantes o Distribuidores de equipos electrónicos o aparatos señales satelitales', precio: 30000 },
    { codigo: 'IRC-08', nombre: 'Galerías de Arte', descripcion: 'Galerías de Arte', precio: 30000 },
    { codigo: 'IRC-08-1', nombre: 'Imp. y Fabricación de Soporte Fonogramas y Videogramas', descripcion: 'Importadores y Fabricación de Soporte Fonogramas y Videogramas', precio: 30000 },
    { codigo: 'IRC-09', nombre: 'Estaciones de Transmisión/Retransmisión abierta por cable, fibra óptica u otro procedimiento análogo', descripcion: 'Estaciones de Transmisión/Retransmisión abierta por cable, fibra óptica u otro procedimiento análogo', precio: 50000 },
    { codigo: 'IRC-10', nombre: 'Estaciones de Radiodifusión Televisiva Abierta', descripcion: 'Estaciones de Radiodifusión Televisiva Abierta', precio: 50000 },
    { codigo: 'IRC-11', nombre: 'Estaciones de Radiodifusión Televisiva Cerrada', descripcion: 'Estaciones de Radiodifusión Televisiva Cerrada', precio: 50000 },
    { codigo: 'IRC-11-1', nombre: 'Canal Perteneciente a las Estaciones de Radiodifusión Televisiva Cerrada', descripcion: 'Canal Perteneciente a las Estaciones de Radiodifusión Televisiva Cerrada', precio: 30000 },
    { codigo: 'IRC-12', nombre: 'Estaciones de Radiodifusión Sonora F.M.', descripcion: 'Estaciones de Radiodifusión Sonora F.M.', precio: 30000 },
    { codigo: 'IRC-13', nombre: 'Estaciones de Radiodifusión Sonora A.M.', descripcion: 'Estaciones de Radiodifusión Sonora A.M.', precio: 30000 },
    { codigo: 'IRC-14', nombre: 'Estaciones de Radiodifusión por Internet', descripcion: 'Estaciones de Radiodifusión por Internet', precio: 10000 },
    { codigo: 'IRC-15', nombre: 'Primer registro de empresa de Telecable (sin operación)', descripcion: 'Primer registro de empresa de Telecable (sin operación)', precio: 10000 },
  ];

  for (const cat of categoriasIRC) {
    await prisma.categoriaIrc.upsert({
      where: { codigo: cat.codigo },
      update: cat,
      create: cat,
    });
  }
  console.log(`✅ Created ${categoriasIRC.length} Categorías IRC`);

  // 2. STATUS DE INSPECCIÓN (mantener de V1)
  console.log('📋 Seeding Status de Inspección...');

  const statusInspeccion = [
    { nombre: 'VISITADA', descripcion: 'Empresa ha sido visitada por inspector' },
    { nombre: 'NO NOTIFICADA', descripcion: 'Empresa aún no ha sido notificada' },
    { nombre: 'NOTIFICACION RENOVACION', descripcion: 'Empresa notificada para renovación anual' },
    { nombre: 'NOTIFICACION', descripcion: 'Empresa ha sido notificada de infracción' },
    { nombre: 'INTIMADA', descripcion: 'Empresa intimada por incumplimiento' },
  ];

  for (const status of statusInspeccion) {
    await prisma.statusInspeccion.upsert({
      where: { nombre: status.nombre },
      update: { descripcion: status.descripcion },
      create: { nombre: status.nombre, descripcion: status.descripcion },
    });
  }
  console.log(`✅ Created ${statusInspeccion.length} Status de Inspección`);

  // 3. ESTADOS JURÍDICOS (mantener de V1)
  console.log('📋 Seeding Estados Jurídicos...');

  const estadosJuridicos = [
    { nombre: 'STATUS OK', descripcion: 'Empresa sin problemas legales' },
    { nombre: 'EMPRESA INTIMADA POR DEP. LEGAL', descripcion: 'Empresa intimada por departamento legal' },
    { nombre: 'EMPRESA REMITIDA DEP. JURIDICO', descripcion: 'Caso remitido a departamento jurídico' },
  ];

  for (const estado of estadosJuridicos) {
    await prisma.estadoJuridico.upsert({
      where: { nombre: estado.nombre },
      update: { descripcion: estado.descripcion },
      create: { nombre: estado.nombre, descripcion: estado.descripcion },
    });
  }
  console.log(`✅ Created ${estadosJuridicos.length} Estados Jurídicos`);

  // 4. CONCLUSIONES (mantener de V1)
  console.log('📋 Seeding Conclusiones...');

  const conclusiones = [
    { nombre: 'VIGENTE', descripcion: 'Registro vigente y al día' },
    { nombre: 'PENDIENTE', descripcion: 'Caso pendiente de resolución' },
    { nombre: 'INACTIVA', descripcion: 'Empresa inactiva' },
    { nombre: 'TRABAJADA', descripcion: 'Caso trabajado/resuelto' },
    { nombre: 'NO CALIFICA', descripcion: 'Empresa no califica para registro' },
    { nombre: 'NO APLICA', descripcion: 'No aplica inspección' },
    { nombre: 'NO EXISTE', descripcion: 'Empresa no existe físicamente' },
  ];

  for (const conclusion of conclusiones) {
    await prisma.conclusion.upsert({
      where: { nombre: conclusion.nombre },
      update: { descripcion: conclusion.descripcion },
      create: { nombre: conclusion.nombre, descripcion: conclusion.descripcion },
    });
  }
  console.log(`✅ Created ${conclusiones.length} Conclusiones`);

  // 5. STATUS EXTERNOS (mantener de V1)
  console.log('📋 Seeding Status Externos...');

  const statusExternos = [
    { nombre: 'AL DIA', descripcion: 'Empresa al día con responsabilidades' },
    { nombre: 'ATRASO EN RESPONSABILIDADES', descripcion: 'Empresa con pagos o trámites atrasados' },
    { nombre: 'EN PROCESO LEGAL', descripcion: 'Empresa en proceso legal' },
    { nombre: 'NO APLICA', descripcion: 'No aplica status externo' },
  ];

  for (const status of statusExternos) {
    await prisma.statusExterno.upsert({
      where: { nombre: status.nombre },
      update: { descripcion: status.descripcion },
      create: { nombre: status.nombre, descripcion: status.descripcion },
    });
  }
  console.log(`✅ Created ${statusExternos.length} Status Externos`);

  // 6. PROVINCIAS DE REPÚBLICA DOMINICANA
  console.log('📋 Seeding Provincias...');

  const provincias = [
    { id: 1, nombre: 'DISTRITO NACIONAL', codigo: 'DN' },
    { id: 2, nombre: 'LA ALTAGRACIA', codigo: 'AG' },
    { id: 3, nombre: 'AZUA', codigo: 'AZ' },
    { id: 4, nombre: 'BAHORUCO', codigo: 'BO' },
    { id: 5, nombre: 'BARAHONA', codigo: 'BA' },
    { id: 6, nombre: 'DAJABON', codigo: 'DJ' },
    { id: 7, nombre: 'DUARTE', codigo: 'DU' },
    { id: 8, nombre: 'EL SEYBO', codigo: 'SY' },
    { id: 9, nombre: 'ELIAS PIÑA', codigo: 'EP' },
    { id: 10, nombre: 'ESPAILLAT', codigo: 'ES' },
    { id: 11, nombre: 'HATO MAYOR', codigo: 'HM' },
    { id: 12, nombre: 'INDEPENDENCIA', codigo: 'IN' },
    { id: 13, nombre: 'LA ROMANA', codigo: 'RO' },
    { id: 14, nombre: 'LA VEGA', codigo: 'VE' },
    { id: 15, nombre: 'MARIA TRINIDAD SANCHEZ', codigo: 'MT' },
    { id: 16, nombre: 'MONSEÑOR NOUEL', codigo: 'MN' },
    { id: 17, nombre: 'MONTECRISTI', codigo: 'MC' },
    { id: 18, nombre: 'MONTE PLATA', codigo: 'MP' },
    { id: 19, nombre: 'PEDERNALES', codigo: 'PD' },
    { id: 20, nombre: 'PERAVIA', codigo: 'PV' },
    { id: 21, nombre: 'PUERTO PLATA', codigo: 'PP' },
    { id: 22, nombre: 'HERMANAS MIRABAL', codigo: 'SA' },
    { id: 23, nombre: 'SAMANA', codigo: 'SM' },
    { id: 24, nombre: 'SAN CRISTOBAL', codigo: 'SC' },
    { id: 25, nombre: 'SAN JUAN', codigo: 'SJ' },
    { id: 26, nombre: 'SAN PEDRO DE MACORIS', codigo: 'PM' },
    { id: 27, nombre: 'SANCHEZ RAMIREZ', codigo: 'SR' },
    { id: 28, nombre: 'SANTIAGO', codigo: 'ST' },
    { id: 29, nombre: 'SANTIAGO RODRIGUEZ', codigo: 'SD' },
    { id: 30, nombre: 'VALVERDE', codigo: 'VA' },
    { id: 31, nombre: 'SAN JOSE DE OCOA', codigo: 'JO' },
    { id: 32, nombre: 'SANTO DOMINGO', codigo: 'SD' },
  ];

  for (const prov of provincias) {
    await prisma.provincia.upsert({
      where: { id: prov.id },
      update: { nombre: prov.nombre, codigo: prov.codigo },
      create: prov,
    });
  }
  console.log(`✅ Created ${provincias.length} Provincias`);

  // 7. ESTADOS DE SOLICITUD DE INSPECCIÓN (FLUJO PR-DI-002)
  console.log('📋 Seeding Estados de Solicitud de Inspección...');

  const estadosSolicitudInspeccion = [
    { nombre: 'PENDIENTE', descripcion: 'Solicitud recibida, pendiente de validación', orden: 1 },
    { nombre: 'VALIDADA', descripcion: 'Documentos validados por Inspectoría', orden: 2 },
    { nombre: 'PAGADA', descripcion: 'Pago recibido en Caja', orden: 3 },
    { nombre: 'ASENTADA', descripcion: 'Número de asiento introducido', orden: 4 },
    { nombre: 'PENDIENTE_FIRMA', descripcion: 'Certificado generado, pendiente de firma', orden: 5 },
    { nombre: 'LISTA_ENTREGA', descripcion: 'Certificado firmado, listo para entrega', orden: 6 },
    { nombre: 'ENTREGADA', descripcion: 'Certificado entregado al cliente', orden: 7 },
    { nombre: 'RECHAZADA', descripcion: 'Solicitud rechazada por documentación incompleta', orden: 99 },
  ];

  for (const estado of estadosSolicitudInspeccion) {
    await prisma.estadoSolicitudInspeccion.upsert({
      where: { nombre: estado.nombre },
      update: { descripcion: estado.descripcion, orden: estado.orden },
      create: { nombre: estado.nombre, descripcion: estado.descripcion, orden: estado.orden },
    });
  }
  console.log(`✅ Created ${estadosSolicitudInspeccion.length} Estados de Solicitud de Inspección`);

  // 8. ESTADOS DE CASO DE INSPECCIÓN (FLUJO PR-DI-001, PR-DI-003, PR-DI-004)
  console.log('📋 Seeding Estados de Caso de Inspección...');

  const estadosCasoInspeccion = [
    { nombre: 'PENDIENTE_ASIGNACION', descripcion: 'Caso creado, pendiente de asignar inspector', orden: 1 },
    { nombre: 'ASIGNADO', descripcion: 'Inspector asignado al caso', orden: 2 },
    { nombre: 'EN_PLAZO_GRACIA', descripcion: 'Empresa notificada, 10 días para corregir', orden: 3 },
    { nombre: 'REACTIVADO', descripcion: 'Caso reactivado después del plazo', orden: 4 },
    { nombre: 'CERRADO', descripcion: 'Caso cerrado/resuelto', orden: 5 },
    { nombre: 'TRAMITADO_JURIDICO', descripcion: 'Caso remitido a Departamento Jurídico', orden: 6 },
  ];

  for (const estado of estadosCasoInspeccion) {
    await prisma.estadoCasoInspeccion.upsert({
      where: { nombre: estado.nombre },
      update: { descripcion: estado.descripcion, orden: estado.orden },
      create: { nombre: estado.nombre, descripcion: estado.descripcion, orden: estado.orden },
    });
  }
  console.log(`✅ Created ${estadosCasoInspeccion.length} Estados de Caso de Inspección`);

  // 9. ESTADOS DE OPERATIVO
  console.log('📋 Seeding Estados de Operativo...');

  const estadosOperativo = [
    { nombre: 'PLANIFICADO', descripcion: 'Operativo planificado' },
    { nombre: 'EN_EJECUCION', descripcion: 'Operativo en ejecución' },
    { nombre: 'COMPLETADO', descripcion: 'Operativo completado' },
    { nombre: 'CANCELADO', descripcion: 'Operativo cancelado' },
  ];

  for (const estado of estadosOperativo) {
    await prisma.estadoOperativo.upsert({
      where: { nombre: estado.nombre },
      update: { descripcion: estado.descripcion },
      create: { nombre: estado.nombre, descripcion: estado.descripcion },
    });
  }
  console.log(`✅ Created ${estadosOperativo.length} Estados de Operativo`);

  // 10. ESTADOS DE VIAJE DE OFICIO
  console.log('📋 Seeding Estados de Viaje de Oficio...');

  const estadosViajeOficio = [
    { nombre: 'ABIERTO', descripcion: 'Viaje en curso' },
    { nombre: 'CERRADO', descripcion: 'Viaje finalizado con informe general' },
    { nombre: 'CANCELADO', descripcion: 'Viaje cancelado' },
  ];

  for (const estado of estadosViajeOficio) {
    await prisma.estadoViajeOficio.upsert({
      where: { nombre: estado.nombre },
      update: { descripcion: estado.descripcion },
      create: { nombre: estado.nombre, descripcion: estado.descripcion },
    });
  }
  console.log(`✅ Created ${estadosViajeOficio.length} Estados de Viaje de Oficio`);

  // 11. ESTADOS DE CASO JURÍDICO
  console.log('📋 Seeding Estados de Caso Jurídico...');

  const estadosCasoJuridico = [
    { nombre: 'RECIBIDO', descripcion: 'Caso recibido desde Inspectoría', orden: 1 },
    { nombre: 'EN_ATENCION', descripcion: 'Caso en atención por el equipo jurídico', orden: 2 },
    { nombre: 'CERRADO', descripcion: 'Caso cerrado', orden: 3 },
  ];

  for (const estado of estadosCasoJuridico) {
    await prisma.estadoCasoJuridico.upsert({
      where: { nombre: estado.nombre },
      update: { descripcion: estado.descripcion, orden: estado.orden },
      create: { nombre: estado.nombre, descripcion: estado.descripcion, orden: estado.orden },
    });
  }
  console.log(`✅ Created ${estadosCasoJuridico.length} Estados de Caso Jurídico`);

  console.log('');
  console.log('✅ Inspectoría seed data completed!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   - ${categoriasIRC.length} Categorías IRC (IRC-01 a IRC-15, incluyendo IRC-08-1 y IRC-11-1)`);
  console.log(`   - ${statusInspeccion.length} Status de Inspección`);
  console.log(`   - ${estadosJuridicos.length} Estados Jurídicos`);
  console.log(`   - ${conclusiones.length} Conclusiones`);
  console.log(`   - ${statusExternos.length} Status Externos`);
  console.log(`   - ${provincias.length} Provincias`);
  console.log(`   - ${estadosSolicitudInspeccion.length} Estados de Solicitud`);
  console.log(`   - ${estadosCasoInspeccion.length} Estados de Caso`);
  console.log(`   - ${estadosOperativo.length} Estados de Operativo`);
  console.log(`   - ${estadosViajeOficio.length} Estados de Viaje de Oficio`);
  console.log(`   - ${estadosCasoJuridico.length} Estados de Caso Jurídico`);
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding Inspectoría data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
