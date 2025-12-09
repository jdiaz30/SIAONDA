import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding productos/obras con precios oficiales...\n');

  // 1. Obtener o crear estado activo
  const estadoActivo = await prisma.productoEstado.upsert({
    where: { nombre: 'Activo' },
    update: {},
    create: {
      nombre: 'Activo',
      descripcion: 'Producto disponible para registro'
    }
  });

  // ====================================
  // I. OBRAS ARTÍSTICAS
  // ====================================

  console.log('📚 Creando productos de Obras Artísticas...');

  // A. Obras Musicales y Afines
  const musicales = [
    { codigo: 'MUS-01', nombre: 'Obras Musicales, con letra o sin ella', precio: 500.00, categoria: 'Artísticas - Musical' },
    { codigo: 'MUS-02', nombre: 'Arreglo Musical', precio: 500.00, categoria: 'Artísticas - Musical' },
    { codigo: 'MUS-03', nombre: 'Fonograma', precio: 1500.00, categoria: 'Artísticas - Musical' },
    { codigo: 'MUS-04', nombre: 'Interpretaciones o Ejecuciones Musicales', precio: 500.00, categoria: 'Artísticas - Musical' },
    { codigo: 'MUS-05', nombre: 'Emisiones de Radiodifusión', precio: 500.00, categoria: 'Artísticas - Musical' },
  ];

  for (const item of musicales) {
    await prisma.producto.upsert({
      where: { codigo: item.codigo },
      update: { nombre: item.nombre, descripcion: `Registro de ${item.nombre}`, categoria: item.categoria, estadoId: estadoActivo.id },
      create: {
        codigo: item.codigo,
        nombre: item.nombre,
        descripcion: `Registro de ${item.nombre}`,
        categoria: item.categoria,
        estadoId: estadoActivo.id,
        costos: {
          create: {
            precio: item.precio,
            cantidadMin: 1,
            fechaInicio: new Date('2023-01-01')
          }
        }
      }
    });
  }

  // B. Obras Audiovisuales
  const audiovisuales = [
    { codigo: 'AUD-01', nombre: 'Obra Cinematográfica (largo metraje)', precio: 7000.00, categoria: 'Artísticas - Audiovisual' },
    { codigo: 'AUD-02', nombre: 'Obra Cinematográfica (corto metraje)', precio: 5000.00, categoria: 'Artísticas - Audiovisual' },
    { codigo: 'AUD-03', nombre: 'Documental (corto metraje)', precio: 3000.00, categoria: 'Artísticas - Audiovisual' },
    { codigo: 'AUD-04', nombre: 'Documental (largo metraje), Temporada de Serie o Telenovela completa', precio: 4000.00, categoria: 'Artísticas - Audiovisual' },
    { codigo: 'AUD-05', nombre: 'Obras Audiovisuales Análogas al Cine (Capítulo de Serie, Videoclip, Jingle, etc.)', precio: 2000.00, categoria: 'Artísticas - Audiovisual' },
  ];

  for (const item of audiovisuales) {
    await prisma.producto.upsert({
      where: { codigo: item.codigo },
      update: { nombre: item.nombre, descripcion: `Registro de ${item.nombre}`, categoria: item.categoria, estadoId: estadoActivo.id },
      create: {
        codigo: item.codigo,
        nombre: item.nombre,
        descripcion: `Registro de ${item.nombre}`,
        categoria: item.categoria,
        estadoId: estadoActivo.id,
        costos: {
          create: {
            precio: item.precio,
            cantidadMin: 1,
            fechaInicio: new Date('2023-01-01')
          }
        }
      }
    });
  }

  // C. Obras Escénicas
  const escenicas = [
    { codigo: 'ESC-01', nombre: 'Obra de Teatro', precio: 1500.00, categoria: 'Artísticas - Escénica' },
    { codigo: 'ESC-02', nombre: 'Obra de Teatro Musical', precio: 3000.00, categoria: 'Artísticas - Escénica' },
    { codigo: 'ESC-03', nombre: 'Concierto y/o Espectáculo', precio: 1500.00, categoria: 'Artísticas - Escénica' },
    { codigo: 'ESC-04', nombre: 'Escenografía', precio: 1500.00, categoria: 'Artísticas - Escénica' },
    { codigo: 'ESC-05', nombre: 'Obra coreográfica', precio: 1000.00, categoria: 'Artísticas - Escénica' },
    { codigo: 'ESC-06', nombre: 'Monólogo', precio: 1000.00, categoria: 'Artísticas - Escénica' },
    { codigo: 'ESC-07', nombre: 'Pantomima', precio: 1000.00, categoria: 'Artísticas - Escénica' },
  ];

  for (const item of escenicas) {
    await prisma.producto.upsert({
      where: { codigo: item.codigo },
      update: { nombre: item.nombre, descripcion: `Registro de ${item.nombre}`, categoria: item.categoria, estadoId: estadoActivo.id },
      create: {
        codigo: item.codigo,
        nombre: item.nombre,
        descripcion: `Registro de ${item.nombre}`,
        categoria: item.categoria,
        estadoId: estadoActivo.id,
        costos: {
          create: {
            precio: item.precio,
            cantidadMin: 1,
            fechaInicio: new Date('2023-01-01')
          }
        }
      }
    });
  }

  // D. Obras de Artes Visuales (Plásticas o de Bellas Artes y Fotográficas)
  const visuales = [
    { codigo: 'AP-01', nombre: 'Dibujo', precio: 1000.00, categoria: 'Artísticas - Artes Visuales' },
    { codigo: 'AP-02', nombre: 'Fotografía', precio: 1000.00, categoria: 'Artísticas - Artes Visuales' },
    { codigo: 'AP-03', nombre: 'Pintura', precio: 1000.00, categoria: 'Artísticas - Artes Visuales' },
    { codigo: 'AP-04', nombre: 'Escultura', precio: 1000.00, categoria: 'Artísticas - Artes Visuales' },
    { codigo: 'AP-05', nombre: 'Grabado', precio: 500.00, categoria: 'Artísticas - Artes Visuales' },
  ];

  for (const item of visuales) {
    await prisma.producto.upsert({
      where: { codigo: item.codigo },
      update: { nombre: item.nombre, descripcion: `Registro de ${item.nombre}`, categoria: item.categoria, estadoId: estadoActivo.id },
      create: {
        codigo: item.codigo,
        nombre: item.nombre,
        descripcion: `Registro de ${item.nombre}`,
        categoria: item.categoria,
        estadoId: estadoActivo.id,
        costos: {
          create: {
            precio: item.precio,
            cantidadMin: 1,
            fechaInicio: new Date('2023-01-01')
          }
        }
      }
    });
  }

  // E. Obras de Arte Aplicado
  const arteAplicado = [
    { codigo: 'AA-01', nombre: 'Diseño del espacio (Arquitectura de interiores, paisajismo)', precio: 1000.00, categoria: 'Artísticas - Arte Aplicado' },
    { codigo: 'AA-02', nombre: 'Diseño textil (Ropa, vestuarios, accesorios)', precio: 1000.00, categoria: 'Artísticas - Arte Aplicado' },
    { codigo: 'AA-03', nombre: 'Diseño de productos (Mobiliarios y objetos industriales)', precio: 1000.00, categoria: 'Artísticas - Arte Aplicado' },
    { codigo: 'AA-04', nombre: 'Diseño de comunicación (Gráfico, publicidad, multimedia)', precio: 1000.00, categoria: 'Artísticas - Arte Aplicado' },
    { codigo: 'AA-05', nombre: 'Artesanía artística (Cerámica, vitrales)', precio: 1000.00, categoria: 'Artísticas - Arte Aplicado' },
    { codigo: 'AA-06', nombre: 'Artesanía artística (Joyería)', precio: 1000.00, categoria: 'Artísticas - Arte Aplicado' },
    { codigo: 'AA-07', nombre: 'Juego de azar', precio: 5000.00, categoria: 'Artísticas - Arte Aplicado' },
    { codigo: 'AA-08', nombre: 'Otros juegos', precio: 3000.00, categoria: 'Artísticas - Arte Aplicado' },
  ];

  for (const item of arteAplicado) {
    await prisma.producto.upsert({
      where: { codigo: item.codigo },
      update: { nombre: item.nombre, descripcion: `Registro de ${item.nombre}`, categoria: item.categoria, estadoId: estadoActivo.id },
      create: {
        codigo: item.codigo,
        nombre: item.nombre,
        descripcion: `Registro de ${item.nombre}`,
        categoria: item.categoria,
        estadoId: estadoActivo.id,
        costos: {
          create: {
            precio: item.precio,
            cantidadMin: 1,
            fechaInicio: new Date('2023-01-01')
          }
        }
      }
    });
  }

  // ====================================
  // II. OBRAS LITERARIAS
  // ====================================

  console.log('📖 Creando productos de Obras Literarias...');

  const literarias = [
    { codigo: 'LIT-01', nombre: 'Letra para una obra musical', precio: 500.00, categoria: 'Literarias' },
    { codigo: 'LIT-02', nombre: 'Poema', precio: 500.00, categoria: 'Literarias' },
    { codigo: 'LIT-03', nombre: 'Libro', precio: 3000.00, categoria: 'Literarias' },
    { codigo: 'LIT-04', nombre: 'Libro electrónico', precio: 3000.00, categoria: 'Literarias' },
    { codigo: 'LIT-05', nombre: 'Audiolibro', precio: 2000.00, categoria: 'Literarias' },
    { codigo: 'LIT-06', nombre: 'Libro en braille (Para personas con discapacidad visual)', precio: 500.00, categoria: 'Literarias' },
    { codigo: 'LIT-07', nombre: 'Revistas, Folletos, Agendas, Sermones, Novelas, Cuentos, Manuales', precio: 2000.00, categoria: 'Literarias' },
    { codigo: 'LIT-08', nombre: 'Edición obra de dominio público (Por cada Obra Anexa)', precio: 1000.00, categoria: 'Literarias' },
    { codigo: 'LIT-09', nombre: 'Guion Cinematográfico y Documental (largo metraje)', precio: 5000.00, categoria: 'Literarias' },
    { codigo: 'LIT-10', nombre: 'Guion Obras Audiovisuales Análogas al Cine (capítulo, videoclip, etc.)', precio: 1000.00, categoria: 'Literarias' },
    { codigo: 'LIT-11', nombre: 'Sinopsis, Argumento, Escaleta de guion', precio: 1000.00, categoria: 'Literarias' },
    { codigo: 'LIT-12', nombre: 'Guion o Libreto de Humor', precio: 1500.00, categoria: 'Literarias' },
    { codigo: 'LIT-13', nombre: 'Guion para Concierto y/o Espectáculo', precio: 1500.00, categoria: 'Literarias' },
    { codigo: 'LIT-14', nombre: 'Guion para Obra de Teatro', precio: 1500.00, categoria: 'Literarias' },
    { codigo: 'LIT-15', nombre: 'Personaje', precio: 2000.00, categoria: 'Literarias' },
    { codigo: 'LIT-16', nombre: 'Seudónimo de Autor', precio: 1000.00, categoria: 'Literarias' },
    { codigo: 'LIT-17', nombre: 'Tesis, Monográfico o Anteproyecto', precio: 1000.00, categoria: 'Literarias' },
    { codigo: 'LIT-18', nombre: 'Manual taller para estudios universitarios', precio: 3000.00, categoria: 'Literarias' },
    { codigo: 'LIT-19', nombre: 'Guion cinematográfico y documental (corto metraje)', precio: 2000.00, categoria: 'Literarias' },
  ];

  for (const item of literarias) {
    await prisma.producto.upsert({
      where: { codigo: item.codigo },
      update: { nombre: item.nombre, descripcion: `Registro de ${item.nombre}`, categoria: item.categoria, estadoId: estadoActivo.id },
      create: {
        codigo: item.codigo,
        nombre: item.nombre,
        descripcion: `Registro de ${item.nombre}`,
        categoria: item.categoria,
        estadoId: estadoActivo.id,
        costos: {
          create: {
            precio: item.precio,
            cantidadMin: 1,
            fechaInicio: new Date('2023-01-01')
          }
        }
      }
    });
  }

  // ====================================
  // III. OBRAS CIENTÍFICAS
  // ====================================

  console.log('🔬 Creando productos de Obras Científicas...');

  const cientificas = [
    { codigo: 'OC-01', nombre: 'Plano o Proyecto Arquitectónico', precio: 10000.00, categoria: 'Científicas' },
    { codigo: 'OC-02', nombre: 'Plano o Proyecto Arquitectónico de una unidad', precio: 5000.00, categoria: 'Científicas' },
    { codigo: 'OC-03', nombre: 'Obra o Proyecto de Ingeniería', precio: 5000.00, categoria: 'Científicas' },
    { codigo: 'OC-04', nombre: 'Mapas, Croquis u Obras Análogas', precio: 1500.00, categoria: 'Científicas' },
    { codigo: 'OC-05', nombre: 'Proyectos en General', precio: 5000.00, categoria: 'Científicas' },
    { codigo: 'OC-06', nombre: 'Programa Computadora', precio: 10000.00, categoria: 'Científicas' },
    { codigo: 'OC-07', nombre: 'Página Web/Multimedia', precio: 3000.00, categoria: 'Científicas' },
    { codigo: 'OC-08', nombre: 'Base Electrónica de Datos', precio: 2000.00, categoria: 'Científicas' },
  ];

  for (const item of cientificas) {
    await prisma.producto.upsert({
      where: { codigo: item.codigo },
      update: { nombre: item.nombre, descripcion: `Registro de ${item.nombre}`, categoria: item.categoria, estadoId: estadoActivo.id },
      create: {
        codigo: item.codigo,
        nombre: item.nombre,
        descripcion: `Registro de ${item.nombre}`,
        categoria: item.categoria,
        estadoId: estadoActivo.id,
        costos: {
          create: {
            precio: item.precio,
            cantidadMin: 1,
            fechaInicio: new Date('2023-01-01')
          }
        }
      }
    });
  }

  // ====================================
  // IV. COLECCIÓN Y COMPILACIÓN
  // ====================================

  console.log('📦 Creando productos de Colecciones y Compilaciones...');

  const colecciones = [
    { codigo: 'CC-01', nombre: 'Obras Musicales (Impresas o Sonoras)', precio: 3000.00, categoria: 'Colecciones y Compilaciones' },
    { codigo: 'CC-02', nombre: 'Pinturas', precio: 3000.00, categoria: 'Colecciones y Compilaciones' },
    { codigo: 'CC-03', nombre: 'Dibujos', precio: 3000.00, categoria: 'Colecciones y Compilaciones' },
    { codigo: 'CC-04', nombre: 'Fotografías', precio: 3000.00, categoria: 'Colecciones y Compilaciones' },
    { codigo: 'CC-05', nombre: 'Poemas', precio: 3000.00, categoria: 'Colecciones y Compilaciones' },
    { codigo: 'CC-06', nombre: 'Datos, Documentos, Libros o Escritos', precio: 3000.00, categoria: 'Colecciones y Compilaciones' },
    { codigo: 'CC-07', nombre: 'Esculturas', precio: 3000.00, categoria: 'Colecciones y Compilaciones' },
    { codigo: 'CC-08', nombre: 'Grabados', precio: 3000.00, categoria: 'Colecciones y Compilaciones' },
    { codigo: 'CC-09', nombre: 'Diseños del espacio (Arquitectura de Interiores, paisajismo)', precio: 3000.00, categoria: 'Colecciones y Compilaciones' },
    { codigo: 'CC-10', nombre: 'Diseños Textil (Ropas, vestuarios, accesorios)', precio: 3000.00, categoria: 'Colecciones y Compilaciones' },
    { codigo: 'CC-11', nombre: 'Diseños de productos (Mobiliarios y Objetos industriales)', precio: 3000.00, categoria: 'Colecciones y Compilaciones' },
    { codigo: 'CC-12', nombre: 'Diseños de comunicación (Gráfico, Sonoro, Publicidad, Multimedia)', precio: 3000.00, categoria: 'Colecciones y Compilaciones' },
    { codigo: 'CC-13', nombre: 'Artesanía artística (Cerámica, vitrales)', precio: 3000.00, categoria: 'Colecciones y Compilaciones' },
    { codigo: 'CC-14', nombre: 'Artesanías artísticas (joyería)', precio: 13000.00, categoria: 'Colecciones y Compilaciones' },
  ];

  for (const item of colecciones) {
    await prisma.producto.upsert({
      where: { codigo: item.codigo },
      update: { nombre: item.nombre, descripcion: `Registro de ${item.nombre}`, categoria: item.categoria, estadoId: estadoActivo.id },
      create: {
        codigo: item.codigo,
        nombre: item.nombre,
        descripcion: `Registro de ${item.nombre}`,
        categoria: item.categoria,
        estadoId: estadoActivo.id,
        costos: {
          create: {
            precio: item.precio,
            cantidadMin: 1,
            fechaInicio: new Date('2023-01-01')
          }
        }
      }
    });
  }

  // ====================================
  // V. PRODUCCIONES DE OBRAS (6 a 15)
  // ====================================

  console.log('🎬 Creando productos de Producciones de Obras...');

  const producciones = [
    { codigo: 'MUS-01-P', nombre: 'Obras Musicales con letra o sin ella (6-15)', precio: 3000.00, categoria: 'Producciones' },
    { codigo: 'MUS-02-P', nombre: 'Arreglos Musicales (6-15)', precio: 3000.00, categoria: 'Producciones' },
    { codigo: 'LIT-01-P', nombre: 'Letras para obras musicales (6-15)', precio: 3000.00, categoria: 'Producciones' },
    { codigo: 'AP-01-P', nombre: 'Dibujos (6-15)', precio: 3000.00, categoria: 'Producciones' },
    { codigo: 'PRO-05', nombre: 'Personajes (6-15)', precio: 3000.00, categoria: 'Producciones' },
    { codigo: 'AP-02-P', nombre: 'Fotografías (6-15)', precio: 3000.00, categoria: 'Producciones' },
    { codigo: 'LIT-02-P', nombre: 'Poemas (6-15)', precio: 3000.00, categoria: 'Producciones' },
    { codigo: 'AP-03-P', nombre: 'Pinturas (6-15)', precio: 5000.00, categoria: 'Producciones' },
    { codigo: 'AP-04-P', nombre: 'Esculturas (6-15)', precio: 5000.00, categoria: 'Producciones' },
    { codigo: 'AP-05-P', nombre: 'Grabados (6-15)', precio: 3000.00, categoria: 'Producciones' },
    { codigo: 'AA-05-P', nombre: 'Artesanías artísticas (Cerámica, vitrales) (6-15)', precio: 3000.00, categoria: 'Producciones' },
    { codigo: 'AA-06-P', nombre: 'Artesanías artísticas (joyería) (6-15)', precio: 4000.00, categoria: 'Producciones' },
    { codigo: 'PRO-13', nombre: 'Diseños Textil (Ropas, vestuarios, accesorios) (6-15)', precio: 4000.00, categoria: 'Producciones' },
    { codigo: 'MUS-03-P', nombre: 'Fonogramas (6-15)', precio: 6000.00, categoria: 'Producciones' },
    { codigo: 'MUS-04-P', nombre: 'Interpretaciones o Ejecuciones Musicales (6-15)', precio: 3000.00, categoria: 'Producciones' },
  ];

  for (const item of producciones) {
    await prisma.producto.upsert({
      where: { codigo: item.codigo },
      update: { nombre: item.nombre, descripcion: `Registro de ${item.nombre}`, categoria: item.categoria, estadoId: estadoActivo.id },
      create: {
        codigo: item.codigo,
        nombre: item.nombre,
        descripcion: `Registro de ${item.nombre}`,
        categoria: item.categoria,
        estadoId: estadoActivo.id,
        costos: {
          create: {
            precio: item.precio,
            cantidadMin: 1,
            fechaInicio: new Date('2023-01-01')
          }
        }
      }
    });
  }

  console.log('\n✅ Seed de productos/obras completado!');
  console.log(`Total de productos creados: ${musicales.length + audiovisuales.length + escenicas.length + visuales.length + arteAplicado.length + literarias.length + cientificas.length + colecciones.length + producciones.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
