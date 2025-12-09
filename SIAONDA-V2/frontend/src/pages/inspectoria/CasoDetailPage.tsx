import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  obtenerCasoPorId,
  asignarInspector,
  reportarPrimeraVisita,
  reportarSegundaVisita,
  cerrarCaso,
  CasoInspeccion
} from '../../services/inspectoriaService';

export default function CasoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [caso, setCaso] = useState<CasoInspeccion | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [inspectorId, setInspectorId] = useState(0);
  const [fechaPrimeraVisita, setFechaPrimeraVisita] = useState('');
  const [cumplimiento1, setCumplimiento1] = useState<boolean | null>(null);
  const [hallazgos1, setHallazgos1] = useState('');
  const [plazoCorreccion, setPlazoCorreccion] = useState(10);

  const [fechaSegundaVisita, setFechaSegundaVisita] = useState('');
  const [cumplimiento2, setCumplimiento2] = useState<boolean | null>(null);
  const [hallazgos2, setHallazgos2] = useState('');

  const [resolucion, setResolucion] = useState('');
  const [motivoCierre, setMotivoCierre] = useState('');

  useEffect(() => {
    cargarCaso();
  }, [id]);

  const cargarCaso = async () => {
    try {
      setLoading(true);
      const data = await obtenerCasoPorId(parseInt(id!));
      setCaso(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar el caso');
    } finally {
      setLoading(false);
    }
  };

  const handleAsignarInspector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caso || !inspectorId) return;

    try {
      setProcessing(true);
      setError(null);
      await asignarInspector(caso.id!, inspectorId);
      setSuccess('Inspector asignado exitosamente');
      await cargarCaso();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al asignar inspector');
    } finally {
      setProcessing(false);
    }
  };

  const handleReportar1raVisita = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caso || cumplimiento1 === null) return;

    try {
      setProcessing(true);
      setError(null);

      await reportarPrimeraVisita(caso.id!, {
        fechaVisita: fechaPrimeraVisita,
        cumplimiento: cumplimiento1,
        hallazgos: hallazgos1 || undefined,
        plazoCorreccion: cumplimiento1 === false ? plazoCorreccion : undefined
      });

      setSuccess(
        cumplimiento1
          ? 'Primera visita reportada. Caso cerrado exitosamente.'
          : `Primera visita reportada. La empresa tiene ${plazoCorreccion} días hábiles para corregir.`
      );
      await cargarCaso();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al reportar primera visita');
    } finally {
      setProcessing(false);
    }
  };

  const handleReportar2daVisita = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caso || cumplimiento2 === null) return;

    try {
      setProcessing(true);
      setError(null);

      await reportarSegundaVisita(caso.id!, {
        fechaVisita: fechaSegundaVisita,
        corrigioInfracciones: cumplimiento2,
        hallazgos: hallazgos2 || undefined
      });

      setSuccess(
        cumplimiento2
          ? 'Segunda visita reportada. Caso cerrado exitosamente.'
          : 'Segunda visita reportada. El caso será tramitado al Departamento Jurídico.'
      );
      await cargarCaso();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al reportar segunda visita');
    } finally {
      setProcessing(false);
    }
  };

  const handleCerrarCaso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caso) return;

    if (!window.confirm('¿Confirma que desea cerrar este caso?')) {
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      await cerrarCaso(caso.id!, {
        resolucion,
        motivoCierre
      });

      setSuccess('Caso cerrado exitosamente');
      await cargarCaso();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cerrar el caso');
    } finally {
      setProcessing(false);
    }
  };

  const calcularDiasRestantes = () => {
    if (!caso?.fechaLimiteCorreccion) return null;
    const limite = new Date(caso.fechaLimiteCorreccion);
    const hoy = new Date();
    const diff = Math.ceil((limite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!caso) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">Caso no encontrado</div>
      </div>
    );
  }

  const diasRestantes = calcularDiasRestantes();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Caso {caso.codigo}</h1>
          <p className="text-gray-600">{caso.empresa?.nombreEmpresa}</p>
        </div>
        <button
          onClick={() => navigate('/inspectoria/casos')}
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

      {/* Estado Actual */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Estado del Caso</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Estado</label>
            <div className="text-gray-900 font-semibold">{caso.estadoCaso?.nombre}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Tipo de Caso</label>
            <div className="text-gray-900">
              {caso.tipoCaso === 'OFICIO' && 'De Oficio'}
              {caso.tipoCaso === 'DENUNCIA' && 'Inspección de Parte'}
              {caso.tipoCaso === 'OPERATIVO' && 'Operativo'}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Fecha de Creación</label>
            <div className="text-gray-900">{new Date(caso.creadoEn!).toLocaleDateString('es-DO')}</div>
          </div>
        </div>

        {diasRestantes !== null && (
          <div className={`mt-4 p-4 rounded-lg ${
            diasRestantes < 0
              ? 'bg-red-50 border border-red-200'
              : diasRestantes <= 3
              ? 'bg-orange-50 border border-orange-200'
              : 'bg-blue-50 border border-blue-200'
          }`}>
            <div className={`font-semibold ${
              diasRestantes < 0 ? 'text-red-900' : diasRestantes <= 3 ? 'text-orange-900' : 'text-blue-900'
            }`}>
              Plazo de Corrección: {Math.abs(diasRestantes)} días {diasRestantes < 0 ? 'vencido' : 'restantes'}
            </div>
            <div className={`text-sm ${
              diasRestantes < 0 ? 'text-red-700' : diasRestantes <= 3 ? 'text-orange-700' : 'text-blue-700'
            }`}>
              Vence: {new Date(caso.fechaLimiteCorreccion!).toLocaleDateString('es-DO')}
            </div>
          </div>
        )}
      </div>

      {/* Información de la Empresa */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Empresa Inspeccionada</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Nombre</label>
            <div className="text-gray-900">{caso.empresa?.nombreEmpresa}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">RNC</label>
            <div className="text-gray-900">{caso.empresa?.rnc}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Dirección</label>
            <div className="text-gray-900">{caso.empresa?.direccion}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Teléfono</label>
            <div className="text-gray-900">{caso.empresa?.telefono || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Descripción del Caso */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Descripción del Caso</h2>
        <p className="text-gray-700 whitespace-pre-wrap">{caso.descripcion}</p>
        {caso.origen && (
          <div className="mt-2">
            <label className="text-sm font-medium text-gray-500">Origen:</label>
            <div className="text-gray-900">{caso.origen}</div>
          </div>
        )}
      </div>

      {/* Asignar Inspector */}
      {caso.estadoCaso?.orden === 1 && (
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-blue-500">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Asignar Inspector
          </h2>
          <form onSubmit={handleAsignarInspector} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seleccionar Inspector <span className="text-red-500">*</span>
              </label>
              <select
                value={inspectorId}
                onChange={(e) => setInspectorId(parseInt(e.target.value))}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccione un inspector</option>
                {/* TODO: Cargar inspectores desde el backend */}
                <option value="1">Inspector 1</option>
                <option value="2">Inspector 2</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={processing}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Asignar Inspector
            </button>
          </form>
        </div>
      )}

      {/* Reportar Primera Visita */}
      {caso.estadoCaso?.orden === 2 && !caso.fechaPrimeraVisita && (
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-blue-500">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Reportar Primera Visita
          </h2>
          <form onSubmit={handleReportar1raVisita} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de la Visita <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={fechaPrimeraVisita}
                onChange={(e) => setFechaPrimeraVisita(e.target.value)}
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿La empresa cumple con las normas? <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="cumplimiento1"
                    checked={cumplimiento1 === true}
                    onChange={() => setCumplimiento1(true)}
                    className="mr-2"
                  />
                  Sí, cumple
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="cumplimiento1"
                    checked={cumplimiento1 === false}
                    onChange={() => setCumplimiento1(false)}
                    className="mr-2"
                  />
                  No, tiene infracciones
                </label>
              </div>
            </div>

            {cumplimiento1 === false && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plazo para Corrección (días hábiles)
                </label>
                <input
                  type="number"
                  value={plazoCorreccion}
                  onChange={(e) => setPlazoCorreccion(parseInt(e.target.value))}
                  min="1"
                  max="30"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Por defecto: 10 días hábiles</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hallazgos y Observaciones
              </label>
              <textarea
                value={hallazgos1}
                onChange={(e) => setHallazgos1(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={processing || cumplimiento1 === null}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Reportar Primera Visita
            </button>
          </form>
        </div>
      )}

      {/* Reportar Segunda Visita */}
      {caso.estadoCaso?.orden === 4 && (
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-orange-500">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Reportar Segunda Visita
          </h2>
          <form onSubmit={handleReportar2daVisita} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de la Visita <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={fechaSegundaVisita}
                onChange={(e) => setFechaSegundaVisita(e.target.value)}
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿La empresa corrigió las infracciones? <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="cumplimiento2"
                    checked={cumplimiento2 === true}
                    onChange={() => setCumplimiento2(true)}
                    className="mr-2"
                  />
                  Sí, corrigió
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="cumplimiento2"
                    checked={cumplimiento2 === false}
                    onChange={() => setCumplimiento2(false)}
                    className="mr-2"
                  />
                  No, persiste
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hallazgos y Observaciones
              </label>
              <textarea
                value={hallazgos2}
                onChange={(e) => setHallazgos2(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={processing || cumplimiento2 === null}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              Reportar Segunda Visita
            </button>
          </form>
        </div>
      )}

      {/* Cerrar Caso Manualmente */}
      {caso.estadoCaso?.orden && caso.estadoCaso.orden < 5 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Cerrar Caso Manualmente
          </h2>
          <form onSubmit={handleCerrarCaso} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resolución
              </label>
              <input
                type="text"
                value={resolucion}
                onChange={(e) => setResolucion(e.target.value)}
                placeholder="Ej: RESUELTO_PAGO, CERRADO_ADMINISTRATIVAMENTE"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo del Cierre <span className="text-red-500">*</span>
              </label>
              <textarea
                value={motivoCierre}
                onChange={(e) => setMotivoCierre(e.target.value)}
                rows={3}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={processing}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cerrar Caso
            </button>
          </form>
        </div>
      )}

      {/* Caso Cerrado */}
      {caso.estadoCaso?.orden === 5 && (
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-green-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-green-900">Caso Cerrado</h2>
              <p className="text-green-700">Resolución: {caso.resolucion}</p>
              <p className="text-green-700 text-sm">{caso.motivoCierre}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
