import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import aauService, { Formulario } from '../../services/aauService';

const FormulariosDevueltosPage = () => {
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFormulariosDevueltos();
  }, []);

  const fetchFormulariosDevueltos = async () => {
    try {
      setLoading(true);
      const response = await aauService.getFormulariosDevueltos();
      setFormularios(response.data || response);
    } catch (error) {
      console.error('Error al cargar formularios devueltos:', error);
      alert('Error al cargar formularios devueltos');
    } finally {
      setLoading(false);
    }
  };

  const getClienteNombre = (formulario: Formulario) => {
    if (formulario.clientes && formulario.clientes.length > 0) {
      return formulario.clientes[0].cliente.nombrecompleto;
    }
    return 'Sin cliente';
  };

  const getTipo = (formulario: Formulario) => {
    if (formulario.productos && formulario.productos.length > 0) {
      return formulario.productos[0].producto.categoria;
    }
    return 'Sin categoría';
  };

  return (
    <div className="space-y-6">
      {/* Header con alerta */}
      <div className="bg-red-50 border-l-4 border-red-500 rounded-lg shadow-lg p-6">
        <div className="flex items-start">
          <div className="text-4xl mr-4 animate-pulse">⚠️</div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-red-900 mb-2">
              Formularios Devueltos - Requieren Corrección
            </h1>
            <p className="text-red-700">
              Estos formularios fueron devueltos por el Departamento de Registro y necesitan ser corregidos URGENTEMENTE.
              Una vez corregidos, serán reenviados automáticamente sin pasar por caja.
            </p>
          </div>
        </div>
      </div>

      {/* Botón volver */}
      <div>
        <Link
          to="/aau"
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 inline-block"
        >
          ← Volver al Dashboard
        </Link>
      </div>

      {/* Lista de formularios devueltos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando formularios devueltos...</p>
            </div>
          </div>
        ) : formularios.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¡No hay formularios devueltos!
            </h3>
            <p className="text-gray-600 mb-4">Todos los formularios están en orden</p>
            <Link
              to="/aau"
              className="text-blue-600 hover:text-blue-800"
            >
              Volver al Dashboard →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {formularios.map((formulario) => (
              <div
                key={formulario.id}
                className="p-6 hover:bg-red-50 transition-colors border-l-4 border-red-500"
              >
                <div className="flex items-start justify-between">
                  {/* Info principal */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-lg font-bold text-gray-900">
                        {formulario.codigo}
                      </h3>
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
                        ⚠️ DEVUELTO
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Cliente</p>
                        <p className="text-sm font-medium text-gray-900">
                          {getClienteNombre(formulario)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Tipo de Obra</p>
                        <p className="text-sm font-medium text-gray-900">
                          {getTipo(formulario)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Devuelto el</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formulario.fechaDevolucion
                            ? new Date(formulario.fechaDevolucion).toLocaleDateString('es-DO', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Motivo de devolución */}
                    {formulario.mensajeDevolucion && (
                      <div className="bg-red-100 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-xs font-semibold text-red-900 mb-1">
                          MOTIVO DE DEVOLUCIÓN:
                        </p>
                        <p className="text-sm text-red-800">
                          {formulario.mensajeDevolucion}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="ml-6 flex flex-col gap-2">
                    <Link
                      to={`/aau/formularios/${formulario.id}/corregir`}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold text-center shadow-lg transform hover:scale-105 transition-all"
                    >
                      CORREGIR AHORA
                    </Link>
                    <Link
                      to={`/aau/formularios/${formulario.id}`}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-center text-sm"
                    >
                      Ver Detalle
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resumen */}
      {!loading && formularios.length > 0 && (
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <p className="text-sm text-red-800">
            <span className="font-bold">{formularios.length}</span> formulario(s) requieren corrección urgente.
            Prioridad: Alta ⚠️
          </p>
        </div>
      )}
    </div>
  );
};

export default FormulariosDevueltosPage;
