import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarViajes, ViajeOficio } from '../../services/viajesOficioService';

export default function ViajesOficioPage() {
  const navigate = useNavigate();
  const [viajes, setViajes] = useState<ViajeOficio[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [estadoFiltro, setEstadoFiltro] = useState<number | undefined>();

  useEffect(() => {
    cargarViajes();
  }, [page, estadoFiltro]);

  const cargarViajes = async () => {
    try {
      setLoading(true);
      const data = await listarViajes({
        page,
        limit: 20,
        estadoId: estadoFiltro
      });
      setViajes(data.viajes || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error('Error al cargar viajes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'ABIERTO': return 'bg-blue-100 text-blue-800';
      case 'CERRADO': return 'bg-green-100 text-green-800';
      case 'CANCELADO': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && viajes.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Cargando viajes...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Viajes de Oficio</h1>
        <button
          onClick={() => navigate('/inspectoria/viajes-oficio/nuevo')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Crear Viaje
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="flex gap-4">
          <select
            value={estadoFiltro || ''}
            onChange={(e) => setEstadoFiltro(e.target.value ? Number(e.target.value) : undefined)}
            className="border rounded px-3 py-2"
          >
            <option value="">Todos los estados</option>
            <option value="1">ABIERTO</option>
            <option value="2">CERRADO</option>
            <option value="3">CANCELADO</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provincia</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Inicio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inspectores</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {viajes.map((viaje) => (
              <tr key={viaje.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {viaje.codigo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {viaje.provincia.nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(viaje.fechaInicio).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {viaje.inspectores.length} inspector(es)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {viaje._count?.actasInspeccion || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getEstadoBadgeColor(viaje.estadoViaje.nombre)}`}>
                    {viaje.estadoViaje.nombre}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => navigate(`/inspectoria/viajes-oficio/${viaje.id}`)}
                    className="text-blue-600 hover:text-blue-800 mr-3"
                  >
                    Ver Detalle
                  </button>
                  <button
                    onClick={() => navigate(`/inspectoria/viajes-oficio/${viaje.id}/actas`)}
                    className="text-green-600 hover:text-green-800"
                  >
                    📋 Actas ({viaje._count?.actasInspeccion || 0})
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {viajes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay viajes registrados
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="px-4 py-2">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
