import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { obtenerEmpresaPorId, EmpresaInspeccionada } from '../../services/inspectoriaService';
import { api } from '../../services/api';

interface AsientoInfo {
  numeroRegistro?: string;
  numeroLibro?: string;
  numeroHoja?: string;
  fechaAsentamiento?: string;
}

export default function EmpresaDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [empresa, setEmpresa] = useState<EmpresaInspeccionada | null>(null);
  const [asientoInfo, setAsientoInfo] = useState<AsientoInfo | null>(null);

  useEffect(() => {
    if (id) {
      cargarEmpresa();
    }
  }, [id]);

  const cargarEmpresa = async () => {
    try {
      setLoading(true);
      const empresaData = await obtenerEmpresaPorId(parseInt(id!));
      setEmpresa(empresaData);

      // Buscar solicitud asentada para obtener información del asiento
      try {
        const solicitudesResponse = await api.get('/inspectoria/solicitudes', {
          params: { empresaId: parseInt(id!), limit: 1 }
        });

        const solicitudes = solicitudesResponse.data.data || [];
        if (solicitudes.length > 0) {
          const solicitud = solicitudes[0];
          console.log('Solicitud encontrada:', solicitud);
          if (solicitud.numeroRegistro || solicitud.numeroLibro || solicitud.numeroHoja) {
            setAsientoInfo({
              numeroRegistro: solicitud.numeroRegistro || undefined,
              numeroLibro: solicitud.numeroLibro || undefined,
              numeroHoja: solicitud.numeroHoja || undefined,
              fechaAsentamiento: solicitud.fechaAsentamiento || undefined
            });
            console.log('Asiento info cargada:', {
              numeroLibro: solicitud.numeroLibro,
              numeroHoja: solicitud.numeroHoja
            });
          } else {
            console.log('La solicitud no tiene información de asiento aún');
          }
        } else {
          console.log('No se encontró ninguna solicitud para esta empresa');
        }
      } catch (err) {
        console.error('Error buscando información del asiento:', err);
      }
    } catch (error) {
      console.error('Error cargando empresa:', error);
      alert('Error al cargar la información de la empresa');
      navigate('/inspectoria/empresas');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !empresa) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600">Cargando información de la empresa...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Detalles de la Empresa IRC
          </h1>
          <p className="text-gray-600 mt-1">
            {empresa.nombreEmpresa}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to={`/inspectoria/empresas/${id}/editar`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Editar
          </Link>
          <button
            onClick={() => navigate('/inspectoria/empresas')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>

      {/* Información del Asiento de Registro */}
      {asientoInfo && (asientoInfo.numeroLibro || asientoInfo.numeroHoja) && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                Lugar de Asiento del Registro
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {asientoInfo.numeroLibro && (
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Libro</p>
                    <p className="text-blue-900 font-semibold">{asientoInfo.numeroLibro}</p>
                  </div>
                )}
                {asientoInfo.numeroHoja && (
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Hoja</p>
                    <p className="text-blue-900 font-semibold">{asientoInfo.numeroHoja}</p>
                  </div>
                )}
                {asientoInfo.fechaAsentamiento && (
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Fecha de Asentamiento</p>
                    <p className="text-blue-900 font-semibold">
                      {new Date(asientoInfo.fechaAsentamiento).toLocaleDateString('es-DO')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información General */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Información General
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Nombre / Razón Social</p>
            <p className="font-medium text-gray-900">{empresa.nombreEmpresa}</p>
          </div>
          {empresa.nombreComercial && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Nombre Comercial</p>
              <p className="font-medium text-gray-900">{empresa.nombreComercial}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600 mb-1">RNC</p>
            <p className="font-medium text-gray-900">{empresa.rnc}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Tipo de Persona</p>
            <p className="font-medium text-gray-900">
              {empresa.tipoPersona === 'MORAL' ? 'Persona Moral (Empresa)' : 'Persona Física (Individual)'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Categoría IRC</p>
            <p className="font-medium text-gray-900">
              {empresa.categoriaIrc?.codigo} - {empresa.categoriaIrc?.nombre}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Estado</p>
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
              empresa.registrado
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {empresa.registrado ? 'Registrada' : 'Pendiente'}
            </span>
          </div>
          {empresa.fechaConstitucion && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Fecha de Constitución</p>
              <p className="font-medium text-gray-900">
                {new Date(empresa.fechaConstitucion).toLocaleDateString('es-DO')}
              </p>
            </div>
          )}
          {empresa.fechaVencimiento && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Fecha de Vencimiento</p>
              <p className="font-medium text-gray-900">
                {new Date(empresa.fechaVencimiento).toLocaleDateString('es-DO')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Datos del Propietario (Persona Física) */}
      {empresa.tipoPersona === 'FISICA' && empresa.nombrePropietario && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Datos del Propietario
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Nombre Completo</p>
              <p className="font-medium text-gray-900">{empresa.nombrePropietario}</p>
            </div>
            {empresa.cedulaPropietario && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Cédula</p>
                <p className="font-medium text-gray-900">{empresa.cedulaPropietario}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Consejo de Administración (Persona Moral) */}
      {empresa.tipoPersona === 'MORAL' && empresa.consejoAdministracion && empresa.consejoAdministracion.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Consejo de Administración
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cédula</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {empresa.consejoAdministracion.map((miembro, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-900">{miembro.nombreCompleto}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{miembro.cargo}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{miembro.cedula || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ubicación y Contacto */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Ubicación y Contacto
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <p className="text-sm text-gray-600 mb-1">Dirección</p>
            <p className="font-medium text-gray-900">{empresa.direccion}</p>
          </div>
          {empresa.provincia && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Provincia</p>
              <p className="font-medium text-gray-900">{empresa.provincia.nombre}</p>
            </div>
          )}
          {empresa.sector && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Sector</p>
              <p className="font-medium text-gray-900">{empresa.sector}</p>
            </div>
          )}
          {empresa.telefono && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Teléfono</p>
              <p className="font-medium text-gray-900">{empresa.telefono}</p>
            </div>
          )}
          {empresa.telefonoSecundario && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Teléfono Secundario</p>
              <p className="font-medium text-gray-900">{empresa.telefonoSecundario}</p>
            </div>
          )}
          {empresa.correoElectronico && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Correo Electrónico</p>
              <p className="font-medium text-gray-900">{empresa.correoElectronico}</p>
            </div>
          )}
          {empresa.paginaWeb && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Página Web</p>
              <a
                href={empresa.paginaWeb}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:text-blue-800"
              >
                {empresa.paginaWeb}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Principales Clientes */}
      {empresa.principalesClientes && empresa.principalesClientes.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Principales Clientes
          </h2>
          <div className="space-y-2">
            {empresa.principalesClientes.map((cliente, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{cliente.nombreCliente}</p>
                {cliente.descripcion && (
                  <p className="text-sm text-gray-600 mt-1">{cliente.descripcion}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Descripción de Actividades */}
      {empresa.descripcionActividades && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descripción de Actividades
          </h2>
          <p className="text-gray-700 whitespace-pre-wrap">{empresa.descripcionActividades}</p>
        </div>
      )}

      {/* Observaciones */}
      {empresa.observaciones && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            Observaciones
          </h2>
          <p className="text-gray-700 whitespace-pre-wrap">{empresa.observaciones}</p>
        </div>
      )}
    </div>
  );
}
