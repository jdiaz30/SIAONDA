import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';

interface DashboardStats {
  formulariosHoy: number;
  formulariosPendientes: number;
  certificadosHoy: number;
  facturasHoy: number;
  montoHoy: string;
  cajaAbierta: boolean;
}

const DashboardPage = () => {
  const { usuario } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    formulariosHoy: 0,
    formulariosPendientes: 0,
    certificadosHoy: 0,
    facturasHoy: 0,
    montoHoy: 'RD$ 0.00',
    cajaAbierta: false,
  });

  // Permisos basados en tipo de usuario (Réplica de SIAONDA V1)
  const permisos = {
    puedeVerFormularios: ['SUPERUSUARIO', 'ADMINISTRADOR', 'SUPERVISOR', 'COORDINADOR', 'REGISTRADOR', 'DIGITADOR', 'ATENCION_USUARIO'].includes(usuario?.tipo || ''),
    puedeVerCertificados: ['SUPERUSUARIO', 'ADMINISTRADOR', 'SUPERVISOR', 'COORDINADOR', 'CERTIFICADOR', 'ATENCION_USUARIO'].includes(usuario?.tipo || ''),
    puedeVerFacturas: ['SUPERUSUARIO', 'ADMINISTRADOR', 'SUPERVISOR', 'COORDINADOR', 'FACTURADOR'].includes(usuario?.tipo || ''),
    puedeVerCajas: ['SUPERUSUARIO', 'ADMINISTRADOR', 'COORDINADOR', 'CAJERO'].includes(usuario?.tipo || ''),
    puedeVerClientes: ['SUPERUSUARIO', 'ADMINISTRADOR', 'SUPERVISOR', 'COORDINADOR', 'REGISTRADOR', 'ATENCION_USUARIO', 'RECEPCION'].includes(usuario?.tipo || ''),
    puedeVerReportes: ['SUPERUSUARIO', 'ADMINISTRADOR', 'SUPERVISOR', 'COORDINADOR'].includes(usuario?.tipo || ''),
    puedeVerProductos: ['SUPERUSUARIO', 'ADMINISTRADOR'].includes(usuario?.tipo || ''),
    puedeVerUsuarios: ['SUPERUSUARIO', 'ADMINISTRADOR'].includes(usuario?.tipo || ''),
  };

  // TODO: Cargar estadísticas desde el backend
  useEffect(() => {
    // fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Bienvenido, {usuario?.nombrecompleto}
        </h1>
        <p className="text-blue-100">
          {usuario?.tipo} • Código: {usuario?.codigo}
        </p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {permisos.puedeVerFormularios && (
          <>
            <DashboardCard
              title="Formularios Hoy"
              value={stats.formulariosHoy.toString()}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              color="blue"
              link="/formularios"
            />
            <DashboardCard
              title="Pendientes"
              value={stats.formulariosPendientes.toString()}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="yellow"
              link="/formularios?estado=pendiente"
            />
          </>
        )}

        {permisos.puedeVerCertificados && (
          <DashboardCard
            title="Certificados Hoy"
            value={stats.certificadosHoy.toString()}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            }
            color="green"
            link="/certificados"
          />
        )}

        {permisos.puedeVerFacturas && (
          <DashboardCard
            title="Monto Facturado Hoy"
            value={stats.montoHoy}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="purple"
            link="/facturas"
          />
        )}
      </div>

      {/* Alerta de caja */}
      {permisos.puedeVerCajas && !stats.cajaAbierta && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-yellow-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-yellow-700 font-medium">
                No tienes una caja abierta
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Necesitas abrir una caja para procesar transacciones
              </p>
            </div>
            <Link
              to="/cajas"
              className="ml-4 px-4 py-2 bg-yellow-400 text-yellow-900 rounded-lg hover:bg-yellow-500 transition-colors text-sm font-medium"
            >
              Abrir Caja
            </Link>
          </div>
        </div>
      )}

      {/* Accesos rápidos */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Accesos Rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {permisos.puedeVerClientes && (
            <QuickAccessCard
              title="Clientes"
              description="Gestionar clientes"
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
              link="/clientes"
              color="blue"
            />
          )}

          {permisos.puedeVerFormularios && (
            <QuickAccessCard
              title="Formularios"
              description="Gestionar formularios"
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              link="/formularios"
              color="indigo"
            />
          )}

          {permisos.puedeVerCertificados && (
            <QuickAccessCard
              title="Certificados"
              description="Gestionar certificados"
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              }
              link="/certificados"
              color="green"
            />
          )}

          {permisos.puedeVerFacturas && (
            <QuickAccessCard
              title="Facturas"
              description="Gestionar facturas"
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
              }
              link="/facturas"
              color="purple"
            />
          )}

          {permisos.puedeVerCajas && (
            <QuickAccessCard
              title="Cajas"
              description="Gestionar cajas"
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              }
              link="/cajas"
              color="yellow"
            />
          )}

          {permisos.puedeVerReportes && (
            <QuickAccessCard
              title="Reportes"
              description="Ver reportes"
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              link="/reportes"
              color="red"
            />
          )}

          {permisos.puedeVerProductos && (
            <QuickAccessCard
              title="Productos"
              description="Gestionar productos"
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              }
              link="/productos"
              color="orange"
            />
          )}

          {permisos.puedeVerUsuarios && (
            <QuickAccessCard
              title="Usuarios"
              description="Gestionar usuarios"
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
              link="/usuarios"
              color="gray"
            />
          )}
        </div>
      </div>

      {/* Información del usuario */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Información del Usuario
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow label="Nombre Completo" value={usuario?.nombrecompleto || ''} />
          <InfoRow label="Usuario" value={usuario?.nombre || ''} />
          <InfoRow label="Código" value={usuario?.codigo || ''} />
          <InfoRow label="Tipo" value={usuario?.tipo || ''} />
          <InfoRow label="Correo" value={usuario?.correo || 'No registrado'} />
          <InfoRow label="Teléfono" value={usuario?.telefono || 'No registrado'} />
        </div>
      </div>
    </div>
  );
};

const DashboardCard = ({
  title,
  value,
  icon,
  color,
  link,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  link?: string;
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    yellow: 'from-yellow-500 to-yellow-600',
  }[color] || 'from-gray-500 to-gray-600';

  const content = (
    <div className={`bg-gradient-to-br ${colorClasses} rounded-xl shadow-lg p-6 text-white transform transition-transform hover:scale-105 cursor-pointer`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-sm text-white/80">{title}</p>
    </div>
  );

  return link ? <Link to={link}>{content}</Link> : content;
};

const QuickAccessCard = ({
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
    blue: 'text-blue-600 bg-blue-50 hover:bg-blue-100',
    indigo: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100',
    green: 'text-green-600 bg-green-50 hover:bg-green-100',
    purple: 'text-purple-600 bg-purple-50 hover:bg-purple-100',
    yellow: 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100',
    red: 'text-red-600 bg-red-50 hover:bg-red-100',
    orange: 'text-orange-600 bg-orange-50 hover:bg-orange-100',
    gray: 'text-gray-600 bg-gray-50 hover:bg-gray-100',
  }[color] || 'text-gray-600 bg-gray-50 hover:bg-gray-100';

  return (
    <Link
      to={link}
      className={`${colorClasses} rounded-xl p-6 transition-all hover:shadow-md border border-gray-200`}
    >
      <div className="mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-gray-600 font-medium mb-1">{label}</span>
      <span className="text-gray-900 font-semibold">{value}</span>
    </div>
  );
};

export default DashboardPage;
