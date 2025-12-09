import { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface FormularioCampo {
  id: number;
  valor: string;
  campo: {
    id: number;
    campo: string;
    etiqueta: string;
    tipo: string;
  };
}

interface SolicitudIRC {
  id: number;
  codigo: string;
  nombreEmpresa: string;
  nombreComercial: string | null;
  rnc: string;
  tipoSolicitud: string;
  fechaRecepcion: string;
  fechaPago: string;
  fechaAsentamiento: string;
  numeroRegistro: string | null;
  numeroLibro: string | null;
  numeroHoja: string | null;
  categoriaIrc: {
    id: number;
    codigo: string;
    nombre: string;
    precio: number;
  };
  estado: {
    id: number;
    nombre: string;
  };
  formulario: {
    id: number;
    codigo: string;
    productos?: {
      campos?: FormularioCampo[];
    }[];
  } | null;
  factura: {
    id: number;
    codigo: string;
    ncf: string | null;
  } | null;
  certificado?: {
    id: number;
    numeroCertificado: string;
    rutaPdf: string;
    fechaEmision: string;
  } | null;
}

interface ModalFormularioProps {
  solicitud: SolicitudIRC | null;
  onClose: () => void;
}

interface ModalDevolverProps {
  solicitud: SolicitudIRC | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface ModalCargarFirmadoProps {
  solicitud: SolicitudIRC | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ModalDevolver = ({ solicitud, onClose, onSuccess }: ModalDevolverProps) => {
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);

  if (!solicitud) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!motivo.trim()) {
      alert('⚠️ Debe especificar el motivo de la devolución');
      return;
    }

    if (!confirm('¿Está seguro de devolver esta solicitud a AuU? El usuario deberá corregir los errores indicados.')) {
      return;
    }

    try {
      setLoading(true);
      await api.put(`/inspectoria/solicitudes/${solicitud.id}/devolver`, {
        motivo: motivo.trim()
      });

      alert('✅ Solicitud devuelta a AuU exitosamente');
      onSuccess();
      onClose();
    } catch (error: any) {
      alert('❌ Error al devolver solicitud: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-red-900">Devolver a AuU</h2>
              <p className="text-sm text-gray-600 mt-1">
                Devolver solicitud para correcciones (Segunda revisión)
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              disabled={loading}
            >
              ×
            </button>
          </div>

          {/* Información de la Solicitud */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-red-900 mb-2">Información de la Solicitud</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-red-700 font-medium">Código:</span>
                <span className="ml-2 text-red-900">{solicitud.codigo}</span>
              </div>
              <div>
                <span className="text-red-700 font-medium">Número de Registro:</span>
                <span className="ml-2 text-red-900">{solicitud.numeroRegistro || 'N/A'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-red-700 font-medium">Empresa:</span>
                <span className="ml-2 text-red-900">{solicitud.nombreEmpresa}</span>
              </div>
            </div>
          </div>

          {/* Formulario de Devolución */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo de la Devolución <span className="text-red-500">*</span>
              </label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Describa detalladamente los errores encontrados en la segunda revisión..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                rows={5}
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Segunda revisión - Sea específico sobre los errores detectados
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> Esta es una segunda revisión. La solicitud será devuelta a AuU para correcciones.
                El número de registro ya fue asignado y se mantendrá una vez corregido.
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300"
                disabled={loading}
              >
                {loading ? 'Devolviendo...' : 'Devolver a AuU'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ModalCargarFirmado = ({ solicitud, onClose, onSuccess }: ModalCargarFirmadoProps) => {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!solicitud) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!archivo) {
      alert('Debe seleccionar el certificado firmado (PDF)');
      return;
    }

    if (!confirm(`¿Confirma que desea cargar el certificado firmado para ${solicitud.nombreEmpresa}?`)) {
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('certificado', archivo);

      await api.put(`/inspectoria/solicitudes/${solicitud.id}/firmar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('✅ Certificado firmado cargado exitosamente. Listo para entrega.');
      onSuccess();
      onClose();
    } catch (error: any) {
      alert('❌ Error al cargar certificado: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-green-900">Cargar Certificado Firmado</h2>
              <p className="text-sm text-gray-600 mt-1">
                Suba el certificado después de firmarlo digitalmente
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              disabled={loading}
            >
              ×
            </button>
          </div>

          {/* Información de la Solicitud */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-900 mb-2">Información de la Solicitud</h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div>
                <span className="text-green-700 font-medium">Código:</span>
                <span className="ml-2 text-green-900">{solicitud.codigo}</span>
              </div>
              <div>
                <span className="text-green-700 font-medium">Empresa:</span>
                <span className="ml-2 text-green-900">{solicitud.nombreEmpresa}</span>
              </div>
              <div>
                <span className="text-green-700 font-medium">RNC:</span>
                <span className="ml-2 text-green-900">{solicitud.rnc}</span>
              </div>
            </div>
          </div>

          {/* Formulario de Carga */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certificado Firmado (PDF) <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Solo archivos PDF. Máximo 10MB.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Proceso:</strong> Descargue el certificado generado, fírmelo digitalmente en GOB.DO y cárguelo aquí.
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
                disabled={loading}
              >
                {loading ? 'Cargando...' : 'Cargar Certificado'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ModalFormulario = ({ solicitud, onClose }: ModalFormularioProps) => {
  if (!solicitud) return null;

  const campos = solicitud.formulario?.productos?.[0]?.campos || [];

  // Función para convertir camelCase a texto legible
  const formatearEtiqueta = (texto: string): string => {
    if (texto.includes(' ') && texto[0] === texto[0].toUpperCase()) {
      return texto;
    }

    const etiquetas: { [key: string]: string } = {
      tipoSolicitud: 'Tipo de Solicitud',
      nombreEmpresa: 'Nombre de la Empresa',
      nombreComercial: 'Nombre Comercial',
      rnc: 'RNC',
      categoriaIrc: 'Categoría IRC',
      fechaInicioOperaciones: 'Fecha de Inicio de Operaciones',
      principalesClientes: 'Principales Clientes',
      direccion: 'Dirección',
      provincia: 'Provincia',
      sector: 'Sector',
      telefono: 'Teléfono',
      telefonoSecundario: 'Teléfono Secundario',
      email: 'Correo Electrónico',
      representanteLegal: 'Representante Legal',
      cedulaRepresentante: 'Cédula del Representante',
      tipoPersona: 'Tipo de Persona',
      descripcionActividades: 'Descripción de Actividades',
    };

    if (etiquetas[texto]) {
      return etiquetas[texto];
    }

    return texto
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Función para determinar la categoría de un campo
  const obtenerCategoria = (nombreCampo: string): string => {
    const campo = nombreCampo.toLowerCase();

    if (campo.includes('presidente') || campo.includes('vicepresidente') ||
        campo.includes('secretario') || campo.includes('tesorero') ||
        campo.includes('administrador') || campo.includes('consejo')) {
      return 'Miembros del Consejo';
    }

    if (campo.includes('representante') || campo.includes('cedula') &&
        (campo.includes('representante') || campo === 'cedularepresentante')) {
      return 'Representante Legal';
    }

    if (campo.includes('direccion') || campo.includes('provincia') ||
        campo.includes('sector') || campo.includes('domicilio')) {
      return 'Ubicación';
    }

    if (campo.includes('telefono') || campo.includes('celular') || campo.includes('email')) {
      return 'Información de Contacto';
    }

    return 'Información General';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Revisión de Formulario IRC</h2>
              <p className="text-sm text-gray-600 mt-1">
                Segunda revisión - Código: {solicitud.codigo}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Información del Asentamiento */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-900 mb-3">Datos del Asentamiento</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-green-700 font-medium">Número de Registro:</span>
                <p className="text-green-900 font-bold mt-1">{solicitud.numeroRegistro || 'N/A'}</p>
              </div>
              <div>
                <span className="text-green-700 font-medium">Libro:</span>
                <p className="text-green-900 font-bold mt-1">{solicitud.numeroLibro || 'N/A'}</p>
              </div>
              <div>
                <span className="text-green-700 font-medium">Hoja:</span>
                <p className="text-green-900 font-bold mt-1">{solicitud.numeroHoja || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Información de la Solicitud */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3">Información General</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Código Solicitud:</span>
                <span className="ml-2 text-blue-900">{solicitud.codigo}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Categoría IRC:</span>
                <span className="ml-2 text-blue-900">{solicitud.categoriaIrc.codigo} - {solicitud.categoriaIrc.nombre}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">RNC:</span>
                <span className="ml-2 text-blue-900">{solicitud.rnc}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Tipo:</span>
                <span className="ml-2 text-blue-900">{solicitud.tipoSolicitud}</span>
              </div>
            </div>
          </div>

          {/* Campos del Formulario */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-lg border-b-2 border-gray-200 pb-2">
              Datos del Formulario IRC
            </h3>

            {campos.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-lg">📄</p>
                <p className="mt-2">No hay campos disponibles en el formulario</p>
              </div>
            ) : (
              <div className="space-y-6">
                {(() => {
                  // Agrupar campos por categoría
                  const camposPorCategoria: { [key: string]: typeof campos } = {};

                  campos.forEach((campo) => {
                    const categoria = obtenerCategoria(campo.campo.campo);
                    if (!camposPorCategoria[categoria]) {
                      camposPorCategoria[categoria] = [];
                    }
                    camposPorCategoria[categoria].push(campo);
                  });

                  const ordenCategorias = [
                    'Información General',
                    'Ubicación',
                    'Información de Contacto',
                    'Representante Legal',
                    'Miembros del Consejo',
                  ];

                  return ordenCategorias.map((categoria) => {
                    const camposCategoria = camposPorCategoria[categoria];
                    if (!camposCategoria || camposCategoria.length === 0) return null;

                    return (
                      <div key={categoria} className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-4 border border-gray-200">
                        <h4 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-500 flex items-center gap-2">
                          <span className="text-blue-600">📋</span>
                          {categoria}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {camposCategoria.map((campo) => {
                            const etiqueta = formatearEtiqueta(campo.campo.etiqueta || campo.campo.campo);
                            const valor = campo.valor && campo.valor.trim() !== '' ? campo.valor : null;

                            return (
                              <div key={campo.id} className="bg-white rounded-lg p-3 border border-gray-200">
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                                  {etiqueta}
                                </label>
                                <div className="text-sm text-gray-900">
                                  {valor ? (
                                    <span className="font-medium">{valor}</span>
                                  ) : (
                                    <span className="text-gray-400 italic text-xs">Sin especificar</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>

          {/* Botón Cerrar */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CertificadosPendientesPage() {
  const [solicitudes, setSolicitudes] = useState<SolicitudIRC[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<SolicitudIRC | null>(null);
  const [modalAbierto, setModalAbierto] = useState<'formulario' | 'devolver' | 'cargarFirmado' | null>(null);

  useEffect(() => {
    cargarSolicitudes();
  }, [page, search]);

  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      // Cargar solicitudes en estado ASENTADA (4) y PENDIENTE_FIRMA (5)
      // Para mantener trazabilidad y poder descargar certificados
      const params: any = {
        page,
        limit: 20,
        search,
        estadoId: '4,5' // ASENTADA y PENDIENTE_FIRMA
      };

      const response = await api.get('/inspectoria/solicitudes', { params });

      setSolicitudes(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error: any) {
      console.error('Error cargando solicitudes:', error);
      alert('Error al cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    cargarSolicitudes();
  };

  const handleGenerarCertificado = async (solicitud: SolicitudIRC) => {
    if (!confirm(`¿Confirma que desea generar el certificado para ${solicitud.nombreEmpresa}?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(`/inspectoria/solicitudes/${solicitud.id}/generar-certificado`);

      alert('✅ Certificado generado exitosamente');

      // Descargar certificado desde el backend
      const pdfUrl = response.data.data?.rutaPdf;
      if (pdfUrl) {
        const backendUrl = `http://localhost:3000${pdfUrl}`;
        window.open(backendUrl, '_blank');
      }

      cargarSolicitudes();
    } catch (error: any) {
      alert('❌ Error al generar certificado: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleVerCertificado = (solicitud: SolicitudIRC) => {
    if (solicitud.certificado?.rutaPdf) {
      const backendUrl = `http://localhost:3000${solicitud.certificado.rutaPdf}`;
      window.open(backendUrl, '_blank');
    } else {
      alert('⚠️ No hay certificado disponible para descargar');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificados Pendientes de Generación</h1>
          <p className="text-gray-600 mt-1">
            Segunda revisión y generación de certificados IRC
          </p>
        </div>
      </div>

      {/* Búsqueda */}
      <form onSubmit={handleBuscar} className="flex gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por código, RNC o nombre de empresa..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Buscar
        </button>
      </form>

      {/* Tabla de Solicitudes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Cargando solicitudes...
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay certificados pendientes de generación
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código / Registro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empresa / RNC
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría IRC
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asentamiento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {solicitudes.map((solicitud) => (
                    <tr key={solicitud.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{solicitud.codigo}</div>
                        <div className="text-xs text-gray-500 font-mono">
                          Reg: {solicitud.numeroRegistro || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{solicitud.nombreEmpresa}</div>
                        <div className="text-xs text-gray-500">RNC: {solicitud.rnc}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{solicitud.categoriaIrc.codigo}</div>
                        <div className="text-xs text-gray-500">{solicitud.categoriaIrc.nombre}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Libro: {solicitud.numeroLibro || 'N/A'}</div>
                        <div className="text-xs text-gray-500">Hoja: {solicitud.numeroHoja || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs mb-2">
                          <span className={`px-2 py-1 rounded-full font-semibold ${
                            solicitud.estado.id === 5
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {solicitud.estado.nombre}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => {
                              setSolicitudSeleccionada(solicitud);
                              setModalAbierto('formulario');
                            }}
                            className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                          >
                            📄 Ver Formulario
                          </button>

                          {solicitud.estado.id === 4 ? (
                            // ASENTADA - Mostrar botones de generar y devolver
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleGenerarCertificado(solicitud)}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                              >
                                Generar Cert.
                              </button>
                              <button
                                onClick={() => {
                                  setSolicitudSeleccionada(solicitud);
                                  setModalAbierto('devolver');
                                }}
                                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                              >
                                Devolver
                              </button>
                            </div>
                          ) : (
                            // PENDIENTE_FIRMA - Certificado ya generado
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleVerCertificado(solicitud)}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                              >
                                Descargar
                              </button>
                              <button
                                onClick={() => handleGenerarCertificado(solicitud)}
                                className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
                                title="Regenerar certificado con cambios actualizados"
                              >
                                Regenerar
                              </button>
                              <button
                                onClick={() => {
                                  setSolicitudSeleccionada(solicitud);
                                  setModalAbierto('cargarFirmado');
                                }}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                title="Cargar certificado firmado digitalmente"
                              >
                                Cargar Firmado
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Página {page} de {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modales */}
      {modalAbierto === 'formulario' && solicitudSeleccionada && (
        <ModalFormulario
          solicitud={solicitudSeleccionada}
          onClose={() => {
            setSolicitudSeleccionada(null);
            setModalAbierto(null);
          }}
        />
      )}

      {modalAbierto === 'devolver' && solicitudSeleccionada && (
        <ModalDevolver
          solicitud={solicitudSeleccionada}
          onClose={() => {
            setSolicitudSeleccionada(null);
            setModalAbierto(null);
          }}
          onSuccess={cargarSolicitudes}
        />
      )}

      {modalAbierto === 'cargarFirmado' && solicitudSeleccionada && (
        <ModalCargarFirmado
          solicitud={solicitudSeleccionada}
          onClose={() => {
            setSolicitudSeleccionada(null);
            setModalAbierto(null);
          }}
          onSuccess={cargarSolicitudes}
        />
      )}
    </div>
  );
}
