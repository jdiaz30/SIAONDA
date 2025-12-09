import { useState } from 'react';
import { FiCheckCircle, FiUser, FiPackage, FiFileText, FiAlertCircle } from 'react-icons/fi';

interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string;
  precio: number;
}

interface Autor {
  id: number;
  cliente: any;
  rol: string;
  orden: number;
}

interface DatosFormulario {
  titulo: string;
  subtitulo: string;
  anioCreacion: number;
  descripcion: string;
  paisOrigen: string;
  archivos: File[];
}

interface Props {
  autores: Autor[];
  producto: Producto | null;
  datos: DatosFormulario;
  onEnviar: () => void;
  onVolver: () => void;
}

const ROLES_LABELS: Record<string, string> = {
  AUTOR_PRINCIPAL: 'Autor Principal',
  COAUTOR: 'Coautor',
  COMPOSITOR: 'Compositor',
  INTERPRETE: 'Intérprete',
  EDITOR: 'Editor',
  PRODUCTOR: 'Productor',
  ARREGLISTA: 'Arreglista',
  DIRECTOR: 'Director',
  OTRO: 'Otro',
};

const RevisionStep = ({ autores, producto, datos, onEnviar, onVolver }: Props) => {
  const [confirmado, setConfirmado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const handleEnviar = async () => {
    if (!confirmado) {
      alert('Debe confirmar que la información es correcta');
      return;
    }

    setEnviando(true);
    try {
      await onEnviar();
    } catch (error) {
      console.error('Error al enviar:', error);
      alert('Hubo un error al enviar el formulario');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <FiCheckCircle className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Paso 4: Revisión Final</h3>
            <p className="text-sm text-blue-800">
              Revise cuidadosamente toda la información antes de enviar. Una vez enviado, el formulario pasará a
              estado PENDIENTE y se generará una factura para pago en caja.
            </p>
          </div>
        </div>
      </div>

      {/* Sección 1: Autores */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
          <div className="flex items-center gap-3 text-white">
            <FiUser className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Autores y Colaboradores</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {autores.map((autor, index) => (
              <div key={autor.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-bold">{index + 1}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{autor.cliente.nombrecompleto}</p>
                  <p className="text-sm text-gray-600">Cédula: {autor.cliente.identificacion}</p>
                  {autor.cliente.telefono && (
                    <p className="text-sm text-gray-500">Tel: {autor.cliente.telefono}</p>
                  )}
                </div>
                <div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {ROLES_LABELS[autor.rol] || autor.rol}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sección 2: Tipo de Obra */}
      {producto && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center gap-3 text-white">
              <FiPackage className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Tipo de Obra</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Código</p>
                <p className="font-mono font-semibold text-gray-900">{producto.codigo}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 mb-1">Nombre</p>
                <p className="font-semibold text-gray-900">{producto.nombre}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Categoría</p>
                <p className="text-gray-900">{producto.categoria}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Precio Oficial</p>
                <p className="text-2xl font-bold text-blue-600">
                  RD$ {producto.precio.toLocaleString('es-DO')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sección 3: Datos de la Obra */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
          <div className="flex items-center gap-3 text-white">
            <FiFileText className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Datos de la Obra</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Título</p>
              <p className="font-semibold text-gray-900">{datos.titulo}</p>
            </div>
            {datos.subtitulo && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Subtítulo</p>
                <p className="text-gray-900">{datos.subtitulo}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600 mb-1">Año de Creación</p>
              <p className="text-gray-900">{datos.anioCreacion}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">País de Origen</p>
              <p className="text-gray-900">{datos.paisOrigen}</p>
            </div>
            {datos.descripcion && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 mb-1">Descripción</p>
                <p className="text-gray-900">{datos.descripcion}</p>
              </div>
            )}
          </div>

          {/* Archivos */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Archivos Adjuntos ({datos.archivos?.length || 0})
            </p>
            <div className="space-y-2">
              {datos.archivos?.map((archivo, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <FiFileText className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{archivo.name}</p>
                    <p className="text-sm text-gray-500">
                      {(archivo.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monto Total */}
      {producto && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-blue-100 mb-1">Monto Total a Pagar</p>
              <p className="text-4xl font-bold">RD$ {producto.precio.toLocaleString('es-DO')}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100">
                El pago se realizará en Caja una vez<br />enviado el formulario
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Confirmación */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <FiAlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-900 mb-2">Importante</h3>
            <ul className="space-y-1 text-sm text-yellow-800 mb-4">
              <li>• Revise cuidadosamente todos los datos antes de enviar</li>
              <li>• Una vez enviado, el formulario pasará a estado PENDIENTE</li>
              <li>• Se generará una factura que deberá pagar en Caja</li>
              <li>• Después del pago, el formulario será enviado a Registro para revisión</li>
            </ul>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmado}
                onChange={(e) => setConfirmado(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="font-medium text-yellow-900">
                Confirmo que toda la información es correcta y deseo enviar el formulario
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between">
        <button
          onClick={onVolver}
          disabled={enviando}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al Formulario
        </button>

        <button
          onClick={handleEnviar}
          disabled={!confirmado || enviando}
          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg flex items-center gap-2"
        >
          {enviando ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Enviando...
            </>
          ) : (
            <>
              <FiCheckCircle className="w-5 h-5" />
              Enviar Formulario
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default RevisionStep;
