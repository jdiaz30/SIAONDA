import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  crearEmpresa,
  actualizarEmpresa,
  obtenerEmpresaPorId,
  obtenerTodosCatalogos,
  EmpresaInspeccionada,
  ConsejoAdministracion,
  ClienteEmpresa,
  Catalogos
} from '../../services/inspectoriaService';

export default function EmpresaFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [catalogos, setCatalogos] = useState<Catalogos | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<EmpresaInspeccionada>>({
    nombreEmpresa: '',
    nombreComercial: '',
    rnc: '',
    categoriaIrcId: 0,
    tipoPersona: 'MORAL',
    nombrePropietario: '',
    cedulaPropietario: '',
    descripcionActividades: '',
    direccion: '',
    provinciaId: 0,
    sector: '',
    telefono: '',
    telefonoSecundario: '',
    correoElectronico: '',
    paginaWeb: '',
    cantidadEmpleados: 0,
    fechaConstitucion: '',
    registrado: false,
    statusId: 1,
    estadoJuridicoId: 1,
    conclusionId: 1,
    registradoId: 1,
    existenciaId: 1,
    observaciones: '',
    consejoAdministracion: [],
    principalesClientes: []
  });

  const [nuevoMiembro, setNuevoMiembro] = useState<ConsejoAdministracion>({
    nombreCompleto: '',
    cargo: '',
    cedula: ''
  });

  const [nuevoCliente, setNuevoCliente] = useState<ClienteEmpresa>({
    nombreCliente: '',
    descripcion: ''
  });

  useEffect(() => {
    cargarCatalogos();
    if (isEditing) {
      cargarEmpresa();
    }
  }, [id]);

  const cargarCatalogos = async () => {
    try {
      const data = await obtenerTodosCatalogos();
      setCatalogos(data);
    } catch (err) {
      console.error('Error cargando catálogos:', err);
      setError('Error al cargar los catálogos');
    }
  };

  const cargarEmpresa = async () => {
    try {
      setLoading(true);
      const empresa = await obtenerEmpresaPorId(parseInt(id!));
      setFormData({
        ...empresa,
        fechaConstitucion: empresa.fechaConstitucion
          ? new Date(empresa.fechaConstitucion).toISOString().split('T')[0]
          : ''
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar la empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else if (type === 'number') {
      setFormData({ ...formData, [name]: value ? parseInt(value) : 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const agregarMiembroConsejo = () => {
    if (!nuevoMiembro.nombreCompleto || !nuevoMiembro.cargo) {
      alert('Nombre completo y cargo son obligatorios');
      return;
    }

    setFormData({
      ...formData,
      consejoAdministracion: [
        ...(formData.consejoAdministracion || []),
        nuevoMiembro
      ]
    });

    setNuevoMiembro({ nombreCompleto: '', cargo: '', cedula: '' });
  };

  const eliminarMiembroConsejo = (index: number) => {
    const nuevosMiembros = [...(formData.consejoAdministracion || [])];
    nuevosMiembros.splice(index, 1);
    setFormData({ ...formData, consejoAdministracion: nuevosMiembros });
  };

  const agregarCliente = () => {
    if (!nuevoCliente.nombreCliente) {
      alert('El nombre del cliente es obligatorio');
      return;
    }

    setFormData({
      ...formData,
      principalesClientes: [
        ...(formData.principalesClientes || []),
        nuevoCliente
      ]
    });

    setNuevoCliente({ nombreCliente: '', descripcion: '' });
  };

  const eliminarCliente = (index: number) => {
    const nuevosClientes = [...(formData.principalesClientes || [])];
    nuevosClientes.splice(index, 1);
    setFormData({ ...formData, principalesClientes: nuevosClientes });
  };

  const validarRNC = (rnc: string): boolean => {
    const rncRegex = /^\d{3}-?\d{5}-?\d{1}$/;
    return rncRegex.test(rnc);
  };

  const validarCedula = (cedula: string): boolean => {
    const cedulaRegex = /^\d{3}-?\d{7}-?\d{1}$/;
    return cedulaRegex.test(cedula);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.nombreEmpresa || !formData.rnc || !formData.descripcionActividades || !formData.direccion) {
      setError('Por favor complete todos los campos obligatorios');
      return;
    }

    if (!validarRNC(formData.rnc)) {
      setError('El RNC debe tener el formato XXX-XXXXX-X');
      return;
    }

    if (formData.tipoPersona === 'MORAL') {
      if (!formData.consejoAdministracion || formData.consejoAdministracion.length === 0) {
        setError('Las Personas Morales deben tener al menos un miembro del Consejo de Administración');
        return;
      }
    } else {
      if (!formData.nombrePropietario || !formData.cedulaPropietario) {
        setError('Las Personas Físicas deben tener nombre y cédula del propietario');
        return;
      }
      if (!validarCedula(formData.cedulaPropietario)) {
        setError('La cédula debe tener el formato XXX-XXXXXXX-X');
        return;
      }
    }

    try {
      setLoading(true);

      const dataToSend = {
        ...formData,
        categoriaIrcId: parseInt(formData.categoriaIrcId as any),
        provinciaId: parseInt(formData.provinciaId as any),
        statusId: parseInt(formData.statusId as any),
        estadoJuridicoId: parseInt(formData.estadoJuridicoId as any),
        conclusionId: parseInt(formData.conclusionId as any),
        registradoId: parseInt(formData.registradoId as any),
        existenciaId: parseInt(formData.existenciaId as any)
      };

      if (isEditing) {
        await actualizarEmpresa(parseInt(id!), dataToSend);
      } else {
        await crearEmpresa(dataToSend as EmpresaInspeccionada);
      }

      navigate('/inspectoria/empresas');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar la empresa');
    } finally {
      setLoading(false);
    }
  };

  if (!catalogos) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Empresa' : 'Nueva Empresa'}
        </h1>
        <p className="text-gray-600">
          {isEditing ? 'Modifique los datos de la empresa' : 'Registre una nueva empresa en Inspectoría'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo de Persona */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tipo de Persona</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="relative flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="tipoPersona"
                value="MORAL"
                checked={formData.tipoPersona === 'MORAL'}
                onChange={handleChange}
                className="mr-3"
                disabled={isEditing}
              />
              <div>
                <div className="font-medium text-gray-900">Persona Moral</div>
                <div className="text-sm text-gray-500">Empresa con Consejo de Administración</div>
              </div>
            </label>

            <label className="relative flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="tipoPersona"
                value="FISICA"
                checked={formData.tipoPersona === 'FISICA'}
                onChange={handleChange}
                className="mr-3"
                disabled={isEditing}
              />
              <div>
                <div className="font-medium text-gray-900">Persona Física</div>
                <div className="text-sm text-gray-500">Empresa individual con propietario</div>
              </div>
            </label>
          </div>
        </div>

        {/* Información General */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Información General</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Empresa <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombreEmpresa"
                value={formData.nombreEmpresa}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RNC <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="rnc"
                value={formData.rnc}
                onChange={handleChange}
                placeholder="XXX-XXXXX-X"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Formato: XXX-XXXXX-X</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría IRC <span className="text-red-500">*</span>
              </label>
              <select
                name="categoriaIrcId"
                value={formData.categoriaIrcId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccione una categoría</option>
                {catalogos.categoriasIRC.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.codigo} - {cat.nombre} (RD$ {cat.precio.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Constitución
              </label>
              <input
                type="date"
                name="fechaConstitucion"
                value={formData.fechaConstitucion?.toString()}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción de Actividades <span className="text-red-500">*</span>
              </label>
              <textarea
                name="descripcionActividades"
                value={formData.descripcionActividades}
                onChange={handleChange}
                rows={3}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Propietario (solo Persona Física) */}
        {formData.tipoPersona === 'FISICA' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Datos del Propietario</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombrePropietario"
                  value={formData.nombrePropietario}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cédula <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="cedulaPropietario"
                  value={formData.cedulaPropietario}
                  onChange={handleChange}
                  placeholder="XXX-XXXXXXX-X"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Formato: XXX-XXXXXXX-X</p>
              </div>
            </div>
          </div>
        )}

        {/* Consejo de Administración (solo Persona Moral) */}
        {formData.tipoPersona === 'MORAL' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Consejo de Administración <span className="text-red-500">*</span>
            </h2>

            {formData.consejoAdministracion && formData.consejoAdministracion.length > 0 && (
              <div className="mb-4 border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cargo</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cédula</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.consejoAdministracion.map((miembro, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm">{miembro.nombreCompleto}</td>
                        <td className="px-4 py-2 text-sm">{miembro.cargo}</td>
                        <td className="px-4 py-2 text-sm">{miembro.cedula || '-'}</td>
                        <td className="px-4 py-2 text-sm text-right">
                          <button
                            type="button"
                            onClick={() => eliminarMiembroConsejo(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={nuevoMiembro.nombreCompleto}
                    onChange={(e) => setNuevoMiembro({ ...nuevoMiembro, nombreCompleto: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Cargo"
                    value={nuevoMiembro.cargo}
                    onChange={(e) => setNuevoMiembro({ ...nuevoMiembro, cargo: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Cédula (opcional)"
                    value={nuevoMiembro.cedula}
                    onChange={(e) => setNuevoMiembro({ ...nuevoMiembro, cedula: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={agregarMiembroConsejo}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ubicación y Contacto */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ubicación y Contacto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección <span className="text-red-500">*</span>
              </label>
              <textarea
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                rows={2}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provincia <span className="text-red-500">*</span>
              </label>
              <select
                name="provinciaId"
                value={formData.provinciaId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccione una provincia</option>
                {catalogos.provincias.map((prov) => (
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono Principal
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Página Web
              </label>
              <input
                type="url"
                name="paginaWeb"
                value={formData.paginaWeb}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad de Empleados
              </label>
              <input
                type="number"
                name="cantidadEmpleados"
                value={formData.cantidadEmpleados}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Principales Clientes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Principales Clientes (Opcional)
          </h2>

          {formData.principalesClientes && formData.principalesClientes.length > 0 && (
            <div className="mb-4 border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Acción</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.principalesClientes.map((cliente, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm">{cliente.nombreCliente}</td>
                      <td className="px-4 py-2 text-sm">{cliente.descripcion || '-'}</td>
                      <td className="px-4 py-2 text-sm text-right">
                        <button
                          type="button"
                          onClick={() => eliminarCliente(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Nombre del cliente"
                  value={nuevoCliente.nombreCliente}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombreCliente: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Descripción (opcional)"
                  value={nuevoCliente.descripcion}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, descripcion: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={agregarCliente}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Observaciones */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Observaciones</h2>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Notas adicionales sobre la empresa..."
          />
        </div>

        {/* Botones */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => navigate('/inspectoria/empresas')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {isEditing ? 'Actualizar' : 'Guardar'} Empresa
          </button>
        </div>
      </form>
    </div>
  );
}
