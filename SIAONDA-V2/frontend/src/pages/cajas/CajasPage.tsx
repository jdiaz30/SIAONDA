import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import cajasService, { Caja } from '../../services/cajasService';
import ncfService, { EstadisticasNcf, SecuenciaNcfInput } from '../../services/ncfService';
import './Cajas.css';

const CajasPage = () => {
  const [cajaActiva, setCajaActiva] = useState<Caja | null>(null);
  const [mostrarFormAbrir, setMostrarFormAbrir] = useState(false);
  const [mostrarFormCerrar, setMostrarFormCerrar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [descripcion, setDescripcion] = useState('');
  const [montoFinal, setMontoFinal] = useState(0);
  const [observaciones, setObservaciones] = useState('');
  const navigate = useNavigate();

  // Estados para gestión de NCF
  const [estadisticasNcf, setEstadisticasNcf] = useState<EstadisticasNcf[]>([]);
  const [mostrarModalNcf, setMostrarModalNcf] = useState(false);
  const [formNcf, setFormNcf] = useState<SecuenciaNcfInput>({
    tipoComprobante: 'B02',
    serie: 'E',
    numeroInicial: '',
    numeroFinal: '',
    fechaVencimiento: '',
    observaciones: ''
  });

  useEffect(() => {
    cargarCajaActiva();
    cargarEstadisticasNcf();
  }, []);

  const cargarCajaActiva = async () => {
    try {
      setLoading(true);
      const caja = await cajasService.getCajaActiva();
      setCajaActiva(caja);
    } catch (error: any) {
      console.log('No hay caja activa');
      setCajaActiva(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirCaja = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!descripcion.trim()) {
      alert('La descripción es requerida');
      return;
    }

    try {
      await cajasService.abrirCaja({
        descripcion,
        observaciones: observaciones || undefined
      });

      alert('Caja abierta exitosamente');
      setMostrarFormAbrir(false);
      setDescripcion('');
      setObservaciones('');
      cargarCajaActiva();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al abrir la caja');
    }
  };

  const handleCerrarCaja = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cajaActiva) return;

    if (!confirm('¿Estás seguro de cerrar la caja? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await cajasService.cerrarCaja(cajaActiva.id, {
        montoFinal,
        observaciones: observaciones || undefined
      });

      alert('Caja cerrada exitosamente');
      setMostrarFormCerrar(false);
      setMontoFinal(0);
      setObservaciones('');
      cargarCajaActiva();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al cerrar la caja');
    }
  };

  const cargarEstadisticasNcf = async () => {
    try {
      const stats = await ncfService.getEstadisticas();
      setEstadisticasNcf(stats);
    } catch (error) {
      console.error('Error al cargar estadísticas NCF:', error);
    }
  };

  const handleCrearSecuenciaNcf = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formNcf.numeroInicial || !formNcf.numeroFinal || !formNcf.fechaVencimiento) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    const inicial = parseInt(formNcf.numeroInicial);
    const final = parseInt(formNcf.numeroFinal);

    if (inicial >= final) {
      alert('El número inicial debe ser menor que el número final');
      return;
    }

    const cantidad = final - inicial + 1;
    if (!confirm(`¿Confirma crear secuencia NCF con ${cantidad.toLocaleString()} comprobantes?`)) {
      return;
    }

    try {
      await ncfService.crearSecuencia(formNcf);
      alert('Secuencia NCF creada exitosamente');
      setMostrarModalNcf(false);
      setFormNcf({
        tipoComprobante: 'B02',
        serie: 'E',
        numeroInicial: '',
        numeroFinal: '',
        fechaVencimiento: '',
        observaciones: ''
      });
      await cargarEstadisticasNcf();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al crear secuencia NCF');
    }
  };

  const calcularDiasRestantes = (fechaVencimiento: string): number => {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diff = vencimiento.getTime() - hoy.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="cajas-container">
        <div className="loading">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="cajas-container">
      <div className="cajas-header">
        <h1>Gestión de Caja</h1>
      </div>

      {!cajaActiva ? (
        // No hay caja abierta
        <div className="no-caja">
          <div className="no-caja-mensaje">
            <h2>No tienes una caja abierta</h2>
            <p>Debes abrir una caja para procesar pagos y generar facturas</p>

            {!mostrarFormAbrir ? (
              <button
                className="btn btn-primary btn-lg"
                onClick={() => setMostrarFormAbrir(true)}
              >
                Abrir Caja
              </button>
            ) : (
              <div className="form-abrir-caja">
                <h3>Abrir Nueva Caja</h3>
                <form onSubmit={handleAbrirCaja}>
                  <div className="form-group">
                    <label>Descripción *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder="Ej: Caja del turno de mañana"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Observaciones</label>
                    <textarea
                      className="form-control"
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      Confirmar Apertura
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setMostrarFormAbrir(false);
                        setDescripcion('');
                        setObservaciones('');
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Caja abierta
        <div className="caja-activa">
          <div className="caja-info-card">
            <h2>Caja Activa</h2>
            <div className="caja-detalles">
              <div className="detalle-item">
                <label>Código:</label>
                <span>{cajaActiva.codigo}</span>
              </div>
              <div className="detalle-item">
                <label>Descripción:</label>
                <span>{cajaActiva.descripcion}</span>
              </div>
              <div className="detalle-item">
                <label>Fecha Apertura:</label>
                <span>{new Date(cajaActiva.horaApertura).toLocaleString()}</span>
              </div>
              <div className="detalle-item">
                <label>Total Facturas:</label>
                <span className="monto">
                  RD$ {Number(cajaActiva.totalFacturas || 0).toFixed(2)}
                </span>
              </div>
              <div className="detalle-item">
                <label>Facturas Procesadas:</label>
                <span>{cajaActiva._count?.facturas || 0}</span>
              </div>
            </div>
          </div>

          <div className="caja-acciones">
            <button
              className="btn btn-success btn-lg"
              onClick={() => navigate('/cajas/operaciones')}
            >
              Ir a Operaciones de Caja
            </button>

            <button
              className="btn btn-info btn-lg"
              onClick={() => navigate('/cajas/solicitudes-irc')}
            >
              💰 Cobrar Solicitudes IRC
            </button>

            {!mostrarFormCerrar ? (
              <button
                className="btn btn-danger btn-lg"
                onClick={() => setMostrarFormCerrar(true)}
              >
                Cerrar Caja
              </button>
            ) : (
              <div className="form-cerrar-caja">
                <h3>Cerrar Caja</h3>
                <form onSubmit={handleCerrarCaja}>
                  <div className="cierre-info">
                    <p>Monto esperado: <strong>RD$ {Number(cajaActiva.totalFacturas || 0).toFixed(2)}</strong></p>
                  </div>

                  <div className="form-group">
                    <label>Monto Final (Contado en caja) *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={montoFinal}
                      onChange={(e) => setMontoFinal(parseFloat(e.target.value))}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  {montoFinal > 0 && (
                    <div className="diferencia-info">
                      <p>
                        Diferencia:{' '}
                        <strong className={
                          montoFinal - Number(cajaActiva.totalFacturas || 0) === 0
                            ? 'text-success'
                            : 'text-danger'
                        }>
                          RD$ {(montoFinal - Number(cajaActiva.totalFacturas || 0)).toFixed(2)}
                        </strong>
                      </p>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Observaciones de Cierre</label>
                    <textarea
                      className="form-control"
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      rows={3}
                      placeholder="Detalles del cierre, incidencias, etc."
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-danger">
                      Confirmar Cierre
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setMostrarFormCerrar(false);
                        setMontoFinal(0);
                        setObservaciones('');
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Widget de Estado de NCF */}
      <div className="ncf-widget">
        <div className="ncf-header">
          <h2>Comprobantes Fiscales (NCF)</h2>
          <button className="btn btn-primary btn-sm" onClick={() => setMostrarModalNcf(true)}>
            + Nueva Secuencia
          </button>
        </div>

        {estadisticasNcf.length === 0 ? (
          <div className="ncf-alerta">
            <p>⚠️ No hay secuencias NCF configuradas. Configure al menos una secuencia B01 para poder emitir facturas.</p>
          </div>
        ) : (
          <div className="ncf-lista">
            {estadisticasNcf.map((est, index) => {
              const diasRestantes = calcularDiasRestantes(est.fechaVencimiento);
              const alerta = est.disponibles < 50 || diasRestantes < 30;

              return (
                <div key={index} className={`ncf-card ${alerta ? 'ncf-alerta-card' : ''}`}>
                  <div className="ncf-card-header">
                    <h3>{est.tipoComprobante}</h3>
                    <span className={`badge ${est.activo ? 'badge-success' : 'badge-danger'}`}>
                      {est.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <div className="ncf-card-body">
                    <p><strong>Disponibles:</strong> {est.disponibles?.toLocaleString() || 0} ({(est.porcentajeUtilizado || 0).toFixed(1)}% usado)</p>
                    <p><strong>Vencimiento:</strong> {new Date(est.fechaVencimiento).toLocaleDateString('es-DO')} ({diasRestantes} días)</p>
                    {alerta && (
                      <div className="ncf-warning">
                        {est.disponibles < 50 && '⚠️ Quedan menos de 50 comprobantes. '}
                        {diasRestantes < 30 && '⚠️ Vence pronto.'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal para crear secuencia NCF */}
      {mostrarModalNcf && (
        <div className="modal-overlay" onClick={() => setMostrarModalNcf(false)}>
          <div className="modal-content-ncf" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-ncf">
              <h2>Nueva Secuencia NCF</h2>
              <button className="btn-close" onClick={() => setMostrarModalNcf(false)}>×</button>
            </div>

            <form onSubmit={handleCrearSecuenciaNcf}>
              <div className="form-grid-ncf">
                <div className="form-group">
                  <label>Tipo de Comprobante *</label>
                  <select
                    value={formNcf.tipoComprobante}
                    onChange={(e) => setFormNcf({ ...formNcf, tipoComprobante: e.target.value })}
                    required
                  >
                    <option value="B01">B01 - Crédito Fiscal</option>
                    <option value="B02">B02 - Consumo</option>
                    <option value="B14">B14 - Regímenes Especiales</option>
                    <option value="B15">B15 - Gubernamental</option>
                  </select>
                  <small>B01 es el más común para facturas a consumidor final</small>
                </div>

                <div className="form-group">
                  <label>Serie *</label>
                  <select
                    value={formNcf.serie}
                    onChange={(e) => setFormNcf({ ...formNcf, serie: e.target.value })}
                    required
                  >
                    <option value="E">E - Electrónico</option>
                    <option value="P">P - Físico</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Número Inicial *</label>
                  <input
                    type="number"
                    value={formNcf.numeroInicial}
                    onChange={(e) => setFormNcf({ ...formNcf, numeroInicial: e.target.value })}
                    min="1"
                    placeholder="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Número Final *</label>
                  <input
                    type="number"
                    value={formNcf.numeroFinal}
                    onChange={(e) => setFormNcf({ ...formNcf, numeroFinal: e.target.value })}
                    min="1"
                    placeholder="1000"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Fecha de Vencimiento *</label>
                  <input
                    type="date"
                    value={formNcf.fechaVencimiento}
                    onChange={(e) => setFormNcf({ ...formNcf, fechaVencimiento: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                  <small>Fecha límite autorizada por la DGII</small>
                </div>

                <div className="form-group full-width">
                  <label>Observaciones</label>
                  <textarea
                    value={formNcf.observaciones}
                    onChange={(e) => setFormNcf({ ...formNcf, observaciones: e.target.value })}
                    rows={3}
                    placeholder="Información adicional sobre esta secuencia..."
                  />
                </div>
              </div>

              {formNcf.numeroInicial && formNcf.numeroFinal && (
                <div className="alert-info-ncf">
                  📊 Se crearán {(parseInt(formNcf.numeroFinal) - parseInt(formNcf.numeroInicial) + 1).toLocaleString()} comprobantes disponibles
                </div>
              )}

              <div className="modal-footer-ncf">
                <button type="button" className="btn btn-secondary" onClick={() => setMostrarModalNcf(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Crear Secuencia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CajasPage;
