import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  obtenerSolicitudPorId,
  validarSolicitud,
  asentarSolicitud,
  generarCertificado,
  entregarCertificado,
  SolicitudRegistro
} from '../../services/inspectoriaService';
import { useAuthStore } from '../../store/authStore';

export default function SolicitudWorkflowPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuthStore();

  const [solicitud, setSolicitud] = useState<SolicitudRegistro | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states for each step
  const [numeroAsiento, setNumeroAsiento] = useState('');
  const [libroAsiento, setLibroAsiento] = useState('');

  useEffect(() => {
    cargarSolicitud();
  }, [id]);

  const cargarSolicitud = async () => {
    try {
      setLoading(true);
      const data = await obtenerSolicitudPorId(parseInt(id!));
      setSolicitud(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleValidar = async () => {
    if (!solicitud) return;

    if (!window.confirm('¿Confirma que desea validar esta solicitud y generar la factura?')) {
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      setSuccess(null);

      await validarSolicitud(solicitud.id!, solicitud.empresa!.categoriaIrcId);
      setSuccess('Solicitud validada exitosamente. Factura generada y enviada a Caja.');

      // Recargar datos
      await cargarSolicitud();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al validar la solicitud');
    } finally {
      setProcessing(false);
    }
  };

  const handleAsentar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solicitud) return;

    if (!numeroAsiento || !libroAsiento) {
      setError('Debe ingresar el número de asiento y el libro');
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      setSuccess(null);

      await asentarSolicitud(solicitud.id!, {
        numeroAsiento,
        libroAsiento
      });
      setSuccess('Solicitud asentada exitosamente en el libro físico.');

      // Limpiar form
      setNumeroAsiento('');
      setLibroAsiento('');

      // Recargar datos
      await cargarSolicitud();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al asentar la solicitud');
    } finally {
      setProcessing(false);
    }
  };

  const handleGenerarCertificado = async () => {
    if (!solicitud) return;

    if (!window.confirm('¿Confirma que desea generar el certificado PDF?')) {
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      setSuccess(null);

      await generarCertificado(solicitud.id!);
      setSuccess('Certificado generado exitosamente. Enviado al Departamento de Registro para firma.');

      // Recargar datos
      await cargarSolicitud();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al generar el certificado');
    } finally {
      setProcessing(false);
    }
  };

  const handleEntregar = async () => {
    if (!solicitud) return;

    if (!window.confirm('¿Confirma que el certificado ha sido entregado al cliente?')) {
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      setSuccess(null);

      await entregarCertificado(solicitud.id!);
      setSuccess('Certificado entregado exitosamente. Registro de la empresa actualizado.');

      // Recargar datos
      await cargarSolicitud();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar la entrega');
    } finally {
      setProcessing(false);
    }
  };

  const getStepStatus = (stepOrder: number) => {
    if (!solicitud || !solicitud.estado) return 'pending';
    const currentOrder = solicitud.estado.orden;
    if (stepOrder < currentOrder) return 'completed';
    if (stepOrder === currentOrder) return 'current';
    return 'pending';
  };

  const getStepColor = (status: string) => {
    if (status === 'completed') return 'bg-green-500';
    if (status === 'current') return 'bg-blue-500';
    return 'bg-gray-300';
  };

  const canUserProcessStep = (stepOrder: number) => {
    if (!solicitud || !usuario) return false;
    const currentOrder = solicitud.estado?.orden || 1;
    if (stepOrder !== currentOrder) return false;

    // PASO 2: Solo Inspectoría puede validar
    if (stepOrder === 2) return usuario.tipo === 'Administrador'; // TODO: agregar rol Inspectoría

    // PASO 4: Solo Paralegal puede asentar
    if (stepOrder === 4) return usuario.tipo === 'Administrador'; // TODO: agregar rol Paralegal

    // PASO 5: Cualquiera del departamento puede generar certificado
    if (stepOrder === 5) return usuario.tipo === 'Administrador';

    // PASO 7: Solo AuU puede entregar
    if (stepOrder === 7) return usuario.tipo === 'Administrador'; // TODO: AuU es quien recibe en Formularios

    return false;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!solicitud) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">Solicitud no encontrada</div>
      </div>
    );
  }

  const steps = [
    { order: 1, name: 'Recepción (AuU)', field: 'fechaRecepcion', user: solicitud.recibidoPorId },
    { order: 2, name: 'Validación (Inspectoría)', field: 'fechaValidacion', user: solicitud.validadoPorId },
    { order: 3, name: 'Pago (Caja)', field: 'fechaPago', user: null },
    { order: 4, name: 'Asentamiento (Paralegal)', field: 'fechaAsentamiento', user: solicitud.asentadoPorId },
    { order: 5, name: 'Certificado Generado', field: null, user: null },
    { order: 6, name: 'Firma (Registro)', field: 'fechaFirma', user: solicitud.firmadoPorId },
    { order: 7, name: 'Entrega (AuU)', field: 'fechaEntrega', user: solicitud.entregadoPorId }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Solicitud {solicitud.codigo}
          </h1>
          <p className="text-gray-600">
            {solicitud.tipoSolicitud === 'REGISTRO_NUEVO' ? 'Registro Nuevo' : 'Renovación'} - {solicitud.empresa?.nombreEmpresa}
          </p>
        </div>
        <button
          onClick={() => navigate('/inspectoria/solicitudes')}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Volver al Listado
        </button>
      </div>

      {/* Alerts */}
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

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        </div>
      )}

      {/* Timeline - Visual Progress */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Flujo de Trabajo (PR-DI-002)</h2>

        <div className="relative">
          {/* Progress line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" style={{ zIndex: 0 }}></div>
          <div
            className="absolute top-5 left-0 h-0.5 bg-blue-500 transition-all duration-500"
            style={{
              width: `${((solicitud.estado?.orden || 1) - 1) / 6 * 100}%`,
              zIndex: 0
            }}
          ></div>

          {/* Steps */}
          <div className="relative flex justify-between" style={{ zIndex: 1 }}>
            {steps.map((step) => {
              const status = getStepStatus(step.order);
              return (
                <div key={step.order} className="flex flex-col items-center" style={{ flex: 1 }}>
                  {/* Circle */}
                  <div className={`w-10 h-10 rounded-full ${getStepColor(status)} flex items-center justify-center text-white font-bold mb-2 relative z-10 border-4 border-white`}>
                    {status === 'completed' ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      step.order
                    )}
                  </div>

                  {/* Label */}
                  <div className="text-center max-w-24">
                    <div className={`text-xs font-medium ${status === 'current' ? 'text-blue-600' : 'text-gray-600'}`}>
                      {step.name}
                    </div>
                    {step.field && (solicitud as any)[step.field] && (
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date((solicitud as any)[step.field]).toLocaleDateString('es-DO')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current step indicator */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <div className="font-semibold text-blue-900">Estado Actual: {solicitud.estado?.nombre}</div>
              <div className="text-sm text-blue-700">Paso {solicitud.estado?.orden} de 7</div>
            </div>
          </div>
        </div>
      </div>

      {/* Información de la Empresa */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de la Empresa</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Nombre de la Empresa</label>
            <div className="text-gray-900">{solicitud.empresa?.nombreEmpresa}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">RNC</label>
            <div className="text-gray-900">{solicitud.empresa?.rnc}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Categoría IRC</label>
            <div className="text-gray-900">{solicitud.empresa?.categoriaIrc?.codigo} - {solicitud.empresa?.categoriaIrc?.nombre}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Tipo de Persona</label>
            <div className="text-gray-900">{solicitud.empresa?.tipoPersona === 'MORAL' ? 'Persona Moral' : 'Persona Física'}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Provincia</label>
            <div className="text-gray-900">{solicitud.empresa?.provincia?.nombre}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Teléfono</label>
            <div className="text-gray-900">{solicitud.empresa?.telefono || '-'}</div>
          </div>
        </div>
      </div>

      {/* Información de Factura (si existe) */}
      {solicitud.facturaId && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de Factura</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Número de Factura</label>
              <div className="text-gray-900">#{solicitud.facturaId}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Monto</label>
              <div className="text-gray-900">RD$ {((solicitud.empresa?.categoriaIrc?.precio || 0) * 1.18).toLocaleString('es-DO')}</div>
              <div className="text-xs text-gray-500">Incluye 18% ITBIS</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Estado de Pago</label>
              <div>
                {solicitud.fechaPago ? (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Pagado - {new Date(solicitud.fechaPago).toLocaleDateString('es-DO')}
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Pendiente de Pago
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Número de Asiento (si existe) */}
      {solicitud.numeroAsiento && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Datos de Asentamiento</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Número de Asiento</label>
              <div className="text-gray-900 font-mono text-lg">{solicitud.numeroAsiento}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Libro</label>
              <div className="text-gray-900">{solicitud.libroAsiento}</div>
            </div>
          </div>
        </div>
      )}

      {/* Action Forms based on current step */}

      {/* PASO 2: Validación (Inspectoría) */}
      {solicitud.estado?.orden === 2 && canUserProcessStep(2) && (
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-blue-500">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Acción Requerida: Validar Solicitud
          </h2>
          <p className="text-gray-600 mb-4">
            Revise los documentos de la empresa y valide esta solicitud. Al validar se generará automáticamente
            la factura por RD$ {((solicitud.empresa?.categoriaIrc?.precio || 0) * 1.18).toLocaleString('es-DO')}
            (incluye 18% ITBIS) y se enviará al módulo de Caja para procesamiento del pago.
          </p>
          <button
            onClick={handleValidar}
            disabled={processing}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {processing && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            Validar y Generar Factura
          </button>
        </div>
      )}

      {/* PASO 3: Esperando Pago */}
      {solicitud.estado?.orden === 3 && (
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-yellow-500">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Esperando Pago en Caja
          </h2>
          <p className="text-gray-600 mb-4">
            La factura #{solicitud.facturaId} ha sido generada y está pendiente de pago en el módulo de Caja.
            El sistema actualizará automáticamente esta solicitud cuando el pago sea registrado.
          </p>
          <div className="flex items-center gap-2 text-yellow-700">
            <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Esperando confirmación de pago...</span>
          </div>
        </div>
      )}

      {/* PASO 4: Asentamiento (Paralegal) */}
      {solicitud.estado?.orden === 4 && canUserProcessStep(4) && (
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-blue-500">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Acción Requerida: Asentar en Libro Físico
          </h2>
          <p className="text-gray-600 mb-4">
            Ingrese el número de asiento del libro físico donde se registró esta solicitud.
          </p>
          <form onSubmit={handleAsentar} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Asiento <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={numeroAsiento}
                  onChange={(e) => setNumeroAsiento(e.target.value)}
                  placeholder="Ej: 2025-0001"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Libro <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={libroAsiento}
                  onChange={(e) => setLibroAsiento(e.target.value)}
                  placeholder="Ej: Libro I - Tomo 5"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={processing}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {processing && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              Asentar Solicitud
            </button>
          </form>
        </div>
      )}

      {/* PASO 5: Generar Certificado */}
      {solicitud.estado?.orden === 5 && canUserProcessStep(5) && (
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-blue-500">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Acción Requerida: Generar Certificado
          </h2>
          <p className="text-gray-600 mb-4">
            La solicitud ha sido asentada correctamente. Genere el certificado PDF que será enviado
            al Departamento de Registro para su firma digital.
          </p>
          <button
            onClick={handleGenerarCertificado}
            disabled={processing}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {processing && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            Generar Certificado PDF
          </button>
        </div>
      )}

      {/* PASO 6: Esperando Firma */}
      {solicitud.estado?.orden === 6 && (
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-green-500">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Esperando Firma del Departamento de Registro
          </h2>
          <p className="text-gray-600 mb-4">
            El certificado ha sido generado y enviado al Departamento de Registro para su firma digital
            en el portal GOB.DO. El sistema actualizará automáticamente cuando el certificado sea firmado.
          </p>
          <div className="flex items-center gap-2 text-green-700">
            <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Esperando firma digital...</span>
          </div>
        </div>
      )}

      {/* PASO 7: Entrega (AuU) */}
      {solicitud.estado?.orden === 7 && canUserProcessStep(7) && (
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-green-500">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Acción Requerida: Entregar Certificado al Cliente
          </h2>
          <p className="text-gray-600 mb-4">
            El certificado ha sido firmado por el Departamento de Registro. Confirme que ha sido
            entregado al cliente. Esto completará el proceso y actualizará el registro de la empresa.
          </p>
          <button
            onClick={handleEntregar}
            disabled={processing}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {processing && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            Confirmar Entrega al Cliente
          </button>
        </div>
      )}

      {/* Completed */}
      {solicitud.estado?.orden && solicitud.estado.orden > 7 && (
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-green-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-green-900">Proceso Completado</h2>
              <p className="text-green-700">El certificado ha sido entregado exitosamente al cliente.</p>
            </div>
          </div>
        </div>
      )}

      {/* Observaciones */}
      {solicitud.observaciones && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Observaciones</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{solicitud.observaciones}</p>
        </div>
      )}
    </div>
  );
}
