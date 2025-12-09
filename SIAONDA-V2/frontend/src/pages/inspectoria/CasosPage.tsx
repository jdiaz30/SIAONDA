import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { obtenerCasos, obtenerTodosCatalogos, CasoInspeccion, Catalogos } from '../../services/inspectoriaService';

export default function CasosPage() {
  const [searchParams] = useSearchParams();
  const [casos, setCasos] = useState<CasoInspeccion[]>([]);
  const [catalogos, setCatalogos] = useState<Catalogos | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState(searchParams.get('estado') || '');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });

  useEffect(() => {
    cargarCatalogos();
  }, []);

  useEffect(() => {
    cargarCasos();
  }, [pagination.page, filtroEstado, filtroTipo]);

  const cargarCatalogos = async () => {
    try {
      const data = await obtenerTodosCatalogos();
      setCatalogos(data);
    } catch (error) {
      console.error('Error cargando catálogos:', error);
    }
  };

  const cargarCasos = async () => {
    try {
      setLoading(true);
      const response = await obtenerCasos({
        estadoCasoId: filtroEstado ? parseInt(filtroEstado) : undefined,
        tipoCaso: filtroTipo || undefined,
        page: pagination.page,
        limit: pagination.limit
      });
      setCasos(response?.casos || []);
      setPagination({
        total: response?.total || 0,
        page: response?.page || 1,
        limit: response?.limit || 10,
        totalPages: response?.totalPages || 0
      });
    } catch (error) {
      console.error('Error cargando casos:', error);
      setCasos([]);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (orden: number) => {
    const colores: Record<number, string> = {
      1: 'bg-gray-100 text-gray-800',        // PENDIENTE_ASIGNACION
      2: 'bg-blue-100 text-blue-800',         // ASIGNADO
      3: 'bg-orange-100 text-orange-800',     // EN_PLAZO_GRACIA
      4: 'bg-red-100 text-red-800',           // PENDIENTE_SEGUNDA_VISITA
      5: 'bg-green-100 text-green-800',       // CERRADO
      6: 'bg-green-100 text-green-800'      // TRAMITADO_JURIDICO
    };
    return colores[orden] || 'bg-gray-100 text-gray-800';
  };

  const getTipoCasoColor = (tipo: string) => {
    const colores: Record<string, string> = {
      'OFICIO': 'bg-blue-100 text-blue-800',
      'DENUNCIA': 'bg-red-100 text-red-800',
      'OPERATIVO': 'bg-green-100 text-green-800'
    };
    return colores[tipo] || 'bg-gray-100 text-gray-800';
  };

  const getTipoCasoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      'OFICIO': 'De Oficio',
      'DENUNCIA': 'Inspección de Parte',
      'OPERATIVO': 'Operativo'
    };
    return labels[tipo] || tipo;
  };

  const casosFiltrados = (casos || []).filter(c => {
    if (!busqueda) return true;
    return c.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
           c.empresa?.nombreEmpresa?.toLowerCase().includes(busqueda.toLowerCase()) ||
           c.empresa?.rnc?.includes(busqueda);
  });

  const calcularDiasRestantes = (fechaLimite?: Date | string) => {
    if (!fechaLimite) return null;
    const limite = new Date(fechaLimite);
    const hoy = new Date();
    const diff = Math.ceil((limite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading && (!casos || casos.length === 0)) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Casos de Inspección</h1>
          <p className="text-gray-600">Gestión de casos de inspección (PR-DI-001, PR-DI-003, PR-DI-004)</p>
        </div>
        <Link
          to="/inspectoria/casos/nuevo"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Caso
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Código, empresa, RNC..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              {catalogos?.estadosCaso.map((estado) => (
                <option key={estado.id} value={estado.id}>
                  {estado.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Caso
            </label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="OFICIO">De Oficio</option>
              <option value="DENUNCIA">Inspección de Parte</option>
              <option value="OPERATIVO">Operativo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estado Legend */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Estados de Caso</h3>
        <div className="flex flex-wrap gap-2">
          {catalogos?.estadosCaso.map((estado) => (
            <span key={estado.id} className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(estado.orden)}`}>
              {estado.nombre}
            </span>
          ))}
        </div>
      </div>

      {/* Listado */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {casosFiltrados.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay casos</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza creando un nuevo caso de inspección
            </p>
            <div className="mt-6">
              <Link
                to="/inspectoria/casos/nuevo"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nuevo Caso
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empresa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plazo Corrección
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visitas
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {casosFiltrados.map((caso) => {
                    const diasRestantes = calcularDiasRestantes(caso.fechaLimiteCorreccion);
                    return (
                      <tr key={caso.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link to={`/inspectoria/casos/${caso.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                            {caso.codigo}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{caso.empresa?.nombreEmpresa}</div>
                            <div className="text-gray-500">RNC: {caso.empresa?.rnc}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTipoCasoColor(caso.tipoCaso)}`}>
                            {getTipoCasoLabel(caso.tipoCaso)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(caso.estadoCaso?.orden || 1)}`}>
                            {caso.estadoCaso?.nombre}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {caso.fechaLimiteCorreccion ? (
                            <div className="text-sm">
                              <div className={`font-medium ${
                                diasRestantes !== null && diasRestantes < 0
                                  ? 'text-red-600'
                                  : diasRestantes !== null && diasRestantes <= 3
                                  ? 'text-orange-600'
                                  : 'text-gray-900'
                              }`}>
                                {new Date(caso.fechaLimiteCorreccion).toLocaleDateString('es-DO')}
                              </div>
                              {diasRestantes !== null && (
                                <div className={`text-xs ${
                                  diasRestantes < 0
                                    ? 'text-red-500'
                                    : diasRestantes <= 3
                                    ? 'text-orange-500'
                                    : 'text-gray-500'
                                }`}>
                                  {diasRestantes < 0
                                    ? `Vencido hace ${Math.abs(diasRestantes)} días`
                                    : `${diasRestantes} días restantes`
                                  }
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-1">
                            {caso.fechaPrimeraVisita && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                                1ª
                              </span>
                            )}
                            {caso.fechaSegundaVisita && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
                                2ª
                              </span>
                            )}
                            {!caso.fechaPrimeraVisita && !caso.fechaSegundaVisita && (
                              <span className="text-sm text-gray-500">Ninguna</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            to={`/inspectoria/casos/${caso.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Ver / Procesar
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> a{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    de <span className="font-medium">{pagination.total}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    {[...Array(pagination.totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPagination({ ...pagination, page: i + 1 })}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pagination.page === i + 1
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                      disabled={pagination.page === pagination.totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Siguiente
                    </button>
                  </nav>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
