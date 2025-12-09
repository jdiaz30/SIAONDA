import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding categorías IRC...');

  const categorias = [
    {
      codigo: 'IRC-01',
      nombre: 'Clubes o Tiendas de video juegos',
      descripcion: 'Clubes o Tiendas de video juegos',
      precio: 3000.00
    },
    {
      codigo: 'IRC-02',
      nombre: 'Importadores y Distribuidores de Audiovisuales',
      descripcion: 'Importadores y Distribuidores de Audiovisuales',
      precio: 3000.00
    },
    {
      codigo: 'IRC-03',
      nombre: 'Importadores y Distribuidores de Fonogramas',
      descripcion: 'Importadores y Distribuidores de Fonogramas',
      precio: 3000.00
    },
    {
      codigo: 'IRC-04',
      nombre: 'Importadores, Distribuidores y Fabricantes de Programas de Computadoras',
      descripcion: 'Importadores, Distribuidores y Fabricantes de Programas de Computadoras, Software y Videojuegos. Precio varía: Grande 10,000.00; Mediana 5,000.00; Pequeña 3,000.00',
      precio: 10000.00
    },
    {
      codigo: 'IRC-05',
      nombre: 'Importadores, Distribuidores y Fabricantes de Obras expresadas por escrito',
      descripcion: 'Importadores, Distribuidores y Fabricantes de Ejemplares de Obras expresadas por escrito o en forma de Texto. Precio varía: Grande 10,000.00; Mediana 5,000.00; Pequeña 3,000.00',
      precio: 10000.00
    },
    {
      codigo: 'IRC-06',
      nombre: 'Importadores, Distribuidores y Fabricantes de soportes',
      descripcion: 'Importadores, Distribuidores y Fabricantes de soportes destinados a la reproducción de Fonogramas y Obras Audiovisuales',
      precio: 3000.00
    },
    {
      codigo: 'IRC-07',
      nombre: 'Importadores, Fabricantes y Comerciantes de equipos',
      descripcion: 'Importadores, Fabricantes y Comerciantes o Distribuidores de equipos o aparatos destinados a la Reproducción de Fonogramas, Obras Audiovisuales y Transmisión de Señales',
      precio: 15000.00
    },
    {
      codigo: 'IRC-08',
      nombre: 'Galerías de Arte',
      descripcion: 'Galerías de Arte',
      precio: 5000.00
    },
    {
      codigo: 'IRC-09',
      nombre: 'Estaciones de Transmisión/Retransmisión abierta',
      descripcion: 'Estaciones de Transmisión/Retransmisión abierta de Radiodifusión Sonora y Televisiva por Cable, Satélite, Microondas, Internet u otro medio. Precio varía: A) T.N 50,000.00; B) T.R 15,000.00; C) T.P 10,000.00; D) T.M 7,000.00',
      precio: 50000.00
    },
    {
      codigo: 'IRC-10',
      nombre: 'Estaciones de Radiodifusión Televisiva Abierta',
      descripcion: 'Estaciones de Radiodifusión Televisiva Abierta',
      precio: 15000.00
    },
    {
      codigo: 'IRC-11',
      nombre: 'Estaciones de Radiodifusión Televisiva Cerrada',
      descripcion: 'Estaciones de Radiodifusión Televisiva Cerrada',
      precio: 10000.00
    },
    {
      codigo: 'IRC-11-1',
      nombre: 'Canal de Estaciones de Radiodifusión Televisiva Cerrada',
      descripcion: 'Canal perteneciente a las Estaciones de Radiodifusión Televisiva Cerrada',
      precio: 5000.00
    },
    {
      codigo: 'IRC-12',
      nombre: 'Estaciones de Radiodifusión Sonora F.M.',
      descripcion: 'Estaciones de Radiodifusión Sonora F.M.',
      precio: 7500.00
    },
    {
      codigo: 'IRC-13',
      nombre: 'Estaciones de Radiodifusión Sonora A.M.',
      descripcion: 'Estaciones de Radiodifusión Sonora A.M.',
      precio: 5000.00
    },
    {
      codigo: 'IRC-14',
      nombre: 'Estaciones de Radiodifusión por Internet',
      descripcion: 'Estaciones de Radiodifusión por Internet',
      precio: 3000.00
    },
    {
      codigo: 'IRC-15',
      nombre: 'Primer registro de empresa de Telecable',
      descripcion: 'Primer registro de empresa de Telecable (sin operación)',
      precio: 5000.00
    }
  ];

  for (const categoria of categorias) {
    await prisma.categoriaIrc.upsert({
      where: { codigo: categoria.codigo },
      update: {
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        precio: categoria.precio
      },
      create: categoria
    });
    console.log(`✓ Categoría ${categoria.codigo} creada/actualizada`);
  }

  console.log('\n✅ Seed de categorías IRC completado');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
