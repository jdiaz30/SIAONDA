import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Lista completa de productos oficiales ONDA según Resolución 013-2023
const productosOficiales = [
  // I. Obras Artísticas - A. Obras Musicales y Afines
  { codigo: 'MUS-01', nombre: 'Obras Musicales, con letra o sin ella', categoria: 'Musical', precio: 500.00 },
  { codigo: 'MUS-02', nombre: 'Arreglo Musical', categoria: 'Musical', precio: 500.00 },
  { codigo: 'MUS-03', nombre: 'Fonograma', categoria: 'Musical', precio: 1500.00 },
  { codigo: 'MUS-04', nombre: 'Interpretaciones o Ejecuciones Musicales', categoria: 'Musical', precio: 500.00 },
  { codigo: 'MUS-05', nombre: 'Emisiones de Radiodifusión', categoria: 'Musical', precio: 500.00 },

  // I. Obras Artísticas - B. Obras Audiovisuales
  { codigo: 'AUD-01', nombre: 'Obra Cinematográfica (largo metraje)', categoria: 'Audiovisual', precio: 7000.00 },
  { codigo: 'AUD-02', nombre: 'Obra Cinematográfica (corto metraje)', categoria: 'Audiovisual', precio: 5000.00 },
  { codigo: 'AUD-03', nombre: 'Documental (corto metraje)', categoria: 'Audiovisual', precio: 3000.00 },
  { codigo: 'AUD-04', nombre: 'Documental (largo metraje), Temporada de Serie o Telenovela completa', categoria: 'Audiovisual', precio: 4000.00 },
  { codigo: 'AUD-05', nombre: 'Obras Audiovisuales Análogas al Cine (Capítulo de Serie o de telenovela, Videoclip, Jingle, Promoción, entre otros)', categoria: 'Audiovisual', precio: 2000.00 },

  // I. Obras Artísticas - C. Obras Escénicas
  { codigo: 'ESC-01', nombre: 'Obra de Teatro', categoria: 'Escénica', precio: 1500.00 },
  { codigo: 'ESC-02', nombre: 'Obra de Teatro Musical', categoria: 'Escénica', precio: 3000.00 },
  { codigo: 'ESC-03', nombre: 'Concierto y/o Espectáculo', categoria: 'Escénica', precio: 1500.00 },
  { codigo: 'ESC-04', nombre: 'Escenografía', categoria: 'Escénica', precio: 1500.00 },
  { codigo: 'ESC-05', nombre: 'Obra coreográfica', categoria: 'Escénica', precio: 1000.00 },
  { codigo: 'ESC-06', nombre: 'Monólogo', categoria: 'Escénica', precio: 1000.00 },
  { codigo: 'ESC-07', nombre: 'Pantomima', categoria: 'Escénica', precio: 1000.00 },

  // I. Obras Artísticas - D. Artes Visuales
  { codigo: 'AP-01', nombre: 'Dibujo', categoria: 'Artes Visuales', precio: 1000.00 },
  { codigo: 'AP-02', nombre: 'Fotografía', categoria: 'Artes Visuales', precio: 1000.00 },
  { codigo: 'AP-03', nombre: 'Pintura', categoria: 'Artes Visuales', precio: 1000.00 },
  { codigo: 'AP-04', nombre: 'Escultura', categoria: 'Artes Visuales', precio: 1000.00 },
  { codigo: 'AP-05', nombre: 'Grabado', categoria: 'Artes Visuales', precio: 500.00 },

  // I. Obras Artísticas - E. Arte Aplicado
  { codigo: 'AA-01', nombre: 'Diseño del espacio (Arquitectura de interiores, paisajismo)', categoria: 'Arte Aplicado', precio: 1000.00 },
  { codigo: 'AA-02', nombre: 'Diseño textil (Ropa, vestuarios, accesorios)', categoria: 'Arte Aplicado', precio: 1000.00 },
  { codigo: 'AA-03', nombre: 'Diseño de productos (Mobiliarios y objetos industriales)', categoria: 'Arte Aplicado', precio: 1000.00 },
  { codigo: 'AA-04', nombre: 'Diseño de comunicación (Gráfico, publicidad, multimedia)', categoria: 'Arte Aplicado', precio: 1000.00 },
  { codigo: 'AA-05', nombre: 'Artesanía artística (Cerámica, vitrales)', categoria: 'Arte Aplicado', precio: 1000.00 },
  { codigo: 'AA-06', nombre: 'Artesanía artística (Joyería)', categoria: 'Arte Aplicado', precio: 1000.00 },
  { codigo: 'AA-07', nombre: 'Juego de azar', categoria: 'Arte Aplicado', precio: 5000.00 },
  { codigo: 'AA-08', nombre: 'Otros juegos', categoria: 'Arte Aplicado', precio: 3000.00 },

  // II. Obras Literarias
  { codigo: 'LIT-01', nombre: 'Letra para una obra musical', categoria: 'Literaria', precio: 500.00 },
  { codigo: 'LIT-02', nombre: 'Poema', categoria: 'Literaria', precio: 500.00 },
  { codigo: 'LIT-03', nombre: 'Libro', categoria: 'Literaria', precio: 3000.00 },
  { codigo: 'LIT-04', nombre: 'Libro electrónico', categoria: 'Literaria', precio: 3000.00 },
  { codigo: 'LIT-05', nombre: 'Audiolibro', categoria: 'Literaria', precio: 2000.00 },
  { codigo: 'LIT-06', nombre: 'Libro en braille (Para personas con discapacidad visual)', categoria: 'Literaria', precio: 500.00 },
  { codigo: 'LIT-07', nombre: 'Revistas, Folletos, Agendas, Sermones, Novelas, Cuentos, Manuales, entre otras análogas', categoria: 'Literaria', precio: 2000.00 },
  { codigo: 'LIT-08', nombre: 'Edición obra de dominio público (Por cada Obra Anexa)', categoria: 'Literaria', precio: 1000.00 },
  { codigo: 'LIT-09', nombre: 'Guion Cinematográfico y Documental (largo metraje)', categoria: 'Literaria', precio: 5000.00 },
  { codigo: 'LIT-10', nombre: 'Guion Obras Audiovisuales Análogas al Cine (capítulo de una Serie o Telenovela, Videoclip, Jingle, Promoción, entre otros)', categoria: 'Literaria', precio: 1000.00 },
  { codigo: 'LIT-11', nombre: 'Sinopsis, Argumento, Escaleta de guion', categoria: 'Literaria', precio: 1000.00 },
  { codigo: 'LIT-12', nombre: 'Guion o Libreto de Humor', categoria: 'Literaria', precio: 1500.00 },
  { codigo: 'LIT-13', nombre: 'Guion para Concierto y/o Espectáculo', categoria: 'Literaria', precio: 1500.00 },
  { codigo: 'LIT-14', nombre: 'Guion para Obra de Teatro', categoria: 'Literaria', precio: 1500.00 },
  { codigo: 'LIT-15', nombre: 'Personaje', categoria: 'Literaria', precio: 2000.00 },
  { codigo: 'LIT-16', nombre: 'Seudónimo de Autor', categoria: 'Literaria', precio: 1000.00 },
  { codigo: 'LIT-17', nombre: 'Tesis, Monográfico o Anteproyecto', categoria: 'Literaria', precio: 1000.00 },
  { codigo: 'LIT-18', nombre: 'Manual taller para estudios universitarios', categoria: 'Literaria', precio: 3000.00 },
  { codigo: 'LIT-19', nombre: 'Guion cinematográfico y documental (corto metraje)', categoria: 'Literaria', precio: 2000.00 },

  // III. Obras Científicas
  { codigo: 'OC-01', nombre: 'Plano o Proyecto Arquitectónico', categoria: 'Científica', precio: 10000.00 },
  { codigo: 'OC-02', nombre: 'Plano o Proyecto Arquitectónico de una unidad', categoria: 'Científica', precio: 5000.00 },
  { codigo: 'OC-03', nombre: 'Obra o Proyecto de Ingeniería', categoria: 'Científica', precio: 5000.00 },
  { codigo: 'OC-04', nombre: 'Mapas, Croquis u Obras Análogas', categoria: 'Científica', precio: 1500.00 },
  { codigo: 'OC-05', nombre: 'Proyectos en General', categoria: 'Científica', precio: 5000.00 },
  { codigo: 'OC-06', nombre: 'Programa Computadora', categoria: 'Científica', precio: 10000.00 },
  { codigo: 'OC-07', nombre: 'Página Web/Multimedia', categoria: 'Científica', precio: 3000.00 },
  { codigo: 'OC-08', nombre: 'Base Electrónica de Datos', categoria: 'Científica', precio: 2000.00 },

  // IV. Colección y Compilación
  { codigo: 'CC-01', nombre: 'Obras Musicales (Impresas o Sonoras)', categoria: 'Colección', precio: 3000.00 },
  { codigo: 'CC-02', nombre: 'Pinturas', categoria: 'Colección', precio: 3000.00 },
  { codigo: 'CC-03', nombre: 'Dibujos', categoria: 'Colección', precio: 3000.00 },
  { codigo: 'CC-04', nombre: 'Fotografías', categoria: 'Colección', precio: 3000.00 },
  { codigo: 'CC-05', nombre: 'Poemas', categoria: 'Colección', precio: 3000.00 },
  { codigo: 'CC-06', nombre: 'Datos, Documentos, Libros o Escritos', categoria: 'Colección', precio: 3000.00 },
  { codigo: 'CC-07', nombre: 'Esculturas', categoria: 'Colección', precio: 3000.00 },
  { codigo: 'CC-08', nombre: 'Grabados', categoria: 'Colección', precio: 3000.00 },
  { codigo: 'CC-09', nombre: 'Diseños del espacio (Arquitectura de Interiores, paisajismo)', categoria: 'Colección', precio: 3000.00 },
  { codigo: 'CC-10', nombre: 'Diseños Textil (Ropas, vestuarios, accesorios)', categoria: 'Colección', precio: 3000.00 },
  { codigo: 'CC-11', nombre: 'Diseños de productos (Mobiliarios y Objetos industriales)', categoria: 'Colección', precio: 3000.00 },
  { codigo: 'CC-12', nombre: 'Diseños de comunicación (Gráfico, Sonoro, Publicidad, Multimedia)', categoria: 'Colección', precio: 3000.00 },
  { codigo: 'CC-13', nombre: 'Artesanía artística (Cerámica, vitrales)', categoria: 'Colección', precio: 3000.00 },
  { codigo: 'CC-14', nombre: 'Artesanías artísticas (joyería)', categoria: 'Colección', precio: 13000.00 },

  // V. Producciones (6-15)
  { codigo: 'MUS-01-P', nombre: 'Obras Musicales con letra o sin ella (6-15)', categoria: 'Producción', precio: 3000.00 },
  { codigo: 'MUS-02-P', nombre: 'Arreglos Musicales (6-15)', categoria: 'Producción', precio: 3000.00 },
  { codigo: 'MUS-03-P', nombre: 'Fonogramas (6-15)', categoria: 'Producción', precio: 6000.00 },
  { codigo: 'MUS-04-P', nombre: 'Interpretaciones o Ejecuciones Musicales (6-15)', categoria: 'Producción', precio: 3000.00 },
  { codigo: 'LIT-01-P', nombre: 'Letras para obras musicales (6-15)', categoria: 'Producción', precio: 3000.00 },
  { codigo: 'LIT-02-P', nombre: 'Poemas (6-15)', categoria: 'Producción', precio: 3000.00 },
  { codigo: 'AP-01-P', nombre: 'Dibujos (6-15)', categoria: 'Producción', precio: 3000.00 },
  { codigo: 'AP-02-P', nombre: 'Fotografías (6-15)', categoria: 'Producción', precio: 3000.00 },
  { codigo: 'AP-03-P', nombre: 'Pinturas (6-15)', categoria: 'Producción', precio: 5000.00 },
  { codigo: 'AP-04-P', nombre: 'Esculturas (6-15)', categoria: 'Producción', precio: 5000.00 },
  { codigo: 'AP-05-P', nombre: 'Grabados (6-15)', categoria: 'Producción', precio: 3000.00 },
  { codigo: 'AA-05-P', nombre: 'Artesanías artísticas (Cerámica, vitrales) (6-15)', categoria: 'Producción', precio: 3000.00 },
  { codigo: 'AA-06-P', nombre: 'Artesanías artísticas (joyería) (6-15)', categoria: 'Producción', precio: 4000.00 },
  { codigo: 'PRO-05', nombre: 'Personajes (6-15)', categoria: 'Producción', precio: 3000.00 },
  { codigo: 'PRO-13', nombre: 'Diseños Textil (Ropas, vestuarios, accesorios) (6-15)', categoria: 'Producción', precio: 4000.00 },

  // VI. Actos o Contratos
  { codigo: 'AC-01', nombre: 'Actos o Contratos que transfieren derechos patrimoniales (Sin valores envueltos) hasta RD$200,000', categoria: 'Contrato', precio: 2000.00 },
  { codigo: 'AC-03', nombre: 'Convenios o Contratos de Sociedades de Gestión Colectiva con similares extranjeras', categoria: 'Contrato', precio: 10000.00 },
  { codigo: 'AC-04', nombre: 'Inscripción de decisión judicial, administrativa o arbitraje en materia de derecho de autor', categoria: 'Contrato', precio: 2000.00 },
  { codigo: 'AC-05', nombre: 'Cancelaciones, Adiciones o Modificaciones de las inscripciones efectuadas', categoria: 'Contrato', precio: 2000.00 },
  { codigo: 'AC-06', nombre: 'Certificaciones Generales', categoria: 'Contrato', precio: 1000.00 },
  { codigo: 'AC-07', nombre: 'Copias simples por páginas (1 a 10 hojas) y las demás RD$5.00 c/u', categoria: 'Contrato', precio: 100.00 },
  { codigo: 'SONDA055', nombre: 'Solicitud duplicada de Certificado', categoria: 'Contrato', precio: 1000.00 },

  // VII. Consulta Técnica
  { codigo: 'CTS-01', nombre: 'Consulta Técnica Escrita', categoria: 'Servicios', precio: 3000.00 },
  { codigo: 'CTS-02', nombre: 'Inspección (Distrito Nacional, Provincia Santo Domingo y Santiago en sus zonas aledañas en un rango de 40 km o menos)', categoria: 'Servicios', precio: 5000.00 },
  { codigo: 'CTS-03', nombre: 'Inspección (Interior del país, excepto Santiago y sus zonas aledañas en un rango de 40 km o menos)', categoria: 'Servicios', precio: 8000.00 },
  { codigo: 'CTS-04', nombre: 'Solicitud de Conciliación, Mediación y Arbitraje', categoria: 'Servicios', precio: 4500.00 },
  { codigo: 'CTS-05', nombre: 'Solicitud de Medida Cautelar, Aplazamientos o Notificaciones de Citación (D.N. y Prov. Santo Domingo)', categoria: 'Servicios', precio: 4500.00 },
  { codigo: 'CTS-06', nombre: 'Solicitud de Medida Cautelar, Aplazamientos o Notificaciones de Citación (Interior del País)', categoria: 'Servicios', precio: 6000.00 },

  // VIII. Sociedades de Gestión
  { codigo: 'ISG-01', nombre: 'Solicitud de incorporación de Sociedades de Gestión Colectiva', categoria: 'Gestión', precio: 10000.00 },
  { codigo: 'ISG-02', nombre: 'Homologación de aprobación de Sociedades de Gestión Colectiva', categoria: 'Gestión', precio: 40000.00 },

  // IX. Inspectoría (IRC)
  { codigo: 'IRC-01', nombre: 'Clubes o Tiendas de video juegos', categoria: 'Inspectoría', precio: 3000.00 },
  { codigo: 'IRC-02', nombre: 'Importadores y Distribuidores de Audiovisuales', categoria: 'Inspectoría', precio: 3000.00 },
  { codigo: 'IRC-03', nombre: 'Importadores y Distribuidores de Fonogramas', categoria: 'Inspectoría', precio: 3000.00 },
  { codigo: 'IRC-04', nombre: 'Importadores, Distribuidores y Fabricantes de Programas de Computadoras o Dispositivos Grabadores Digitales (Grande)', categoria: 'Inspectoría', precio: 10000.00 },
  { codigo: 'IRC-04-M', nombre: 'Importadores, Distribuidores y Fabricantes de Programas de Computadoras o Dispositivos Grabadores Digitales (Mediana)', categoria: 'Inspectoría', precio: 5000.00 },
  { codigo: 'IRC-04-P', nombre: 'Importadores, Distribuidores y Fabricantes de Programas de Computadoras o Dispositivos Grabadores Digitales (Pequeña)', categoria: 'Inspectoría', precio: 3000.00 },
  { codigo: 'IRC-05', nombre: 'Importadores, Distribuidores y Fabricantes de Ejemplares de Obras expresadas en forma gráfica (Editoras, Imprentas, etc.) (Grande)', categoria: 'Inspectoría', precio: 10000.00 },
  { codigo: 'IRC-05-M', nombre: 'Importadores, Distribuidores y Fabricantes de Ejemplares de Obras expresadas en forma gráfica (Editoras, Imprentas, etc.) (Mediana)', categoria: 'Inspectoría', precio: 5000.00 },
  { codigo: 'IRC-05-P', nombre: 'Importadores, Distribuidores y Fabricantes de Ejemplares de Obras expresadas en forma gráfica (Editoras, Imprentas, etc.) (Pequeña)', categoria: 'Inspectoría', precio: 3000.00 },
  { codigo: 'IRC-06', nombre: 'Importadores, Distribuidores y Fabricantes de soportes destinados a la fijación o reproducción de Obras protegidas y Fonogramas', categoria: 'Inspectoría', precio: 3000.00 },
  { codigo: 'IRC-07', nombre: 'Importadores, Fabricantes y Comerciantes o Distribuidores de equipos electrónicos o aparatos señales satelitales', categoria: 'Inspectoría', precio: 15000.00 },
  { codigo: 'IRC-08', nombre: 'Galerías de Arte', categoria: 'Inspectoría', precio: 5000.00 },
  { codigo: 'IRC-09-A', nombre: 'Estaciones de Transmisión/Retransmisión abierta por cable, fibra óptica u otro procedimiento análogo (T.N)', categoria: 'Inspectoría', precio: 50000.00 },
  { codigo: 'IRC-09-B', nombre: 'Estaciones de Transmisión/Retransmisión abierta por cable, fibra óptica u otro procedimiento análogo (T.R)', categoria: 'Inspectoría', precio: 15000.00 },
  { codigo: 'IRC-09-C', nombre: 'Estaciones de Transmisión/Retransmisión abierta por cable, fibra óptica u otro procedimiento análogo (T.P)', categoria: 'Inspectoría', precio: 10000.00 },
  { codigo: 'IRC-09-D', nombre: 'Estaciones de Transmisión/Retransmisión abierta por cable, fibra óptica u otro procedimiento análogo (T.M)', categoria: 'Inspectoría', precio: 7000.00 },
  { codigo: 'IRC-10', nombre: 'Estaciones de Radiodifusión Televisiva Abierta', categoria: 'Inspectoría', precio: 15000.00 },
  { codigo: 'IRC-11', nombre: 'Estaciones de Radiodifusión Televisiva Cerrada', categoria: 'Inspectoría', precio: 10000.00 },
  { codigo: 'IRC-11-1', nombre: 'Canal perteneciente a las Estaciones de Radiodifusión Televisiva Cerrada', categoria: 'Inspectoría', precio: 5000.00 },
  { codigo: 'IRC-12', nombre: 'Estaciones de Radiodifusión Sonora F.M.', categoria: 'Inspectoría', precio: 7500.00 },
  { codigo: 'IRC-13', nombre: 'Estaciones de Radiodifusión Sonora A.M.', categoria: 'Inspectoría', precio: 5000.00 },
  { codigo: 'IRC-14', nombre: 'Estaciones de Radiodifusión por Internet', categoria: 'Inspectoría', precio: 3000.00 },
  { codigo: 'IRC-15', nombre: 'Primer registro de empresa de Telecable (sin operación)', categoria: 'Inspectoría', precio: 5000.00 },
];

async function main() {
  console.log('🔄 Agregando productos faltantes a la base de datos...\n');

  const estadoActivo = await prisma.productoEstado.findUnique({
    where: { nombre: 'Activo' }
  });

  if (!estadoActivo) {
    throw new Error('Estado "Activo" no encontrado. Ejecuta el seed primero.');
  }

  let agregados = 0;
  let yaExisten = 0;

  for (const prod of productosOficiales) {
    try {
      // Verificar si ya existe
      const existente = await prisma.producto.findUnique({
        where: { codigo: prod.codigo }
      });

      if (existente) {
        console.log(`⏭️  ${prod.codigo} ya existe`);
        yaExisten++;
        continue;
      }

      // Crear producto
      const producto = await prisma.producto.create({
        data: {
          codigo: prod.codigo,
          nombre: prod.nombre,
          categoria: prod.categoria,
          estadoId: estadoActivo.id
        }
      });

      // Crear costo inicial
      await prisma.productoCosto.create({
        data: {
          productoId: producto.id,
          precio: prod.precio,
          cantidadMin: 1,
          cantidadMax: null,
          fechaInicio: new Date(),
          fechaFinal: null
        }
      });

      console.log(`✅ ${prod.codigo} - ${prod.nombre} - RD$ ${prod.precio.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`);
      agregados++;
    } catch (error) {
      console.error(`❌ Error con ${prod.codigo}:`, error);
    }
  }

  console.log(`\n📊 Resumen:`);
  console.log(`   - Productos agregados: ${agregados}`);
  console.log(`   - Productos que ya existían: ${yaExisten}`);
  console.log(`   - Total en catálogo oficial: ${productosOficiales.length}`);
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
