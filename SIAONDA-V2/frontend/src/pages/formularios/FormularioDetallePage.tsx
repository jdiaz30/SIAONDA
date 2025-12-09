import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

interface Formulario {
  id: number;
  codigo: string;
  fecha: string;
  estado: {
    nombre: string;
  };
  usuario: {
    nombrecompleto: string;
  };
  productos: Array<{
    producto: {
      codigo: string;
      nombre: string;
    };
    cantidad: number;
    campos: Array<{
      campo: {
        campo: string;
        titulo: string;
      };
      valor: string;
    }>;
  }>;
  solicitudIrc?: {
    codigo: string;
    nombreEmpresa: string;
    rnc: string;
    estado: {
      nombre: string;
    };
    categoriaIrc: {
      codigo: string;
      nombre: string;
      precio: number;
    };
    factura?: {
      codigo: string;
      ncf: string;
      total: number;
    };
  };
  observaciones?: string;
}

const FormularioDetallePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formulario, setFormulario] = useState<Formulario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarFormulario();
  }, [id]);

  const cargarFormulario = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/formularios/${id}`);
      setFormulario(response.data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getCampoValor = (campos: any[], nombreCampo: string) => {
    return campos.find(c => c.campo.campo === nombreCampo)?.valor || 'N/A';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !formulario) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Formulario no encontrado'}
        </div>
      </div>
    );
  }

  const productoIrc = formulario.productos.find(p => p.producto.codigo === 'IRC-01');
  const campos = productoIrc?.campos || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/formularios')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ← Volver
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Formulario {formulario.codigo}
            </h1>
            <p className="text-gray-600">Detalles del formulario IRC</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            formulario.estado.nombre === 'Pendiente' 
              ? 'bg-yellow-100 text-yellow-800'
              : formulario.estado.nombre === 'Asentado'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {formulario.estado.nombre}
          </span>
        </div>
      </div>

      {/* Información General */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          📄 Información General
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Código</p>
            <p className="font-medium">{formulario.codigo}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Fecha</p>
            <p className="font-medium">{new Date(formulario.fecha).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Creado por</p>
            <p className="font-medium">{formulario.usuario.nombrecompleto}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Tipo</p>
            <p className="font-medium">{productoIrc?.producto.nombre}</p>
          </div>
        </div>
      </div>

      {/* Solicitud IRC */}
      {formulario.solicitudIrc && (
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">
            Solicitud de Inspectoría
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-blue-700">Código Solicitud</p>
              <p className="font-medium text-blue-900">{formulario.solicitudIrc.codigo}</p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Estado</p>
              <p className="font-medium text-blue-900">{formulario.solicitudIrc.estado.nombre}</p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Categoría IRC</p>
              <p className="font-medium text-blue-900">
                {formulario.solicitudIrc.categoriaIrc ?
                  `${formulario.solicitudIrc.categoriaIrc.codigo} - ${formulario.solicitudIrc.categoriaIrc.nombre}`
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Precio</p>
              <p className="font-medium text-blue-900">
                {formulario.solicitudIrc.categoriaIrc ?
                  `RD$ ${formulario.solicitudIrc.categoriaIrc.precio.toLocaleString()}`
                  : 'N/A'}
              </p>
            </div>
          </div>

          {formulario.solicitudIrc.factura && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
              <p className="text-sm font-medium text-green-900 mb-2">✓ Factura Generada</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-green-700">Código</p>
                  <p className="font-medium text-green-900">{formulario.solicitudIrc.factura.codigo}</p>
                </div>
                <div>
                  <p className="text-xs text-green-700">NCF</p>
                  <p className="font-medium text-green-900">{formulario.solicitudIrc.factura.ncf}</p>
                </div>
                <div>
                  <p className="text-xs text-green-700">Total</p>
                  <p className="font-medium text-green-900">
                    RD$ {formulario.solicitudIrc.factura.total.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Datos de la Empresa */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          🏢 Datos de la Empresa
        </h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Nombre de la Empresa</p>
            <p className="font-medium">{getCampoValor(campos, 'nombreEmpresa')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Nombre Comercial</p>
            <p className="font-medium">{getCampoValor(campos, 'nombreComercial')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">RNC</p>
            <p className="font-medium">{getCampoValor(campos, 'rnc')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Tipo de Persona</p>
            <p className="font-medium">{getCampoValor(campos, 'tipoPersona')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Categoría IRC</p>
            <p className="font-medium">{getCampoValor(campos, 'categoriaIrc')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Fecha Inicio Operaciones</p>
            <p className="font-medium">{getCampoValor(campos, 'fechaInicioOperaciones')}</p>
          </div>
        </div>
      </div>

      {/* Ubicación y Contacto */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          📍 Ubicación y Contacto
        </h2>
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <p className="text-sm text-gray-600 mb-1">Dirección</p>
            <p className="font-medium">{getCampoValor(campos, 'direccion')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Provincia</p>
            <p className="font-medium">{getCampoValor(campos, 'provincia')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Sector</p>
            <p className="font-medium">{getCampoValor(campos, 'sector')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">📞 Teléfono</p>
            <p className="font-medium">{getCampoValor(campos, 'telefono')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">📞 Teléfono Secundario</p>
            <p className="font-medium">{getCampoValor(campos, 'telefonoSecundario')}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-600 mb-1">✉️ Correo Electrónico</p>
            <p className="font-medium">{getCampoValor(campos, 'email')}</p>
          </div>
        </div>
      </div>

      {/* Representante Legal */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          👤 Representante Legal
        </h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Nombre</p>
            <p className="font-medium">{getCampoValor(campos, 'representanteLegal')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Cédula</p>
            <p className="font-medium">{getCampoValor(campos, 'cedulaRepresentante')}</p>
          </div>
        </div>
      </div>

      {/* Descripción de Actividades */}
      {getCampoValor(campos, 'descripcionActividades') !== 'N/A' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Descripción de Actividades
          </h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {getCampoValor(campos, 'descripcionActividades')}
          </p>
        </div>
      )}

      {/* Observaciones */}
      {formulario.observaciones && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Observaciones</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{formulario.observaciones}</p>
        </div>
      )}
    </div>
  );
};

export default FormularioDetallePage;
