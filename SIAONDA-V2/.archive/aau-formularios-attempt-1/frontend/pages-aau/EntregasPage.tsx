import { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface Certificado {
  id: number;
  tipo: 'IRC' | 'OBRAS';
  codigo: string;
  cliente: string;
  documento: string; // RNC o cédula
  numeroRegistro: string;
  fechaFirma: string;
  fechaEntrega?: string;
  rutaPdf: string;
  solicitudId?: number;
  formularioId?: number;
  entregado: boolean;
}

export default function EntregasPage() {
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | 'IRC' | 'OBRAS'>('TODOS');
  const [filtroEstado, setFiltroEstado] = useState<'PENDIENTES' | 'ENTREGADOS' | 'TODOS'>('PENDIENTES');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    cargarCertificados();
  }, [page, filtroTipo, filtroEstado]);

  const cargarCertificados = async () => {
    try {
      setLoading(true);

      // Determinar qué estados cargar según el filtro
      let estadosIds: string[] = [];
      if (filtroEstado === 'PENDIENTES') {
        estadosIds = ['6']; // FIRMADA
      } else if (filtroEstado === 'ENTREGADOS') {
        estadosIds = ['7']; // ENTREGADA
      } else {
        estadosIds = ['6', '7']; // TODOS
      }

      // Cargar certificados IRC
      const ircPromises = estadosIds.map(estadoId =>
        api.get('/inspectoria/solicitudes', {
          params: {
            estadoId,
            page,
            limit: 50,
            search
          }
        })
      );

      const ircResponses = await Promise.all(ircPromises);

      // TODO: Cargar certificados de Obras cuando esté implementado
      // const obrasResponse = await api.get('/obras/certificados', { params: { estado: 'FIRMADO' }});

      // Mapear solicitudes IRC a formato unificado
      const certificadosIRC: Certificado[] = ircResponses.flatMap(response =>
        (response.data.data || []).map((sol: any) => ({
          id: sol.id,
          tipo: 'IRC' as const,
          codigo: sol.codigo,
          cliente: sol.nombreEmpresa,
          documento: sol.rnc,
          numeroRegistro: sol.numeroRegistro || 'N/A',
          fechaFirma: sol.certificado?.fechaFirma || '',
          fechaEntrega: sol.fechaEntrega || '',
          rutaPdf: sol.certificado?.rutaPdfFirmado || sol.certificado?.rutaPdf || '',
          solicitudId: sol.id,
          entregado: sol.estadoId === 7
        }))
      );

      // Filtrar por tipo si es necesario
      let certificadosFiltrados = certificadosIRC;
      if (filtroTipo === 'IRC') {
        certificadosFiltrados = certificadosIRC;
      } else if (filtroTipo === 'OBRAS') {
        certificadosFiltrados = []; // Por ahora vacío hasta implementar obras
      }

      // Ordenar por fecha de firma (más recientes primero)
      certificadosFiltrados.sort((a, b) => {
        const dateA = a.fechaEntrega || a.fechaFirma;
        const dateB = b.fechaEntrega || b.fechaFirma;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });

      setCertificados(certificadosFiltrados);
      setTotalPages(1); // Simplificado por ahora
    } catch (error) {
      console.error('Error al cargar certificados:', error);
      alert('Error al cargar los certificados');
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    cargarCertificados();
  };

  const handleVerCertificado = (certificado: Certificado) => {
    if (certificado.rutaPdf) {
      const backendUrl = `http://localhost:3000${certificado.rutaPdf}`;
      window.open(backendUrl, '_blank');
    } else {
      alert('No hay certificado disponible');
    }
  };

  const handleEntregarCertificado = async (certificado: Certificado) => {
    if (!confirm(`¿Confirma que el certificado de ${certificado.cliente} ha sido entregado al cliente?\n\nEste paso completará el proceso.`)) {
      return;
    }

    try {
      setLoading(true);

      if (certificado.tipo === 'IRC' && certificado.solicitudId) {
        await api.post(`/inspectoria/solicitudes/${certificado.solicitudId}/entregar`);
      }
      // TODO: Implementar entrega de obras
      // else if (certificado.tipo === 'OBRAS' && certificado.formularioId) {
      //   await api.post(`/obras/certificados/${certificado.id}/entregar`);
      // }

      alert('Certificado entregado exitosamente');
      cargarCertificados();
    } catch (error: any) {
      alert('Error al entregar certificado: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Entregas de Certificados</h1>
          <p className="text-gray-600 mt-1">
            Certificados listos para entrega y registro de entregas realizadas
          </p>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="space-y-4">
          {/* Primera fila: Filtro por estado */}
          <div className="flex gap-2">
            <span className="text-sm font-medium text-gray-700 flex items-center">Estado:</span>
            <button
              onClick={() => setFiltroEstado('PENDIENTES')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filtroEstado === 'PENDIENTES'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Pendientes Entrega
            </button>
            <button
              onClick={() => setFiltroEstado('ENTREGADOS')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filtroEstado === 'ENTREGADOS'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Entregados
            </button>
            <button
              onClick={() => setFiltroEstado('TODOS')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filtroEstado === 'TODOS'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todos
            </button>
          </div>

          {/* Segunda fila: Filtro por tipo y búsqueda */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Filtro por tipo */}
            <div className="flex gap-2">
              <span className="text-sm font-medium text-gray-700 flex items-center">Tipo:</span>
              <button
                onClick={() => setFiltroTipo('TODOS')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filtroTipo === 'TODOS'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFiltroTipo('IRC')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filtroTipo === 'IRC'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                IRC
              </button>
              <button
                onClick={() => setFiltroTipo('OBRAS')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filtroTipo === 'OBRAS'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Obras
              </button>
            </div>

            {/* Búsqueda */}
            <form onSubmit={handleBuscar} className="flex-1 flex gap-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por código, cliente o documento..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Buscar
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Tabla de Certificados */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Cargando certificados...
          </div>
        ) : certificados.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {filtroEstado === 'PENDIENTES'
              ? 'No hay certificados pendientes de entrega'
              : filtroEstado === 'ENTREGADOS'
              ? 'No hay certificados entregados'
              : 'No se encontraron certificados'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Núm. Registro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Firma
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {certificados.map((certificado) => (
                    <tr key={`${certificado.tipo}-${certificado.id}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          certificado.tipo === 'IRC'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {certificado.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {certificado.codigo}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {certificado.cliente}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {certificado.documento}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {certificado.numeroRegistro}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {certificado.fechaFirma
                          ? new Date(certificado.fechaFirma).toLocaleDateString('es-DO')
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        {certificado.entregado ? (
                          <div>
                            <span className="px-2 py-1 text-xs rounded-full font-medium bg-green-100 text-green-800">
                              Entregado
                            </span>
                            {certificado.fechaEntrega && (
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(certificado.fechaEntrega).toLocaleDateString('es-DO')}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full font-medium bg-orange-100 text-orange-800">
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVerCertificado(certificado)}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                          >
                            Ver / Imprimir
                          </button>
                          {!certificado.entregado && (
                            <button
                              onClick={() => handleEntregarCertificado(certificado)}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                            >
                              Confirmar Entrega
                            </button>
                          )}
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

      {/* Instrucciones */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 mb-2">Instrucciones de Entrega</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-green-800">
          <li>Verificar la identidad del cliente antes de entregar el certificado</li>
          <li>Hacer clic en "Ver / Imprimir" para descargar e imprimir el certificado</li>
          <li>Solicitar al cliente que firme el libro de control de entregas</li>
          <li>Hacer clic en "Confirmar Entrega" una vez entregado el certificado</li>
        </ol>
      </div>
    </div>
  );
}
