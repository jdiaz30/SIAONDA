import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creando estados de formularios...\n');

  const estados = [
    { nombre: 'Pendiente', descripcion: 'Formulario recién creado, pendiente de validación' },
    { nombre: 'Recibido', descripcion: 'Formulario validado y recibido por el sistema' },
    { nombre: 'Asentado', descripcion: 'Formulario registrado en libro físico' },
    { nombre: 'Devuelto', descripcion: 'Formulario devuelto para correcciones' },
    { nombre: 'Con Certificado', descripcion: 'Certificado generado, listo para entrega' },
    { nombre: 'Entregado', descripcion: 'Certificado entregado al cliente' },
  ];

  for (const estado of estados) {
    await prisma.formularioEstado.upsert({
      where: { nombre: estado.nombre },
      update: { descripcion: estado.descripcion },
      create: estado
    });
    console.log(`✅ Estado creado: ${estado.nombre}`);
  }

  console.log('\n✅ Seed de estados completado!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
