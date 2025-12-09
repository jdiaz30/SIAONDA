import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearViaje } from '../../services/viajesOficioService';
import { obtenerTodosCatalogos } from '../../services/inspectoriaService';
import { api } from '../../services/api';

export default function ViajeOficioFormPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [provincias, setProvincias] = useState<any[]>([]);
  const [inspectores, setInspectores] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    provinciaId: '',
    fechaInicio: '',
    fechaFin: '',
    inspectoresIds: [] as number[],
    observaciones: ''
  });

  useEffect(() => {
    cargarCatalogos();
  }, []);

  const cargarCatalogos = async () => {
    try {
      const catalogos = await obtenerTodosCatalogos();
      setProvincias(catalogos.provincias || []);

      // Cargar inspectores
      const response = await api.get('/inspectoria/catalogos/inspectores');
      setInspectores(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar catálogos:', error);
    }
  };

  const handleInspectorChange = (inspectorId: number) => {
    setFormData(prev => ({
      ...prev,
      inspectoresIds: prev.inspectoresIds.includes(inspectorId)
        ? prev.inspectoresIds.filter(id => id !== inspectorId)
        : [...prev.inspectoresIds, inspectorId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.provinciaId || !formData.fechaInicio || formData.inspectoresIds.length === 0) {
      alert('Completa todos los campos requeridos');
      return;
    }

    try {
      setLoading(true);
      await crearViaje({
        provinciaId: Number(formData.provinciaId),
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin || undefined,
        inspectoresIds: formData.inspectoresIds,
        observaciones: formData.observaciones || undefined
      });

      alert('Viaje creado exitosamente');
      navigate('/inspectoria/viajes-oficio');
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'Error al crear viaje');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Crear Viaje de Oficio</h1>
        <p className="text-gray-600">Planificar viaje de inspección a provincia</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Provincia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provincia <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.provinciaId}
                onChange={(e) => setFormData({ ...formData, provinciaId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
                <option value="">Seleccionar provincia</option>
                {provincias.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>

            {/* Fecha Inicio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Inicio <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.fechaInicio}
                onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>

            {/* Fecha Fin (Opcional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Fin
              </label>
              <input
                type="date"
                value={formData.fechaFin}
                onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Por defecto es el mismo día. Los viajes suelen ser de un solo día.
              </p>
            </div>
          </div>

          {/* Inspectores */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inspectores Asignados <span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
              {inspectores.length === 0 ? (
                <p className="text-gray-500">No hay inspectores disponibles</p>
              ) : (
                <div className="space-y-2">
                  {inspectores.map(inspector => (
                    <label key={inspector.id} className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.inspectoresIds.includes(inspector.id)}
                        onChange={() => handleInspectorChange(inspector.id)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm">
                        {inspector.nombrecompleto} ({inspector.codigo})
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Seleccionados: {formData.inspectoresIds.length}
            </p>
          </div>

          {/* Observaciones */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Notas sobre el viaje..."
            />
          </div>

          {/* Botones */}
          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Viaje'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/inspectoria/viajes-oficio')}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
