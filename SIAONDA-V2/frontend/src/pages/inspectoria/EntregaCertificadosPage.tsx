import { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface SolicitudIRC {
  id: number;
  codigo: string;
  nombreEmpresa: string;
  nombreComercial: string | null;
  rnc: string;
  tipoSolicitud: string;
  fechaRecepcion: string;
  numeroRegistro: string | null;
  categoriaIrc: {
    id: number;
    codigo: string;
    nombre: string;
    precio: number;
  };
  estado: {
    id: number;
    nombre: string;
  };
  certificado?: {
    id: number;
    rutaPdf: string;
    rutaPdfFirmado: string | null;
    fechaFirma: string;
  };
}

export default function EntregaCertificadosPage() {
  const [solicitudes, setSolicitudes] = useState<SolicitudIRC[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    cargarSolicitudes();
  }, [page]);

  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 20,
        search,
        estadoId: '6' // FIRMADA - listas para entrega
      };

      const response = await api.get('/inspectoria/solicitudes', { params });
      setSolicitudes(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    cargarSolicitudes();
  };

  const handleVerCertificado = (solicitud: SolicitudIRC) => {
    // Priorizar el certificado firmado sobre el generado
    const rutaPdf = solicitud.certificado?.rutaPdfFirmado || solicitud.certificado?.rutaPdf;

    if (rutaPdf) {
      const backendUrl = `http://localhost:3000${rutaPdf}`;
      window.open(backendUrl, '_blank');
    } else {
      alert('⚠️ No hay certificado disponible');
    }
  };

  const handleEntregarCertificado = async (solicitud: SolicitudIRC) => {
    if (!confirm(`¿Confirma que el certificado de ${solicitud.nombreEmpresa} ha sido entregado al cliente?\n\nEste paso completará el proceso y actualizará los registros de la empresa.`)) {
      return;
    }

    try {
      setLoading(true);
      await api.post(`/inspectoria/solicitudes/${solicitud.id}/entregar`);

      alert('✅ Certificado entregado exitosamente. Proceso completado.');
      cargarSolicitudes();
    } catch (error: any) {
      alert('❌ Error al entregar certificado: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Entrega de Certificados</h1>
          <p className="text-gray-600 mt-1">
            Certificados firmados listos para entregar a los clientes
          </p>
        </div>
      </div>

      {/* Búsqueda */}
      <form onSubmit={handleBuscar} className="flex gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por código, RNC o nombre de empresa..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Buscar
        </button>
      </form>

      {/* Tabla de Solicitudes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Cargando certificados...
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay certificados listos para entrega
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código / Registro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empresa / RNC
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría IRC
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo Solicitud
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Firma
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {solicitudes.map((solicitud) => (
                    <tr key={solicitud.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {solicitud.codigo}
                        </div>
                        <div className="text-xs text-gray-500">
                          Reg: {solicitud.numeroRegistro || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {solicitud.nombreEmpresa}
                        </div>
                        <div className="text-xs text-gray-500">
                          RNC: {solicitud.rnc}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {solicitud.categoriaIrc.codigo}
                        </div>
                        <div className="text-xs text-gray-500">
                          {solicitud.categoriaIrc.nombre}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          solicitud.tipoSolicitud === 'REGISTRO_NUEVO'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {solicitud.tipoSolicitud === 'REGISTRO_NUEVO' ? 'Registro Nuevo' : 'Renovación'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {solicitud.certificado?.fechaFirma
                          ? new Date(solicitud.certificado.fechaFirma).toLocaleDateString('es-DO')
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVerCertificado(solicitud)}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                          >
                            Ver Certificado
                          </button>
                          <button
                            onClick={() => handleEntregarCertificado(solicitud)}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                            Confirmar Entrega
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Página {page} de {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
