import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding campos dinámicos de formularios...\n');

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
    create: { nombre: 'fecha', descripcion: 'Campo de fecha' }
  });

  const tipoCheckbox = await prisma.formularioCampoTipo.upsert({
    where: { nombre: 'checkbox' },
    update: {},
    create: { nombre: 'checkbox', descripcion: 'Casilla de verificación' }
  });

  const tipoArchivo = await prisma.formularioCampoTipo.upsert({
    where: { nombre: 'archivo' },
    update: {},
    create: { nombre: 'archivo', descripcion: 'Campo de carga de archivo' }
  });

  const tipoListado = await prisma.formularioCampoTipo.upsert({
    where: { nombre: 'listado' },
    update: {},
    create: { nombre: 'listado', descripcion: 'Lista desplegable (select)' }
  });

  console.log('✅ Tipos de campos creados\n');

  // 2. Obtener productos para asociar campos
  const productoMusical = await prisma.producto.findFirst({
    where: { codigo: 'MUS-01' }
  });

  const productoAudiovisual = await prisma.producto.findFirst({
    where: { codigo: 'AUD-01' }
  });

  const productoLiterario = await prisma.producto.findFirst({
    where: { codigo: 'LIT-03' }
  });

  const productoArteVisual = await prisma.producto.findFirst({
    where: { codigo: 'AP-01' }
  });

  const productoCientifico = await prisma.producto.findFirst({
    where: { codigo: 'OC-01' }
  });

  // ================================================
  // CAMPOS PARA OBRAS MUSICALES (MUS-01)
  // ================================================
  if (productoMusical) {
    console.log('🎵 Creando campos para Obras Musicales...');

    const camposMusical = [
      // Título
      {
        productoId: productoMusical.id,
        tipoId: tipoTexto.id,
        campo: 'titulo_obra',
        titulo: 'Título de la obra',
        descripcion: 'Título completo de la obra musical',
        placeholder: 'Ej: Mi canción del corazón',
        requerido: true,
        orden: 1
      },
      // Género musical
      {
        productoId: productoMusical.id,
        tipoId: tipoTexto.id,
        campo: 'genero_musical',
        titulo: 'Género musical',
        descripcion: 'Género o estilo musical',
        placeholder: 'Ej: Merengue, Bachata, Salsa, Pop, Rock',
        requerido: true,
        orden: 2
      },
      // Ritmo/Forma
      {
        productoId: productoMusical.id,
        tipoId: tipoTexto.id,
        campo: 'ritmo_forma',
        titulo: 'Ritmo o forma musical',
        descripcion: 'Ritmo específico de la obra',
        placeholder: 'Ej: 4/4, Vals, Bolero',
        requerido: false,
        orden: 3
      },
      // País de origen
      {
        productoId: productoMusical.id,
        tipoId: tipoTexto.id,
        campo: 'pais_origen',
        titulo: 'País de origen de la obra',
        descripcion: 'País donde se creó la obra',
        placeholder: 'República Dominicana',
        requerido: true,
        orden: 4
      },
      // Año de creación
      {
        productoId: productoMusical.id,
        tipoId: tipoNumerico.id,
        campo: 'ano_creacion',
        titulo: 'Año de creación',
        descripcion: 'Año en que fue creada la obra',
        placeholder: '2024',
        requerido: true,
        orden: 5
      },
      // ¿Ha sido grabada?
      {
        productoId: productoMusical.id,
        tipoId: tipoCheckbox.id,
        campo: 'ha_sido_grabada',
        titulo: '¿Ha sido grabada con fines comerciales?',
        descripcion: 'Marque si la obra ya ha sido grabada',
        requerido: false,
        orden: 6,
        grupo: 'grabacion'
      },
      // Nombre del productor fonográfico
      {
        productoId: productoMusical.id,
        tipoId: tipoTexto.id,
        campo: 'nombre_productor',
        titulo: 'Nombre del productor fonográfico',
        descripcion: 'Solo si la obra ha sido grabada',
        placeholder: 'Nombre de la productora o productor',
        requerido: false,
        orden: 7,
        grupo: 'grabacion'
      },
      // Año de la grabación
      {
        productoId: productoMusical.id,
        tipoId: tipoNumerico.id,
        campo: 'ano_grabacion',
        titulo: 'Año de creación de la grabación',
        descripcion: 'Año en que se realizó la grabación',
        placeholder: '2024',
        requerido: false,
        orden: 8,
        grupo: 'grabacion'
      },
      // Descripción
      {
        productoId: productoMusical.id,
        tipoId: tipoTextarea.id,
        campo: 'descripcion_obra',
        titulo: 'Breve descripción de la obra',
        descripcion: 'Descripción general de la composición musical',
        placeholder: 'Describa brevemente la obra musical, su contenido, mensaje, etc.',
        requerido: true,
        orden: 9
      },
      // Partitura (archivo)
      {
        productoId: productoMusical.id,
        tipoId: tipoArchivo.id,
        campo: 'archivo_partitura',
        titulo: 'Partitura (PDF)',
        descripcion: 'Suba la partitura en formato PDF',
        requerido: false,
        orden: 10
      },
      // Audio (archivo)
      {
        productoId: productoMusical.id,
        tipoId: tipoArchivo.id,
        campo: 'archivo_audio',
        titulo: 'Audio de la obra (MP3, WAV)',
        descripcion: 'Suba el audio de la obra musical',
        requerido: false,
        orden: 11
      },
    ];

    for (const campo of camposMusical) {
      await prisma.formularioCampo.upsert({
        where: {
          productoId_campo: {
            productoId: campo.productoId!,
            campo: campo.campo
          }
        },
        update: campo,
        create: campo
      });
    }

    console.log(`✅ ${camposMusical.length} campos creados para Obras Musicales`);
  }

  // ================================================
  // CAMPOS PARA OBRAS AUDIOVISUALES (AUD-01)
  // ================================================
  if (productoAudiovisual) {
    console.log('🎬 Creando campos para Obras Audiovisuales...');

    const camposAudiovisual = [
      // Título
      {
        productoId: productoAudiovisual.id,
        tipoId: tipoTexto.id,
        campo: 'titulo_obra',
        titulo: 'Título de la obra audiovisual',
        descripcion: 'Título completo',
        placeholder: 'Ej: El sueño de una nación',
        requerido: true,
        orden: 1
      },
      // Director
      {
        productoId: productoAudiovisual.id,
        tipoId: tipoTexto.id,
        campo: 'director',
        titulo: 'Director',
        descripcion: 'Nombre completo del director',
        placeholder: 'Nombre y apellidos',
        requerido: true,
        orden: 2
      },
      // Guionista
      {
        productoId: productoAudiovisual.id,
        tipoId: tipoTexto.id,
        campo: 'guionista',
        titulo: 'Guionista',
        descripcion: 'Nombre completo del guionista',
        placeholder: 'Nombre y apellidos',
        requerido: true,
        orden: 3
      },
      // Compositor música
      {
        productoId: productoAudiovisual.id,
        tipoId: tipoTexto.id,
        campo: 'compositor_musica',
        titulo: 'Compositor de la música',
        descripcion: 'Si aplica',
        placeholder: 'Nombre y apellidos',
        requerido: false,
        orden: 4
      },
      // Intérpretes principales
      {
        productoId: productoAudiovisual.id,
        tipoId: tipoTextarea.id,
        campo: 'interpretes',
        titulo: 'Intérpretes principales',
        descripcion: 'Actores/actrices principales',
        placeholder: 'Liste los nombres separados por comas',
        requerido: false,
        orden: 5
      },
      // Género
      {
        productoId: productoAudiovisual.id,
        tipoId: tipoTexto.id,
        campo: 'genero',
        titulo: 'Género',
        descripcion: 'Género cinematográfico',
        placeholder: 'Drama, Comedia, Acción, Terror, etc.',
        requerido: true,
        orden: 6
      },
      // País de origen
      {
        productoId: productoAudiovisual.id,
        tipoId: tipoTexto.id,
        campo: 'pais_origen',
        titulo: 'País de origen',
        descripcion: 'País de producción',
        placeholder: 'República Dominicana',
        requerido: true,
        orden: 7
      },
      // Fecha de terminación
      {
        productoId: productoAudiovisual.id,
        tipoId: tipoFecha.id,
        campo: 'fecha_terminacion',
        titulo: 'Fecha de terminación o creación',
        descripcion: 'Fecha en que se terminó la obra',
        requerido: true,
        orden: 8
      },
      // Duración
      {
        productoId: productoAudiovisual.id,
        tipoId: tipoTexto.id,
        campo: 'duracion',
        titulo: 'Duración de la obra',
        descripcion: 'Duración en minutos',
        placeholder: 'Ej: 90 minutos',
        requerido: true,
        orden: 9
      },
      // Sinopsis
      {
        productoId: productoAudiovisual.id,
        tipoId: tipoTextarea.id,
        campo: 'sinopsis',
        titulo: 'Breve sinopsis del argumento',
        descripcion: 'Resumen de la historia',
        placeholder: 'Describa brevemente el argumento de la obra',
        requerido: true,
        orden: 10
      },
      // Archivo de video
      {
        productoId: productoAudiovisual.id,
        tipoId: tipoArchivo.id,
        campo: 'archivo_video',
        titulo: 'Archivo de video (MP4, AVI, MOV)',
        descripcion: 'Suba el video de la obra (hasta 15GB)',
        requerido: false,
        orden: 11
      },
    ];

    for (const campo of camposAudiovisual) {
      await prisma.formularioCampo.upsert({
        where: {
          productoId_campo: {
            productoId: campo.productoId!,
            campo: campo.campo
          }
        },
        update: campo,
        create: campo
      });
    }

    console.log(`✅ ${camposAudiovisual.length} campos creados para Obras Audiovisuales`);
  }

  // ================================================
  // CAMPOS PARA OBRAS LITERARIAS (LIT-03)
  // ================================================
  if (productoLiterario) {
    console.log('📚 Creando campos para Obras Literarias...');

    const camposLiterario = [
      // Título
      {
        productoId: productoLiterario.id,
        tipoId: tipoTexto.id,
        campo: 'titulo_obra',
        titulo: 'Título de la obra',
        descripcion: 'Título completo del libro',
        placeholder: 'Ej: Cien años de soledad',
        requerido: true,
        orden: 1
      },
      // Género literario
      {
        productoId: productoLiterario.id,
        tipoId: tipoTexto.id,
        campo: 'genero_literario',
        titulo: 'Género literario',
        descripcion: 'Género de la obra',
        placeholder: 'Novela, Cuento, Poesía, Ensayo, etc.',
        requerido: true,
        orden: 2
      },
      // País de origen
      {
        productoId: productoLiterario.id,
        tipoId: tipoTexto.id,
        campo: 'pais_origen',
        titulo: 'País de origen',
        descripcion: 'País donde se escribió',
        placeholder: 'República Dominicana',
        requerido: true,
        orden: 3
      },
      // Año de creación
      {
        productoId: productoLiterario.id,
        tipoId: tipoNumerico.id,
        campo: 'ano_creacion',
        titulo: 'Año de creación',
        descripcion: 'Año en que se escribió',
        placeholder: '2024',
        requerido: true,
        orden: 4
      },
      // ¿Está publicada?
      {
        productoId: productoLiterario.id,
        tipoId: tipoCheckbox.id,
        campo: 'esta_publicada',
        titulo: '¿La obra está publicada?',
        descripcion: 'Marque si ya fue publicada',
        requerido: false,
        orden: 5,
        grupo: 'publicacion'
      },
      // Fecha de publicación
      {
        productoId: productoLiterario.id,
        tipoId: tipoFecha.id,
        campo: 'fecha_publicacion',
        titulo: 'Fecha de primera publicación',
        descripcion: 'Solo si está publicada',
        requerido: false,
        orden: 6,
        grupo: 'publicacion'
      },
      // Número de edición
      {
        productoId: productoLiterario.id,
        tipoId: tipoNumerico.id,
        campo: 'numero_edicion',
        titulo: 'Número de edición',
        descripcion: 'Solo si está publicada',
        placeholder: '1',
        requerido: false,
        orden: 7,
        grupo: 'publicacion'
      },
      // ISBN
      {
        productoId: productoLiterario.id,
        tipoId: tipoTexto.id,
        campo: 'isbn',
        titulo: 'ISBN',
        descripcion: 'Número ISBN si lo tiene',
        placeholder: '978-0-123456-78-9',
        requerido: false,
        orden: 8,
        grupo: 'publicacion'
      },
      // Descripción
      {
        productoId: productoLiterario.id,
        tipoId: tipoTextarea.id,
        campo: 'descripcion_obra',
        titulo: 'Breve descripción de la obra',
        descripcion: 'Resumen del contenido',
        placeholder: 'Describa brevemente el contenido de la obra literaria',
        requerido: true,
        orden: 9
      },
      // Manuscrito (archivo)
      {
        productoId: productoLiterario.id,
        tipoId: tipoArchivo.id,
        campo: 'archivo_manuscrito',
        titulo: 'Manuscrito o documento (PDF, DOC)',
        descripcion: 'Suba el manuscrito de la obra',
        requerido: false,
        orden: 10
      },
    ];

    for (const campo of camposLiterario) {
      await prisma.formularioCampo.upsert({
        where: {
          productoId_campo: {
            productoId: campo.productoId!,
            campo: campo.campo
          }
        },
        update: campo,
        create: campo
      });
    }

    console.log(`✅ ${camposLiterario.length} campos creados para Obras Literarias`);
  }

  // ================================================
  // CAMPOS PARA ARTES VISUALES (AP-01)
  // ================================================
  if (productoArteVisual) {
    console.log('🎨 Creando campos para Artes Visuales...');

    const camposArteVisual = [
      // Título
      {
        productoId: productoArteVisual.id,
        tipoId: tipoTexto.id,
        campo: 'titulo_obra',
        titulo: 'Título de la obra',
        descripcion: 'Título de la pieza artística',
        placeholder: 'Ej: La noche estrellada',
        requerido: true,
        orden: 1
      },
      // Técnica
      {
        productoId: productoArteVisual.id,
        tipoId: tipoTexto.id,
        campo: 'tecnica',
        titulo: 'Técnica utilizada',
        descripcion: 'Técnica artística empleada',
        placeholder: 'Ej: Óleo sobre lienzo, Acuarela, Grafito',
        requerido: true,
        orden: 2
      },
      // Dimensiones
      {
        productoId: productoArteVisual.id,
        tipoId: tipoTexto.id,
        campo: 'dimensiones',
        titulo: 'Dimensiones',
        descripcion: 'Medidas de la obra',
        placeholder: 'Ej: 100cm x 80cm',
        requerido: false,
        orden: 3
      },
      // Año de creación
      {
        productoId: productoArteVisual.id,
        tipoId: tipoNumerico.id,
        campo: 'ano_creacion',
        titulo: 'Año de creación',
        descripcion: 'Año en que se creó la obra',
        placeholder: '2024',
        requerido: true,
        orden: 4
      },
      // País de origen
      {
        productoId: productoArteVisual.id,
        tipoId: tipoTexto.id,
        campo: 'pais_origen',
        titulo: 'País de origen',
        descripcion: 'País donde se creó',
        placeholder: 'República Dominicana',
        requerido: true,
        orden: 5
      },
      // Descripción
      {
        productoId: productoArteVisual.id,
        tipoId: tipoTextarea.id,
        campo: 'descripcion_obra',
        titulo: 'Breve descripción de la obra',
        descripcion: 'Descripción de la pieza artística',
        placeholder: 'Describa la obra, su significado, inspiración, etc.',
        requerido: true,
        orden: 6
      },
      // Imagen (archivo)
      {
        productoId: productoArteVisual.id,
        tipoId: tipoArchivo.id,
        campo: 'archivo_imagen',
        titulo: 'Imagen de la obra (JPG, PNG)',
        descripcion: 'Fotografía de alta calidad de la obra',
        requerido: false,
        orden: 7
      },
    ];

    for (const campo of camposArteVisual) {
      await prisma.formularioCampo.upsert({
        where: {
          productoId_campo: {
            productoId: campo.productoId!,
            campo: campo.campo
          }
        },
        update: campo,
        create: campo
      });
    }

    console.log(`✅ ${camposArteVisual.length} campos creados para Artes Visuales`);
  }

  // ================================================
  // CAMPOS PARA OBRAS CIENTÍFICAS (OC-01)
  // ================================================
  if (productoCientifico) {
    console.log('🔬 Creando campos para Obras Científicas...');

    const camposCientifico = [
      // Título
      {
        productoId: productoCientifico.id,
        tipoId: tipoTexto.id,
        campo: 'titulo_obra',
        titulo: 'Título del proyecto',
        descripcion: 'Título completo',
        placeholder: 'Ej: Proyecto de vivienda unifamiliar',
        requerido: true,
        orden: 1
      },
      // Tipo de proyecto
      {
        productoId: productoCientifico.id,
        tipoId: tipoTexto.id,
        campo: 'tipo_proyecto',
        titulo: 'Tipo de proyecto',
        descripcion: 'Clasificación del proyecto',
        placeholder: 'Residencial, Comercial, Industrial, etc.',
        requerido: true,
        orden: 2
      },
      // Ubicación
      {
        productoId: productoCientifico.id,
        tipoId: tipoTexto.id,
        campo: 'ubicacion',
        titulo: 'Ubicación del proyecto',
        descripcion: 'Lugar físico del proyecto',
        placeholder: 'Ciudad, sector, coordenadas',
        requerido: false,
        orden: 3
      },
      // Año de creación
      {
        productoId: productoCientifico.id,
        tipoId: tipoNumerico.id,
        campo: 'ano_creacion',
        titulo: 'Año de creación',
        descripcion: 'Año del diseño',
        placeholder: '2024',
        requerido: true,
        orden: 4
      },
      // Descripción técnica
      {
        productoId: productoCientifico.id,
        tipoId: tipoTextarea.id,
        campo: 'descripcion_tecnica',
        titulo: 'Descripción técnica del proyecto',
        descripcion: 'Detalles técnicos relevantes',
        placeholder: 'Describa características técnicas, materiales, especificaciones',
        requerido: true,
        orden: 5
      },
      // Planos (archivo)
      {
        productoId: productoCientifico.id,
        tipoId: tipoArchivo.id,
        campo: 'archivo_planos',
        titulo: 'Planos del proyecto (PDF, DWG, ZIP)',
        descripcion: 'Archivos de planos arquitectónicos',
        requerido: false,
        orden: 6
      },
    ];

    for (const campo of camposCientifico) {
      await prisma.formularioCampo.upsert({
        where: {
          productoId_campo: {
            productoId: campo.productoId!,
            campo: campo.campo
          }
        },
        update: campo,
        create: campo
      });
    }

    console.log(`✅ ${camposCientifico.length} campos creados para Obras Científicas`);
  }

  console.log('\n✅ Seed de campos dinámicos completado!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
