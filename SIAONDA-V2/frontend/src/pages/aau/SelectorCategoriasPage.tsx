import { Link } from 'react-router-dom';
import {
  FiMusic,
  FiFilm,
  FiActivity,
  FiImage,
  FiPenTool,
  FiBook,
  FiCpu,
  FiArchive,
  FiLayers,
  FiFileText,
  FiHelpCircle,
  FiUsers
} from 'react-icons/fi';

interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  icon: React.ReactNode;
  color: string;
  count: number;
}

const categorias: Categoria[] = [
  {
    id: 'obras-musicales',
    nombre: 'Obras Musicales',
    descripcion: 'Obras musicales, arreglos, fonogramas, interpretaciones',
    icon: <FiMusic className="text-5xl" />,
    color: 'from-green-500 to-green-600',
    count: 5
  },
  {
    id: 'obras-audiovisuales',
    nombre: 'Obras Audiovisuales',
    descripcion: 'Cine, documentales, series, videoclips',
    icon: <FiFilm className="text-5xl" />,
    color: 'from-red-500 to-red-600',
    count: 5
  },
  {
    id: 'obras-escenicas',
    nombre: 'Obras Escénicas',
    descripcion: 'Teatro, musicales, conciertos, coreografías',
    icon: <FiActivity className="text-5xl" />,
    color: 'from-pink-500 to-pink-600',
    count: 7
  },
  {
    id: 'artes-visuales',
    nombre: 'Artes Visuales',
    descripcion: 'Dibujo, fotografía, pintura, escultura, grabado',
    icon: <FiImage className="text-5xl" />,
    color: 'from-yellow-500 to-yellow-600',
    count: 5
  },
  {
    id: 'arte-aplicado',
    nombre: 'Arte Aplicado',
    descripcion: 'Diseño, artesanía, joyería, juegos',
    icon: <FiPenTool className="text-5xl" />,
    color: 'from-orange-500 to-orange-600',
    count: 8
  },
  {
    id: 'obras-literarias',
    nombre: 'Obras Literarias',
    descripcion: 'Libros, poemas, guiones, personajes, seudónimos',
    icon: <FiBook className="text-5xl" />,
    color: 'from-blue-500 to-blue-600',
    count: 19
  },
  {
    id: 'obras-cientificas',
    nombre: 'Obras Científicas',
    descripcion: 'Planos, proyectos, programas, bases de datos',
    icon: <FiCpu className="text-5xl" />,
    color: 'from-green-500 to-green-600',
    count: 8
  },
  {
    id: 'colecciones-compilaciones',
    nombre: 'Colecciones y Compilaciones',
    descripcion: 'Compilaciones de obras, datos o documentos',
    icon: <FiArchive className="text-5xl" />,
    color: 'from-indigo-500 to-indigo-600',
    count: 14
  },
  {
    id: 'producciones-obras',
    nombre: 'Producciones de Obras',
    descripcion: 'Producciones de 6 a 15 obras del mismo tipo',
    icon: <FiLayers className="text-5xl" />,
    color: 'from-teal-500 to-teal-600',
    count: 15
  },
  {
    id: 'actos-contratos',
    nombre: 'Actos y Contratos',
    descripcion: 'Transferencia de derechos, certificaciones',
    icon: <FiFileText className="text-5xl" />,
    color: 'from-gray-500 to-gray-600',
    count: 8
  },
  {
    id: 'consulta-tecnica',
    nombre: 'Consulta Técnica y Otros',
    descripcion: 'Consultas, inspecciones, medidas cautelares',
    icon: <FiHelpCircle className="text-5xl" />,
    color: 'from-cyan-500 to-cyan-600',
    count: 6
  },
  {
    id: 'sociedades-gestion',
    nombre: 'Sociedades de Gestión',
    descripcion: 'Inscripción y homologación de sociedades',
    icon: <FiUsers className="text-5xl" />,
    color: 'from-violet-500 to-violet-600',
    count: 2
  }
];

const SelectorCategoriasPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Nuevo Registro de Obra</h1>
            <p className="text-blue-100">Selecciona el tipo de obra que deseas registrar</p>
          </div>
          <Link
            to="/aau"
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al Dashboard
          </Link>
        </div>
      </div>

      {/* Categorías Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categorias.map((categoria) => (
          <Link
            key={categoria.id}
            to={`/aau/formularios/categoria/${categoria.id}`}
            className="group"
          >
            <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden h-full">
              {/* Encabezado con gradiente */}
              <div className={`bg-gradient-to-br ${categoria.color} p-6 text-white`}>
                <div className="flex items-center justify-between mb-3">
                  {categoria.icon}
                  <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                    {categoria.count} {categoria.count === 1 ? 'servicio' : 'servicios'}
                  </span>
                </div>
                <h3 className="text-xl font-bold">{categoria.nombre}</h3>
              </div>

              {/* Descripción */}
              <div className="p-4">
                <p className="text-sm text-gray-600">{categoria.descripcion}</p>
                <div className="mt-4 flex items-center text-blue-600 group-hover:text-blue-700 font-medium">
                  <span className="text-sm">Ver servicios</span>
                  <svg
                    className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Información importante</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Asegúrate de tener toda la documentación necesaria antes de iniciar el registro</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Los autores/clientes deben estar previamente registrados en el sistema (Recepción)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Podrás guardar el formulario como borrador y completarlo más tarde</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Los precios mostrados son los oficiales según las tarifas vigentes de ONDA</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectorCategoriasPage;
