import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BusquedaAutoresStep from '../../components/aau/BusquedaAutoresStep';
import SelectorProductoStep from '../../components/aau/SelectorProductoStep';
import FormularioObraStep from '../../components/aau/FormularioObraStep';
import RevisionStep from '../../components/aau/RevisionStep';
import { formulariosService } from '../../services/formulariosService';

interface AutorSeleccionado {
  id: number;
  cliente: any;
  rol: string;
  orden: number;
}

interface ProductoSeleccionado {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string;
  precio: number;
}

type Step = 'autores' | 'producto' | 'formulario' | 'revision';

const NuevoRegistroObraPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('autores');
  const [autoresSeleccionados, setAutoresSeleccionados] = useState<AutorSeleccionado[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoSeleccionado | null>(null);
  const [datosFormulario, setDatosFormulario] = useState<any>(null);

  const steps = [
    { id: 'autores', nombre: 'Autores', numero: 1 },
    { id: 'producto', nombre: 'Tipo de Obra', numero: 2 },
    { id: 'formulario', nombre: 'Datos de la Obra', numero: 3 },
    { id: 'revision', nombre: 'Revisión', numero: 4 },
  ];

  const handleAutoresCompleted = (autores: AutorSeleccionado[]) => {
    setAutoresSeleccionados(autores);
    setCurrentStep('producto');
  };

  const handleProductoSelected = (producto: ProductoSeleccionado) => {
    setProductoSeleccionado(producto);
    setCurrentStep('formulario');
  };

  const handleFormularioCompleted = (datos: any) => {
    setDatosFormulario(datos);
    setCurrentStep('revision');
  };

  const handleVolver = () => {
    const stepOrder: Step[] = ['autores', 'producto', 'formulario', 'revision'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handleEnviar = async () => {
    try {
      if (!productoSeleccionado) {
        alert('Error: No hay producto seleccionado');
        return;
      }

      // Preparar datos para enviar
      const autores = autoresSeleccionados.map(a => ({
        clienteId: a.cliente.id,
        rol: a.rol
      }));

      const datosObra = {
        titulo: datosFormulario.titulo,
        subtitulo: datosFormulario.subtitulo,
        anioCreacion: parseInt(datosFormulario.anioCreacion),
        descripcion: datosFormulario.descripcion,
        paisOrigen: datosFormulario.paisOrigen,
        camposEspecificos: datosFormulario.camposEspecificos || {}
      };

      // Llamar al backend
      const formulario = await formulariosService.createFormularioObra({
        autores,
        productoId: productoSeleccionado.id,
        datosObra
      });

      alert(`¡Formulario creado exitosamente!\n\nCódigo: ${formulario.codigo}\n\nEl formulario está en estado PENDIENTE. Ahora debe dirigirse a Caja para realizar el pago.`);

      // Redirigir al listado de formularios o al dashboard
      navigate('/aau/formularios');
    } catch (error: any) {
      console.error('Error al crear formulario:', error);
      alert(`Error al crear el formulario: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Nuevo Registro de Obra</h1>
              <p className="text-blue-100 mt-1">Complete los pasos para registrar una nueva obra</p>
            </div>
            <button
              onClick={() => navigate('/aau')}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar
            </button>
          </div>

          {/* Progress Steps */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                        currentStep === step.id
                          ? 'bg-white text-blue-600 shadow-lg'
                          : steps.findIndex(s => s.id === currentStep) > index
                          ? 'bg-green-500 text-white'
                          : 'bg-white/20 text-white/60'
                      }`}
                    >
                      {steps.findIndex(s => s.id === currentStep) > index ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        step.numero
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium transition-all ${
                          currentStep === step.id
                            ? 'text-white'
                            : steps.findIndex(s => s.id === currentStep) > index
                            ? 'text-green-200'
                            : 'text-white/60'
                        }`}
                      >
                        {step.nombre}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 w-full mx-4 rounded transition-all ${
                        steps.findIndex(s => s.id === currentStep) > index
                          ? 'bg-green-500'
                          : 'bg-white/20'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 'autores' && (
          <BusquedaAutoresStep
            autoresIniciales={autoresSeleccionados}
            onContinuar={handleAutoresCompleted}
          />
        )}

        {currentStep === 'producto' && (
          <SelectorProductoStep
            onProductoSeleccionado={handleProductoSelected}
            onVolver={handleVolver}
          />
        )}

        {currentStep === 'formulario' && productoSeleccionado && (
          <FormularioObraStep
            producto={productoSeleccionado}
            autores={autoresSeleccionados}
            datosIniciales={datosFormulario}
            onContinuar={handleFormularioCompleted}
            onVolver={handleVolver}
          />
        )}

        {currentStep === 'revision' && (
          <RevisionStep
            autores={autoresSeleccionados}
            producto={productoSeleccionado}
            datos={datosFormulario}
            onEnviar={handleEnviar}
            onVolver={handleVolver}
          />
        )}
      </div>
    </div>
  );
};

export default NuevoRegistroObraPage;
