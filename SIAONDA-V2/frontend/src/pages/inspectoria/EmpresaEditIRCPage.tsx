import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { obtenerTodosCatalogos, obtenerEmpresaPorId, actualizarEmpresa, Catalogos, EmpresaInspeccionada } from '../../services/inspectoriaService';
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

  // Representante Legal
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

interface AsientoInfo {
  numeroRegistro?: string;
  numeroLibro?: string;
  numeroHoja?: string;
  fechaAsentamiento?: string;
}

export default function EmpresaEditIRCPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [catalogos, setCatalogos] = useState<Catalogos | null>(null);
  const [producto, setProducto] = useState<Producto | null>(null);
  const [empresa, setEmpresa] = useState<EmpresaInspeccionada | null>(null);
  const [asientoInfo, setAsientoInfo] = useState<AsientoInfo | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1); // Solo pasos 1 y 2 (datos empresa y confirmación)

  const [formData, setFormData] = useState<FormularioIRCData>({
    tipoSolicitud: 'RENOVACION',
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

  useEffect(() => {
    initializeEditForm();
  }, [id]);

  const initializeEditForm = async () => {
    try {
      setLoading(true);

      // Cargar catálogos
      const catalogosData = await obtenerTodosCatalogos();
      setCatalogos(catalogosData);

      // Cargar producto IRC-01
      const productosResponse = await api.get('/productos');
      const productoIRC = productosResponse.data.find((p: any) => p.codigo === 'IRC-01');
      if (productoIRC) {
        const camposResponse = await api.get(`/productos/${productoIRC.id}/campos`);
        setProducto({
          ...productoIRC,
          campos: camposResponse.data
        });
      }

      // Cargar empresa
      if (id) {
        const empresaData = await obtenerEmpresaPorId(parseInt(id));
        setEmpresa(empresaData);

        // Buscar solicitud asentada para obtener información del asiento
        try {
          const solicitudesResponse = await api.get('/inspectoria/solicitudes', {
            params: { empresaId: parseInt(id), limit: 1 }
          });

          const solicitudes = solicitudesResponse.data.data || [];
          if (solicitudes.length > 0) {
            const solicitud = solicitudes[0];
            if (solicitud.numeroRegistro || solicitud.numeroLibro || solicitud.numeroHoja) {
              setAsientoInfo({
                numeroRegistro: solicitud.numeroRegistro || undefined,
                numeroLibro: solicitud.numeroLibro || undefined,
                numeroHoja: solicitud.numeroHoja || undefined,
                fechaAsentamiento: solicitud.fechaAsentamiento || undefined
              });
            }
          }
        } catch (err) {
          console.log('No se encontró información del asiento');
        }

        // Extraer datos del consejo de administración si existe
        const consejoData = empresaData.consejoAdministracion || [];
        const presidente = consejoData.find((m: any) => m.cargo.toLowerCase().includes('presidente'));
        const vicepresidente = consejoData.find((m: any) => m.cargo.toLowerCase().includes('vicepresidente'));
        const secretario = consejoData.find((m: any) => m.cargo.toLowerCase().includes('secretario'));
        const tesorero = consejoData.find((m: any) => m.cargo.toLowerCase().includes('tesorero'));
        const administrador = consejoData.find((m: any) => m.cargo.toLowerCase().includes('administrador'));

        // Extraer principales clientes
        const clientesData = empresaData.principalesClientes || [];
        const principalesClientes = clientesData.map((c: any) => c.nombreCliente).join(', ');

        // Mapear datos de empresa a formulario IRC
        setFormData({
          tipoSolicitud: 'RENOVACION',
          nombreEmpresa: empresaData.nombreEmpresa || '',
          nombreComercial: empresaData.nombreComercial || '',
          rnc: empresaData.rnc || '',
          categoriaIrcId: empresaData.categoriaIrcId || 0,
          fechaInicioOperaciones: empresaData.fechaConstitucion
            ? new Date(empresaData.fechaConstitucion).toISOString().split('T')[0]
            : '',
          principalesClientes: principalesClientes,
          direccion: empresaData.direccion || '',
          provinciaId: empresaData.provinciaId || 0,
          sector: empresaData.sector || '',
          telefono: empresaData.telefono || '',
          telefonoSecundario: empresaData.telefonoSecundario || '',
          correoElectronico: empresaData.correoElectronico || '',
          representanteLegal: empresaData.nombrePropietario || presidente?.nombreCompleto || '',
          cedulaRepresentante: empresaData.cedulaPropietario || presidente?.cedula || '',
          descripcionActividades: empresaData.descripcionActividades || '',
          tipoPersona: empresaData.tipoPersona || 'MORAL',

          // Persona MORAL
          presidenteNombre: presidente?.nombreCompleto || '',
          presidenteCedula: presidente?.cedula || '',
          vicepresidente: vicepresidente?.nombreCompleto || '',
          secretario: secretario?.nombreCompleto || '',
          tesorero: tesorero?.nombreCompleto || '',
          administrador: administrador?.nombreCompleto || '',
          fechaConstitucion: empresaData.fechaConstitucion
            ? new Date(empresaData.fechaConstitucion).toISOString().split('T')[0]
            : '',

          // Persona FISICA
          nombrePropietario: empresaData.nombrePropietario || '',
          cedulaPropietario: empresaData.cedulaPropietario || ''
        });
      }
    } catch (error) {
      console.error('Error inicializando formulario:', error);
      alert('Error al cargar los datos de la empresa');
      navigate('/inspectoria/empresas');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    let processedValue: string | number = value;
    if (name === 'categoriaIrcId' || name === 'provinciaId') {
      processedValue = parseInt(value, 10);
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));

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
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      if (!empresa || !id) {
        alert('Error: No se pudo identificar la empresa');
        return;
      }

      // Reconstruir consejoAdministracion desde el formulario
      const consejoAdministracion = [];
      if (formData.tipoPersona === 'MORAL') {
        if (formData.presidenteNombre) {
          consejoAdministracion.push({
            nombreCompleto: formData.presidenteNombre,
            cargo: 'Presidente',
            cedula: formData.presidenteCedula || ''
          });
        }
        if (formData.vicepresidente) {
          consejoAdministracion.push({
            nombreCompleto: formData.vicepresidente,
            cargo: 'Vicepresidente',
            cedula: ''
          });
        }
        if (formData.secretario) {
          consejoAdministracion.push({
            nombreCompleto: formData.secretario,
            cargo: 'Secretario',
            cedula: ''
          });
        }
        if (formData.tesorero) {
          consejoAdministracion.push({
            nombreCompleto: formData.tesorero,
            cargo: 'Tesorero',
            cedula: ''
          });
        }
        if (formData.administrador) {
          consejoAdministracion.push({
            nombreCompleto: formData.administrador,
            cargo: 'Administrador',
            cedula: ''
          });
        }
      }

      // Reconstruir principalesClientes desde el formulario
      const principalesClientes = formData.principalesClientes
        ? formData.principalesClientes.split(',').map(nombre => ({
            nombreCliente: nombre.trim(),
            descripcion: ''
          }))
        : [];

      // Construir objeto de actualización
      const empresaActualizada: Partial<EmpresaInspeccionada> = {
        nombreEmpresa: formData.nombreEmpresa,
        nombreComercial: formData.nombreComercial,
        rnc: formData.rnc,
        categoriaIrcId: formData.categoriaIrcId,
        tipoPersona: formData.tipoPersona,
        nombrePropietario: formData.tipoPersona === 'FISICA' ? formData.nombrePropietario : null,
        cedulaPropietario: formData.tipoPersona === 'FISICA' ? formData.cedulaPropietario : null,
        personaContacto: formData.representanteLegal, // Este campo se muestra en el listado como "Representante Legal"
        descripcionActividades: formData.descripcionActividades,
        direccion: formData.direccion,
        provinciaId: formData.provinciaId,
        sector: formData.sector,
        telefono: formData.telefono,
        telefonoSecundario: formData.telefonoSecundario,
        correoElectronico: formData.correoElectronico,
        fechaConstitucion: formData.fechaConstitucion || null,
        consejoAdministracion: consejoAdministracion.length > 0 ? consejoAdministracion : undefined,
        principalesClientes: principalesClientes.length > 0 ? principalesClientes : undefined
      };

      await actualizarEmpresa(parseInt(id), empresaActualizada);

      alert('✅ Empresa actualizada exitosamente');
      // Navegar y forzar recarga agregando timestamp
      navigate('/inspectoria/empresas?refresh=' + Date.now());
    } catch (error: any) {
      console.error('Error:', error);
      alert('Error al actualizar la empresa: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !catalogos || !producto || !empresa) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600">Cargando información de la empresa...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Editar Empresa IRC
          </h1>
          <p className="text-gray-600">
            {empresa.nombreEmpresa} - RNC: {empresa.rnc}
          </p>
        </div>
        <button
          onClick={() => navigate('/inspectoria/empresas')}
          className="text-gray-600 hover:text-gray-800"
        >
          Cancelar
        </button>
      </div>

      {/* Información del Asiento de Registro (No editable) */}
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

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          {[1, 2].map((num) => (
            <div key={num} className="flex items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step >= num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {num}
              </div>
              {num < 2 && (
                <div className={`flex-1 h-1 mx-2 ${
                  step > num ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Datos de la Empresa</span>
          <span>Confirmación</span>
        </div>
      </div>

      {/* Step 1: Datos de la Empresa - EXACT SAME AS FormularioIRCPage Step 2 */}
      {step === 1 && (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Datos de la Empresa
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
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed"
              >
                <option value="MORAL">Persona Moral (Empresa/Sociedad)</option>
                <option value="FISICA">Persona Física (Individual)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Este campo no puede ser modificado</p>
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

      {/* Step 2: Confirmación */}
      {step === 2 && (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Confirmar Cambios</h2>

          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-2">Datos Generales</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Tipo de Persona</p>
                  <p className="font-medium">{formData.tipoPersona === 'MORAL' ? 'Persona Moral' : 'Persona Física'}</p>
                </div>
                <div>
                  <p className="text-gray-600">RNC / Cédula</p>
                  <p className="font-medium">{formData.rnc}</p>
                </div>
                <div>
                  <p className="text-gray-600">Categoría IRC</p>
                  <p className="font-medium">
                    {catalogos?.categoriasIRC.find(c => c.id === formData.categoriaIrcId)?.codigo} - {catalogos?.categoriasIRC.find(c => c.id === formData.categoriaIrcId)?.nombre || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Provincia</p>
                  <p className="font-medium">{catalogos?.provincias.find(p => p.id === formData.provinciaId)?.nombre || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-2">Información de Contacto</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="col-span-2">
                  <p className="text-gray-600">Nombre / Razón Social</p>
                  <p className="font-medium">{formData.nombreEmpresa}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600">Dirección</p>
                  <p className="font-medium">{formData.direccion}</p>
                </div>
                <div>
                  <p className="text-gray-600">Teléfono</p>
                  <p className="font-medium">{formData.telefono}</p>
                </div>
                <div>
                  <p className="text-gray-600">Correo Electrónico</p>
                  <p className="font-medium">{formData.correoElectronico || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">¿Qué sucede al confirmar?</p>
                <p>Los datos de la empresa serán actualizados en el sistema de Inspectoría.</p>
              </div>
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
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Confirmar y Actualizar
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
