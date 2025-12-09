import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import aauFormulariosService, { Formulario } from '../../services/aauFormulariosService';

export default function FormularioAauDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState<Formulario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [archivos, setArchivos] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      cargarFormulario(parseInt(id));
      cargarArchivos(parseInt(id));
    }
  }, [id]);

  const cargarFormulario = async (formularioId: number) => {
    try {
      setLoading(true);
      const response = await aauFormulariosService.getFormularioById(formularioId);
      setFormulario(response.data);
    } catch (err: any) {
      setError('Error al cargar el formulario: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const cargarArchivos = async (formularioId: number) => {
    try {
      const response = await aauFormulariosService.getArchivosByFormulario(formularioId);
      setArchivos(response.data || []);
    } catch (err: any) {
      console.error('Error al cargar archivos:', err);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Recibido': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Asentado': return 'bg-green-100 text-green-800 border-green-300';
      case 'Devuelto': return 'bg-red-100 text-red-800 border-red-300';
      case 'Con Certificado': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Entregado': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando formulario...</p>
        </div>
      </div>
    );
  }

  if (error || !formulario) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-red-900 font-semibold mb-1">Error al cargar formulario</h3>
              <p className="text-red-800">{error || 'Formulario no encontrado'}</p>
              <button
                onClick={() => navigate('/aau/formularios')}
                className="mt-4 text-red-700 hover:text-red-900 underline"
              >
                Volver a la lista
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Link to="/aau/formularios" className="hover:text-blue-600">
            Formularios
          </Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span>{formulario.codigo}</span>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{formulario.codigo}</h1>
            <p className="text-gray-600">
              Formulario de registro de obras - Creado el {new Date(formulario.creadoEn).toLocaleDateString('es-DO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          <div>
            <span className={`inline-block px-4 py-2 rounded-lg font-semibold border-2 ${getEstadoColor(formulario.estado.nombre)}`}>
              {formulario.estado.nombre}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Autores */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Autores
            </h2>
            <div className="space-y-3">
              {formulario.clientes.map((fc) => (
                <div key={fc.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{fc.cliente.nombrecompleto}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Código:</span> {fc.cliente.codigo}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Identificación:</span> {fc.cliente.identificacion}
                      </p>
                      {fc.cliente.telefono && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Teléfono:</span> {fc.cliente.telefono}
                        </p>
                      )}
                      {fc.cliente.correo && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Correo:</span> {fc.cliente.correo}
                        </p>
                      )}
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                      {fc.tipoRelacion}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Obras */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Obras Registradas
            </h2>
            <div className="space-y-4">
              {formulario.productos.map((fp) => (
                <div key={fp.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{fp.producto.nombre}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {fp.producto.codigo} - {fp.producto.categoria}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded">
                      Cantidad: {fp.cantidad}
                    </span>
                  </div>

                  {/* Campos dinámicos del producto */}
                  {fp.campos && fp.campos.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-3">Datos de la obra:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {fp.campos.map((campo: any) => (
                          <div key={campo.id} className="text-sm">
                            <span className="font-medium text-gray-600">{campo.campo.titulo}:</span>
                            <span className="ml-2 text-gray-900">
                              {campo.valor || <span className="text-gray-400 italic">No especificado</span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Archivos */}
          {archivos.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Archivos Adjuntos
              </h2>
              <div className="space-y-2">
                {archivos.map((archivo) => (
                  <div key={archivo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{archivo.nombreOriginal}</p>
                        <p className="text-xs text-gray-500">
                          {(parseInt(archivo.tamano) / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <a
                      href={aauFormulariosService.getDownloadUrl(archivo.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Descargar
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Firma */}
          {formulario.firma && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Firma Digital
              </h2>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <img
                  src={formulario.firma}
                  alt="Firma digital"
                  className="max-w-md mx-auto"
                />
              </div>
            </div>
          )}

          {/* Observaciones */}
          {formulario.observaciones && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Observaciones</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{formulario.observaciones}</p>
            </div>
          )}
        </div>

        {/* Sidebar derecha */}
        <div className="space-y-6">
          {/* Información general */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información General</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Código</p>
                <p className="font-medium text-gray-900">{formulario.codigo}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <span className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold ${getEstadoColor(formulario.estado.nombre)}`}>
                  {formulario.estado.nombre}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-600">Monto Total</p>
                <p className="font-bold text-2xl text-gray-900">
                  RD$ {Number(formulario.montoTotal).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Fecha de Creación</p>
                <p className="font-medium text-gray-900">
                  {new Date(formulario.creadoEn).toLocaleDateString('es-DO')}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Recibido por</p>
                <p className="font-medium text-gray-900">
                  {formulario.usuario.nombrecompleto}
                </p>
                <p className="text-sm text-gray-500">{formulario.usuario.codigo}</p>
              </div>

              {formulario.libro && (
                <div>
                  <p className="text-sm text-gray-600">Libro</p>
                  <p className="font-medium text-gray-900">{formulario.libro}</p>
                </div>
              )}

              {formulario.hoja && (
                <div>
                  <p className="text-sm text-gray-600">Hoja</p>
                  <p className="font-medium text-gray-900">{formulario.hoja}</p>
                </div>
              )}

              {formulario.fechaAsentamiento && (
                <div>
                  <p className="text-sm text-gray-600">Fecha Asentamiento</p>
                  <p className="font-medium text-gray-900">
                    {new Date(formulario.fechaAsentamiento).toLocaleDateString('es-DO')}
                  </p>
                </div>
              )}

              {formulario.fechaEntrega && (
                <div>
                  <p className="text-sm text-gray-600">Fecha Entrega</p>
                  <p className="font-medium text-gray-900">
                    {new Date(formulario.fechaEntrega).toLocaleDateString('es-DO')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Factura */}
          {formulario.factura && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Factura</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Número</p>
                  <Link
                    to={`/facturas/${formulario.factura.id}`}
                    className="font-medium text-blue-600 hover:text-blue-800"
                  >
                    {formulario.factura.codigo}
                  </Link>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="font-bold text-xl text-gray-900">
                    RD$ {Number(formulario.factura.total).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h2>
            <div className="space-y-2">
              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir
              </button>

              <button
                onClick={() => navigate('/aau/formularios')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver a la Lista
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
