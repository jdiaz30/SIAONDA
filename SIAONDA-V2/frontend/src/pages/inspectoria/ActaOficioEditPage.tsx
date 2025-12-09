import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';

interface Inspector {
  id: number;
  codigo: string;
  nombrecompleto: string;
}

interface Acta {
  id: number;
  numeroActa: string;
  resultadoInspeccion: string;
  requiereSeguimiento: boolean;
  rutaPdfActa: string;
  viaje: {
    id: number;
    numeroViaje: string;
  };
  inspector: {
    id: number;
    nombrecompleto: string;
  };
  empresa: {
    id: number;
    nombreEmpresa: string;
    rnc: string;
  };
  casoGenerado?: {
    id: number;
    codigo: string;
  };
}

export default function ActaOficioEditPage() {
  const navigate = useNavigate();
  const { actaId } = useParams<{ actaId: string }>();

  const [loading, setLoading] = useState(false);
  const [acta, setActa] = useState<Acta | null>(null);
  const [inspectores, setInspectores] = useState<Inspector[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    numeroActa: '',
    inspectorId: '',
    empresaRnc: '',
    empresaNombre: '',
    resultadoInspeccion: '',
    requiereSeguimiento: false
  });

  useEffect(() => {
    cargarDatos();
  }, [actaId]);

  const cargarDatos = async () => {
    try {
      // Cargar acta
      const actaResponse = await api.get(`/inspectoria/actas-oficio/${actaId}`);
      const actaData = actaResponse.data.data;
      setActa(actaData);

      // Llenar formulario con datos existentes
      setFormData({
        numeroActa: actaData.numeroActa,
        inspectorId: actaData.inspector.id.toString(),
        empresaRnc: actaData.empresa.rnc,
        empresaNombre: actaData.empresa.nombreEmpresa,
        resultadoInspeccion: actaData.resultadoInspeccion,
        requiereSeguimiento: actaData.requiereSeguimiento
      });

      // Cargar inspectores
      const inspectoresResponse = await api.get('/inspectoria/catalogos/inspectores');
      setInspectores(inspectoresResponse.data.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar datos del acta');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        alert('Solo se permiten archivos PDF');
        return;
      }
      setPdfFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.inspectorId) {
      alert('Debe seleccionar un inspector');
      return;
    }

    try {
      setLoading(true);

      const formDataToSend = new FormData();
      formDataToSend.append('numeroActa', formData.numeroActa);
      formDataToSend.append('inspectorId', formData.inspectorId);
      formDataToSend.append('empresaRnc', formData.empresaRnc);
      formDataToSend.append('empresaNombre', formData.empresaNombre);
      formDataToSend.append('resultadoInspeccion', formData.resultadoInspeccion);
      formDataToSend.append('requiereSeguimiento', formData.requiereSeguimiento.toString());

      if (pdfFile) {
        formDataToSend.append('pdfActa', pdfFile);
      }

      await api.put(`/inspectoria/actas-oficio/${actaId}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Acta actualizada exitosamente');
      navigate(`/inspectoria/viajes-oficio/${acta?.viaje.id}/actas`);
    } catch (error: any) {
      console.error('Error al actualizar acta:', error);
      alert(error.response?.data?.message || 'Error al actualizar acta');
    } finally {
      setLoading(false);
    }
  };

  const descargarPDFActual = () => {
    if (acta?.rutaPdfActa) {
      const pdfUrl = `${import.meta.env.VITE_API_URL}/${acta.rutaPdfActa}`;
      window.open(pdfUrl, '_blank');
    }
  };

  if (!acta) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Editar Acta {acta.numeroActa}</h1>
        <p className="text-gray-600 mt-2">
          Viaje: {acta.viaje.numeroViaje}
        </p>
        {acta.casoGenerado && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              ℹ️ Esta acta generó el caso: <strong>{acta.casoGenerado.codigo}</strong>
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        {/* Número de Acta */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número de Acta *
          </label>
          <input
            type="text"
            value={formData.numeroActa}
            onChange={(e) => setFormData({ ...formData, numeroActa: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Inspector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Inspector *
          </label>
          <select
            value={formData.inspectorId}
            onChange={(e) => setFormData({ ...formData, inspectorId: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Seleccione un inspector</option>
            {inspectores.map((inspector) => (
              <option key={inspector.id} value={inspector.id}>
                {inspector.nombrecompleto} ({inspector.codigo})
              </option>
            ))}
          </select>
        </div>

        {/* Información de la Empresa */}
        <div className="mb-4">
          <h3 className="text-md font-semibold text-gray-700 mb-3">Empresa Inspeccionada</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RNC
              </label>
              <input
                type="text"
                value={formData.empresaRnc}
                onChange={(e) => setFormData({ ...formData, empresaRnc: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="000-0000000-0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de Empresa
              </label>
              <input
                type="text"
                value={formData.empresaNombre}
                onChange={(e) => setFormData({ ...formData, empresaNombre: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre de la empresa"
              />
            </div>
          </div>
        </div>

        {/* Resultado de Inspección */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Resultado de Inspección
          </label>
          <textarea
            value={formData.resultadoInspeccion}
            onChange={(e) => setFormData({ ...formData, resultadoInspeccion: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Descripción del resultado de la inspección..."
          />
        </div>

        {/* PDF del Acta */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PDF del Acta Escaneada
          </label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={descargarPDFActual}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              📄 Ver PDF Actual
            </button>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="flex-1"
            />
          </div>
          {pdfFile && (
            <p className="text-sm text-green-600 mt-2">
              ✓ Nuevo PDF seleccionado: {pdfFile.name}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Solo suba un nuevo PDF si desea reemplazar el actual
          </p>
        </div>

        {/* Requiere Seguimiento */}
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.requiereSeguimiento}
              onChange={(e) => setFormData({ ...formData, requiereSeguimiento: e.target.checked })}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={!!acta.casoGenerado}
            />
            <span className="text-sm text-gray-700">
              Requiere seguimiento (generar caso de inspección)
            </span>
          </label>
          {acta.casoGenerado && (
            <p className="text-xs text-gray-500 mt-1">
              No se puede modificar porque ya se generó un caso
            </p>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate(`/inspectoria/viajes-oficio/${acta.viaje.id}/actas`)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
