import { useState, useEffect } from 'react';
import axios from 'axios';

interface CertificadoPendiente {
  id: number;
  solicitud: {
    id: number;
    codigo: string;
    tipoSolicitud: string;
    empresa: {
      nombreEmpresa: string;
      rnc: string;
      categoriaIrc: {
        codigo: string;
        nombre: string;
      };
    };
    numeroAsiento: string;
    libroAsiento: string;
  };
  urlPdf: string;
  creadoEn: Date;
}

export default function CertificadosPendientesPage() {
  const [certificados, setCertificados] = useState<CertificadoPendiente[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarCertificados();
  }, []);

  const cargarCertificados = async () => {
    try {
      setLoading(true);
      // TODO: Este endpoint debe crearse en el backend
      const response = await axios.get('http://localhost:3000/api/inspectoria/certificados/pendientes-firma');
      setCertificados(response.data.data);
    } catch (err) {
      console.error('Error cargando certificados:', err);
      setCertificados([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarFirmado = async (certificadoId: number, solicitudId: number) => {
    if (!window.confirm('¿Confirma que este certificado ha sido firmado digitalmente en el portal GOB.DO?')) {
      return;
    }

    try {
      setProcessing(certificadoId);
      setError(null);

      // Usar el endpoint existente de solicitudes para marcar como firmada
      await axios.post(`http://localhost:3000/api/inspectoria/solicitudes/${solicitudId}/firmar`);

      // Recargar lista
      await cargarCertificados();

      alert('Certificado marcado como firmado exitosamente');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al marcar como firmado');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Certificados Pendientes de Firma</h1>
        <p className="text-gray-600">Certificados IRC que requieren firma digital en el portal GOB.DO</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Proceso de Firma Digital</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Descargue el certificado PDF haciendo clic en el botón "Descargar PDF"</li>
              <li>Acceda al portal de firma digital de GOB.DO</li>
              <li>Firme el documento digitalmente</li>
              <li>Una vez firmado, haga clic en "Marcar como Firmado" en este sistema</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Listado */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {certificados.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay certificados pendientes</h3>
            <p className="mt-1 text-sm text-gray-500">
              Todos los certificados han sido firmados
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Solicitud
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría IRC
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Generación
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {certificados.map((cert) => (
                  <tr key={cert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{cert.solicitud.codigo}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{cert.solicitud.empresa.nombreEmpresa}</div>
                        <div className="text-gray-500">RNC: {cert.solicitud.empresa.rnc}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cert.solicitud.empresa.categoriaIrc.codigo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        cert.solicitud.tipoSolicitud === 'REGISTRO_NUEVO'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {cert.solicitud.tipoSolicitud === 'REGISTRO_NUEVO' ? 'Nuevo' : 'Renovación'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-mono text-gray-900">{cert.solicitud.numeroAsiento}</div>
                        <div className="text-gray-500 text-xs">{cert.solicitud.libroAsiento}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(cert.creadoEn).toLocaleDateString('es-DO')}
                      <div className="text-xs">{new Date(cert.creadoEn).toLocaleTimeString('es-DO')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <a
                        href={cert.urlPdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Descargar PDF
                      </a>
                      <span className="text-gray-300">|</span>
                      <a
                        href="https://portal.gob.do/firma-digital"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-900"
                      >
                        Portal GOB.DO
                      </a>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => handleMarcarFirmado(cert.id, cert.solicitud.id)}
                        disabled={processing === cert.id}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                      >
                        {processing === cert.id ? 'Procesando...' : 'Marcar como Firmado'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Nota adicional */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex gap-2">
          <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-yellow-800">
            <strong>Nota:</strong> Esta es una interfaz temporal hasta que se desarrolle el módulo completo
            del Departamento de Registro. Una vez firmados, los certificados retornan automáticamente a AuU para entrega.
          </div>
        </div>
      </div>
    </div>
  );
}
