import { Link } from 'react-router-dom';

export default function DashboardRegistroPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Módulo de Registro</h1>
        <p className="text-green-100">
          Gestión de certificados y emisión de documentos oficiales
        </p>
      </div>

      {/* Menú de opciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ModuleCard
          title="Certificados"
          description="Ver, generar y gestionar certificados"
          icon={
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          }
          link="/certificados"
          color="green"
        />

        <ModuleCard
          title="Certificados Pendientes"
          description="Certificados que requieren emisión"
          icon={
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          link="/certificados-pendientes"
          color="yellow"
        />

        <ModuleCard
          title="Formularios"
          description="Ver formularios asociados a certificados"
          icon={
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          link="/formularios"
          color="blue"
        />
      </div>

      {/* Información del módulo */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Acerca del Módulo de Registro
        </h2>
        <div className="space-y-3 text-gray-600">
          <p>
            El módulo de <strong>Registro</strong> es responsable de la emisión y gestión de
            certificados de derecho de autor.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <InfoBox
              title="Funciones Principales"
              items={[
                'Emisión de certificados',
                'Generación de documentos PDF',
                'Control de libros de registro',
                'Trazabilidad de certificados'
              ]}
            />
            <InfoBox
              title="Procesos"
              items={[
                'Validación de formularios completos',
                'Asignación de números de libro',
                'Generación automática de certificados',
                'Registro de fechas de emisión'
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const ModuleCard = ({
  title,
  description,
  icon,
  link,
  color,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  color: string;
}) => {
  const colorClasses = {
    green: 'text-green-600 bg-green-50 hover:bg-green-100 border-green-200',
    yellow: 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100 border-yellow-200',
    blue: 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200',
  }[color] || 'text-gray-600 bg-gray-50 hover:bg-gray-100 border-gray-200';

  return (
    <Link
      to={link}
      className={`${colorClasses} rounded-xl p-6 transition-all hover:shadow-lg border-2`}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="font-bold text-xl text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  );
};

const InfoBox = ({ title, items }: { title: string; items: string[] }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start">
            <svg
              className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
