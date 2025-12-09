import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiClock,
  FiSearch,
  FiAlertTriangle,
  FiCheckCircle,
  FiPlus,
  FiFileText,
  FiSend,
  FiPackage
} from 'react-icons/fi';
import aauService, { EstadisticasDashboard } from '../../services/aauService';

const DashboardAauPage = () => {
  const [stats, setStats] = useState<EstadisticasDashboard>({
    pendientes: 0,
    enRevision: 0,
    devueltos: 0,
    certificados: 0,
    recibidosMes: 0,
    asentadosMes: 0,
    entregadosMes: 0,
    devueltosMes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEstadisticas();
  }, []);

  const fetchEstadisticas = async () => {
    try {
      setLoading(true);
      const data = await aauService.getEstadisticasDashboard();
      setStats(data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Atención al Usuario</h1>
        <p className="text-blue-100">Gestión de registros de obras y servicios ONDA</p>
      </div>

      {/* Resumen General */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen General</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pendientes */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-400">
            <div className="flex items-center justify-between mb-4">
              <FiClock className="text-4xl text-gray-500" />
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendientes}</p>
              </div>
            </div>
            <Link
              to="/aau/formularios?estado=PENDIENTE"
              className="text-sm text-blue-600 hover:text-blue-800 inline-block"
            >
              Ver todos →
            </Link>
          </div>

          {/* En Revisión */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-400">
            <div className="flex items-center justify-between mb-4">
              <FiSearch className="text-4xl text-blue-500" />
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">En Revisión</p>
                <p className="text-3xl font-bold text-blue-900">{stats.enRevision}</p>
              </div>
            </div>
            <Link
              to="/aau/formularios/en-revision"
              className="text-sm text-blue-600 hover:text-blue-800 inline-block"
            >
              Ver todos →
            </Link>
          </div>

          {/* Devueltos - CRÍTICO */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between mb-4">
              <FiAlertTriangle className="text-4xl text-red-500 animate-pulse" />
              <div className="text-right">
                <p className="text-sm font-medium text-red-600 font-bold">Devueltos</p>
                <p className="text-3xl font-bold text-red-700">{stats.devueltos}</p>
              </div>
            </div>
            <Link
              to="/aau/formularios/devueltos"
              className="text-sm text-red-600 hover:text-red-800 inline-block font-semibold"
            >
              CORREGIR AHORA →
            </Link>
          </div>

          {/* Certificados */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-400">
            <div className="flex items-center justify-between mb-4">
              <FiCheckCircle className="text-4xl text-green-500" />
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Certificados</p>
                <p className="text-3xl font-bold text-green-900">{stats.certificados}</p>
              </div>
            </div>
            <Link
              to="/aau/certificados-pendientes"
              className="text-sm text-blue-600 hover:text-blue-800 inline-block"
            >
              Pendientes entrega →
            </Link>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nuevo Registro */}
          <Link
            to="/aau/formularios/nuevo"
            className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-lg p-6 transition-all transform hover:scale-105"
          >
            <FiPlus className="text-4xl mb-3" />
            <h3 className="text-xl font-bold mb-2">Nuevo Registro</h3>
            <p className="text-blue-100 text-sm">
              Obras: Musical, Audiovisual, Literaria, Científica, etc.
            </p>
          </Link>

          {/* Nueva Solicitud IRC */}
          <Link
            to="/inspectoria/empresas/nueva"
            className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg shadow-lg p-6 transition-all transform hover:scale-105"
          >
            <FiPackage className="text-4xl mb-3" />
            <h3 className="text-xl font-bold mb-2">Registro IRC</h3>
            <p className="text-green-100 text-sm">
              Inscripción de Empresas IRC
            </p>
          </Link>
        </div>
      </div>

      {/* Gestión de Formularios */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Gestión de Formularios</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {/* Todos los Registros */}
            <Link
              to="/aau/formularios"
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <FiFileText className="text-2xl text-gray-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Todos los Registros</h3>
                  <p className="text-sm text-gray-600">Ver lista completa con filtros</p>
                </div>
              </div>
              <div className="text-gray-400">→</div>
            </Link>

            {/* Formularios Devueltos - DESTACADO */}
            {stats.devueltos > 0 && (
              <Link
                to="/aau/formularios/devueltos"
                className="flex items-center justify-between p-4 hover:bg-red-50 transition-colors bg-red-50 border-l-4 border-red-500"
              >
                <div className="flex items-center space-x-3">
                  <FiAlertTriangle className="text-2xl text-red-600 animate-pulse" />
                  <div>
                    <h3 className="font-bold text-red-700">
                      Formularios Devueltos ({stats.devueltos})
                    </h3>
                    <p className="text-sm text-red-600 font-semibold">
                      REQUIEREN CORRECCIÓN URGENTE
                    </p>
                  </div>
                </div>
                <div className="text-red-600 font-bold">→</div>
              </Link>
            )}

            {/* Enviados a Registro */}
            <Link
              to="/aau/formularios/en-revision"
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <FiSend className="text-2xl text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Enviados a Registro ({stats.enRevision})
                  </h3>
                  <p className="text-sm text-gray-600">En espera de revisión</p>
                </div>
              </div>
              <div className="text-gray-400">→</div>
            </Link>

            {/* Certificados Pendientes */}
            <Link
              to="/aau/certificados-pendientes"
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <FiCheckCircle className="text-2xl text-green-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Certificados Pendientes de Entrega ({stats.certificados})
                  </h3>
                  <p className="text-sm text-gray-600">Listos para que cliente recoja</p>
                </div>
              </div>
              <div className="text-gray-400">→</div>
            </Link>
          </div>
        </div>
      </div>

      {/* Estadísticas del Mes */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas del Mes</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Recibidos</p>
            <p className="text-2xl font-bold text-gray-900">{stats.recibidosMes}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Asentados</p>
            <p className="text-2xl font-bold text-green-700">{stats.asentadosMes}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Entregados</p>
            <p className="text-2xl font-bold text-green-700">{stats.entregadosMes}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Devueltos</p>
            <p className="text-2xl font-bold text-red-700">{stats.devueltosMes}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAauPage;
