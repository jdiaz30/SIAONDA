import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para limpiar todo lo relacionado con el intento #1 de AaU Formularios
 *
 * QUÉ SE LIMPIA:
 * - FormularioCampo (todos los campos dinámicos creados)
 * - FormularioProductoCampo (valores de campos)
 *
 * QUÉ NO SE TOCA:
 * - Formulario (tabla base - usada por IRC)
 * - FormularioEstado (estados - usados por IRC)
 * - FormularioCliente (relaciones - usadas por IRC)
 * - FormularioArchivo (archivos - usados por IRC)
 * - FormularioProducto (productos en formularios - usado por IRC)
 * - Producto (los 87 productos con precios se mantienen)
 * - ProductoCosto (precios oficiales se mantienen)
 * - Todo lo de Inspectoría/IRC se mantiene intacto
 */

async function main() {
  console.log('🧹 Limpieza de módulo AaU Formularios - Intento #1\n');

  // 1. Limpiar valores de campos (foreign key)
  console.log('🗑️  Eliminando valores de campos dinámicos...');
  const deletedValores = await prisma.formularioProductoCampo.deleteMany({});
  console.log(`   ✅ ${deletedValores.count} valores eliminados`);

  // 2. Limpiar campos dinámicos
  console.log('🗑️  Eliminando campos dinámicos...');
  const deletedCampos = await prisma.formularioCampo.deleteMany({});
  console.log(`   ✅ ${deletedCampos.count} campos eliminados`);

  // 3. Verificar qué se mantiene intacto
  console.log('\n📊 Verificando integridad del sistema...');

  const formularios = await prisma.formulario.count();
  console.log(`   ✅ Formularios (IRC): ${formularios}`);

  const estados = await prisma.formularioEstado.count();
  console.log(`   ✅ Estados de formularios: ${estados}`);

  const productos = await prisma.producto.count();
  console.log(`   ✅ Productos/Obras: ${productos}`);

  const costos = await prisma.productoCosto.count();
  console.log(`   ✅ Costos oficiales: ${costos}`);

  const clientes = await prisma.cliente.count();
  console.log(`   ✅ Clientes/Autores: ${clientes}`);

  const solicitudesIrc = await prisma.solicitudRegistroInspeccion.count();
  console.log(`   ✅ Solicitudes IRC: ${solicitudesIrc}`);

  const empresas = await prisma.empresaInspeccionada.count();
  console.log(`   ✅ Empresas (Inspectoría): ${empresas}`);

  console.log('\n✅ Limpieza completada!');
  console.log('\n📝 Resumen:');
  console.log('   - Campos dinámicos eliminados ✅');
  console.log('   - Sistema de Inspectoría intacto ✅');
  console.log('   - Productos y precios intactos ✅');
  console.log('   - Tabla base de Formularios intacta ✅');
  console.log('\n💡 Ahora puedes reimplementar el módulo de AaU con un enfoque más simple.');
}

main()
  .catch((e) => {
    console.error('❌ Error durante la limpieza:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
