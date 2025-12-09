import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { formulariosService, CreateFormularioDto } from '../../services/formulariosService';
import { productosService, Producto } from '../../services/productosService';
import { clientesService } from '../../services/clientesService';
import FirmaDigital from '../../components/formularios/FirmaDigital';

type WizardStep = 'cliente' | 'productos' | 'campos' | 'firma' | 'resumen';

interface ProductoSeleccionado {
  productoId: number;
  producto: {
    id: number;
    codigo: string;
    nombre: string;
    categoria: string;
    descripcion: string | null;
  };
  indice: number;
  indiceMadre: number | null;
  campos: Array<{
    campoId: number;
    titulo: string;
    campo: string;
    tipo: string;
    requerido: boolean;
    valor: string;
  }>;
}

interface ClienteSeleccionado {
  clienteId: number;
  cliente: {
    id: number;
    nombrecompleto: string;
    identificacion: string;
  };
  rol: string;
}

export default function FormularioFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<WizardStep>('cliente');
  const [formulario, setFormulario] = useState<any>(null);

  // Datos del formulario
  const [clientesSeleccionados, setClientesSeleccionados] = useState<ClienteSeleccionado[]>([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState<ProductoSeleccionado[]>([]);
  const [firma, setFirma] = useState<string>('');

  // Estados para búsqueda de clientes
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [clientesEncontrados, setClientesEncontrados] = useState<any[]>([]);
  const [buscandoClientes, setBuscandoClientes] = useState(false);

  // Estados para productos
  const [productosDisponibles, setProductosDisponibles] = useState<Producto[]>([]);
  const [mostrarSelectorProductos, setMostrarSelectorProductos] = useState(false);

  useEffect(() => {
    if (id) {
      loadFormulario();
    }
    loadProductos();
  }, [id]);

  const loadFormulario = async () => {
    try {
      setLoading(true);
      const formularioData = await formulariosService.getFormulario(Number(id));

      // Guardar formulario completo para acceder a solicitudIrc
      setFormulario(formularioData);

      // Cargar datos existentes
      setClientesSeleccionados(formularioData.clientes.map(fc => ({
        clienteId: fc.clienteId,
        cliente: fc.cliente,
        rol: fc.rol
      })));

      setProductosSeleccionados(formularioData.productos.map(fp => ({
        productoId: fp.productoId,
        producto: fp.producto,
        indice: fp.indice,
        indiceMadre: fp.indiceMadre,
        campos: fp.campos.map(c => ({
          campoId: c.campoId,
          titulo: c.campo.titulo,
          campo: c.campo.campo,
          tipo: c.campo.tipo,
          requerido: c.campo.requerido,
          valor: c.valor || ''
        }))
      })));

      if (formularioData.firma) {
        setFirma(formularioData.firma);
      }
    } catch (error) {
      console.error('Error cargando formulario:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProductos = async () => {
    try {
      const productos = await productosService.getProductosActivos();
      setProductosDisponibles(productos);
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };

  const buscarClientes = async () => {
    if (!busquedaCliente.trim()) return;

    try {
      setBuscandoClientes(true);
      const response = await clientesService.getClientes({
        search: busquedaCliente
      });
      setClientesEncontrados(response.clientes);
    } catch (error) {
      console.error('Error buscando clientes:', error);
    } finally {
      setBuscandoClientes(false);
    }
  };

  const agregarCliente = (cliente: any, rol: string) => {
    if (clientesSeleccionados.some(c => c.clienteId === cliente.id)) {
      alert('Este cliente ya fue agregado');
      return;
    }

    setClientesSeleccionados([
      ...clientesSeleccionados,
      {
        clienteId: cliente.id,
        cliente: {
          id: cliente.id,
          nombrecompleto: cliente.nombrecompleto,
          identificacion: cliente.identificacion
        },
        rol
      }
    ]);
    setBusquedaCliente('');
    setClientesEncontrados([]);
  };

  const eliminarCliente = (clienteId: number) => {
    setClientesSeleccionados(clientesSeleccionados.filter(c => c.clienteId !== clienteId));
  };

  const agregarProducto = async (producto: Producto) => {
    try {
      // Cargar campos dinámicos del producto
      const campos = await formulariosService.getCamposPorProducto(producto.id);

      const nuevoProducto: ProductoSeleccionado = {
        productoId: producto.id,
        producto: {
          id: producto.id,
          codigo: producto.codigo,
          nombre: producto.nombre,
          categoria: producto.categoria,
          descripcion: producto.descripcion
        },
        indice: productosSeleccionados.length + 1,
        indiceMadre: null,
        campos: campos.map(c => ({
          campoId: c.id,
          titulo: c.titulo,
          campo: c.campo,
          tipo: c.tipo.nombre,
          requerido: c.requerido,
          valor: ''
        }))
      };

      setProductosSeleccionados([...productosSeleccionados, nuevoProducto]);
      setMostrarSelectorProductos(false);
    } catch (error) {
      console.error('Error cargando campos del producto:', error);
      alert('Error al cargar los campos del producto');
    }
  };

  const eliminarProducto = (indice: number) => {
    setProductosSeleccionados(productosSeleccionados.filter(p => p.indice !== indice));
  };

  const actualizarCampoProducto = (productoIndice: number, campoId: number, valor: string) => {
    setProductosSeleccionados(productosSeleccionados.map(p => {
      if (p.indice === productoIndice) {
        return {
          ...p,
          campos: p.campos.map(c =>
            c.campoId === campoId ? { ...c, valor } : c
          )
        };
      }
      return p;
    }));
  };

  const validarPaso = (): boolean => {
    switch (step) {
      case 'cliente':
        if (clientesSeleccionados.length === 0) {
          alert('Debe agregar al menos un cliente/autor');
          return false;
        }
        return true;

      case 'productos':
        if (productosSeleccionados.length === 0) {
          alert('Debe agregar al menos una obra');
          return false;
        }
        return true;

      case 'campos':
        // Validar campos requeridos
        for (const producto of productosSeleccionados) {
          for (const campo of producto.campos) {
            if (campo.requerido && !campo.valor.trim()) {
              alert(`El campo "${campo.titulo}" es requerido en ${producto.producto.nombre}`);
              return false;
            }
          }
        }
        return true;

      case 'firma':
        if (!firma) {
          alert('Debe firmar el formulario');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const siguientePaso = () => {
    if (!validarPaso()) return;

    const pasos: WizardStep[] = ['cliente', 'productos', 'campos', 'firma', 'resumen'];
    const currentIndex = pasos.indexOf(step);
    if (currentIndex < pasos.length - 1) {
      setStep(pasos[currentIndex + 1]);
    }
  };

  const pasoAnterior = () => {
    const pasos: WizardStep[] = ['cliente', 'productos', 'campos', 'firma', 'resumen'];
    const currentIndex = pasos.indexOf(step);
    if (currentIndex > 0) {
      setStep(pasos[currentIndex - 1]);
    }
  };

  const guardarFormulario = async () => {
    if (!validarPaso()) return;

    try {
      setLoading(true);

      const dto: CreateFormularioDto = {
        firma,
        productos: productosSeleccionados.map(p => ({
          productoId: p.productoId,
          indice: p.indice,
          indiceMadre: p.indiceMadre,
          campos: p.campos.map(c => ({
            campoId: c.campoId,
            valor: c.valor
          }))
        })),
        clientes: clientesSeleccionados.map(c => ({
          clienteId: c.clienteId,
          rol: c.rol
        }))
      };

      if (id) {
        await formulariosService.updateFormulario(Number(id), dto);
      } else {
        await formulariosService.createFormulario(dto);
      }

      alert('Formulario guardado exitosamente');
      navigate('/formularios');
    } catch (error) {
      console.error('Error guardando formulario:', error);
      alert('Error al guardar el formulario');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    const pasos = [
      { id: 'cliente', nombre: 'Cliente/Autor', icon: '👤' },
      { id: 'productos', nombre: 'Obras', icon: '📄' },
      { id: 'campos', nombre: 'Datos', icon: '✏️' },
      { id: 'firma', nombre: 'Firma', icon: '✍️' },
      { id: 'resumen', nombre: 'Resumen', icon: '✓' }
    ];

    return (
      <div className="flex items-center justify-between mb-8">
        {pasos.map((paso, index) => (
          <div key={paso.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                step === paso.id ? 'bg-blue-600 text-white' :
                pasos.findIndex(p => p.id === step) > index ? 'bg-green-600 text-white' :
                'bg-gray-200 text-gray-600'
              }`}>
                {paso.icon}
              </div>
              <span className={`text-xs mt-1 ${step === paso.id ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                {paso.nombre}
              </span>
            </div>
            {index < pasos.length - 1 && (
              <div className={`h-0.5 flex-1 ${
                pasos.findIndex(p => p.id === step) > index ? 'bg-green-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderClienteStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Seleccionar Cliente(s) / Autor(es)</h2>

        {/* Búsqueda de clientes */}
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar Cliente
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={busquedaCliente}
              onChange={(e) => setBusquedaCliente(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && buscarClientes()}
              placeholder="Nombre, cédula o RNC..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={buscarClientes}
              disabled={buscandoClientes}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {buscandoClientes ? 'Buscando...' : 'Buscar'}
            </button>
          </div>

          {/* Resultados de búsqueda */}
          {clientesEncontrados.length > 0 && (
            <div className="mt-4 border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
              {clientesEncontrados.map((cliente) => (
                <div key={cliente.id} className="p-3 border-b border-gray-100 hover:bg-gray-50 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{cliente.nombrecompleto}</div>
                    <div className="text-sm text-gray-500">{cliente.identificacion}</div>
                  </div>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        agregarCliente(cliente, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="">Seleccionar rol...</option>
                    <option value="Autor">Autor</option>
                    <option value="Compositor">Compositor</option>
                    <option value="Intérprete">Intérprete</option>
                    <option value="Productor">Productor</option>
                    <option value="Editor">Editor</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clientes seleccionados */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium mb-3">Clientes/Autores Seleccionados ({clientesSeleccionados.length})</h3>
          {clientesSeleccionados.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay clientes seleccionados</p>
          ) : (
            <div className="space-y-2">
              {clientesSeleccionados.map((cliente) => (
                <div key={cliente.clienteId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{cliente.cliente.nombrecompleto}</div>
                    <div className="text-sm text-gray-500">
                      {cliente.cliente.identificacion} - <span className="font-semibold">{cliente.rol}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => eliminarCliente(cliente.clienteId)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderProductosStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Obras a Registrar</h2>
        <button
          onClick={() => setMostrarSelectorProductos(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Agregar Obra
        </button>
      </div>

      {/* Modal selector de productos */}
      {mostrarSelectorProductos && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Seleccionar Tipo de Obra</h3>
              <button
                onClick={() => setMostrarSelectorProductos(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productosDisponibles.map((producto) => (
                <button
                  key={producto.id}
                  onClick={() => agregarProducto(producto)}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition-colors"
                >
                  <div className="font-semibold text-blue-600">{producto.codigo}</div>
                  <div className="text-sm font-medium mt-1">{producto.nombre}</div>
                  <div className="text-xs text-gray-500 mt-1">{producto.categoria}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lista de productos seleccionados */}
      <div className="space-y-4">
        {productosSeleccionados.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500">No hay obras agregadas</p>
            <p className="text-sm text-gray-400 mt-1">Haz clic en "Agregar Obra" para comenzar</p>
          </div>
        ) : (
          productosSeleccionados.map((producto) => (
            <div key={producto.indice} className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-semibold text-blue-600">{producto.producto.codigo}</span>
                  <span className="ml-2 font-medium">{producto.producto.nombre}</span>
                </div>
                <button
                  onClick={() => eliminarProducto(producto.indice)}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="text-sm text-gray-500">
                {producto.campos.length} campos a completar
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderCamposStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Completar Datos de las Obras</h2>

      {productosSeleccionados.map((producto, pIndex) => (
        <div key={producto.indice} className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-4 text-blue-600">
            {producto.producto.codigo} - {producto.producto.nombre}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {producto.campos.map((campo) => (
              <div key={campo.campoId} className={campo.tipo === 'divisor' ? 'md:col-span-2' : ''}>
                {campo.tipo === 'divisor' ? (
                  <div className="border-t border-gray-300 pt-4 mt-2">
                    <h4 className="font-semibold text-gray-700">{campo.titulo}</h4>
                  </div>
                ) : (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {campo.titulo}
                      {campo.requerido && <span className="text-red-500 ml-1">*</span>}
                    </label>

                    {campo.tipo === 'texto' && (
                      <input
                        type="text"
                        value={campo.valor}
                        onChange={(e) => actualizarCampoProducto(producto.indice, campo.campoId, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required={campo.requerido}
                      />
                    )}

                    {campo.tipo === 'numerico' && (
                      <input
                        type="number"
                        value={campo.valor}
                        onChange={(e) => actualizarCampoProducto(producto.indice, campo.campoId, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required={campo.requerido}
                      />
                    )}

                    {campo.tipo === 'fecha' && (
                      <input
                        type="date"
                        value={campo.valor}
                        onChange={(e) => actualizarCampoProducto(producto.indice, campo.campoId, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required={campo.requerido}
                      />
                    )}

                    {campo.tipo === 'checkbox' && (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={campo.valor === 'true'}
                          onChange={(e) => actualizarCampoProducto(producto.indice, campo.campoId, e.target.checked ? 'true' : 'false')}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">Sí</span>
                      </div>
                    )}

                    {campo.tipo === 'listado' && (
                      <select
                        value={campo.valor}
                        onChange={(e) => actualizarCampoProducto(producto.indice, campo.campoId, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required={campo.requerido}
                      >
                        <option value="">Seleccionar...</option>
                        {/* Las opciones vendrían del campo en la BD */}
                      </select>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderFirmaStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Firma Digital</h2>

      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600 mb-4">
          Por favor, firme en el recuadro siguiente para completar el formulario
        </p>

        <FirmaDigital
          onFirmaChange={setFirma}
          firmaInicial={firma}
        />
      </div>
    </div>
  );

  const renderResumenStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Resumen del Formulario</h2>

      {/* Clientes */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-3">Clientes/Autores</h3>
        <div className="space-y-2">
          {clientesSeleccionados.map((cliente) => (
            <div key={cliente.clienteId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span>{cliente.cliente.nombrecompleto}</span>
              <span className="text-sm font-semibold text-blue-600">{cliente.rol}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Obras */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-3">Obras Registradas ({productosSeleccionados.length})</h3>
        <div className="space-y-3">
          {productosSeleccionados.map((producto) => (
            <div key={producto.indice} className="p-3 bg-gray-50 rounded">
              <div className="font-medium text-blue-600">
                {producto.producto.codigo} - {producto.producto.nombre}
              </div>
              <div className="text-sm text-gray-600 mt-2">
                {producto.campos.filter(c => c.valor && c.tipo !== 'divisor').length} campos completados
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estado de firma */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-3">Firma Digital</h3>
        {firma ? (
          <div className="text-green-600 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Formulario firmado</span>
          </div>
        ) : (
          <div className="text-red-600">Falta firma</div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {id ? 'Editar Formulario' : 'Nuevo Formulario de Registro'}
          </h1>
          <p className="text-gray-600">Complete todos los pasos para registrar las obras</p>
        </div>
        <button
          onClick={() => navigate('/formularios')}
          className="text-gray-600 hover:text-gray-800"
        >
          Cancelar
        </button>
      </div>

      {/* 🔗 Estado de Inspectoría (si es formulario IRC) */}
      {id && formulario?.solicitudIrc && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 shadow-md">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Solicitud de Registro IRC - Inspectoría
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Código de Solicitud:</p>
                  <p className="text-base font-medium text-gray-900">{formulario.solicitudIrc.codigo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado:</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    formulario.solicitudIrc.estado.nombre === 'PAGADA' ? 'bg-green-100 text-green-800' :
                    formulario.solicitudIrc.estado.nombre === 'ASENTADA' ? 'bg-blue-100 text-blue-800' :
                    formulario.solicitudIrc.estado.nombre === 'LISTA_ENTREGA' ? 'bg-green-100 text-green-800' :
                    formulario.solicitudIrc.estado.nombre === 'ENTREGADA' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {formulario.solicitudIrc.estado.nombre}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Empresa:</p>
                  <p className="text-base font-medium text-gray-900">{formulario.solicitudIrc.empresa?.nombreEmpresa || formulario.solicitudIrc.nombreEmpresa}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">RNC:</p>
                  <p className="text-base font-medium text-gray-900">{formulario.solicitudIrc.rnc}</p>
                </div>
              </div>
              {formulario.solicitudIrc.certificado && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-green-800">Certificado generado y firmado</span>
                </div>
              )}
              <Link
                to={`/inspectoria/solicitudes/${formulario.solicitudIrc.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Ver progreso en Inspectoría
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Step Indicator */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {renderStepIndicator()}
      </div>

      {/* Step Content */}
      <div className="bg-gray-50 rounded-lg p-6">
        {step === 'cliente' && renderClienteStep()}
        {step === 'productos' && renderProductosStep()}
        {step === 'campos' && renderCamposStep()}
        {step === 'firma' && renderFirmaStep()}
        {step === 'resumen' && renderResumenStep()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-md">
        <button
          onClick={pasoAnterior}
          disabled={step === 'cliente'}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Anterior
        </button>

        {step === 'resumen' ? (
          <button
            onClick={guardarFormulario}
            disabled={loading}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {loading ? 'Guardando...' : 'Guardar Formulario'}
          </button>
        ) : (
          <button
            onClick={siguientePaso}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            Siguiente
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
