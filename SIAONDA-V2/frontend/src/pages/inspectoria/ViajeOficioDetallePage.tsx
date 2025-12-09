import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerViaje, cerrarViaje, cancelarViaje, ViajeOficio } from '../../services/viajesOficioService';
import { listarActasDeViaje, ActaInspeccionOficio } from '../../services/actasOficioService';

export default function ViajeOficioDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [viaje, setViaje] = useState<ViajeOficio | null>(null);
  const [actas, setActas] = useState<ActaInspeccionOficio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCerrarModal, setShowCerrarModal] = useState(false);
  const [showCancelarModal, setShowCancelarModal] = useState(false);

  useEffect(() => {
    if (id) {
      cargarViaje();
      cargarActas();
    }
  }, [id]);

  const cargarViaje = async () => {
    try {
      const data = await obtenerViaje(Number(id));
      setViaje(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarActas = async () => {
    try {
      const data = await listarActasDeViaje(Number(id));
      setActas(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (!viaje) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          Viaje no encontrado
        </div>
      </div>
    );
  }

  const getEstadoBadge = (estado: string) => {
    const colors = {
      ABIERTO: 'bg-blue-100 text-blue-800',
      CERRADO: 'bg-green-100 text-green-800',
      CANCELADO: 'bg-red-100 text-red-800'
    };
    return colors[estado as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/inspectoria/viajes-oficio')}
          className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1"
        >
          ← Volver a Viajes
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{viaje.codigo}</h1>
            <p className="text-gray-600">Viaje a {viaje.provincia.nombre}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoBadge(viaje.estadoViaje.nombre)}`}>
            {viaje.estadoViaje.nombre}
          </span>
        </div>
      </div>

      {/* Información del Viaje */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Información del Viaje</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Provincia</p>
            <p className="font-medium">{viaje.provincia.nombre}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Fecha de Inicio</p>
            <p className="font-medium">{new Date(viaje.fechaInicio).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Fecha de Fin</p>
            <p className="font-medium">
              {viaje.fechaFin ? new Date(viaje.fechaFin).toLocaleDateString() : 'En curso'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Creado por</p>
            <p className="font-medium">{viaje.creadoPor.nombrecompleto}</p>
          </div>
          {viaje.observaciones && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Observaciones</p>
              <p className="font-medium">{viaje.observaciones}</p>
            </div>
          )}
        </div>
      </div>

      {/* Inspectores Asignados */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Inspectores Asignados</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {viaje.inspectores.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-3">
              <p className="font-medium">{item.inspector.nombrecompleto}</p>
              <p className="text-sm text-gray-600">{item.inspector.codigo}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actas Registradas */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Actas Registradas ({actas.length})</h2>
          {viaje.estadoViaje.nombre === 'ABIERTO' && (
            <button
              onClick={() => navigate(`/inspectoria/actas-oficio/registrar?viajeId=${viaje.id}`)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            >
              + Registrar Acta
            </button>
          )}
        </div>

        {actas.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay actas registradas</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número Acta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inspector</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {actas.map((acta) => (
                  <tr key={acta.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{acta.numeroActa}</td>
                    <td className="px-6 py-4 text-sm">{acta.empresa.nombreEmpresa}</td>
                    <td className="px-6 py-4 text-sm">{acta.inspector.nombrecompleto}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(acta.fechaInspeccion).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Acciones */}
      {viaje.estadoViaje.nombre === 'ABIERTO' && (
        <div className="flex gap-3">
          <button
            onClick={() => setShowCerrarModal(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Cerrar Viaje
          </button>
          <button
            onClick={() => setShowCancelarModal(true)}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Cancelar Viaje
          </button>
        </div>
      )}
    </div>
  );
}
