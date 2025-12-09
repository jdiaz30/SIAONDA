import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarDenuncias, Denuncia } from '../../services/denunciasService';

export default function DenunciasPage() {
  const navigate = useNavigate();
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    cargarDenuncias();
  }, [page]);

  const cargarDenuncias = async () => {
    try {
      setLoading(true);
      const data = await listarDenuncias({ page, limit: 20 });
      setDenuncias(data.denuncias || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error('Error al cargar denuncias:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE_PAGO': return 'bg-yellow-100 text-yellow-800';
      case 'PAGADA': return 'bg-blue-100 text-blue-800';
      case 'ASIGNADA': return 'bg-purple-100 text-purple-800';
      case 'COMPLETADA': return 'bg-green-100 text-green-800';
      case 'RECHAZADA': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && denuncias.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Cargando denuncias...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Denuncias</h1>
        <button
          onClick={() => navigate('/aau/denuncias/nueva')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Registrar Denuncia
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Denunciante</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa Denunciada</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pago</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {denuncias.map((denuncia) => (
              <tr key={denuncia.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {denuncia.codigo}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {denuncia.denuncianteNombre}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {denuncia.empresaDenunciada}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getEstadoBadgeColor(denuncia.estadoDenuncia.nombre)}`}>
                    {denuncia.estadoDenuncia.nombre.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {denuncia.factura ? (
                    <span className="text-green-600">Pagado</span>
                  ) : (
                    <span className="text-red-600">Pendiente RD$3,000</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => navigate(`/aau/denuncias/${denuncia.id}`)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Ver Detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {denuncias.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay denuncias registradas
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
