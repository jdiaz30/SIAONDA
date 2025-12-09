import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding TODOS los campos dinámicos de formularios...\n');

  // 1. Crear o verificar tipos de campos
  const tipoTexto = await prisma.formularioCampoTipo.upsert({
    where: { nombre: 'texto' },
    update: {},
    create: { nombre: 'texto', descripcion: 'Campo de texto corto' }
  });

  const tipoTextarea = await prisma.formularioCampoTipo.upsert({
    where: { nombre: 'textarea' },
    update: {},
    create: { nombre: 'textarea', descripcion: 'Campo de texto largo' }
  });

  const tipoNumerico = await prisma.formularioCampoTipo.upsert({
    where: { nombre: 'numerico' },
    update: {},
    create: { nombre: 'numerico', descripcion: 'Campo numérico' }
  });

  const tipoFecha = await prisma.formularioCampoTipo.upsert({
    where: { nombre: 'fecha' },
    update: {},
    create: { nombre: 'fecha', descripcion: 'Selector de fecha' }
  });

  const tipoCheckbox = await prisma.formularioCampoTipo.upsert({
    where: { nombre: 'checkbox' },
    update: {},
    create: { nombre: 'checkbox', descripcion: 'Casilla de verificación' }
  });

  const tipoArchivo = await prisma.formularioCampoTipo.upsert({
    where: { nombre: 'archivo' },
    update: {},
    create: { nombre: 'archivo', descripcion: 'Campo de carga de archivos' }
  });

  const tipoListado = await prisma.formularioCampoTipo.upsert({
    where: { nombre: 'listado' },
    update: {},
    create: { nombre: 'listado', descripcion: 'Lista desplegable' }
  });

  console.log('✅ Tipos de campos creados\n');

  // ====================================
  // I. OBRAS ARTÍSTICAS
  // ====================================

  // A. OBRAS MUSICALES (MUS-01 a MUS-05)
  console.log('🎵 Creando campos para Obras Musicales...');

  const productoMusical = await prisma.producto.findFirst({
    where: { codigo: 'MUS-01' }
  });

  if (productoMusical) {
    const camposMusical = [
      { tipoId: tipoTexto.id, campo: 'titulo_obra', titulo: 'Título de la obra', placeholder: 'Ej: Mi canción del corazón', requerido: true, orden: 1 },
      { tipoId: tipoTexto.id, campo: 'autor_letra', titulo: 'Autor de la letra', placeholder: 'Nombre completo del letrista', requerido: false, orden: 2 },
      { tipoId: tipoTexto.id, campo: 'autor_musica', titulo: 'Autor de la música', placeholder: 'Nombre completo del compositor', requerido: true, orden: 3 },
      { tipoId: tipoListado.id, campo: 'genero_musical', titulo: 'Género musical', requerido: true, orden: 4 },
      { tipoId: tipoTexto.id, campo: 'ritmo_forma', titulo: 'Ritmo o forma musical', placeholder: 'Ej: Bolero, Bachata, Merengue', requerido: false, orden: 5 },
      { tipoId: tipoTexto.id, campo: 'pais_origen', titulo: 'País de origen', placeholder: 'República Dominicana', requerido: true, orden: 6 },
      { tipoId: tipoNumerico.id, campo: 'ano_creacion', titulo: 'Año de creación', placeholder: '2024', requerido: true, orden: 7 },
      { tipoId: tipoCheckbox.id, campo: 'ha_sido_grabada', titulo: '¿Ha sido grabada con fines comerciales?', requerido: false, orden: 8, grupo: 'grabacion' },
      { tipoId: tipoTexto.id, campo: 'nombre_productor', titulo: 'Nombre del productor', placeholder: 'Productor de la grabación', requerido: false, orden: 9, grupo: 'grabacion' },
      { tipoId: tipoNumerico.id, campo: 'ano_grabacion', titulo: 'Año de grabación', placeholder: '2024', requerido: false, orden: 10, grupo: 'grabacion' },
      { tipoId: tipoTextarea.id, campo: 'descripcion_obra', titulo: 'Descripción de la obra', placeholder: 'Breve descripción del contenido', requerido: false, orden: 11 },
      { tipoId: tipoArchivo.id, campo: 'archivo_partitura', titulo: 'Partitura (PDF)', requerido: false, orden: 12 },
      { tipoId: tipoArchivo.id, campo: 'archivo_audio', titulo: 'Archivo de audio (MP3/WAV)', requerido: false, orden: 13 },
    ];

    for (const campo of camposMusical) {
      await prisma.formularioCampo.upsert({
        where: { productoId_campo: { productoId: productoMusical.id, campo: campo.campo } },
        update: campo,
        create: { productoId: productoMusical.id, ...campo }
      });
    }
  }

  // B. OBRAS AUDIOVISUALES (AUD-01 a AUD-05)
  console.log('🎬 Creando campos para Obras Audiovisuales...');

  const productosAudiovisuales = await prisma.producto.findMany({
    where: { codigo: { startsWith: 'AUD-' } }
  });

  for (const producto of productosAudiovisuales) {
    const camposAudiovisual = [
      { tipoId: tipoTexto.id, campo: 'titulo_obra', titulo: 'Título de la obra audiovisual', placeholder: 'Título completo', requerido: true, orden: 1 },
      { tipoId: tipoTexto.id, campo: 'director', titulo: 'Director', placeholder: 'Nombre del director', requerido: true, orden: 2 },
      { tipoId: tipoTexto.id, campo: 'guionista', titulo: 'Guionista', placeholder: 'Autor del guion', requerido: false, orden: 3 },
      { tipoId: tipoTexto.id, campo: 'productora', titulo: 'Casa productora', placeholder: 'Nombre de la productora', requerido: false, orden: 4 },
      { tipoId: tipoTexto.id, campo: 'compositor_musica', titulo: 'Compositor de música original', placeholder: 'Si aplica', requerido: false, orden: 5 },
      { tipoId: tipoTextarea.id, campo: 'interpretes', titulo: 'Intérpretes principales', placeholder: 'Lista de actores principales', requerido: false, orden: 6 },
      { tipoId: tipoListado.id, campo: 'genero', titulo: 'Género', requerido: true, orden: 7 },
      { tipoId: tipoTexto.id, campo: 'pais_origen', titulo: 'País de origen/producción', placeholder: 'República Dominicana', requerido: true, orden: 8 },
      { tipoId: tipoFecha.id, campo: 'fecha_terminacion', titulo: 'Fecha de terminación', requerido: true, orden: 9 },
      { tipoId: tipoTexto.id, campo: 'duracion', titulo: 'Duración', placeholder: 'Ej: 90 minutos', requerido: true, orden: 10 },
      { tipoId: tipoTextarea.id, campo: 'sinopsis', titulo: 'Sinopsis', placeholder: 'Resumen breve del contenido', requerido: true, orden: 11 },
      { tipoId: tipoArchivo.id, campo: 'archivo_video', titulo: 'Soporte material (Video/Enlace)', requerido: false, orden: 12 },
    ];

    for (const campo of camposAudiovisual) {
      await prisma.formularioCampo.upsert({
        where: { productoId_campo: { productoId: producto.id, campo: campo.campo } },
        update: campo,
        create: { productoId: producto.id, ...campo }
      });
    }
  }

  // C. OBRAS ESCÉNICAS (ESC-01 a ESC-07)
  console.log('🎭 Creando campos para Obras Escénicas...');

  const productosEscenicos = await prisma.producto.findMany({
    where: { codigo: { startsWith: 'ESC-' } }
  });

  for (const producto of productosEscenicos) {
    const camposEscenico = [
      { tipoId: tipoTexto.id, campo: 'titulo_obra', titulo: 'Título de la obra escénica', placeholder: 'Título completo', requerido: true, orden: 1 },
      { tipoId: tipoTexto.id, campo: 'autor', titulo: 'Autor', placeholder: 'Autor de la obra', requerido: true, orden: 2 },
      { tipoId: tipoTexto.id, campo: 'director', titulo: 'Director escénico', placeholder: 'Si aplica', requerido: false, orden: 3 },
      { tipoId: tipoTexto.id, campo: 'coreografo', titulo: 'Coreógrafo', placeholder: 'Para obras coreográficas', requerido: false, orden: 4 },
      { tipoId: tipoListado.id, campo: 'genero', titulo: 'Género', requerido: true, orden: 5 },
      { tipoId: tipoTextarea.id, campo: 'descripcion', titulo: 'Descripción de la obra', placeholder: 'Sinopsis o descripción del contenido', requerido: true, orden: 6 },
      { tipoId: tipoFecha.id, campo: 'fecha_creacion', titulo: 'Fecha de creación', requerido: true, orden: 7 },
      { tipoId: tipoTexto.id, campo: 'duracion', titulo: 'Duración aproximada', placeholder: 'Ej: 2 horas', requerido: false, orden: 8 },
      { tipoId: tipoTexto.id, campo: 'pais_origen', titulo: 'País de origen', placeholder: 'República Dominicana', requerido: true, orden: 9 },
      { tipoId: tipoArchivo.id, campo: 'archivo_guion', titulo: 'Guion o libreto (PDF)', requerido: false, orden: 10 },
      { tipoId: tipoArchivo.id, campo: 'archivo_multimedia', titulo: 'Material audiovisual (Opcional)', requerido: false, orden: 11 },
    ];

    for (const campo of camposEscenico) {
      await prisma.formularioCampo.upsert({
        where: { productoId_campo: { productoId: producto.id, campo: campo.campo } },
        update: campo,
        create: { productoId: producto.id, ...campo }
      });
    }
  }

  // D. ARTES VISUALES (AP-01 a AP-05)
  console.log('🎨 Creando campos para Artes Visuales...');

  const productosArtesVisuales = await prisma.producto.findMany({
    where: { codigo: { startsWith: 'AP-' } }
  });

  for (const producto of productosArtesVisuales) {
    const camposArtesVisuales = [
      { tipoId: tipoTexto.id, campo: 'titulo_obra', titulo: 'Título de la obra', placeholder: 'Título o nombre de la obra', requerido: true, orden: 1 },
      { tipoId: tipoTexto.id, campo: 'tecnica', titulo: 'Técnica utilizada', placeholder: 'Ej: Óleo sobre lienzo, Acuarela, Digital', requerido: true, orden: 2 },
      { tipoId: tipoTexto.id, campo: 'dimensiones', titulo: 'Dimensiones', placeholder: 'Ej: 50x70 cm', requerido: false, orden: 3 },
      { tipoId: tipoNumerico.id, campo: 'ano_creacion', titulo: 'Año de creación', placeholder: '2024', requerido: true, orden: 4 },
      { tipoId: tipoTexto.id, campo: 'pais_origen', titulo: 'País de creación', placeholder: 'República Dominicana', requerido: true, orden: 5 },
      { tipoId: tipoTextarea.id, campo: 'descripcion_obra', titulo: 'Descripción de la obra', placeholder: 'Breve descripción del contenido o tema', requerido: false, orden: 6 },
      { tipoId: tipoArchivo.id, campo: 'archivo_imagen', titulo: 'Fotografía de la obra (JPG/PNG)', requerido: true, orden: 7 },
    ];

    for (const campo of camposArtesVisuales) {
      await prisma.formularioCampo.upsert({
        where: { productoId_campo: { productoId: producto.id, campo: campo.campo } },
        update: campo,
        create: { productoId: producto.id, ...campo }
      });
    }
  }

  // E. ARTES APLICADAS (AA-01 a AA-08)
  console.log('🖌️ Creando campos para Artes Aplicadas...');

  const productosArtesAplicadas = await prisma.producto.findMany({
    where: { codigo: { startsWith: 'AA-' } }
  });

  for (const producto of productosArtesAplicadas) {
    const camposArtesAplicadas = [
      { tipoId: tipoTexto.id, campo: 'titulo_obra', titulo: 'Título o nombre del diseño', placeholder: 'Denominación de la obra', requerido: true, orden: 1 },
      { tipoId: tipoListado.id, campo: 'tipo_diseno', titulo: 'Tipo de diseño', requerido: true, orden: 2 },
      { tipoId: tipoTextarea.id, campo: 'descripcion_tecnica', titulo: 'Descripción técnica', placeholder: 'Detalles del diseño, materiales, funcionalidad', requerido: true, orden: 3 },
      { tipoId: tipoTexto.id, campo: 'dimensiones', titulo: 'Dimensiones o especificaciones', placeholder: 'Si aplica', requerido: false, orden: 4 },
      { tipoId: tipoNumerico.id, campo: 'ano_creacion', titulo: 'Año de creación', placeholder: '2024', requerido: true, orden: 5 },
      { tipoId: tipoTexto.id, campo: 'pais_origen', titulo: 'País de origen', placeholder: 'República Dominicana', requerido: true, orden: 6 },
      { tipoId: tipoArchivo.id, campo: 'archivo_diseno', titulo: 'Planos, bocetos o imágenes del diseño', requerido: true, orden: 7 },
    ];

    for (const campo of camposArtesAplicadas) {
      await prisma.formularioCampo.upsert({
        where: { productoId_campo: { productoId: producto.id, campo: campo.campo } },
        update: campo,
        create: { productoId: producto.id, ...campo }
      });
    }
  }

  // ====================================
  // II. OBRAS LITERARIAS (LIT-01 a LIT-19)
  // ====================================

  console.log('📚 Creando campos para Obras Literarias...');

  const productosLiterarios = await prisma.producto.findMany({
    where: { codigo: { startsWith: 'LIT-' } }
  });

  for (const producto of productosLiterarios) {
    const camposLiterarios = [
      { tipoId: tipoTexto.id, campo: 'titulo_obra', titulo: 'Título de la obra', placeholder: 'Título completo', requerido: true, orden: 1 },
      { tipoId: tipoListado.id, campo: 'genero_literario', titulo: 'Género literario', requerido: true, orden: 2 },
      { tipoId: tipoTexto.id, campo: 'pais_origen', titulo: 'País de origen', placeholder: 'República Dominicana', requerido: true, orden: 3 },
      { tipoId: tipoNumerico.id, campo: 'ano_creacion', titulo: 'Año de creación', placeholder: '2024', requerido: true, orden: 4 },
      { tipoId: tipoCheckbox.id, campo: 'esta_publicada', titulo: '¿La obra está publicada?', requerido: false, orden: 5, grupo: 'publicacion' },
      { tipoId: tipoFecha.id, campo: 'fecha_publicacion', titulo: 'Fecha de publicación', requerido: false, orden: 6, grupo: 'publicacion' },
      { tipoId: tipoTexto.id, campo: 'numero_edicion', titulo: 'Número de edición', placeholder: 'Primera edición', requerido: false, orden: 7, grupo: 'publicacion' },
      { tipoId: tipoTexto.id, campo: 'isbn', titulo: 'ISBN', placeholder: 'Si aplica', requerido: false, orden: 8, grupo: 'publicacion' },
      { tipoId: tipoTextarea.id, campo: 'descripcion_obra', titulo: 'Descripción o sinopsis', placeholder: 'Breve resumen del contenido', requerido: false, orden: 9 },
      { tipoId: tipoArchivo.id, campo: 'archivo_manuscrito', titulo: 'Manuscrito o ejemplar (PDF/DOCX)', requerido: false, orden: 10 },
    ];

    for (const campo of camposLiterarios) {
      await prisma.formularioCampo.upsert({
        where: { productoId_campo: { productoId: producto.id, campo: campo.campo } },
        update: campo,
        create: { productoId: producto.id, ...campo }
      });
    }
  }

  // ====================================
  // III. OBRAS CIENTÍFICAS (OC-01 a OC-08)
  // ====================================

  console.log('🔬 Creando campos para Obras Científicas...');

  const productosCientificos = await prisma.producto.findMany({
    where: { codigo: { startsWith: 'OC-' } }
  });

  for (const producto of productosCientificos) {
    const camposCientificos = [
      { tipoId: tipoTexto.id, campo: 'titulo_obra', titulo: 'Título del proyecto u obra', placeholder: 'Denominación completa', requerido: true, orden: 1 },
      { tipoId: tipoListado.id, campo: 'tipo_proyecto', titulo: 'Tipo de proyecto', requerido: true, orden: 2 },
      { tipoId: tipoTexto.id, campo: 'ubicacion', titulo: 'Ubicación del proyecto', placeholder: 'Dirección o coordenadas', requerido: false, orden: 3 },
      { tipoId: tipoNumerico.id, campo: 'ano_creacion', titulo: 'Año de elaboración', placeholder: '2024', requerido: true, orden: 4 },
      { tipoId: tipoTextarea.id, campo: 'descripcion_tecnica', titulo: 'Descripción técnica', placeholder: 'Detalles del proyecto o programa', requerido: true, orden: 5 },
      { tipoId: tipoArchivo.id, campo: 'archivo_planos', titulo: 'Planos, código fuente o documentación técnica', requerido: true, orden: 6 },
    ];

    for (const campo of camposCientificos) {
      await prisma.formularioCampo.upsert({
        where: { productoId_campo: { productoId: producto.id, campo: campo.campo } },
        update: campo,
        create: { productoId: producto.id, ...campo }
      });
    }
  }

  // ====================================
  // IV. COLECCIONES Y COMPILACIONES (CC-01 a CC-14)
  // ====================================

  console.log('📦 Creando campos para Colecciones y Compilaciones...');

  const productosColecciones = await prisma.producto.findMany({
    where: { codigo: { startsWith: 'CC-' } }
  });

  for (const producto of productosColecciones) {
    const camposColecciones = [
      { tipoId: tipoTexto.id, campo: 'titulo_coleccion', titulo: 'Título de la colección', placeholder: 'Nombre de la compilación', requerido: true, orden: 1 },
      { tipoId: tipoTexto.id, campo: 'compilador', titulo: 'Compilador o editor', placeholder: 'Responsable de la compilación', requerido: true, orden: 2 },
      { tipoId: tipoNumerico.id, campo: 'cantidad_obras', titulo: 'Cantidad de obras incluidas', placeholder: 'Número de obras en la colección', requerido: true, orden: 3 },
      { tipoId: tipoTextarea.id, campo: 'listado_obras', titulo: 'Listado de obras incluidas', placeholder: 'Enumere las obras que componen la colección', requerido: true, orden: 4 },
      { tipoId: tipoNumerico.id, campo: 'ano_compilacion', titulo: 'Año de compilación', placeholder: '2024', requerido: true, orden: 5 },
      { tipoId: tipoTextarea.id, campo: 'descripcion', titulo: 'Descripción de la colección', placeholder: 'Criterio de selección y características', requerido: false, orden: 6 },
      { tipoId: tipoArchivo.id, campo: 'archivo_coleccion', titulo: 'Soporte material de la colección', requerido: false, orden: 7 },
    ];

    for (const campo of camposColecciones) {
      await prisma.formularioCampo.upsert({
        where: { productoId_campo: { productoId: producto.id, campo: campo.campo } },
        update: campo,
        create: { productoId: producto.id, ...campo }
      });
    }
  }

  // ====================================
  // V. PRODUCCIONES (PRO-*)
  // ====================================

  console.log('🎬 Creando campos para Producciones...');

  const productosProducciones = await prisma.producto.findMany({
    where: {
      OR: [
        { codigo: { contains: '-P' } },
        { codigo: { startsWith: 'PRO-' } }
      ]
    }
  });

  for (const producto of productosProducciones) {
    const camposProducciones = [
      { tipoId: tipoTexto.id, campo: 'titulo_produccion', titulo: 'Título de la producción', placeholder: 'Nombre del conjunto de obras', requerido: true, orden: 1 },
      { tipoId: tipoNumerico.id, campo: 'cantidad_obras', titulo: 'Cantidad de obras (6-15)', placeholder: 'Entre 6 y 15 obras', requerido: true, orden: 2 },
      { tipoId: tipoTextarea.id, campo: 'listado_obras', titulo: 'Listado de obras', placeholder: 'Enumere cada obra con su título', requerido: true, orden: 3 },
      { tipoId: tipoNumerico.id, campo: 'ano_produccion', titulo: 'Año de producción', placeholder: '2024', requerido: true, orden: 4 },
      { tipoId: tipoTextarea.id, campo: 'descripcion', titulo: 'Descripción general', placeholder: 'Características del conjunto', requerido: false, orden: 5 },
      { tipoId: tipoArchivo.id, campo: 'archivo_produccion', titulo: 'Material de respaldo', requerido: false, orden: 6 },
    ];

    for (const campo of camposProducciones) {
      await prisma.formularioCampo.upsert({
        where: { productoId_campo: { productoId: producto.id, campo: campo.campo } },
        update: campo,
        create: { productoId: producto.id, ...campo }
      });
    }
  }

  console.log('\n✅ Seed de campos completo finalizado!');
  console.log('📊 Total de categorías procesadas: I. Artísticas, II. Literarias, III. Científicas, IV. Colecciones, V. Producciones');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
