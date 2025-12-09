import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { obtenerEmpresas, crearCaso, EmpresaInspeccionada } from '../../services/inspectoriaService';

export default function EmpresasVencidasPage() {
  const [empresas, setEmpresas] = useState<EmpresaInspeccionada[]>([]);
  const [loading, setLoading] = useState(true);
  const [seleccionadas, setSeleccionadas] = useState<number[]>([]);
  const [creandoCasos, setCreandoCasos] = useState(false);

  useEffect(() => {
    cargarEmpresasVencidas();
  }, []);

  const cargarEmpresasVencidas = async () => {
    try {
      setLoading(true);
      const response = await obtenerEmpresas({
        vencidas: true,
        registrado: true,
        page: 1,
        limit: 100
      });
      setEmpresas(response.empresas || []);
    } catch (error) {
      console.error('Error cargando empresas vencidas:', error);
      setEmpresas([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSeleccion = (id: number) => {
    if (seleccionadas.includes(id)) {
      setSeleccionadas(seleccionadas.filter(s => s !== id));
    } else {
      setSeleccionadas([...seleccionadas, id]);
    }
  };

  const seleccionarTodas = () => {
    if (seleccionadas.length === empresas.length) {
      setSeleccionadas([]);
    } else {
      setSeleccionadas(empresas.map(e => e.id!));
    }
  };

  const crearCasosInspeccion = async () => {
    if (seleccionadas.length === 0) {
      alert('Selecciona al menos una empresa');
      return;
    }

    if (!confirm(`¿Crear casos de inspección por renovación para ${seleccionadas.length} empresa(s)?`)) {
      return;
    }

    try {
      setCreandoCasos(true);

      for (const empresaId of seleccionadas) {
        const empresa = empresas.find(e => e.id === empresaId);
        if (!empresa) continue;

        await crearCaso({
          empresaId,
          tipoCaso: 'OFICIO',
          descripcion: `Inspección por renovación vencida. Fecha de vencimiento: ${new Date(empresa.fechaVencimiento!).toLocaleDateString()}`,
          origen: 'SISTEMA_AUTOMATICO',
          estadoCasoId: 1 // Estado inicial
        });
      }

      alert(`Se crearon ${seleccionadas.length} caso(s) de inspección exitosamente`);
      setSeleccionadas([]);
      cargarEmpresasVencidas();
    } catch (error: any) {
      console.error('Error creando casos:', error);
      alert('Error al crear casos de inspección: ' + (error.response?.data?.message || error.message));
    } finally {
      setCreandoCasos(false);
    }
  };

  const calcularDiasVencidos = (fechaVencimiento: string | Date) => {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diffTime = hoy.getTime() - vencimiento.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empresas con Renovación Vencida</h1>
          <p className="text-gray-600">Asignar inspecciones por oficio (PR-DI-001)</p>
        </div>
        <Link
          to="/inspectoria"
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Volver al Dashboard
        </Link>
      </div>

      {/* Stats */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-800">Total de Empresas Vencidas</p>
            <p className="text-3xl font-bold text-red-900">{empresas.length}</p>
            <p className="text-sm text-red-600 mt-1">Requieren inspección inmediata</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-red-800">Empresas Seleccionadas</p>
            <p className="text-3xl font-bold text-red-900">{seleccionadas.length}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      {empresas.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={seleccionarTodas}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {seleccionadas.length === empresas.length ? 'Deseleccionar Todas' : 'Seleccionar Todas'}
              </button>
              <span className="text-sm text-gray-600">
                {seleccionadas.length} de {empresas.length} seleccionadas
              </span>
            </div>
            <button
              onClick={crearCasosInspeccion}
              disabled={seleccionadas.length === 0 || creandoCasos}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {creandoCasos ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creando Casos...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Asignar Inspección por Renovación (Oficio)
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Listado */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {empresas.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">¡No hay empresas vencidas!</h3>
            <p className="mt-1 text-sm text-gray-500">
              Todas las empresas están al día con sus renovaciones
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={seleccionadas.length === empresas.length && empresas.length > 0}
                      onChange={seleccionarTodas}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RNC
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría IRC
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Vencimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Días Vencidos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provincia
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {empresas.map((empresa) => {
                  const diasVencidos = calcularDiasVencidos(empresa.fechaVencimiento!);
                  const urgencia = diasVencidos > 90 ? 'bg-red-100' : diasVencidos > 30 ? 'bg-orange-100' : 'bg-yellow-50';

                  return (
                    <tr key={empresa.id} className={`hover:bg-gray-50 ${urgencia}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={seleccionadas.includes(empresa.id!)}
                          onChange={() => toggleSeleccion(empresa.id!)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">{empresa.nombreEmpresa}</div>
                          {empresa.nombreComercial && (
                            <div className="text-sm text-gray-500">{empresa.nombreComercial}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono">{empresa.rnc}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{empresa.categoriaIrc?.codigo}</div>
                        <div className="text-xs text-gray-500">{empresa.categoriaIrc?.nombre}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-red-900">
                          {new Date(empresa.fechaVencimiento!).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          diasVencidos > 90
                            ? 'bg-red-200 text-red-900'
                            : diasVencidos > 30
                            ? 'bg-orange-200 text-orange-900'
                            : 'bg-yellow-200 text-yellow-900'
                        }`}>
                          {diasVencidos} días
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{empresa.provincia?.nombre}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
