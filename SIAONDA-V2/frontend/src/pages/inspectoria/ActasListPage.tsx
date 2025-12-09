import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';

interface Acta {
  id: number;
  numeroActa: string;
  fechaInspeccion: string;
  resultadoInspeccion: string;
  requiereSeguimiento: boolean;
  rutaPdfActa: string;
  inspector: {
    id: number;
    nombrecompleto: string;
    codigo: string;
  };
  empresa: {
    id: number;
    nombreEmpresa: string;
    rnc: string;
  };
  casoGenerado?: {
    id: number;
    codigo: string;
    estadoCaso: {
      nombre: string;
    };
  };
}

interface Viaje {
  id: number;
  numeroViaje: string;
  provincia: {
    nombre: string;
  };
  fechaInicio: string;
  estadoViaje: {
    nombre: string;
  };
}

export default function ActasListPage() {
  const { viajeId } = useParams<{ viajeId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [viaje, setViaje] = useState<Viaje | null>(null);
  const [actas, setActas] = useState<Acta[]>([]);

  useEffect(() => {
    cargarDatos();
  }, [viajeId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar info del viaje
      const viajeResponse = await api.get(`/inspectoria/viajes-oficio/${viajeId}`);
      setViaje(viajeResponse.data.data);

      // Cargar actas del viaje
      const actasResponse = await api.get(`/inspectoria/actas-oficio/viaje/${viajeId}`);
      setActas(actasResponse.data.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const descargarPDF = (rutaPdf: string, numeroActa: string) => {
    // Construir URL del PDF
    const pdfUrl = `${import.meta.env.VITE_API_URL}/${rutaPdf}`;
    window.open(pdfUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header con info del viaje */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Actas del Viaje {viaje?.numeroViaje}
            </h1>
            <p className="text-gray-600 mt-2">
              {viaje?.provincia.nombre} • {new Date(viaje?.fechaInicio || '').toLocaleDateString()}
            </p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
              viaje?.estadoViaje.nombre === 'ABIERTO' ? 'bg-green-100 text-green-800' :
              viaje?.estadoViaje.nombre === 'CERRADO' ? 'bg-gray-100 text-gray-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {viaje?.estadoViaje.nombre}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/inspectoria/viajes-oficio')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              ← Volver
            </button>
            {viaje?.estadoViaje.nombre === 'ABIERTO' && (
              <button
                onClick={() => navigate(`/inspectoria/actas-oficio/registrar?viajeId=${viajeId}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                + Registrar Acta
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista de actas */}
      {actas.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">No hay actas registradas para este viaje</p>
          {viaje?.estadoViaje.nombre === 'ABIERTO' && (
            <button
              onClick={() => navigate(`/inspectoria/actas-oficio/registrar?viajeId=${viajeId}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Registrar Primera Acta
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nº Acta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Inspector
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Resultado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Seguimiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Caso Generado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {actas.map((acta) => (
                <tr key={acta.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {acta.numeroActa}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(acta.fechaInspeccion).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{acta.empresa.nombreEmpresa}</div>
                    <div className="text-xs text-gray-500">RNC: {acta.empresa.rnc}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{acta.inspector.nombrecompleto}</div>
                    <div className="text-xs text-gray-500">{acta.inspector.codigo}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {acta.resultadoInspeccion}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {acta.requiereSeguimiento ? (
                      <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                        Sí
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {acta.casoGenerado ? (
                      <Link
                        to={`/inspectoria/casos/${acta.casoGenerado.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        {acta.casoGenerado.codigo}
                      </Link>
                    ) : (
                      <span className="text-xs text-gray-400">Sin caso</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => descargarPDF(acta.rutaPdfActa, acta.numeroActa)}
                        className="text-green-600 hover:text-green-800"
                        title="Ver PDF"
                      >
                        📄 PDF
                      </button>
                      <button
                        onClick={() => navigate(`/inspectoria/actas-oficio/${acta.id}/editar`)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Editar"
                      >
                        ✏️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Resumen */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Resumen</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-blue-700">Total actas:</span>
            <span className="ml-2 font-medium">{actas.length}</span>
          </div>
          <div>
            <span className="text-blue-700">Con seguimiento:</span>
            <span className="ml-2 font-medium">
              {actas.filter(a => a.requiereSeguimiento).length}
            </span>
          </div>
          <div>
            <span className="text-blue-700">Casos generados:</span>
            <span className="ml-2 font-medium">
              {actas.filter(a => a.casoGenerado).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
