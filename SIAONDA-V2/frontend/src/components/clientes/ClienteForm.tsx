import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { clientesService, Cliente, CreateClienteDto } from '../../services/clientesService';

interface Props {
  cliente: Cliente | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const ClienteForm = ({ cliente, onSuccess, onCancel }: Props) => {
  const [formData, setFormData] = useState<CreateClienteDto>({
    identificacion: '',
    nombre: '',
    apellido: '',
    direccion: '',
    telefono: '',
    correo: '',
    tipoId: 0,
    nacionalidadId: 0
  });

  const [error, setError] = useState('');

  // Cargar catálogos
  const { data: tipos } = useQuery({
    queryKey: ['clientes-tipos'],
    queryFn: clientesService.getTipos
  });

  const { data: nacionalidades } = useQuery({
    queryKey: ['clientes-nacionalidades'],
    queryFn: clientesService.getNacionalidades
  });

  // Mutation para crear/actualizar
  const mutation = useMutation({
    mutationFn: cliente
      ? (data: CreateClienteDto) => clientesService.updateCliente(cliente.id, data)
      : clientesService.createCliente,
    onSuccess: () => {
      onSuccess();
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Error al guardar cliente');
    }
  });

  // Cargar datos si es edición
  useEffect(() => {
    if (cliente) {
      setFormData({
        identificacion: cliente.identificacion,
        nombre: cliente.nombre,
        apellido: cliente.apellido || '',
        direccion: cliente.direccion || '',
        telefono: cliente.telefono || '',
        correo: cliente.correo || '',
        tipoId: cliente.tipoId,
        nacionalidadId: cliente.nacionalidadId
      });
    }
  }, [cliente]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.tipoId || !formData.nacionalidadId) {
      setError('Debe seleccionar tipo y nacionalidad');
      return;
    }

    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'tipoId' || name === 'nacionalidadId' ? parseInt(value) : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Identificación */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Identificación (Cédula/Pasaporte/RNC) *
          </label>
          <input
            type="text"
            name="identificacion"
            value={formData.identificacion}
            onChange={handleChange}
            required
            maxLength={50}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre *
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            maxLength={200}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Apellido */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Apellido
          </label>
          <input
            type="text"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            maxLength={200}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Cliente *
          </label>
          <select
            name="tipoId"
            value={formData.tipoId}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value={0}>Seleccione...</option>
            {tipos?.map(tipo => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Nacionalidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nacionalidad *
          </label>
          <select
            name="nacionalidadId"
            value={formData.nacionalidadId}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value={0}>Seleccione...</option>
            {nacionalidades?.map(nac => (
              <option key={nac.id} value={nac.id}>
                {nac.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono
          </label>
          <input
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            maxLength={50}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Correo Electrónico
          </label>
          <input
            type="email"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Dirección */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dirección
          </label>
          <textarea
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
};

export default ClienteForm;
