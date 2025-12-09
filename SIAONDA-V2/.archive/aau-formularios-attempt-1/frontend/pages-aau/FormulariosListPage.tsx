import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import aauFormulariosService, { Formulario } from '../../services/aauFormulariosService';

const FormulariosListPage = () => {
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [filtroCodigo, setFiltroCodigo] = useState<string>('');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');

  useEffect(() => {
    fetchFormularios();
  }, [filtroEstado, filtroCodigo, fechaInicio, fechaFin]);

  const fetchFormularios = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filtroEstado) params.estado = filtroEstado;
      if (filtroCodigo) params.codigo = filtroCodigo;
      if (fechaInicio) params.fechaInicio = fechaInicio;
      if (fechaFin) params.fechaFin = fechaFin;

      const response = await aauFormulariosService.getFormularios(params);
      setFormularios(response.data);
    } catch (error) {
      console.error('Error al cargar formularios:', error);
      alert('Error al cargar formularios');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id: number, codigo: string) => {
    if (!confirm(`¿Está seguro de eliminar el formulario ${codigo}?`)) {
      return;
    }

    try {
      await aauFormulariosService.deleteFormulario(id);
      alert('Formulario eliminado exitosamente');
      fetchFormularios();
    } catch (error: any) {
      console.error('Error al eliminar:', error);
      alert(error.response?.data?.message || 'Error al eliminar formulario');
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'Recibido': return 'bg-blue-100 text-blue-800';
      case 'Asentado': return 'bg-green-100 text-green-800';
      case 'Devuelto': return 'bg-red-100 text-red-800';
      case 'Con Certificado': return 'bg-purple-100 text-purple-800';
      case 'Entregado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Formularios de Obras</h1>
        <Link
          to="/aau/formularios/nuevo"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Formulario
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Estado</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Recibido">Recibido</option>
              <option value="Asentado">Asentado</option>
              <option value="Devuelto">Devuelto</option>
              <option value="Con Certificado">Con Certificado</option>
              <option value="Entregado">Entregado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Código</label>
            <input
              type="text"
              value={filtroCodigo}
              onChange={(e) => setFiltroCodigo(e.target.value)}
              placeholder="FORM-2024-0001"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Fecha Inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Fecha Fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              setFiltroEstado('');
              setFiltroCodigo('');
              setFechaInicio('');
              setFechaFin('');
            }}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Tabla de formularios */}
      {loading ? (
        <div className="text-center py-8">Cargando formularios...</div>
      ) : formularios.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500">No hay formularios registrados</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente(s)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Obra(s)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {formularios.map((formulario) => (
                <tr key={formulario.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    <Link to={`/formularios/${formulario.id}`}>
                      {formulario.codigo}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(formulario.fecha).toLocaleDateString('es-DO')}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {formulario.clientes.map(fc => fc.cliente.nombrecompleto).join(', ')}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {formulario.productos.map(fp => fp.producto.nombre).join(', ').substring(0, 50)}
                    {formulario.productos.map(fp => fp.producto.nombre).join(', ').length > 50 && '...'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${getEstadoColor(formulario.estado.nombre)}`}>
                      {formulario.estado.nombre}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    RD$ {Number(formulario.montoTotal).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <Link
                        to={`/formularios/${formulario.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Ver
                      </Link>
                      {formulario.estado.nombre === 'Pendiente' && (
                        <>
                          <Link
                            to={`/formularios/${formulario.id}/editar`}
                            className="text-yellow-600 hover:text-yellow-800"
                          >
                            Editar
                          </Link>
                          <button
                            onClick={() => handleEliminar(formulario.id, formulario.codigo)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FormulariosListPage;
