import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { obtenerTodosCatalogos, Catalogos } from '../../services/inspectoriaService';
import { api } from '../../services/api';

interface ProductoCampo {
  id: number;
  campo: string;
  titulo: string;
  requerido: boolean;
}

interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  campos: ProductoCampo[];
}

interface FormularioIRCData {
  // Tipo de solicitud
  tipoSolicitud: 'REGISTRO_NUEVO' | 'RENOVACION';

  // Datos de la empresa
  nombreEmpresa: string;
  nombreComercial: string;
  rnc: string;
  categoriaIrcId: number;
  fechaInicioOperaciones: string;
  principalesClientes: string;

  // Ubicación
  direccion: string;
  provinciaId: number;
  sector: string;

  // Contacto
  telefono: string;
  telefonoSecundario: string;
  correoElectronico: string;

  // Representante Legal (para ambos tipos)
  representanteLegal: string;
  cedulaRepresentante: string;

  // Descripción
  descripcionActividades: string;

  // Tipo de persona
  tipoPersona: 'MORAL' | 'FISICA';

  // Persona MORAL - Consejo de Administración
  presidenteNombre?: string;
  presidenteCedula?: string;
  presidenteDomicilio?: string;
  presidenteTelefono?: string;
  presidenteCelular?: string;
  presidenteEmail?: string;
  vicepresidente?: string;
  secretario?: string;
  tesorero?: string;
  administrador?: string;
  domicilioConsejo?: string;
  telefonoConsejo?: string;
  fechaConstitucion?: string;

  // Persona FISICA - Propietario
  nombrePropietario?: string;
  cedulaPropietario?: string;
  domicilioPropietario?: string;
  telefonoPropietario?: string;
  celularPropietario?: string;
  emailPropietario?: string;
  nombreAdministrador?: string;
  cedulaAdministrador?: string;
  telefonoAdministrador?: string;
  fechaInicioActividades?: string;
}

export default function FormularioIRCPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // Para detectar modo edición
  const [loading, setLoading] = useState(false);
  const [catalogos, setCatalogos] = useState<Catalogos | null>(null);
  const [producto, setProducto] = useState<Producto | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1); // 1: Tipo solicitud, 2: Datos empresa, 3: Confirmación
  const [modoEdicion, setModoEdicion] = useState(false);

  const [formData, setFormData] = useState<FormularioIRCData>({
    tipoSolicitud: 'REGISTRO_NUEVO',
    nombreEmpresa: '',
    nombreComercial: '',
    rnc: '',
    categoriaIrcId: 0,
    fechaInicioOperaciones: '',
    principalesClientes: '',
    direccion: '',
    provinciaId: 0,
    sector: '',
    telefono: '',
    telefonoSecundario: '',
    correoElectronico: '',
    representanteLegal: '',
    cedulaRepresentante: '',
    descripcionActividades: '',
    tipoPersona: 'MORAL'
  });

  const loadCatalogos = async () => {
    try {
      const data = await obtenerTodosCatalogos();
      setCatalogos(data);
    } catch (error) {
      console.error('Error cargando catálogos:', error);
      alert('Error cargando catálogos del sistema');
    }
  };

  const loadProducto = async () => {
    try {
      // Buscar el producto IRC-01 usando el cliente api configurado
      const productosResponse = await api.get('/productos');
      const productoIRC = productosResponse.data.find((p: any) => p.codigo === 'IRC-01');

      if (!productoIRC) {
        throw new Error('Producto IRC-01 no encontrado');
      }

      // Obtener los campos del producto
      const camposResponse = await api.get(`/productos/${productoIRC.id}/campos`);

      setProducto({
        ...productoIRC,
        campos: camposResponse.data
      });
    } catch (error) {
      console.error('Error cargando producto IRC-01:', error);
      alert('Error cargando configuración del formulario');
    }
  };

  const loadFormularioExistente = async (formularioId: string, catalogosData: any) => {
    try {
      setLoading(true);
      const response = await api.get(`/formularios/${formularioId}`);
      const formulario = response.data;

      // Buscar el producto IRC en el formulario
      const productoIRC = formulario.productos.find((p: any) => p.producto.codigo === 'IRC-01');
      if (!productoIRC) {
        throw new Error('Este formulario no es de tipo IRC');
      }

      const campos = productoIRC.campos;
      const getCampoValor = (nombreCampo: string) => {
        const campo = campos.find((c: any) => c.campo.campo === nombreCampo);
        return campo?.valor || '';
      };

      // Buscar la categoría IRC por nombre
      const categoriaIrcNombre = getCampoValor('categoriaIrc');
      let categoriaIrcId = 0;
      if (catalogosData && categoriaIrcNombre) {
        const categoria = catalogosData.categoriasIRC.find((c: any) => c.nombre === categoriaIrcNombre);
        categoriaIrcId = categoria?.id || 0;
      }

      // Buscar provincia por nombre
      const provinciaNombre = getCampoValor('provincia');
      let provinciaId = 0;
      if (catalogosData && provinciaNombre) {
        const provincia = catalogosData.provincias.find((p: any) => p.nombre === provinciaNombre);
        provinciaId = provincia?.id || 0;
      }

      // Cargar todos los datos del formulario
      setFormData({
        tipoSolicitud: getCampoValor('tipoSolicitud') as 'REGISTRO_NUEVO' | 'RENOVACION' || 'REGISTRO_NUEVO',
        nombreEmpresa: getCampoValor('nombreEmpresa'),
        nombreComercial: getCampoValor('nombreComercial'),
        rnc: getCampoValor('rnc'),
        categoriaIrcId,
        fechaInicioOperaciones: getCampoValor('fechaInicioOperaciones'),
        principalesClientes: getCampoValor('principalesClientes'),
        direccion: getCampoValor('direccion'),
        provinciaId,
        sector: getCampoValor('sector'),
        telefono: getCampoValor('telefono'),
        telefonoSecundario: getCampoValor('telefonoSecundario'),
        correoElectronico: getCampoValor('email'), // Campo en BD se llama 'email'
        representanteLegal: getCampoValor('representanteLegal'),
        cedulaRepresentante: getCampoValor('cedulaRepresentante'),
        descripcionActividades: getCampoValor('descripcionActividades'),
        tipoPersona: getCampoValor('tipoPersona') as 'MORAL' | 'FISICA' || 'MORAL',
        // Persona MORAL
        presidenteNombre: getCampoValor('presidenteNombre'),
        presidenteCedula: getCampoValor('presidenteCedula'),
        presidenteDomicilio: getCampoValor('presidenteDomicilio'),
        presidenteTelefono: getCampoValor('presidenteTelefono'),
        presidenteCelular: getCampoValor('presidenteCelular'),
        presidenteEmail: getCampoValor('presidenteEmail'),
        vicepresidente: getCampoValor('vicepresidente'),
        secretario: getCampoValor('secretario'),
        tesorero: getCampoValor('tesorero'),
        administrador: getCampoValor('administrador'),
        domicilioConsejo: getCampoValor('domicilioConsejo'),
        telefonoConsejo: getCampoValor('telefonoConsejo'),
        fechaConstitucion: getCampoValor('fechaConstitucion'),
        // Persona FISICA
        nombrePropietario: getCampoValor('nombrePropietario'),
        cedulaPropietario: getCampoValor('cedulaPropietario'),
        domicilioPropietario: getCampoValor('domicilioPropietario'),
        telefonoPropietario: getCampoValor('telefonoPropietario'),
        celularPropietario: getCampoValor('celularPropietario'),
        emailPropietario: getCampoValor('emailPropietario'),
        nombreAdministrador: getCampoValor('nombreAdministrador'),
        cedulaAdministrador: getCampoValor('cedulaAdministrador'),
        telefonoAdministrador: getCampoValor('telefonoAdministrador'),
        fechaInicioActividades: getCampoValor('fechaInicioActividades')
      });

    } catch (error: any) {
      console.error('Error cargando formulario:', error);
      alert('Error cargando formulario: ' + error.message);
      navigate('/formularios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeForm = async () => {
      const catalogosData = await obtenerTodosCatalogos();
      setCatalogos(catalogosData);
      await loadProducto();

      if (id) {
        setModoEdicion(true);
        await loadFormularioExistente(id, catalogosData);
        setStep(2); // En modo edición, ir directo a paso 2 (datos de empresa)
      }
    };

    initializeForm();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Convertir a número si es categoriaIrcId o provinciaId
    let processedValue: string | number = value;
    if (name === 'categoriaIrcId' || name === 'provinciaId') {
      processedValue = parseInt(value, 10);
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));

    // Limpiar error
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    // No hay validación en paso 1, solo seleccionar tipo
    setErrors(newErrors);
    return true;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombreEmpresa.trim()) {
      newErrors.nombreEmpresa = 'Requerido';
    }

    if (!formData.rnc.trim()) {
      newErrors.rnc = 'Requerido';
    } else if (!/^\d{3}-?\d{5}-?\d{1}$/.test(formData.rnc)) {
      newErrors.rnc = 'Formato inválido (XXX-XXXXX-X)';
    }

    if (!formData.categoriaIrcId || formData.categoriaIrcId === 0) {
      newErrors.categoriaIrcId = 'Seleccione una categoría';
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = 'Requerido';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'Requerido';
    }

    if (!formData.representanteLegal.trim()) {
      newErrors.representanteLegal = 'Requerido';
    }

    if (!formData.cedulaRepresentante.trim()) {
      newErrors.cedulaRepresentante = 'Requerido';
    } else if (!/^\d{3}-?\d{7}-?\d{1}$/.test(formData.cedulaRepresentante)) {
      newErrors.cedulaRepresentante = 'Formato inválido (XXX-XXXXXXX-X)';
    }

    if (!formData.descripcionActividades.trim()) {
      newErrors.descripcionActividades = 'Requerido';
    }

    if (formData.tipoPersona === 'FISICA') {
      if (!formData.nombrePropietario?.trim()) {
        newErrors.nombrePropietario = 'Requerido para persona física';
      }
      if (!formData.cedulaPropietario?.trim()) {
        newErrors.cedulaPropietario = 'Requerido para persona física';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!producto || !catalogos) {
        alert('Error: Configuración no cargada');
        setLoading(false);
        return;
      }

      // Helper para obtener el ID de un campo por su nombre
      const getCampoId = (campoNombre: string): number | undefined => {
        return producto.campos.find(c => c.campo === campoNombre)?.id;
      };

      // Obtener el nombre de la categoría IRC
      const categoriaIRC = catalogos.categoriasIRC.find(c => c.id === formData.categoriaIrcId);
      if (!categoriaIRC) {
        alert('Error: Categoría IRC no válida');
        setLoading(false);
        return;
      }

      // Obtener el nombre de la provincia
      const provincia = catalogos.provincias.find(p => p.id === formData.provinciaId);

      // Construir campos con IDs correctos - TODOS los campos del formulario
      const campos = [
        // Campos básicos
        { campoId: getCampoId('tipoSolicitud'), valor: formData.tipoSolicitud },
        { campoId: getCampoId('nombreEmpresa'), valor: formData.nombreEmpresa },
        { campoId: getCampoId('nombreComercial'), valor: formData.nombreComercial },
        { campoId: getCampoId('rnc'), valor: formData.rnc },
        { campoId: getCampoId('categoriaIrc'), valor: categoriaIRC.nombre },
        { campoId: getCampoId('fechaInicioOperaciones'), valor: formData.fechaInicioOperaciones },
        { campoId: getCampoId('principalesClientes'), valor: formData.principalesClientes },

        // Ubicación y contacto
        { campoId: getCampoId('direccion'), valor: formData.direccion },
        { campoId: getCampoId('provincia'), valor: provincia?.nombre || '' },
        { campoId: getCampoId('sector'), valor: formData.sector },
        { campoId: getCampoId('telefono'), valor: formData.telefono },
        { campoId: getCampoId('telefonoSecundario'), valor: formData.telefonoSecundario },
        { campoId: getCampoId('email'), valor: formData.correoElectronico },

        // Representante Legal
        { campoId: getCampoId('representanteLegal'), valor: formData.representanteLegal },
        { campoId: getCampoId('cedulaRepresentante'), valor: formData.cedulaRepresentante },

        // Tipo de persona
        { campoId: getCampoId('tipoPersona'), valor: formData.tipoPersona },

        // Descripción de actividades
        { campoId: getCampoId('descripcionActividades'), valor: formData.descripcionActividades }
      ];

      // Agregar campos de Persona FISICA si aplica
      if (formData.tipoPersona === 'FISICA') {
        campos.push(
          { campoId: getCampoId('nombrePropietario'), valor: formData.nombrePropietario || '' },
          { campoId: getCampoId('cedulaPropietario'), valor: formData.cedulaPropietario || '' },
          { campoId: getCampoId('domicilioPropietario'), valor: formData.domicilioPropietario || '' },
          { campoId: getCampoId('telefonoPropietario'), valor: formData.telefonoPropietario || '' },
          { campoId: getCampoId('celularPropietario'), valor: formData.celularPropietario || '' },
          { campoId: getCampoId('emailPropietario'), valor: formData.emailPropietario || '' },
          { campoId: getCampoId('nombreAdministrador'), valor: formData.nombreAdministrador || '' },
          { campoId: getCampoId('cedulaAdministrador'), valor: formData.cedulaAdministrador || '' },
          { campoId: getCampoId('telefonoAdministrador'), valor: formData.telefonoAdministrador || '' },
          { campoId: getCampoId('fechaInicioActividades'), valor: formData.fechaInicioActividades || '' }
        );
      }

      // Agregar campos de Persona MORAL si aplica
      if (formData.tipoPersona === 'MORAL') {
        campos.push(
          { campoId: getCampoId('presidenteNombre'), valor: formData.presidenteNombre || '' },
          { campoId: getCampoId('presidenteCedula'), valor: formData.presidenteCedula || '' },
          { campoId: getCampoId('presidenteDomicilio'), valor: formData.presidenteDomicilio || '' },
          { campoId: getCampoId('presidenteTelefono'), valor: formData.presidenteTelefono || '' },
          { campoId: getCampoId('presidenteCelular'), valor: formData.presidenteCelular || '' },
          { campoId: getCampoId('presidenteEmail'), valor: formData.presidenteEmail || '' },
          { campoId: getCampoId('vicepresidente'), valor: formData.vicepresidente || '' },
          { campoId: getCampoId('secretario'), valor: formData.secretario || '' },
          { campoId: getCampoId('tesorero'), valor: formData.tesorero || '' },
          { campoId: getCampoId('administrador'), valor: formData.administrador || '' },
          { campoId: getCampoId('domicilioConsejo'), valor: formData.domicilioConsejo || '' },
          { campoId: getCampoId('telefonoConsejo'), valor: formData.telefonoConsejo || '' },
          { campoId: getCampoId('fechaConstitucion'), valor: formData.fechaConstitucion || '' }
        );
      }

      // Filtrar solo campos que existen en la BD
      const camposValidos = campos.filter(c => c.campoId !== undefined);

      let response;

      if (modoEdicion && id) {
        // Modo edición: actualizar formulario existente
        response = await api.put(`/formularios/${id}`, {
          productos: [{
            productoId: producto.id,
            cantidad: 1,
            campos: camposValidos
          }],
          clientes: [],
          observaciones: formData.descripcionActividades
        });

        alert('✅ Solicitud IRC actualizada exitosamente\n\n' +
              `Código: ${response.data.codigo || 'N/A'}\n` +
              'Los cambios han sido guardados.');
      } else {
        // Modo creación: crear nuevo formulario
        response = await api.post('/formularios', {
          productos: [{
            productoId: producto.id,
            cantidad: 1,
            campos: camposValidos
          }],
          clientes: [],
          observaciones: formData.descripcionActividades
        });

        alert('✅ Solicitud IRC creada exitosamente\n\n' +
              `Código: ${response.data.codigo || 'Generando...'}\n` +
              'La solicitud ha sido enviada a Inspectoría para validación.\n' +
              'Se generará una factura que deberá pagar en Caja.');
      }

      navigate('/formularios');
    } catch (error: any) {
      console.error('Error:', error);
      alert(`Error al ${modoEdicion ? 'actualizar' : 'crear'} la solicitud: ` + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!catalogos || !producto) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600">Cargando configuración del formulario...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {modoEdicion ? 'Editar' : 'Nueva'} Solicitud de Registro IRC
          </h1>
          <p className="text-gray-600">
            Importadores, Reproductores y Comercializadores
          </p>
        </div>
        <button
          onClick={() => navigate('/formularios')}
          className="text-gray-600 hover:text-gray-800"
        >
          Cancelar
        </button>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step >= num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {num}
              </div>
              {num < 3 && (
                <div className={`flex-1 h-1 mx-2 ${
                  step > num ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Tipo de Solicitud</span>
          <span>Datos de la Empresa</span>
          <span>Confirmación</span>
        </div>
      </div>

      {/* Step 1: Tipo de Solicitud */}
      {step === 1 && (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">¿Qué desea realizar?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, tipoSolicitud: 'REGISTRO_NUEVO' })}
              className={`p-6 border-2 rounded-lg text-left transition-all ${
                formData.tipoSolicitud === 'REGISTRO_NUEVO'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Registro Nuevo</h3>
                  <p className="text-sm text-gray-600">
                    Primera vez registrando una empresa en el sistema IRC
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, tipoSolicitud: 'RENOVACION' })}
              className={`p-6 border-2 rounded-lg text-left transition-all ${
                formData.tipoSolicitud === 'RENOVACION'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Renovación</h3>
                  <p className="text-sm text-gray-600">
                    Renovar registro de una empresa ya existente en el sistema
                  </p>
                </div>
              </div>
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Información importante:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Para <strong>Registro Nuevo</strong>: La empresa no debe existir previamente en el sistema</li>
                  <li>Para <strong>Renovación</strong>: La empresa debe estar registrada y buscaremos sus datos</li>
                  <li>Ambos procesos generan una factura que debe pagarse en Caja</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              Continuar
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Datos de la Empresa */}
      {step === 2 && (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Datos de la Empresa - {formData.tipoSolicitud === 'REGISTRO_NUEVO' ? 'Registro Nuevo' : 'Renovación'}
          </h2>

          <div className="space-y-4">
            {/* Tipo de Persona */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Persona <span className="text-red-500">*</span>
              </label>
              <select
                name="tipoPersona"
                value={formData.tipoPersona}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="MORAL">Persona Moral (Empresa/Sociedad)</option>
                <option value="FISICA">Persona Física (Individual)</option>
              </select>
            </div>

            {/* RNC / Cédula */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RNC / Cédula <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="rnc"
                  value={formData.rnc}
                  onChange={handleChange}
                  placeholder="XXX-XXXXX-X"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.rnc ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.rnc && <p className="text-red-500 text-sm mt-1">{errors.rnc}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría IRC <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoriaIrcId"
                  value={formData.categoriaIrcId}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.categoriaIrcId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="0">Seleccione...</option>
                  {catalogos?.categoriasIRC.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.codigo} - {cat.nombre}
                    </option>
                  ))}
                </select>
                {errors.categoriaIrcId && <p className="text-red-500 text-sm mt-1">{errors.categoriaIrcId}</p>}
              </div>
            </div>

            {/* Nombre de la Empresa */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre / Razón Social <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombreEmpresa"
                  value={formData.nombreEmpresa}
                  onChange={handleChange}
                  placeholder="Nombre completo"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.nombreEmpresa ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.nombreEmpresa && <p className="text-red-500 text-sm mt-1">{errors.nombreEmpresa}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Comercial
                </label>
                <input
                  type="text"
                  name="nombreComercial"
                  value={formData.nombreComercial}
                  onChange={handleChange}
                  placeholder="Opcional"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Fecha inicio y Principales clientes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Inicio de Operaciones
                </label>
                <input
                  type="date"
                  name="fechaInicioOperaciones"
                  value={formData.fechaInicioOperaciones}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Principales Clientes
                </label>
                <input
                  type="text"
                  name="principalesClientes"
                  value={formData.principalesClientes}
                  onChange={handleChange}
                  placeholder="Nombres de principales clientes"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Campos adicionales para Persona Física */}
            {formData.tipoPersona === 'FISICA' && (
              <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-yellow-900 mb-4">Datos del Propietario (Persona Física)</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Propietario <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nombrePropietario"
                      value={formData.nombrePropietario || ''}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.nombrePropietario ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.nombrePropietario && <p className="text-red-500 text-sm mt-1">{errors.nombrePropietario}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cédula del Propietario <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="cedulaPropietario"
                      value={formData.cedulaPropietario || ''}
                      onChange={handleChange}
                      placeholder="XXX-XXXXXXX-X"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.cedulaPropietario ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.cedulaPropietario && <p className="text-red-500 text-sm mt-1">{errors.cedulaPropietario}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Domicilio
                    </label>
                    <input
                      type="text"
                      name="domicilioPropietario"
                      value={formData.domicilioPropietario || ''}
                      onChange={handleChange}
                      placeholder="Dirección completa del propietario"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="telefonoPropietario"
                      value={formData.telefonoPropietario || ''}
                      onChange={handleChange}
                      placeholder="(809) 123-4567"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Celular
                    </label>
                    <input
                      type="tel"
                      name="celularPropietario"
                      value={formData.celularPropietario || ''}
                      onChange={handleChange}
                      placeholder="(809) 123-4567"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="emailPropietario"
                      value={formData.emailPropietario || ''}
                      onChange={handleChange}
                      placeholder="correo@ejemplo.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-yellow-900 mb-3 mt-4">Datos del Administrador</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Administrador
                    </label>
                    <input
                      type="text"
                      name="nombreAdministrador"
                      value={formData.nombreAdministrador || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cédula
                    </label>
                    <input
                      type="text"
                      name="cedulaAdministrador"
                      value={formData.cedulaAdministrador || ''}
                      onChange={handleChange}
                      placeholder="XXX-XXXXXXX-X"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="telefonoAdministrador"
                      value={formData.telefonoAdministrador || ''}
                      onChange={handleChange}
                      placeholder="(809) 123-4567"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Inicio de Actividades
                    </label>
                    <input
                      type="date"
                      name="fechaInicioActividades"
                      value={formData.fechaInicioActividades || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Campos adicionales para Persona Moral - Consejo de Administración */}
            {formData.tipoPersona === 'MORAL' && (
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 mb-4">Consejo de Administración (Persona Moral)</h3>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-3">Datos del Presidente</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Presidente
                    </label>
                    <input
                      type="text"
                      name="presidenteNombre"
                      value={formData.presidenteNombre || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cédula
                    </label>
                    <input
                      type="text"
                      name="presidenteCedula"
                      value={formData.presidenteCedula || ''}
                      onChange={handleChange}
                      placeholder="XXX-XXXXXXX-X"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Domicilio
                    </label>
                    <input
                      type="text"
                      name="presidenteDomicilio"
                      value={formData.presidenteDomicilio || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="presidenteTelefono"
                      value={formData.presidenteTelefono || ''}
                      onChange={handleChange}
                      placeholder="(809) 123-4567"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Celular
                    </label>
                    <input
                      type="tel"
                      name="presidenteCelular"
                      value={formData.presidenteCelular || ''}
                      onChange={handleChange}
                      placeholder="(809) 123-4567"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="presidenteEmail"
                      value={formData.presidenteEmail || ''}
                      onChange={handleChange}
                      placeholder="correo@ejemplo.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-3 mt-4">Otros Miembros del Consejo</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vicepresidente
                    </label>
                    <input
                      type="text"
                      name="vicepresidente"
                      value={formData.vicepresidente || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Secretario
                    </label>
                    <input
                      type="text"
                      name="secretario"
                      value={formData.secretario || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tesorero
                    </label>
                    <input
                      type="text"
                      name="tesorero"
                      value={formData.tesorero || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Administrador
                    </label>
                    <input
                      type="text"
                      name="administrador"
                      value={formData.administrador || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Domicilio del Consejo
                    </label>
                    <input
                      type="text"
                      name="domicilioConsejo"
                      value={formData.domicilioConsejo || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono del Consejo
                    </label>
                    <input
                      type="tel"
                      name="telefonoConsejo"
                      value={formData.telefonoConsejo || ''}
                      onChange={handleChange}
                      placeholder="(809) 123-4567"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Constitución de la Compañía
                    </label>
                    <input
                      type="date"
                      name="fechaConstitucion"
                      value={formData.fechaConstitucion || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Dirección y Ubicación */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  placeholder="Dirección completa"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.direccion ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.direccion && <p className="text-red-500 text-sm mt-1">{errors.direccion}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provincia
                </label>
                <select
                  name="provinciaId"
                  value={formData.provinciaId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="0">Seleccione...</option>
                  {catalogos?.provincias.map(prov => (
                    <option key={prov.id} value={prov.id}>
                      {prov.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sector
                </label>
                <input
                  type="text"
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                  placeholder="Sector, barrio o zona"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Contacto */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="(809) 123-4567"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.telefono ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono Secundario
                </label>
                <input
                  type="tel"
                  name="telefonoSecundario"
                  value={formData.telefonoSecundario}
                  onChange={handleChange}
                  placeholder="Opcional"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="correoElectronico"
                  value={formData.correoElectronico}
                  onChange={handleChange}
                  placeholder="empresa@ejemplo.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Representante Legal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Representante Legal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="representanteLegal"
                  value={formData.representanteLegal}
                  onChange={handleChange}
                  placeholder="Nombre completo"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.representanteLegal ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.representanteLegal && <p className="text-red-500 text-sm mt-1">{errors.representanteLegal}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cédula del Representante <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="cedulaRepresentante"
                  value={formData.cedulaRepresentante}
                  onChange={handleChange}
                  placeholder="XXX-XXXXXXX-X"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.cedulaRepresentante ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.cedulaRepresentante && <p className="text-red-500 text-sm mt-1">{errors.cedulaRepresentante}</p>}
              </div>
            </div>

            {/* Descripción de Actividades */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción de Actividades <span className="text-red-500">*</span>
              </label>
              <textarea
                name="descripcionActividades"
                value={formData.descripcionActividades}
                onChange={handleChange}
                rows={3}
                placeholder="Describa las actividades principales de la empresa..."
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.descripcionActividades ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.descripcionActividades && <p className="text-red-500 text-sm mt-1">{errors.descripcionActividades}</p>}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Atrás
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              Continuar
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmación */}
      {step === 3 && (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Confirmar Solicitud</h2>

          <div className="bg-gray-50 rounded-lg p-6 space-y-6">
            {/* Datos Generales */}
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-3">Datos Generales</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tipo de Solicitud</p>
                  <p className="font-medium">{formData.tipoSolicitud === 'REGISTRO_NUEVO' ? 'Registro Nuevo' : 'Renovación'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tipo de Persona</p>
                  <p className="font-medium">{formData.tipoPersona === 'MORAL' ? 'Persona Moral' : 'Persona Física'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">RNC / Cédula</p>
                  <p className="font-medium">{formData.rnc}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Categoría IRC</p>
                  <p className="font-medium">
                    {catalogos?.categoriasIRC.find(c => c.id === formData.categoriaIrcId)?.codigo} - {catalogos?.categoriasIRC.find(c => c.id === formData.categoriaIrcId)?.nombre || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Datos de la Empresa */}
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-3">Datos de la Empresa</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Nombre / Razón Social</p>
                  <p className="font-medium">{formData.nombreEmpresa}</p>
                </div>
                {formData.nombreComercial && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Nombre Comercial</p>
                    <p className="font-medium">{formData.nombreComercial}</p>
                  </div>
                )}
                {formData.fechaInicioOperaciones && (
                  <div>
                    <p className="text-sm text-gray-600">Fecha de Inicio de Operaciones</p>
                    <p className="font-medium">{new Date(formData.fechaInicioOperaciones).toLocaleDateString('es-DO')}</p>
                  </div>
                )}
                {formData.principalesClientes && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Principales Clientes</p>
                    <p className="font-medium">{formData.principalesClientes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Datos del Propietario (Persona Física) */}
            {formData.tipoPersona === 'FISICA' && (
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-3">Datos del Propietario</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Nombre del Propietario</p>
                    <p className="font-medium">{formData.nombrePropietario || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cédula</p>
                    <p className="font-medium">{formData.cedulaPropietario || 'N/A'}</p>
                  </div>
                  {formData.domicilioPropietario && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Domicilio</p>
                      <p className="font-medium">{formData.domicilioPropietario}</p>
                    </div>
                  )}
                  {formData.telefonoPropietario && (
                    <div>
                      <p className="text-sm text-gray-600">Teléfono</p>
                      <p className="font-medium">{formData.telefonoPropietario}</p>
                    </div>
                  )}
                  {formData.celularPropietario && (
                    <div>
                      <p className="text-sm text-gray-600">Celular</p>
                      <p className="font-medium">{formData.celularPropietario}</p>
                    </div>
                  )}
                  {formData.emailPropietario && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{formData.emailPropietario}</p>
                    </div>
                  )}
                  {formData.nombreAdministrador && (
                    <>
                      <div className="col-span-2 mt-3">
                        <p className="text-sm font-semibold text-gray-700">Administrador</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Nombre</p>
                        <p className="font-medium">{formData.nombreAdministrador}</p>
                      </div>
                      {formData.cedulaAdministrador && (
                        <div>
                          <p className="text-sm text-gray-600">Cédula</p>
                          <p className="font-medium">{formData.cedulaAdministrador}</p>
                        </div>
                      )}
                      {formData.telefonoAdministrador && (
                        <div>
                          <p className="text-sm text-gray-600">Teléfono</p>
                          <p className="font-medium">{formData.telefonoAdministrador}</p>
                        </div>
                      )}
                      {formData.fechaInicioActividades && (
                        <div>
                          <p className="text-sm text-gray-600">Fecha de Inicio de Actividades</p>
                          <p className="font-medium">{new Date(formData.fechaInicioActividades).toLocaleDateString('es-DO')}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Datos del Consejo de Administración (Persona Moral) */}
            {formData.tipoPersona === 'MORAL' && formData.presidenteNombre && (
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-3">Consejo de Administración</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <p className="text-sm font-semibold text-gray-700">Presidente</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Nombre</p>
                    <p className="font-medium">{formData.presidenteNombre}</p>
                  </div>
                  {formData.presidenteCedula && (
                    <div>
                      <p className="text-sm text-gray-600">Cédula</p>
                      <p className="font-medium">{formData.presidenteCedula}</p>
                    </div>
                  )}
                  {formData.presidenteDomicilio && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Domicilio</p>
                      <p className="font-medium">{formData.presidenteDomicilio}</p>
                    </div>
                  )}
                  {(formData.vicepresidente || formData.secretario || formData.tesorero || formData.administrador) && (
                    <>
                      <div className="col-span-2 mt-2">
                        <p className="text-sm font-semibold text-gray-700">Otros Miembros</p>
                      </div>
                      {formData.vicepresidente && (
                        <div>
                          <p className="text-sm text-gray-600">Vicepresidente</p>
                          <p className="font-medium">{formData.vicepresidente}</p>
                        </div>
                      )}
                      {formData.secretario && (
                        <div>
                          <p className="text-sm text-gray-600">Secretario</p>
                          <p className="font-medium">{formData.secretario}</p>
                        </div>
                      )}
                      {formData.tesorero && (
                        <div>
                          <p className="text-sm text-gray-600">Tesorero</p>
                          <p className="font-medium">{formData.tesorero}</p>
                        </div>
                      )}
                      {formData.administrador && (
                        <div>
                          <p className="text-sm text-gray-600">Administrador</p>
                          <p className="font-medium">{formData.administrador}</p>
                        </div>
                      )}
                    </>
                  )}
                  {formData.fechaConstitucion && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Fecha de Constitución</p>
                      <p className="font-medium">{new Date(formData.fechaConstitucion).toLocaleDateString('es-DO')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ubicación y Contacto */}
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-3">Ubicación y Contacto</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Dirección</p>
                  <p className="font-medium">{formData.direccion}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Provincia</p>
                  <p className="font-medium">{catalogos?.provincias.find(p => p.id === formData.provinciaId)?.nombre || 'N/A'}</p>
                </div>
                {formData.sector && (
                  <div>
                    <p className="text-sm text-gray-600">Sector</p>
                    <p className="font-medium">{formData.sector}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="font-medium">{formData.telefono}</p>
                </div>
                {formData.telefonoSecundario && (
                  <div>
                    <p className="text-sm text-gray-600">Teléfono Secundario</p>
                    <p className="font-medium">{formData.telefonoSecundario}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Correo Electrónico</p>
                  <p className="font-medium">{formData.correoElectronico || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Representante Legal */}
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-3">Representante Legal</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nombre</p>
                  <p className="font-medium">{formData.representanteLegal}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cédula</p>
                  <p className="font-medium">{formData.cedulaRepresentante}</p>
                </div>
              </div>
            </div>

            {/* Descripción de Actividades */}
            {formData.descripcionActividades && (
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-3">Descripción de Actividades Comerciales</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{formData.descripcionActividades}</p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">¿Qué sucede al confirmar?</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Se creará la solicitud en el sistema</li>
                  <li>Inspectoría validará los datos</li>
                  <li>Se generará automáticamente una factura</li>
                  <li>El cliente deberá pagar en Caja para continuar el proceso</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Atrás
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Confirmar y Crear Solicitud
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
