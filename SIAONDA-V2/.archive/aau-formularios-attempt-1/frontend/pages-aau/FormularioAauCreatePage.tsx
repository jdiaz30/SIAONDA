import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import aauFormulariosService, { CampoFormulario, CreateFormularioData } from '../../services/aauFormulariosService';
import { productosService, Producto } from '../../services/productosService';
import FirmaDigital from '../../components/formularios/FirmaDigital';

interface Cliente {
  id: number;
  codigo: string;
  identificacion: string;
  nombrecompleto: string;
  telefono?: string;
  correo?: string;
}

interface ProductoSeleccionado {
  productoId: number;
  producto?: Producto;
  cantidad: number;
  campos: CampoFormulario[];
  valores: { [campoId: number]: string };
  gruposActivos: { [grupo: string]: boolean };
}

export default function FormularioAauCreatePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Estados del wizard
  const [pasoActual, setPasoActual] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Paso 1: Clientes (Autores)
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clientesSeleccionados, setClientesSeleccionados] = useState<number[]>([]);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([]);

  // Paso 2: Productos (Obras)
  const [productosDisponibles, setProductosDisponibles] = useState<Producto[]>([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState<ProductoSeleccionado[]>([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('');

  // Paso 3: Campos dinámicos - ya manejados en productosSeleccionados

  // Paso 4: Firma y observaciones
  const [firma, setFirma] = useState('');
  const [observaciones, setObservaciones] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    cargarProductos();
    cargarClientes();
  }, []);

  const cargarProductos = async () => {
    try {
      const productos = await productosService.getProductosActivos();
      // Filtrar solo productos de obras (Secciones I-V)
      const productosObras = productos.filter(p =>
        p.categoria.includes('Artísticas') ||
        p.categoria === 'Literarias' ||
        p.categoria === 'Científicas' ||
        p.categoria === 'Colecciones y Compilaciones' ||
        p.categoria === 'Producciones'
      );
      setProductosDisponibles(productosObras);
    } catch (err: any) {
      setError('Error al cargar productos: ' + err.message);
    }
  };

  const cargarClientes = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/clientes`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      const data = await response.json();
      setClientes(data);
      setClientesFiltrados(data);
    } catch (err: any) {
      setError('Error al cargar clientes: ' + err.message);
    }
  };

  // Búsqueda de clientes
  useEffect(() => {
    if (busquedaCliente.trim() === '') {
      setClientesFiltrados(clientes);
    } else {
      const filtrados = clientes.filter(c =>
        c.nombrecompleto.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
        c.identificacion.includes(busquedaCliente) ||
        c.codigo.toLowerCase().includes(busquedaCliente.toLowerCase())
      );
      setClientesFiltrados(filtrados);
    }
  }, [busquedaCliente, clientes]);

  // Manejo de selección de clientes
  const toggleCliente = (clienteId: number) => {
    if (clientesSeleccionados.includes(clienteId)) {
      setClientesSeleccionados(clientesSeleccionados.filter(id => id !== clienteId));
    } else {
      setClientesSeleccionados([...clientesSeleccionados, clienteId]);
    }
  };

  // Manejo de productos
  const agregarProducto = async (productoId: number) => {
    try {
      setLoading(true);
      const producto = productosDisponibles.find(p => p.id === productoId);
      if (!producto) return;

      // Cargar campos dinámicos del producto
      const campos = await aauFormulariosService.getCamposByProducto(productoId);

      const nuevoProducto: ProductoSeleccionado = {
        productoId,
        producto,
        cantidad: 1,
        campos: campos.sort((a, b) => a.orden - b.orden),
        valores: {},
        gruposActivos: {}
      };

      setProductosSeleccionados([...productosSeleccionados, nuevoProducto]);
    } catch (err: any) {
      setError('Error al cargar campos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const removerProducto = (index: number) => {
    setProductosSeleccionados(productosSeleccionados.filter((_, i) => i !== index));
  };

  const actualizarCampoProducto = (
    indexProducto: number,
    campoId: number,
    valor: string,
    campo: CampoFormulario
  ) => {
    const productos = [...productosSeleccionados];
    productos[indexProducto].valores[campoId] = valor;

    // Si es checkbox, actualizar grupos activos
    if (campo.tipo.nombre === 'checkbox' && campo.grupo) {
      productos[indexProducto].gruposActivos[campo.grupo] = valor === 'true';
    }

    setProductosSeleccionados(productos);
  };

  // Validación de pasos
  const validarPaso = (paso: number): boolean => {
    switch (paso) {
      case 1:
        if (clientesSeleccionados.length === 0) {
          setError('Debe seleccionar al menos un autor');
          return false;
        }
        return true;

      case 2:
        if (productosSeleccionados.length === 0) {
          setError('Debe seleccionar al menos una obra');
          return false;
        }
        return true;

      case 3:
        // Validar campos requeridos
        for (const prod of productosSeleccionados) {
          for (const campo of prod.campos) {
            // Solo validar si el campo es requerido y está visible
            if (campo.requerido) {
              // Si tiene grupo, solo validar si el grupo está activo
              if (campo.grupo) {
                if (prod.gruposActivos[campo.grupo] && !prod.valores[campo.id]) {
                  setError(`Complete el campo requerido: ${campo.titulo} en ${prod.producto?.nombre}`);
                  return false;
                }
              } else {
                // Campo sin grupo, siempre debe estar lleno si es requerido
                if (!prod.valores[campo.id]) {
                  setError(`Complete el campo requerido: ${campo.titulo} en ${prod.producto?.nombre}`);
                  return false;
                }
              }
            }
          }
        }
        return true;

      case 4:
        // Firma no es obligatoria, puede continuar
        return true;

      default:
        return true;
    }
  };

  const siguiente = () => {
    setError('');
    if (validarPaso(pasoActual)) {
      setPasoActual(pasoActual + 1);
    }
  };

  const anterior = () => {
    setError('');
    setPasoActual(pasoActual - 1);
  };

  const enviarFormulario = async () => {
    if (!validarPaso(4)) return;

    try {
      setLoading(true);
      setError('');

      const data: CreateFormularioData = {
        clientes: clientesSeleccionados.map(id => ({
          clienteId: id,
          tipoRelacion: 'Autor'
        })),
        productos: productosSeleccionados.map(p => ({
          productoId: p.productoId,
          cantidad: p.cantidad,
          campos: Object.entries(p.valores).map(([campoId, valor]) => ({
            campoId: parseInt(campoId),
            valor
          }))
        })),
        firma: firma || undefined,
        observaciones: observaciones || undefined
      };

      await aauFormulariosService.createFormulario(data);

      navigate('/aau/formularios', {
        state: { mensaje: 'Formulario creado exitosamente' }
      });
    } catch (err: any) {
      setError('Error al crear formulario: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Obtener categorías únicas para filtro
  const categorias = Array.from(new Set(productosDisponibles.map(p => p.categoria)));

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Formulario de Registro de Obras</h1>
        <p className="text-gray-600 mt-2">Complete los datos para registrar una o más obras</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((paso) => (
            <div key={paso} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                paso < pasoActual ? 'bg-blue-600 border-blue-600 text-white' :
                paso === pasoActual ? 'border-blue-600 text-blue-600' :
                'border-gray-300 text-gray-400'
              }`}>
                {paso < pasoActual ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="font-semibold">{paso}</span>
                )}
              </div>

              <div className={`flex-1 h-1 ${paso < 4 ? (paso < pasoActual ? 'bg-blue-600' : 'bg-gray-300') : ''}`} />
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-2">
          <span className={`text-sm ${pasoActual === 1 ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
            Autores
          </span>
          <span className={`text-sm ${pasoActual === 2 ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
            Obras
          </span>
          <span className={`text-sm ${pasoActual === 3 ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
            Datos de Obras
          </span>
          <span className={`text-sm ${pasoActual === 4 ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
            Firma y Revisión
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Contenido del paso actual */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-[500px]">
        {pasoActual === 1 && (
          <PasoClientes
            clientes={clientesFiltrados}
            clientesSeleccionados={clientesSeleccionados}
            busqueda={busquedaCliente}
            onBusquedaChange={setBusquedaCliente}
            onToggleCliente={toggleCliente}
          />
        )}

        {pasoActual === 2 && (
          <PasoProductos
            productos={productosDisponibles}
            productosSeleccionados={productosSeleccionados}
            categorias={categorias}
            categoriaFiltro={categoriaFiltro}
            onCategoriaChange={setCategoriaFiltro}
            onAgregarProducto={agregarProducto}
            onRemoverProducto={removerProducto}
            loading={loading}
          />
        )}

        {pasoActual === 3 && (
          <PasoCamposDinamicos
            productosSeleccionados={productosSeleccionados}
            onActualizarCampo={actualizarCampoProducto}
          />
        )}

        {pasoActual === 4 && (
          <PasoFirmaRevision
            firma={firma}
            observaciones={observaciones}
            onFirmaChange={setFirma}
            onObservacionesChange={setObservaciones}
            productosSeleccionados={productosSeleccionados}
            clientesSeleccionados={clientesSeleccionados}
            clientes={clientes}
          />
        )}
      </div>

      {/* Botones de navegación */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => navigate('/aau/formularios')}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
        >
          Cancelar
        </button>

        <div className="flex gap-3">
          {pasoActual > 1 && (
            <button
              onClick={anterior}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              Anterior
            </button>
          )}

          {pasoActual < 4 ? (
            <button
              onClick={siguiente}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Siguiente
            </button>
          ) : (
            <button
              onClick={enviarFormulario}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Formulario'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente: Paso 1 - Selección de Clientes
function PasoClientes({
  clientes,
  clientesSeleccionados,
  busqueda,
  onBusquedaChange,
  onToggleCliente
}: {
  clientes: Cliente[];
  clientesSeleccionados: number[];
  busqueda: string;
  onBusquedaChange: (value: string) => void;
  onToggleCliente: (id: number) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Seleccione los Autores de la Obra</h2>
      <p className="text-gray-600 mb-6">
        Busque y seleccione uno o más autores. Puede seleccionar múltiples autores para obras en coautoría.
      </p>

      {/* Buscador */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Buscar autor por nombre, cédula o código
        </label>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
          placeholder="Escriba para buscar..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Clientes seleccionados */}
      {clientesSeleccionados.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900 mb-2">
            Autores seleccionados: {clientesSeleccionados.length}
          </p>
          <div className="flex flex-wrap gap-2">
            {clientesSeleccionados.map(id => {
              const cliente = clientes.find(c => c.id === id);
              if (!cliente) return null;
              return (
                <span key={id} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {cliente.nombrecompleto}
                  <button
                    onClick={() => onToggleCliente(id)}
                    className="hover:text-blue-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Lista de clientes */}
      <div className="border border-gray-200 rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
        {clientes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No se encontraron clientes
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="w-12 px-4 py-3"></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Identificación</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contacto</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientes.map((cliente) => (
                <tr
                  key={cliente.id}
                  onClick={() => onToggleCliente(cliente.id)}
                  className={`cursor-pointer hover:bg-gray-50 ${
                    clientesSeleccionados.includes(cliente.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={clientesSeleccionados.includes(cliente.id)}
                      onChange={() => {}}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{cliente.codigo}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{cliente.nombrecompleto}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{cliente.identificacion}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div>{cliente.telefono}</div>
                    <div className="text-xs text-gray-500">{cliente.correo}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Componente: Paso 2 - Selección de Productos
function PasoProductos({
  productos,
  productosSeleccionados,
  categorias,
  categoriaFiltro,
  onCategoriaChange,
  onAgregarProducto,
  onRemoverProducto,
  loading
}: {
  productos: Producto[];
  productosSeleccionados: ProductoSeleccionado[];
  categorias: string[];
  categoriaFiltro: string;
  onCategoriaChange: (value: string) => void;
  onAgregarProducto: (id: number) => void;
  onRemoverProducto: (index: number) => void;
  loading: boolean;
}) {
  const productosFiltrados = categoriaFiltro
    ? productos.filter(p => p.categoria === categoriaFiltro)
    : productos;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Seleccione las Obras a Registrar</h2>
      <p className="text-gray-600 mb-6">
        Seleccione uno o más tipos de obra que desea registrar. Puede registrar múltiples obras en un solo formulario.
      </p>

      {/* Obras seleccionadas */}
      {productosSeleccionados.length > 0 && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-medium text-green-900 mb-3">
            Obras seleccionadas: {productosSeleccionados.length}
          </p>
          <div className="space-y-2">
            {productosSeleccionados.map((ps, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-3 rounded border border-green-200">
                <div>
                  <p className="font-medium text-gray-900">{ps.producto?.nombre}</p>
                  <p className="text-sm text-gray-600">{ps.producto?.codigo} - {ps.producto?.categoria}</p>
                </div>
                <button
                  onClick={() => onRemoverProducto(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtro por categoría */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por categoría</label>
        <select
          value={categoriaFiltro}
          onChange={(e) => onCategoriaChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas las categorías</option>
          {categorias.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Lista de productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
        {productosFiltrados.map((producto) => {
          const yaSeleccionado = productosSeleccionados.some(ps => ps.productoId === producto.id);

          return (
            <div
              key={producto.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                yaSeleccionado
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
              }`}
              onClick={() => !yaSeleccionado && !loading && onAgregarProducto(producto.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{producto.nombre}</p>
                  <p className="text-sm text-gray-600 mt-1">{producto.codigo}</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {producto.categoria}
                  </span>
                </div>
                {yaSeleccionado && (
                  <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {loading && (
        <div className="mt-4 text-center text-gray-600">
          Cargando campos dinámicos...
        </div>
      )}
    </div>
  );
}

// Componente: Paso 3 - Campos Dinámicos
function PasoCamposDinamicos({
  productosSeleccionados,
  onActualizarCampo
}: {
  productosSeleccionados: ProductoSeleccionado[];
  onActualizarCampo: (indexProducto: number, campoId: number, valor: string, campo: CampoFormulario) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Complete los Datos de las Obras</h2>
      <p className="text-gray-600 mb-6">
        Complete la información específica de cada obra seleccionada.
      </p>

      <div className="space-y-8">
        {productosSeleccionados.map((productoSel, indexProducto) => (
          <div key={indexProducto} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {productoSel.producto?.nombre}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {productoSel.producto?.codigo} - {productoSel.producto?.categoria}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {productoSel.campos.map((campo) => {
                // Verificar si el campo debe mostrarse (grupos condicionales)
                if (campo.grupo && !productoSel.gruposActivos[campo.grupo]) {
                  return null;
                }

                return (
                  <CampoDinamico
                    key={campo.id}
                    campo={campo}
                    valor={productoSel.valores[campo.id] || ''}
                    onChange={(valor) => onActualizarCampo(indexProducto, campo.id, valor, campo)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente: Campo Dinámico
function CampoDinamico({
  campo,
  valor,
  onChange
}: {
  campo: CampoFormulario;
  valor: string;
  onChange: (valor: string) => void;
}) {
  const tipoCampo = campo.tipo.nombre;

  const renderCampo = () => {
    switch (tipoCampo) {
      case 'texto':
        return (
          <input
            type="text"
            value={valor}
            onChange={(e) => onChange(e.target.value)}
            placeholder={campo.placeholder || ''}
            required={campo.requerido}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={valor}
            onChange={(e) => onChange(e.target.value)}
            placeholder={campo.placeholder || ''}
            required={campo.requerido}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'numerico':
        return (
          <input
            type="number"
            value={valor}
            onChange={(e) => onChange(e.target.value)}
            placeholder={campo.placeholder || ''}
            required={campo.requerido}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'fecha':
        return (
          <input
            type="date"
            value={valor}
            onChange={(e) => onChange(e.target.value)}
            required={campo.requerido}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={valor === 'true'}
              onChange={(e) => onChange(e.target.checked ? 'true' : 'false')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-600">
              {campo.placeholder || 'Marcar si aplica'}
            </span>
          </div>
        );

      case 'listado':
        return (
          <select
            value={valor}
            onChange={(e) => onChange(e.target.value)}
            required={campo.requerido}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccione una opción</option>
            {/* TODO: Cargar opciones del listado desde la BD */}
            <option value="opcion1">Opción 1</option>
            <option value="opcion2">Opción 2</option>
          </select>
        );

      case 'archivo':
        return (
          <div className="text-sm text-gray-600">
            <p className="mb-2">
              Los archivos se cargarán después de crear el formulario
            </p>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              📎 Campo de archivo: {campo.titulo}
            </div>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={valor}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        );
    }
  };

  return (
    <div className={`${tipoCampo === 'textarea' ? 'md:col-span-2' : ''}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {campo.titulo}
        {campo.requerido && <span className="text-red-500 ml-1">*</span>}
      </label>
      {campo.descripcion && (
        <p className="text-xs text-gray-500 mb-2">{campo.descripcion}</p>
      )}
      {renderCampo()}
    </div>
  );
}

// Componente: Paso 4 - Firma y Revisión
function PasoFirmaRevision({
  firma,
  observaciones,
  onFirmaChange,
  onObservacionesChange,
  productosSeleccionados,
  clientesSeleccionados,
  clientes
}: {
  firma: string;
  observaciones: string;
  onFirmaChange: (firma: string) => void;
  onObservacionesChange: (obs: string) => void;
  productosSeleccionados: ProductoSeleccionado[];
  clientesSeleccionados: number[];
  clientes: Cliente[];
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Revisión y Firma</h2>
      <p className="text-gray-600 mb-6">
        Revise la información ingresada y agregue su firma digital.
      </p>

      {/* Resumen */}
      <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">Resumen del Formulario</h3>

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Autores:</p>
          <div className="space-y-1">
            {clientesSeleccionados.map(id => {
              const cliente = clientes.find(c => c.id === id);
              if (!cliente) return null;
              return (
                <p key={id} className="text-sm text-gray-600">• {cliente.nombrecompleto}</p>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Obras a registrar:</p>
          <div className="space-y-1">
            {productosSeleccionados.map((ps, idx) => (
              <p key={idx} className="text-sm text-gray-600">
                • {ps.producto?.nombre} ({ps.producto?.codigo})
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Observaciones */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observaciones (opcional)
        </label>
        <textarea
          value={observaciones}
          onChange={(e) => onObservacionesChange(e.target.value)}
          placeholder="Agregue cualquier observación o comentario adicional..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Firma Digital */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Firma Digital (opcional)
        </label>
        <FirmaDigital onFirmaChange={onFirmaChange} firmaInicial={firma} />
      </div>
    </div>
  );
}
