import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { clientesService, Cliente } from '../../services/clientesService';
import { visitasService } from '../../services/visitasService';
import { archivosService, ClienteArchivo } from '../../services/archivosService';

const ClienteDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadCliente(parseInt(id));
    }
  }, [id]);

  const loadCliente = async (clienteId: number) => {
    setLoading(true);
    try {
      const data = await clientesService.getCliente(clienteId);
      setCliente(data);
    } catch (error) {
      console.error('Error cargando cliente:', error);
      navigate('/clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!cliente || !window.confirm('¿Está seguro de eliminar este cliente?')) return;

    try {
      await clientesService.deleteCliente(cliente.id);
      navigate('/clientes');
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      alert('Error al eliminar el cliente');
    }
  };

  const handleRegistrarSalida = async (visitaId: number) => {
    if (!window.confirm('¿Confirma el registro de salida?')) return;

    try {
      await visitasService.registrarSalida(visitaId);
      // Recargar datos del cliente para actualizar las visitas
      if (id) {
        loadCliente(parseInt(id));
      }
    } catch (error) {
      console.error('Error registrando salida:', error);
      alert('Error al registrar la salida');
    }
  };

  const handleEliminarArchivo = async (archivoId: number) => {
    if (!window.confirm('¿Está seguro de eliminar este archivo?')) return;

    try {
      if (cliente) {
        await archivosService.deleteArchivoCliente(cliente.id, archivoId);
        // Recargar datos del cliente
        loadCliente(cliente.id);
      }
    } catch (error) {
      console.error('Error eliminando archivo:', error);
      alert('Error al eliminar el archivo');
    }
  };

  const handleVerArchivo = (rutaArchivo: string) => {
    const url = archivosService.getArchivoUrl(rutaArchivo);
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Cliente no encontrado</p>
        <button
          onClick={() => navigate('/clientes')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Volver a Clientes
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/clientes')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{cliente.nombrecompleto}</h1>
            <p className="text-gray-600 mt-1">Código: {cliente.codigo}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            to={`/clientes/${cliente.id}/editar`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Eliminar
          </button>
        </div>
      </div>

      {/* Información General */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Información de Identificación</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem label="Identificación" value={cliente.identificacion} />
            <InfoItem label="Tipo de Identificación" value={cliente.tipoIdentificacion || '-'} />
            <InfoItem label="Tipo de Cliente" value={cliente.tipo.nombre} />
            <InfoItem label="Nacionalidad" value={cliente.nacionalidad.nombre} />
            <InfoItem label="Género" value={cliente.genero === 'M' ? 'Masculino' : cliente.genero === 'F' ? 'Femenino' : '-'} />
          </div>
        </div>
      </div>

      {/* Datos Personales */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Datos Personales</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem label="Nombre" value={cliente.nombre} />
            <InfoItem label="Apellido" value={cliente.apellido || '-'} />
            <InfoItem label="Nombre Completo" value={cliente.nombrecompleto} className="md:col-span-2" />
            <InfoItem label="Seudónimo" value={cliente.seudonimo || '-'} />
            {cliente.fechaFallecimiento && (
              <InfoItem
                label="Fecha de Fallecimiento"
                value={new Date(cliente.fechaFallecimiento).toLocaleDateString('es-DO')}
              />
            )}
          </div>
        </div>
      </div>

      {/* Dirección */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Dirección</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem label="Dirección" value={cliente.direccion || '-'} className="md:col-span-2" />
            <InfoItem label="Sector" value={cliente.sector || '-'} />
            <InfoItem label="Municipio" value={cliente.municipio || '-'} />
            <InfoItem label="Provincia" value={cliente.provincia || '-'} />
          </div>
        </div>
      </div>

      {/* Información de Contacto */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Información de Contacto</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoItem label="Teléfono" value={cliente.telefono || '-'} />
            <InfoItem label="Móvil" value={cliente.movil || '-'} />
            <InfoItem label="Correo Electrónico" value={cliente.correo || '-'} />
          </div>
        </div>
      </div>

      {/* Información del Sistema */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Información del Sistema</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem
              label="Fecha de Creación"
              value={new Date(cliente.creadoEn).toLocaleString('es-DO')}
            />
            <InfoItem
              label="Última Actualización"
              value={new Date(cliente.actualizadoEn).toLocaleString('es-DO')}
            />
          </div>
        </div>
      </div>

      {/* Historial de Visitas */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Historial de Visitas</h2>
        </div>
        <div className="p-6">
          {cliente.visitas && cliente.visitas.length > 0 ? (
            <div className="space-y-4">
              {cliente.visitas.map((visita) => (
                <div key={visita.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Tipo de Visita</p>
                        <p className="font-medium text-gray-900">{visita.tipoVisita}</p>
                      </div>
                      {visita.departamento && (
                        <div>
                          <p className="text-sm text-gray-600">Departamento</p>
                          <p className="font-medium text-gray-900">{visita.departamento}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-600">Fecha de Entrada</p>
                        <p className="font-medium text-gray-900">
                          {new Date(visita.fechaEntrada).toLocaleString('es-DO')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Fecha de Salida</p>
                        {visita.fechaSalida ? (
                          <p className="font-medium text-gray-900">
                            {new Date(visita.fechaSalida).toLocaleString('es-DO')}
                          </p>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              En Instalaciones
                            </span>
                            <button
                              onClick={() => handleRegistrarSalida(visita.id)}
                              className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              Registrar Salida
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-4">
              No hay visitas registradas
            </p>
          )}
        </div>
      </div>

      {/* Documentos Adjuntos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Documentos Adjuntos</h2>
        </div>
        <div className="p-6">
          {cliente.archivos && cliente.archivos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cliente.archivos.map((archivo) => (
                <div key={archivo.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    {/* Icono del archivo */}
                    <div className="flex-shrink-0">
                      {archivo.tipo.includes('pdf') ? (
                        <svg className="h-10 w-10 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-10 w-10 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>

                    {/* Información del archivo */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {archivo.nombre}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {archivo.tipo}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {(archivo.tamano / 1024).toFixed(1)} KB • {new Date(archivo.creadoEn).toLocaleDateString('es-DO')}
                      </p>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleVerArchivo(archivo.ruta)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Ver archivo"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEliminarArchivo(archivo.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Eliminar archivo"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-4">
              No hay documentos adjuntos
            </p>
          )}
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Actividad Reciente</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-600 text-center py-4">
            No hay actividad reciente para mostrar
          </p>
          {/* TODO: Implementar lista de formularios, certificados y facturas relacionados */}
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({
  label,
  value,
  icon,
  className = '',
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        {icon && <div className="text-gray-400">{icon}</div>}
        <p className="text-gray-900 font-medium">{value}</p>
      </div>
    </div>
  );
};

export default ClienteDetailPage;
