import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  crearCaso,
  buscarEmpresaPorRNC,
  EmpresaInspeccionada
} from '../../services/inspectoriaService';
import { useAuthStore } from '../../store/authStore';

export default function CasoFormPage() {
  const navigate = useNavigate();
  const { usuario } = useAuthStore();

  const [tipoCaso, setTipoCaso] = useState<'OFICIO' | 'DENUNCIA' | 'OPERATIVO'>('OFICIO');
  const [loading, setLoading] = useState(false);
  const [buscandoEmpresa, setBuscandoEmpresa] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rncBusqueda, setRncBusqueda] = useState('');
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<EmpresaInspeccionada | null>(null);

  const [formData, setFormData] = useState({
    origen: '',
    descripcion: '',
    inspectorAsignadoId: 0
  });

  const handleBuscarEmpresa = async () => {
    if (!rncBusqueda) {
      setError('Ingrese un RNC para buscar');
      return;
    }

    try {
      setBuscandoEmpresa(true);
      setError(null);
      setEmpresaSeleccionada(null);

      const empresa = await buscarEmpresaPorRNC(rncBusqueda);

      if (empresa) {
        setEmpresaSeleccionada(empresa);
      } else {
        setError('No se encontró ninguna empresa con ese RNC');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al buscar empresa');
    } finally {
      setBuscandoEmpresa(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!empresaSeleccionada) {
      setError('Debe buscar y seleccionar una empresa');
      return;
    }

    if (!formData.descripcion) {
      setError('La descripción del caso es obligatoria');
      return;
    }

    if (tipoCaso === 'DENUNCIA' && !formData.origen) {
      setError('Debe especificar el origen de la denuncia (quién denunció)');
      return;
    }

    try {
      setLoading(true);

      const caso = await crearCaso({
        empresaId: empresaSeleccionada.id!,
        tipoCaso,
        origen: formData.origen || null,
        descripcion: formData.descripcion,
        estadoCasoId: 1, // PENDIENTE_ASIGNACION
        // Si el usuario es Encargado, puede asignar directamente
        ...(formData.inspectorAsignadoId > 0 && {
          inspectorAsignadoId: formData.inspectorAsignadoId,
          estadoCasoId: 2 // ASIGNADO
        })
      });

      navigate(`/inspectoria/casos/${caso.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear el caso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Caso de Inspección</h1>
          <p className="text-gray-600">Crear caso de oficio, denuncia u operativo</p>
        </div>
        <button
          onClick={() => navigate('/inspectoria/casos')}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo de Caso */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tipo de Caso</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 ${
              tipoCaso === 'OFICIO' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}>
              <input
                type="radio"
                name="tipoCaso"
                value="OFICIO"
                checked={tipoCaso === 'OFICIO'}
                onChange={(e) => setTipoCaso(e.target.value as 'OFICIO')}
                className="mb-2"
              />
              <div className="font-medium text-gray-900">De Oficio</div>
              <div className="text-sm text-gray-500">Inspección programada por el departamento</div>
            </label>

            <label className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 ${
              tipoCaso === 'DENUNCIA' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}>
              <input
                type="radio"
                name="tipoCaso"
                value="DENUNCIA"
                checked={tipoCaso === 'DENUNCIA'}
                onChange={(e) => setTipoCaso(e.target.value as 'DENUNCIA')}
                className="mb-2"
              />
              <div className="font-medium text-gray-900">Inspección de Parte</div>
              <div className="text-sm text-gray-500">Denuncia de tercero (pagada en Caja)</div>
            </label>

            <label className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 ${
              tipoCaso === 'OPERATIVO' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}>
              <input
                type="radio"
                name="tipoCaso"
                value="OPERATIVO"
                checked={tipoCaso === 'OPERATIVO'}
                onChange={(e) => setTipoCaso(e.target.value as 'OPERATIVO')}
                className="mb-2"
              />
              <div className="font-medium text-gray-900">Operativo</div>
              <div className="text-sm text-gray-500">Operativo especial del departamento</div>
            </label>
          </div>

          {tipoCaso === 'DENUNCIA' && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-2">
                <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-yellow-800">
                  <strong>Nota:</strong> Las denuncias generalmente se crean automáticamente desde el módulo de Caja
                  cuando se paga el servicio de "Inspección de Parte". Use esta opción solo si necesita crear manualmente.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Buscar Empresa */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Empresa a Inspeccionar</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RNC de la Empresa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={rncBusqueda}
                  onChange={(e) => setRncBusqueda(e.target.value)}
                  placeholder="XXX-XXXXX-X"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleBuscarEmpresa}
                  disabled={buscandoEmpresa}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {buscandoEmpresa && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  Buscar
                </button>
              </div>
            </div>

            {empresaSeleccionada && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900 mb-2">Empresa Seleccionada</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-green-700 font-medium">Nombre:</span>
                        <div className="text-green-900">{empresaSeleccionada.nombreEmpresa}</div>
                      </div>
                      <div>
                        <span className="text-green-700 font-medium">RNC:</span>
                        <div className="text-green-900">{empresaSeleccionada.rnc}</div>
                      </div>
                      <div>
                        <span className="text-green-700 font-medium">Categoría:</span>
                        <div className="text-green-900">{empresaSeleccionada.categoriaIrc?.codigo}</div>
                      </div>
                      <div>
                        <span className="text-green-700 font-medium">Provincia:</span>
                        <div className="text-green-900">{empresaSeleccionada.provincia?.nombre}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detalles del Caso */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalles del Caso</h2>
          <div className="space-y-4">
            {tipoCaso === 'DENUNCIA' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Origen de la Denuncia <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.origen}
                  onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
                  placeholder="Nombre de quien denuncia"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {tipoCaso === 'OPERATIVO' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Operativo
                </label>
                <input
                  type="text"
                  value={formData.origen}
                  onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
                  placeholder="Ej: Operativo Navidad 2025"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción del Caso <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                rows={4}
                placeholder="Describa el motivo de la inspección, qué se va a verificar, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* TODO: Agregar selector de inspector si el usuario es Encargado */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-2">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-800">
                  El caso se creará en estado "Pendiente de Asignación". El Encargado deberá asignar un inspector
                  para que pueda proceder con la primera visita.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => navigate('/inspectoria/casos')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !empresaSeleccionada}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            Crear Caso
          </button>
        </div>
      </form>
    </div>
  );
}
