import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding campos reales de formularios ONDA...\n');

  // Primero, limpiar valores de campos (foreign key)
  console.log('🗑️  Limpiando valores de campos antiguos...');
  await prisma.formularioProductoCampo.deleteMany({});
  console.log('✅ Valores eliminados');

  // Ahora limpiar los campos
  console.log('🗑️  Limpiando campos antiguos...');
  await prisma.formularioCampo.deleteMany({});
  console.log('✅ Campos antiguos eliminados\n');

  // Obtener tipos de campos
  const tipoTexto = await prisma.formularioCampoTipo.findUnique({ where: { nombre: 'texto' } });
  const tipoTextarea = await prisma.formularioCampoTipo.findUnique({ where: { nombre: 'textarea' } });
  const tipoNumerico = await prisma.formularioCampoTipo.findUnique({ where: { nombre: 'numerico' } });
  const tipoFecha = await prisma.formularioCampoTipo.findUnique({ where: { nombre: 'fecha' } });
  const tipoCheckbox = await prisma.formularioCampoTipo.findUnique({ where: { nombre: 'checkbox' } });
  const tipoRadio = await prisma.formularioCampoTipo.findUnique({ where: { nombre: 'radio' } });
  const tipoListado = await prisma.formularioCampoTipo.findUnique({ where: { nombre: 'listado' } });

  if (!tipoTexto || !tipoTextarea || !tipoNumerico || !tipoFecha) {
    throw new Error('Faltan tipos de campos básicos. Ejecuta primero el seed de tipos.');
  }

  // Crear tipos faltantes si no existen
  const tipoCheckboxFinal = tipoCheckbox || await prisma.formularioCampoTipo.create({
    data: { nombre: 'checkbox', descripcion: 'Casillas de verificación múltiples' }
  });

  const tipoRadioFinal = tipoRadio || await prisma.formularioCampoTipo.create({
    data: { nombre: 'radio', descripcion: 'Opción única (botones de radio)' }
  });

  const tipoListadoFinal = tipoListado || await prisma.formularioCampoTipo.create({
    data: { nombre: 'listado', descripcion: 'Lista desplegable' }
  });

  console.log('✅ Tipos de campos verificados\n');

  // Helper para crear campo con descripción de opciones
  const crearCampo = (productoId: number, campo: string, titulo: string, tipoId: number, opciones?: string[], orden = 0, requerido = false) => {
    return prisma.formularioCampo.create({
      data: {
        productoId,
        campo,
        titulo,
        tipoId,
        descripcion: opciones ? JSON.stringify(opciones) : null,
        orden,
        requerido,
        activo: true
      }
    });
  };

  // ====================================
  // MUS-01 y MUS-02: OBRAS MUSICALES
  // ====================================
  console.log('🎵 Creando campos para Obras Musicales (MUS-01, MUS-02)...');

  const productosMusicales = await prisma.producto.findMany({
    where: { codigo: { in: ['MUS-01', 'MUS-02'] } }
  });

  for (const producto of productosMusicales) {
    await crearCampo(producto.id, 'numero_obras', 'Número de obras a registrar', tipoNumerico.id, undefined, 1, true);
    await crearCampo(producto.id, 'titulo', 'Título de la(s) obra(s)', tipoTextarea.id, undefined, 2, true);
    await crearCampo(producto.id, 'titulo_traduccion', 'Título en caso de traducción al castellano', tipoTextarea.id, undefined, 3, false);
    await crearCampo(producto.id, 'tipo_obra', 'Indique si es', tipoRadioFinal.id, [
      'Obra musical con letra',
      'Obra musical sin letra',
      'Arreglo musical',
      'Otro'
    ], 4, true);
    await crearCampo(producto.id, 'caracter', 'Carácter de la(s) obra(s)', tipoCheckboxFinal.id, [
      'Anónima', 'Colectiva', 'Derivada', 'En colaboración', 'Individual',
      'Originaria', 'Por encargo', 'Seudónima', 'Póstuma', 'Otra'
    ], 5, true);
    await crearCampo(producto.id, 'autor_original', 'Nombre del autor original (si es obra derivada)', tipoTexto.id, undefined, 6, false);
    await crearCampo(producto.id, 'genero_musical', 'Género musical', tipoTexto.id, undefined, 7, false);
    await crearCampo(producto.id, 'ritmo_forma', 'Ritmo/Forma musical', tipoTexto.id, undefined, 8, false);
    await crearCampo(producto.id, 'pais_origen', 'País de origen de la obra', tipoTexto.id, undefined, 9, true);
    await crearCampo(producto.id, 'año_creacion', 'Año de su creación', tipoNumerico.id, undefined, 10, true);
    await crearCampo(producto.id, 'productor_fonografico', 'Nombre del productor fonográfico (si ha sido grabada)', tipoTexto.id, undefined, 11, false);
    await crearCampo(producto.id, 'domicilio_productor', 'Domicilio del productor', tipoTexto.id, undefined, 12, false);
    await crearCampo(producto.id, 'editor_divulgador', 'Nombre del editor o divulgador (si es anónima)', tipoTexto.id, undefined, 13, false);
    await crearCampo(producto.id, 'año_grabacion', 'Año de creación de la grabación', tipoNumerico.id, undefined, 14, false);
    await crearCampo(producto.id, 'descripcion', 'Breve descripción de la obra', tipoTextarea.id, undefined, 99, true);
  }

  // ====================================
  // AUD-01 a AUD-05: OBRAS AUDIOVISUALES
  // ====================================
  console.log('🎬 Creando campos para Obras Audiovisuales (AUD-01 a AUD-05)...');

  const productosAudiovisuales = await prisma.producto.findMany({
    where: { codigo: { in: ['AUD-01', 'AUD-02', 'AUD-03', 'AUD-04', 'AUD-05'] } }
  });

  for (const producto of productosAudiovisuales) {
    await crearCampo(producto.id, 'numero_obras', 'Número de obras a registrar', tipoNumerico.id, undefined, 1, true);
    await crearCampo(producto.id, 'titulo', 'Título de la(s) obra(s)', tipoTextarea.id, undefined, 2, true);
    await crearCampo(producto.id, 'titulo_traduccion', 'Título en caso de traducción', tipoTextarea.id, undefined, 3, false);
    await crearCampo(producto.id, 'tipo', 'Indique si es', tipoCheckboxFinal.id, [
      'Cinematográfica', 'Videoclip', 'Serie', 'Dibujos animados', 'Documental', 'Otro'
    ], 4, true);
    await crearCampo(producto.id, 'genero', 'Género', tipoCheckboxFinal.id, [
      'Acción', 'Educativo', 'Musical', 'Ciencia ficción', 'Aventura',
      'Terror', 'Promoción', 'Romántico', 'Comedia', 'Drama', 'Épico', 'Otro'
    ], 5, true);
    await crearCampo(producto.id, 'categoria', 'Categoría o clasificación', tipoRadioFinal.id, [
      'Cortometraje', 'Mediometraje', 'Largometraje'
    ], 6, false);
    await crearCampo(producto.id, 'fecha_terminacion', 'Fecha de terminación o creación', tipoFecha.id, undefined, 7, true);
    await crearCampo(producto.id, 'fecha_publicacion', 'Fecha de publicación (si aplica)', tipoFecha.id, undefined, 8, false);
    await crearCampo(producto.id, 'pais_origen', 'País de origen de la obra', tipoTexto.id, undefined, 9, true);
    await crearCampo(producto.id, 'duracion', 'Duración de la obra', tipoTexto.id, undefined, 10, true);
    await crearCampo(producto.id, 'sinopsis', 'Breve sinopsis del argumento', tipoTextarea.id, undefined, 11, true);
    await crearCampo(producto.id, 'descripcion', 'Breve descripción de la obra', tipoTextarea.id, undefined, 99, true);
  }

  // ====================================
  // ESC-01 a ESC-07: OBRAS ESCÉNICAS
  // ====================================
  console.log('🎭 Creando campos para Obras Escénicas (ESC-01 a ESC-07)...');

  const productosEscenicos = await prisma.producto.findMany({
    where: { codigo: { in: ['ESC-01', 'ESC-02', 'ESC-03', 'ESC-04', 'ESC-05', 'ESC-06', 'ESC-07'] } }
  });

  for (const producto of productosEscenicos) {
    await crearCampo(producto.id, 'titulo', 'Título o nombre de la(s) obra(s) originales o eventos', tipoTextarea.id, undefined, 1, true);
    await crearCampo(producto.id, 'titulo_traduccion', 'Título en caso de traducción', tipoTextarea.id, undefined, 2, false);
    await crearCampo(producto.id, 'tipo', 'Indique si es', tipoCheckboxFinal.id, [
      'Obra de teatro', 'Obra de teatro musical', 'Obra coreográfica',
      'Pantomima', 'Concierto y/o espectáculo', 'Monólogo', 'Escenografía', 'Otro'
    ], 3, true);
    await crearCampo(producto.id, 'caracter', 'Carácter de la(s) obra(s)', tipoCheckboxFinal.id, [
      'Anónima', 'Colectiva', 'Derivada', 'En colaboración', 'Individual',
      'Originaria', 'Por encargo', 'Seudónima', 'Póstuma', 'Otra'
    ], 4, true);
    await crearCampo(producto.id, 'autor_original', 'Nombre del autor original (si es derivada)', tipoTexto.id, undefined, 5, false);
    await crearCampo(producto.id, 'genero', 'Género', tipoTexto.id, undefined, 6, false);
    await crearCampo(producto.id, 'año_creacion', 'Año de su creación', tipoNumerico.id, undefined, 7, true);
    await crearCampo(producto.id, 'pais_origen', 'País de origen de la obra', tipoTexto.id, undefined, 8, true);
    await crearCampo(producto.id, 'descripcion_escenografia', 'Breve descripción de la escenografía', tipoTextarea.id, undefined, 9, false);
    await crearCampo(producto.id, 'descripcion', 'Breve descripción de la obra', tipoTextarea.id, undefined, 99, true);
  }

  // ====================================
  // AP-01 a AP-05: OBRAS PLÁSTICAS/VISUALES
  // ====================================
  console.log('🎨 Creando campos para Obras Plásticas (AP-01 a AP-05)...');

  const productosPlasticos = await prisma.producto.findMany({
    where: { codigo: { in: ['AP-01', 'AP-02', 'AP-03', 'AP-04', 'AP-05'] } }
  });

  for (const producto of productosPlasticos) {
    await crearCampo(producto.id, 'numero_obras', 'Número de obras a registrar', tipoNumerico.id, undefined, 1, true);
    await crearCampo(producto.id, 'titulo', 'Título de la(s) obra(s)', tipoTextarea.id, undefined, 2, true);
    await crearCampo(producto.id, 'titulo_traduccion', 'Título en caso de traducción', tipoTextarea.id, undefined, 3, false);
    await crearCampo(producto.id, 'tipo', 'Indique si es', tipoCheckboxFinal.id, [
      'Dibujo', 'Pintura', 'Fotografía', 'Escultura', 'Grabado', 'Otro'
    ], 4, true);
    await crearCampo(producto.id, 'caracter', 'Carácter de la(s) obra(s)', tipoCheckboxFinal.id, [
      'Anónima', 'Colectiva', 'Derivada', 'En colaboración', 'Individual',
      'Originaria', 'Por encargo', 'Seudónima', 'Póstuma', 'Otra'
    ], 5, true);
    await crearCampo(producto.id, 'autor_original', 'Nombre del autor original (si es derivada)', tipoTexto.id, undefined, 6, false);
    await crearCampo(producto.id, 'genero', 'Género', tipoTexto.id, undefined, 7, false);
    await crearCampo(producto.id, 'categoria', 'Categoría de la obra', tipoTexto.id, undefined, 8, false);
    await crearCampo(producto.id, 'pais_origen', 'País de origen de la obra', tipoTexto.id, undefined, 9, true);
    await crearCampo(producto.id, 'año_creacion', 'Año de su creación', tipoNumerico.id, undefined, 10, true);
    await crearCampo(producto.id, 'descripcion', 'Breve descripción de la(s) obra(s)', tipoTextarea.id, undefined, 99, true);
  }

  // ====================================
  // AA-01 a AA-08: ARTES APLICADAS
  // ====================================
  console.log('✨ Creando campos para Artes Aplicadas (AA-01 a AA-08)...');

  const productosArteAplicado = await prisma.producto.findMany({
    where: { codigo: { in: ['AA-01', 'AA-02', 'AA-03', 'AA-04', 'AA-05', 'AA-06', 'AA-07', 'AA-08'] } }
  });

  for (const producto of productosArteAplicado) {
    await crearCampo(producto.id, 'numero_obras', 'Número de obras a registrar', tipoNumerico.id, undefined, 1, true);
    await crearCampo(producto.id, 'titulo', 'Título de la(s) obra(s)', tipoTextarea.id, undefined, 2, true);
    await crearCampo(producto.id, 'titulo_traduccion', 'Título en caso de traducción', tipoTextarea.id, undefined, 3, false);
    await crearCampo(producto.id, 'tipo', 'Indique si es', tipoCheckboxFinal.id, [
      'Diseño del espacio (Arquitectura de Interiores o paisajismo)',
      'Diseño Textil (Ropa, vestuarios y accesorios)',
      'Diseño de productos (Mobiliarios y Objetos industriales)',
      'Artesanía artística (Cerámica, joyería y vitrales)',
      'Otro'
    ], 4, true);
    await crearCampo(producto.id, 'caracter', 'Carácter de la(s) obra(s)', tipoCheckboxFinal.id, [
      'Anónima', 'Colectiva', 'Derivada', 'En colaboración', 'Individual',
      'Originaria', 'Por encargo', 'Seudónima', 'Póstuma', 'Otra'
    ], 5, true);
    await crearCampo(producto.id, 'autor_original', 'Nombre del autor original (si es derivada)', tipoTexto.id, undefined, 6, false);
    await crearCampo(producto.id, 'genero', 'Género', tipoTexto.id, undefined, 7, false);
    await crearCampo(producto.id, 'categoria', 'Categoría de la obra', tipoTexto.id, undefined, 8, false);
    await crearCampo(producto.id, 'pais_origen', 'País de origen de la obra', tipoTexto.id, undefined, 9, true);
    await crearCampo(producto.id, 'año_creacion', 'Año de su creación', tipoNumerico.id, undefined, 10, true);
    await crearCampo(producto.id, 'descripcion', 'Breve descripción de la(s) obra(s)', tipoTextarea.id, undefined, 99, true);
  }

  // ====================================
  // LIT-01 a LIT-19: OBRAS LITERARIAS
  // ====================================
  console.log('📚 Creando campos para Obras Literarias (LIT-01 a LIT-19)...');

  const productosLiterarios = await prisma.producto.findMany({
    where: {
      codigo: {
        in: ['LIT-01', 'LIT-02', 'LIT-03', 'LIT-04', 'LIT-05', 'LIT-06',
             'LIT-07', 'LIT-08', 'LIT-09', 'LIT-10', 'LIT-11', 'LIT-12',
             'LIT-13', 'LIT-14', 'LIT-15', 'LIT-16', 'LIT-17', 'LIT-18', 'LIT-19']
      }
    }
  });

  for (const producto of productosLiterarios) {
    await crearCampo(producto.id, 'numero_obras', 'Número de obras a registrar', tipoNumerico.id, undefined, 1, true);
    await crearCampo(producto.id, 'titulo', 'Título de la(s) obra(s)', tipoTextarea.id, undefined, 2, true);
    await crearCampo(producto.id, 'titulo_traduccion', 'Título en caso de traducción', tipoTextarea.id, undefined, 3, false);
    await crearCampo(producto.id, 'tipo', 'Indique si es', tipoCheckboxFinal.id, [
      'Libro', 'Letra para una canción', 'Revista', 'Folleto', 'Agenda', 'Sermón',
      'Conferencia', 'G. cinematográfico', 'G. audiovisuales análogos al cine',
      'Personaje', 'G. o libreto de humor', 'G. obra de teatro', 'G. obra de teatro musical',
      'G. para concierto y/o espectáculo', 'Poema', 'Tesis', 'Libro electrónico',
      'Audiolibro', 'Libro Braille', 'Seudónimo de autor', 'Otro'
    ], 4, true);
    await crearCampo(producto.id, 'caracter', 'Carácter de la(s) obra(s)', tipoCheckboxFinal.id, [
      'Inédita', 'Publicada', 'Originaria', 'Derivada', 'Individual', 'Otra'
    ], 5, true);
    await crearCampo(producto.id, 'autor_original', 'Nombre del autor original (si es derivada)', tipoTexto.id, undefined, 6, false);
    await crearCampo(producto.id, 'tipo_obra_derivada', 'Tipo de obra derivada (si aplica)', tipoCheckboxFinal.id, [
      'Traducción', 'Edición Comentada', 'Adaptación', 'Otra'
    ], 7, false);
    await crearCampo(producto.id, 'genero', 'Género', tipoTexto.id, undefined, 8, false);
    await crearCampo(producto.id, 'categoria', 'Categoría', tipoTexto.id, undefined, 9, false);
    await crearCampo(producto.id, 'pais_origen', 'País de origen de la obra', tipoTexto.id, undefined, 10, true);
    await crearCampo(producto.id, 'año_creacion', 'Año de su creación', tipoNumerico.id, undefined, 11, true);
    await crearCampo(producto.id, 'fecha_primera_publicacion', 'Fecha de la 1ra. publicación (si aplica)', tipoFecha.id, undefined, 12, false);
    await crearCampo(producto.id, 'numero_edicion', 'Número de edición', tipoTexto.id, undefined, 13, false);
    await crearCampo(producto.id, 'año_publicacion', 'Año de publicación (si estuviere editada)', tipoNumerico.id, undefined, 14, false);
    await crearCampo(producto.id, 'cantidad_ejemplares', 'Cantidad de ejemplares en existencia', tipoNumerico.id, undefined, 15, false);
    await crearCampo(producto.id, 'nombre_editor', 'Nombre(s) o razón social del editor', tipoTexto.id, undefined, 16, false);
    await crearCampo(producto.id, 'nacionalidad_editor', 'Nacionalidad del editor', tipoTexto.id, undefined, 17, false);
    await crearCampo(producto.id, 'email_editor', 'Correo electrónico del editor', tipoTexto.id, undefined, 18, false);
    await crearCampo(producto.id, 'telefono_residencial_editor', 'Teléfono residencial del editor', tipoTexto.id, undefined, 19, false);
    await crearCampo(producto.id, 'telefono_movil_editor', 'Teléfono móvil del editor', tipoTexto.id, undefined, 20, false);
    await crearCampo(producto.id, 'documento_editor', 'Documento del editor (Cédula/Pasaporte/RNC)', tipoTexto.id, undefined, 21, false);
    await crearCampo(producto.id, 'descripcion', 'Breve descripción de la(s) obra(s)', tipoTextarea.id, undefined, 99, true);
  }

  // ====================================
  // OC-01 a OC-08: OBRAS CIENTÍFICAS
  // ====================================
  console.log('🔬 Creando campos para Obras Científicas (OC-01 a OC-08)...');

  const productosCientificos = await prisma.producto.findMany({
    where: { codigo: { in: ['OC-01', 'OC-02', 'OC-03', 'OC-04', 'OC-05', 'OC-06', 'OC-07', 'OC-08'] } }
  });

  for (const producto of productosCientificos) {
    await crearCampo(producto.id, 'numero_obras', 'Número de obras a registrar', tipoNumerico.id, undefined, 1, true);
    await crearCampo(producto.id, 'titulo', 'Título de la(s) obra(s)', tipoTextarea.id, undefined, 2, true);
    await crearCampo(producto.id, 'titulo_traduccion', 'Título en caso de traducción', tipoTextarea.id, undefined, 3, false);
    await crearCampo(producto.id, 'tipo', 'Indique si es', tipoCheckboxFinal.id, [
      'Plano o proyecto arquitectónico', 'Mapas', 'Croquis',
      'Obras o proyectos de ingeniería', 'Programa computadora',
      'Base electrónica de datos', 'Página web/multimedia', 'Otro'
    ], 4, true);
    await crearCampo(producto.id, 'caracter', 'Carácter de la(s) obra(s)', tipoCheckboxFinal.id, [
      'Anónima', 'Colectiva', 'Derivada', 'En colaboración', 'Individual',
      'Originaria', 'Por encargo', 'Seudónima', 'Póstuma', 'Otra'
    ], 5, true);
    await crearCampo(producto.id, 'autor_original', 'Nombre del autor original (si es derivada)', tipoTexto.id, undefined, 6, false);
    await crearCampo(producto.id, 'genero', 'Género', tipoTexto.id, undefined, 7, false);
    await crearCampo(producto.id, 'categoria', 'Categoría de la obra', tipoTexto.id, undefined, 8, false);
    await crearCampo(producto.id, 'pais_origen', 'País de origen de la obra', tipoTexto.id, undefined, 9, true);
    await crearCampo(producto.id, 'año_creacion', 'Año de su creación', tipoNumerico.id, undefined, 10, true);
    await crearCampo(producto.id, 'descripcion', 'Breve descripción de la(s) obra(s)', tipoTextarea.id, undefined, 99, true);
  }

  // ====================================
  // CC-01 a CC-14: COLECCIONES Y COMPILACIONES
  // ====================================
  console.log('📦 Creando campos para Colecciones (CC-01 a CC-14)...');

  const productosColecciones = await prisma.producto.findMany({
    where: {
      codigo: {
        in: ['CC-01', 'CC-02', 'CC-03', 'CC-04', 'CC-05', 'CC-06', 'CC-07',
             'CC-08', 'CC-09', 'CC-10', 'CC-11', 'CC-12', 'CC-13', 'CC-14']
      }
    }
  });

  for (const producto of productosColecciones) {
    await crearCampo(producto.id, 'numero_obras', 'Número de obras a registrar', tipoNumerico.id, undefined, 1, true);
    await crearCampo(producto.id, 'titulo', 'Título de la colección o la compilación', tipoTextarea.id, undefined, 2, true);
    await crearCampo(producto.id, 'titulo_traduccion', 'Título en caso de traducción', tipoTextarea.id, undefined, 3, false);
    await crearCampo(producto.id, 'tipo_coleccion', 'Indique si es una colección de', tipoCheckboxFinal.id, [
      'Obra musical con letra o sin ella', 'Pinturas', 'Dibujos', 'Fotografías',
      'Poemas', 'Escritos, libros o textos', 'Otro'
    ], 4, true);
    await crearCampo(producto.id, 'caracter', 'Carácter', tipoCheckboxFinal.id, [
      'Anónima', 'Colectiva', 'En colaboración', 'Individual',
      'Originaria', 'Por encargo', 'Seudónima', 'Póstuma', 'Otra'
    ], 5, true);
    await crearCampo(producto.id, 'pais_origen', 'País de origen de la compilación o colección', tipoTexto.id, undefined, 6, true);
    await crearCampo(producto.id, 'año_creacion', 'Año de su creación', tipoNumerico.id, undefined, 7, true);
    await crearCampo(producto.id, 'autores_incluidos', 'Nombres de los autores de las obras incluidas', tipoTextarea.id, undefined, 8, false);
    await crearCampo(producto.id, 'descripcion', 'Breve descripción de la colección o compilación', tipoTextarea.id, undefined, 99, true);
  }

  // ====================================
  // MUS-03: PRODUCCIÓN DE FONOGRAMAS
  // ====================================
  console.log('💿 Creando campos para Producción de Fonogramas (MUS-03)...');

  const productoFonograma = await prisma.producto.findUnique({
    where: { codigo: 'MUS-03' }
  });

  if (productoFonograma) {
    await crearCampo(productoFonograma.id, 'numero_obras', 'Número de obras a registrar', tipoNumerico.id, undefined, 1, true);
    await crearCampo(productoFonograma.id, 'titulo', 'Título de la producción fonográfica', tipoTextarea.id, undefined, 2, true);
    await crearCampo(productoFonograma.id, 'titulo_traduccion', 'Título si es traducción al castellano', tipoTextarea.id, undefined, 3, false);
    await crearCampo(productoFonograma.id, 'genero', 'Género', tipoTexto.id, undefined, 4, false);
    await crearCampo(productoFonograma.id, 'pais_origen', 'País de origen de la producción fonográfica', tipoTexto.id, undefined, 5, true);
    await crearCampo(productoFonograma.id, 'año_fijacion', 'Año de la fijación', tipoNumerico.id, undefined, 6, true);
    await crearCampo(productoFonograma.id, 'año_primera_publicacion', 'Año de la primera publicación (si aplica)', tipoNumerico.id, undefined, 7, false);
    await crearCampo(productoFonograma.id, 'descripcion', 'Breve descripción de la producción', tipoTextarea.id, undefined, 99, true);
  }

  // ====================================
  // MUS-04: INTERPRETACIONES O EJECUCIONES
  // ====================================
  console.log('🎤 Creando campos para Interpretaciones o Ejecuciones (MUS-04)...');

  const productoInterpretaciones = await prisma.producto.findUnique({
    where: { codigo: 'MUS-04' }
  });

  if (productoInterpretaciones) {
    await crearCampo(productoInterpretaciones.id, 'numero_interpretaciones', 'Número de interpretaciones o ejecuciones a registrar', tipoNumerico.id, undefined, 1, true);
    await crearCampo(productoInterpretaciones.id, 'titulo_obras', 'Título de la(s) obra(s) interpretada(s) o ejecutada(s)', tipoTextarea.id, undefined, 2, true);
    await crearCampo(productoInterpretaciones.id, 'nombre_autor_obra', 'Nombre del autor de la obra', tipoTexto.id, undefined, 3, true);
    await crearCampo(productoInterpretaciones.id, 'genero_musical', 'Género musical o artístico', tipoTexto.id, undefined, 4, false);
    await crearCampo(productoInterpretaciones.id, 'pais_origen', 'País de origen de la interpretación', tipoTexto.id, undefined, 5, true);
    await crearCampo(productoInterpretaciones.id, 'año_interpretacion', 'Año de la interpretación o ejecución', tipoNumerico.id, undefined, 6, true);
    await crearCampo(productoInterpretaciones.id, 'fijada_fonograma', '¿Ha sido fijada en fonograma?', tipoRadioFinal.id, ['Sí', 'No'], 7, true);
    await crearCampo(productoInterpretaciones.id, 'productor_fonografico', 'Nombre del productor fonográfico (si fue fijada)', tipoTexto.id, undefined, 8, false);
    await crearCampo(productoInterpretaciones.id, 'año_fijacion', 'Año de la fijación', tipoNumerico.id, undefined, 9, false);
    await crearCampo(productoInterpretaciones.id, 'descripcion', 'Breve descripción de la interpretación o ejecución', tipoTextarea.id, undefined, 99, true);
  }

  // ====================================
  // MUS-05: EMISIONES DE RADIODIFUSIÓN
  // ====================================
  console.log('📻 Creando campos para Emisiones de Radiodifusión (MUS-05)...');

  const productoEmisiones = await prisma.producto.findUnique({
    where: { codigo: 'MUS-05' }
  });

  if (productoEmisiones) {
    await crearCampo(productoEmisiones.id, 'numero_emisiones', 'Número de emisiones a registrar', tipoNumerico.id, undefined, 1, true);
    await crearCampo(productoEmisiones.id, 'titulo_programa', 'Título o nombre del programa emitido', tipoTextarea.id, undefined, 2, true);
    await crearCampo(productoEmisiones.id, 'tipo_emision', 'Tipo de emisión', tipoRadioFinal.id, [
      'Radio', 'Televisión', 'Por satélite', 'Por cable', 'Por internet', 'Otro'
    ], 3, true);
    await crearCampo(productoEmisiones.id, 'frecuencia_canal', 'Frecuencia o canal', tipoTexto.id, undefined, 4, true);
    await crearCampo(productoEmisiones.id, 'fecha_primera_emision', 'Fecha de la primera emisión', tipoFecha.id, undefined, 5, true);
    await crearCampo(productoEmisiones.id, 'hora_emision', 'Hora de emisión', tipoTexto.id, undefined, 6, false);
    await crearCampo(productoEmisiones.id, 'pais_origen', 'País de origen de la emisión', tipoTexto.id, undefined, 7, true);
    await crearCampo(productoEmisiones.id, 'año_emision', 'Año de la emisión', tipoNumerico.id, undefined, 8, true);
    await crearCampo(productoEmisiones.id, 'duracion_programa', 'Duración del programa', tipoTexto.id, undefined, 9, false);
    await crearCampo(productoEmisiones.id, 'periodicidad', 'Periodicidad', tipoRadioFinal.id, [
      'Diaria', 'Semanal', 'Quincenal', 'Mensual', 'Eventual', 'Otra'
    ], 10, true);
    await crearCampo(productoEmisiones.id, 'contenido_programa', 'Contenido del programa', tipoCheckboxFinal.id, [
      'Noticioso', 'Musical', 'Deportivo', 'Cultural', 'Educativo', 'Entretenimiento', 'Otro'
    ], 11, true);
    await crearCampo(productoEmisiones.id, 'descripcion', 'Breve descripción del programa', tipoTextarea.id, undefined, 99, true);
  }

  console.log('\n✅ Seed de campos reales completado!');

  // Estadísticas
  const totalCampos = await prisma.formularioCampo.count();
  const totalProductos = await prisma.producto.count();
  console.log(`📊 Total de campos creados: ${totalCampos}`);
  console.log(`📊 Total de productos en sistema: ${totalProductos}`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
