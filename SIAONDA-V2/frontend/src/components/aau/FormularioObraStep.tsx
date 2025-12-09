import { useState } from 'react';
import { FiFileText, FiUpload } from 'react-icons/fi';

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

interface Props {
  producto: Producto;
  autores: Autor[];
  datosIniciales: any;
  onContinuar: (datos: any) => void;
  onVolver: () => void;
}

const FormularioObraStep = ({ producto, autores, datosIniciales, onContinuar, onVolver }: Props) => {
  const [formData, setFormData] = useState(
    datosIniciales || {
      titulo: '',
      subtitulo: '',
      anioCreacion: new Date().getFullYear(),
      descripcion: '',
      paisOrigen: 'República Dominicana',
      // Campos específicos según tipo de obra (se agregarán después)
      camposEspecificos: {},
      archivos: [],
    }
  );

  const [archivos, setArchivos] = useState<File[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const nuevosArchivos = Array.from(e.target.files);
      setArchivos((prev) => [...prev, ...nuevosArchivos]);
    }
  };

  const eliminarArchivo = (index: number) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleContinuar = () => {
    // Validaciones básicas
    if (!formData.titulo) {
      alert('El título de la obra es obligatorio');
      return;
    }

    if (!formData.anioCreacion) {
      alert('El año de creación es obligatorio');
      return;
    }

    if (archivos.length === 0) {
      alert('Debe adjuntar al menos un archivo');
      return;
    }

    onContinuar({
      ...formData,
      archivos,
    });
  };

  return (
    <div className="space-y-6">
      {/* Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <FiFileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Paso 3: Datos de la Obra</h3>
            <p className="text-sm text-blue-800 mb-2">
              Complete la información de la obra <strong>{producto.nombre}</strong>
            </p>
            <p className="text-sm text-blue-700">
              Todos los campos marcados con <span className="text-red-600">*</span> son obligatorios
            </p>
          </div>
        </div>
      </div>

      {/* Información del producto seleccionado */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Tipo de obra seleccionada:</p>
            <p className="font-semibold text-gray-900">
              {producto.codigo} - {producto.nombre}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Monto a pagar:</p>
            <p className="text-xl font-bold text-gray-900">
              RD$ {producto.precio.toLocaleString('es-DO')}
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Información de la Obra</h2>

        <div className="space-y-6">
          {/* Campos comunes para todas las obras */}

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título de la Obra <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingrese el título completo de la obra"
            />
          </div>

          {/* Subtítulo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtítulo (Opcional)
            </label>
            <input
              type="text"
              name="subtitulo"
              value={formData.subtitulo}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Subtítulo de la obra si aplica"
            />
          </div>

          {/* Año y País */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Año de Creación <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                name="anioCreacion"
                value={formData.anioCreacion}
                onChange={handleInputChange}
                min="1900"
                max={new Date().getFullYear()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                País de Origen <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="paisOrigen"
                value={formData.paisOrigen}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción de la Obra (Opcional)
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Breve descripción de la obra..."
            />
            <p className="text-sm text-gray-500 mt-1">
              Máximo 500 caracteres. {formData.descripcion.length}/500
            </p>
          </div>

          {/* TODO: Aquí irían campos específicos según el tipo de obra */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> Los campos específicos para cada tipo de obra (género musical, duración, ISBN, etc.)
              se agregarán en una próxima fase según el análisis de los formularios oficiales de ONDA.
            </p>
          </div>
        </div>
      </div>

      {/* Archivos Adjuntos */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Archivos Adjuntos <span className="text-red-600">*</span>
        </h2>

        <div className="space-y-4">
          {/* Zona de carga */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <label className="cursor-pointer block">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp3,.mp4,.zip"
              />
              <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-700 font-medium mb-2">
                Haga clic para seleccionar archivos o arrástrelos aquí
              </p>
              <p className="text-sm text-gray-500">
                Formatos aceptados: PDF, DOC, DOCX, JPG, PNG, MP3, MP4, ZIP
              </p>
              <p className="text-sm text-gray-500">Tamaño máximo por archivo: 50MB</p>
            </label>
          </div>

          {/* Lista de archivos */}
          {archivos.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Archivos seleccionados ({archivos.length}):
              </p>
              {archivos.map((archivo, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <FiFileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">{archivo.name}</p>
                      <p className="text-sm text-gray-500">
                        {(archivo.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => eliminarArchivo(index)}
                    className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between">
        <button
          onClick={onVolver}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al Selector
        </button>

        <button
          onClick={handleContinuar}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg flex items-center gap-2"
        >
          Continuar a Revisión
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FormularioObraStep;
