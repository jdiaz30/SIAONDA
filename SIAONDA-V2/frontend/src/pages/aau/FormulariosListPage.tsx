import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import aauService, { Formulario } from '../../services/aauService';
import EstadoBadge from '../../components/aau/EstadoBadge';

const FormulariosListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState(searchParams.get('estado') || '');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [buscar, setBuscar] = useState('');

  useEffect(() => {
    fetchFormularios();
  }, [filtroEstado, filtroTipo, fechaInicio, fechaFin, buscar]);

  const fetchFormularios = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filtroEstado) params.estado = filtroEstado;
      if (filtroTipo) params.tipo = filtroTipo;
      if (fechaInicio) params.fechaInicio = fechaInicio;
      if (fechaFin) params.fechaFin = fechaFin;
      if (buscar) params.buscar = buscar;

      const response = await aauService.getFormularios(params);
      setFormularios(response.data || response);
    } catch (error) {
      console.error('Error al cargar formularios:', error);
      alert('Error al cargar formularios');
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarARegistro = async (id: number, codigo: string) => {
    if (!confirm(`¿Enviar formulario ${codigo} a Registro para revisión?`)) {
      return;
    }

    try {
      await aauService.enviarARegistro(id);
      alert('Formulario enviado a Registro exitosamente');
      fetchFormularios();
    } catch (error: any) {
      console.error('Error al enviar:', error);
      alert(error.response?.data?.message || 'Error al enviar formulario');
    }
  };

  const handleEliminar = async (id: number, codigo: string) => {
    if (!confirm(`¿Está seguro de eliminar el formulario ${codigo}?`)) {
      return;
    }

    try {
      await aauService.deleteFormulario(id);
      alert('Formulario eliminado exitosamente');
      fetchFormularios();
    } catch (error: any) {
      console.error('Error al eliminar:', error);
      alert(error.response?.data?.message || 'Error al eliminar formulario');
    }
  };

  const getClienteNombre = (formulario: Formulario) => {
    if (formulario.clientes && formulario.clientes.length > 0) {
      return formulario.clientes[0].cliente.nombrecompleto;
    }
    return 'Sin cliente';
  };

  const getTipo = (formulario: Formulario) => {
    if (formulario.productos && formulario.productos.length > 0) {
      return formulario.productos[0].producto.categoria;
    }
    return 'Sin categoría';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📋 Todos los Registros</h1>
          <p className="text-gray-600">Gestión completa de formularios</p>
        </div>
        <Link
          to="/aau"
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          ← Volver al Dashboard
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="PAGADO">Pagado</option>
              <option value="EN_REVISION_REGISTRO">En Revisión</option>
              <option value="DEVUELTO">Devuelto</option>
              <option value="ASENTADO">Asentado</option>
              <option value="CERTIFICADO">Certificado</option>
              <option value="ENTREGADO">Entregado</option>
            </select>
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Obra
            </label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="Musical">Musical</option>
              <option value="Audiovisual">Audiovisual</option>
              <option value="Literaria">Literaria</option>
              <option value="IRC">Solicitud IRC</option>
            </select>
          </div>

          {/* Fecha Inicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Desde
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Fecha Fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hasta
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buscar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              placeholder="Código o cliente..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando formularios...</p>
            </div>
          </div>
        ) : formularios.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay formularios
            </h3>
            <p className="text-gray-600 mb-4">No se encontraron formularios con los filtros aplicados</p>
            <button
              onClick={() => {
                setFiltroEstado('');
                setFiltroTipo('');
                setFechaInicio('');
                setFechaFin('');
                setBuscar('');
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formularios.map((formulario) => (
                  <tr key={formulario.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formulario.codigo}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getClienteNombre(formulario)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {getTipo(formulario)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {new Date(formulario.fecha).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <EstadoBadge estado={formulario.estado.nombre} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        RD$ {Number(formulario.montoTotal).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      {/* Ver */}
                      <Link
                        to={`/aau/formularios/${formulario.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver
                      </Link>

                      {/* Acciones según estado */}
                      {formulario.estado.nombre === 'PENDIENTE' && (
                        <>
                          <Link
                            to={`/aau/formularios/${formulario.id}/editar`}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Editar
                          </Link>
                          <button
                            onClick={() => handleEliminar(formulario.id, formulario.codigo)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </>
                      )}

                      {formulario.estado.nombre === 'PAGADO' && (
                        <>
                          <button
                            onClick={() => handleEnviarARegistro(formulario.id, formulario.codigo)}
                            className="text-green-600 hover:text-green-900 font-semibold"
                          >
                            Enviar a Registro
                          </button>
                        </>
                      )}

                      {formulario.estado.nombre === 'DEVUELTO' && (
                        <Link
                          to={`/aau/formularios/${formulario.id}/corregir`}
                          className="text-red-600 hover:text-red-900 font-bold"
                        >
                          CORREGIR
                        </Link>
                      )}

                      {formulario.estado.nombre === 'CERTIFICADO' && (
                        <Link
                          to={`/aau/formularios/${formulario.id}/entregar`}
                          className="text-green-600 hover:text-green-900"
                        >
                          Entregar
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resumen */}
      {!loading && formularios.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            Mostrando <span className="font-semibold">{formularios.length}</span> formularios
          </p>
        </div>
      )}
    </div>
  );
};

export default FormulariosListPage;
