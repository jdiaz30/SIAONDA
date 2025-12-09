import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import cajasService, { Caja } from '../../services/cajasService';
import { formulariosService } from '../../services/formulariosService';
import facturasService from '../../services/facturasService';
import { useAuthStore } from '../../store/authStore';
import './CajaOperacion.css';

interface Formulario {
  id: number;
  codigo: string;
  fecha: string;
  estado: {
    id: number;
    nombre: string;
  };
  clientes: Array<{
    cliente: {
      id: number;
      nombrecompleto: string;
      identificacion: string;
    };
  }>;
  productos: Array<{
    producto: {
      id: number;
      nombre: string;
      codigo: string;
    };
    cantidad: number;
    campos?: Array<{
      campo: {
        campo: string;
        titulo: string;
      };
      valor: string;
    }>;
  }>;
  factura?: {
    id: number;
    codigo: string;
    total: number;
    ncf?: string;
    estado?: {
      id: number;
      nombre: string;
    };
  };
}

interface MetodoPago {
  id: number;
  nombre: string;
  descripcion: string;
  requiereReferencia: boolean;
}

const CajaOperacionPage = () => {
  const [cajaActiva, setCajaActiva] = useState<Caja | null>(null);
  const [formulariosPendientes, setFormulariosPendientes] = useState<Formulario[]>([]);
  const [facturasAbiertas, setFacturasAbiertas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);

  const { accessToken } = useAuthStore();

  // Modal de GENERAR factura (sin pagar)
  const [mostrarModalFactura, setMostrarModalFactura] = useState(false);
  const [formularioSeleccionado, setFormularioSeleccionado] = useState<Formulario | null>(null);
  const [solicitarNCF, setSolicitarNCF] = useState(false);
  const [rnc, setRnc] = useState<string>('');
  const [descuentoEstudiante, setDescuentoEstudiante] = useState(false);
  const [descuento100, setDescuento100] = useState(false);
  const [observaciones, setObservaciones] = useState<string>('');

  // Modal de PAGAR factura (facturas abiertas)
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<any>(null);
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState<string>('Efectivo');
  const [referenciaPago, setReferenciaPago] = useState<string>('');

  // Modal de ANULAR factura
  const [mostrarModalAnular, setMostrarModalAnular] = useState(false);
  const [facturaParaAnular, setFacturaParaAnular] = useState<any>(null);
  const [motivoAnulacion, setMotivoAnulacion] = useState<string>('');

  const navigate = useNavigate();

  useEffect(() => {
    cargarDatos();
    cargarMetodosPago();
  }, []);

  const cargarMetodosPago = async () => {
    try {
      const metodos = await facturasService.getMetodosPago();
      setMetodosPago(metodos);
    } catch (error) {
      console.error('Error cargando métodos de pago:', error);
    }
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar caja activa
      const caja = await cajasService.getCajaActiva();
      if (!caja) {
        alert('Debes tener una caja abierta para operar');
        navigate('/cajas');
        return;
      }
      setCajaActiva(caja);

      // Cargar formularios pendientes y facturas abiertas
      await cargarFormulariosPendientes();
      await cargarFacturasAbiertas();
    } catch (error: any) {
      console.error('Error cargando datos:', error);
      if (error.response?.status === 404) {
        alert('No tienes una caja abierta. Redirigiendo...');
        navigate('/cajas');
      }
    } finally {
      setLoading(false);
    }
  };

  const cargarFormulariosPendientes = async () => {
    try {
      const formularios = await formulariosService.getFormularios({
        estado: 'Pendiente',
        limit: 100
      });

      // Excluir TODOS los formularios IRC (Inspectoría)
      // Los formularios IRC tienen su propio flujo completo en "Cobrar Solicitudes IRC"
      // Este espacio es solo para registros de obras (musicales, literarias, audiovisuales, etc.)
      const formulariosPendientesReales = (formularios || []).filter(f => {
        const esFormularioIRC = f.productos?.some(p =>
          p.producto.codigo === 'IRC-01' || p.producto.categoria === 'Inspectoría'
        );

        // Excluir todos los formularios IRC
        return !esFormularioIRC;
      });

      setFormulariosPendientes(formulariosPendientesReales);
    } catch (error) {
      console.error('Error cargando formularios:', error);
    }
  };

  const cargarFacturasAbiertas = async () => {
    try {
      if (!cajaActiva) return;

      // Obtener todas las facturas de la caja activa
      const response = await facturasService.getFacturas({
        limit: 100
      });

      // Filtrar las facturas por estado "Abierta" y que pertenezcan a esta caja
      const abiertas = (response.facturas || []).filter(
        (f: any) => f.estado.nombre === 'Abierta' && f.cajaId === cajaActiva.id
      );

      setFacturasAbiertas(abiertas);
    } catch (error) {
      console.error('Error cargando facturas abiertas:', error);
    }
  };

  const abrirModalFactura = (formulario: Formulario) => {
    setFormularioSeleccionado(formulario);
    setMostrarModalFactura(true);
    // Reset form
    setSolicitarNCF(false);
    setRnc('');
    setDescuentoEstudiante(false);
    setDescuento100(false);
    setObservaciones('');
  };

  const cerrarModalFactura = () => {
    setMostrarModalFactura(false);
    setFormularioSeleccionado(null);
  };

  const abrirModalPago = (factura: any) => {
    setFacturaSeleccionada(factura);
    setMostrarModalPago(true);
    // Reset form
    setMetodoPagoSeleccionado('Efectivo');
    setReferenciaPago('');
  };

  const cerrarModalPago = () => {
    setMostrarModalPago(false);
    setFacturaSeleccionada(null);
  };

  const abrirModalAnular = (factura: any) => {
    setFacturaParaAnular(factura);
    setMostrarModalAnular(true);
    setMotivoAnulacion('');
  };

  const cerrarModalAnular = () => {
    setMostrarModalAnular(false);
    setFacturaParaAnular(null);
    setMotivoAnulacion('');
  };

  const handleGenerarFactura = async () => {
    if (!formularioSeleccionado) return;

    // Validar NCF
    if (solicitarNCF && (!rnc || rnc.trim().length === 0)) {
      alert('Debe proporcionar el RNC del cliente para generar comprobante fiscal');
      return;
    }

    // Calcular descuento según SIAONDA V1
    let descuentoPorcentaje = 0;
    if (descuento100) {
      descuentoPorcentaje = 100;
    } else if (descuentoEstudiante) {
      descuentoPorcentaje = 80;
    }

    try {
      setProcesando(true);
      const response = await facturasService.createFacturaDesdeFormulario({
        formularioId: formularioSeleccionado.id,
        solicitarNCF,
        rnc: solicitarNCF ? rnc : undefined,
        descuentoPorcentaje,
        observaciones: observaciones || undefined
      });

      alert('Factura generada exitosamente: ' + response.factura.codigo + '. Estado: ABIERTA (pendiente de pago)');
      cerrarModalFactura();

      // Recargar datos
      await cargarFormulariosPendientes();
      await cargarFacturasAbiertas();
    } catch (error: any) {
      console.error('Error completo:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.message || 'Error al generar factura');
    } finally {
      setProcesando(false);
    }
  };

  const handlePagarFactura = async () => {
    if (!facturaSeleccionada) return;

    // Validar referencia si el método de pago lo requiere
    const metodo = metodosPago.find(m => m.nombre === metodoPagoSeleccionado);
    if (metodo?.requiereReferencia && (!referenciaPago || referenciaPago.trim().length === 0)) {
      alert(`El método de pago ${metodoPagoSeleccionado} requiere un código de referencia`);
      return;
    }

    try {
      setProcesando(true);
      await facturasService.pagarFactura(facturaSeleccionada.id, {
        metodoPago: metodoPagoSeleccionado,
        referenciaPago: referenciaPago || undefined
      });

      alert('Pago procesado exitosamente. Factura: ' + facturaSeleccionada.codigo);

      const facturaId = facturaSeleccionada.id;

      // 🔗 WEBHOOKS DE INSPECTORÍA
      try {
        // Webhook 1: Si es factura de Inspectoría (IRC), actualizar solicitud
        if (facturaSeleccionada.codigo?.startsWith('FACT-INSP-')) {
          await axios.post('http://localhost:3000/api/inspectoria/solicitudes/webhook/pago', {
            facturaId: facturaSeleccionada.id
          });
          console.log('✅ Webhook: Solicitud IRC actualizada a PAGADA');
        }

        // Webhook 2: Cerrar casos de inspección si empresa paga renovación
        // (Se ejecuta automáticamente en el backend cuando se paga una factura IRC)
      } catch (webhookError) {
        console.error('⚠️ Error en webhook de Inspectoría (no crítico):', webhookError);
        // No detenemos el flujo si falla el webhook
      }

      cerrarModalPago();

      // Recargar datos
      await cargarFormulariosPendientes();
      await cargarFacturasAbiertas();

      // Abrir ventana de impresión con token en query
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      window.open(`${API_URL}/facturas/${facturaId}/imprimir?token=${accessToken}`, '_blank');
    } catch (error: any) {
      console.error('Error al pagar factura:', error);
      alert(error.response?.data?.message || 'Error al procesar el pago');
    } finally {
      setProcesando(false);
    }
  };

  const handleAnularFactura = async () => {
    if (!facturaParaAnular) return;

    if (!motivoAnulacion || motivoAnulacion.trim().length === 0) {
      alert('El motivo de anulación es requerido');
      return;
    }

    if (!confirm(`¿Estás seguro de anular la factura ${facturaParaAnular.codigo}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      setProcesando(true);
      await facturasService.anularFactura(facturaParaAnular.id, motivoAnulacion);

      alert('Factura anulada exitosamente');
      cerrarModalAnular();

      // Recargar datos
      await cargarFormulariosPendientes();
      await cargarFacturasAbiertas();
    } catch (error: any) {
      console.error('Error al anular factura:', error);
      alert(error.response?.data?.message || 'Error al anular la factura');
    } finally {
      setProcesando(false);
    }
  };

  if (loading) {
    return (
      <div className="caja-operacion-container">
        <div className="loading">Cargando operaciones de caja...</div>
      </div>
    );
  }

  if (!cajaActiva) {
    return null;
  }

  return (
    <div className="caja-operacion-container">
      {/* Header con información de caja */}
      <div className="caja-header">
        <div className="caja-info">
          <h1>Operaciones de Caja</h1>
          <div className="caja-datos">
            <span><strong>Caja:</strong> {cajaActiva.codigo}</span>
            <span><strong>Estado:</strong> {cajaActiva.estado.nombre}</span>
            <span><strong>Monto Inicial:</strong> RD$ {Number(cajaActiva.montoInicial).toFixed(2)}</span>
            <span><strong>Total Facturas:</strong> RD$ {Number(cajaActiva.totalFacturas || 0).toFixed(2)}</span>
          </div>
        </div>
        <div className="caja-acciones-rapidas">
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/cajas')}
          >
            Gestionar Caja
          </button>
        </div>
      </div>

      {/* Tabla unificada de formularios y facturas */}
      <div className="operacion-contenido">
        <div className="formularios-lista">
          <h2>Formularios y Facturas</h2>
            {formulariosPendientes.length === 0 ? (
              <div className="empty-state">
                <p>No hay formularios para procesar</p>
              </div>
            ) : (
              <div className="tabla-container">
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>Código Formulario</th>
                      <th>Fecha</th>
                      <th>Cliente</th>
                      <th>Productos</th>
                      <th>Factura</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formulariosPendientes.map(formulario => {
                      // Extraer nombre del cliente desde los campos del formulario IRC si no hay cliente directo
                      let nombreCliente = formulario.clientes[0]?.cliente.nombrecompleto || 'N/A';
                      let identificacionCliente = formulario.clientes[0]?.cliente.identificacion || '';

                      if (nombreCliente === 'N/A' && formulario.productos?.[0]?.campos) {
                        const campos = formulario.productos[0].campos;
                        const nombreCampo = campos.find((c: any) =>
                          c.campo.campo === 'razonSocial' ||
                          c.campo.campo === 'nombreComercial' ||
                          c.campo.campo === 'nombreEmpresa' ||
                          c.campo.campo === 'nombreRepresentante' ||
                          c.campo.campo === 'nombreCompleto' ||
                          c.campo.campo === 'nombre'
                        );
                        const identificacionCampo = campos.find((c: any) =>
                          c.campo.campo === 'rnc' || c.campo.campo === 'cedula' || c.campo.campo === 'identificacion'
                        );

                        if (nombreCampo) nombreCliente = nombreCampo.valor;
                        if (identificacionCampo) identificacionCliente = identificacionCampo.valor;
                      }

                      return (
                      <tr key={formulario.id}>
                        <td>{formulario.codigo}</td>
                        <td>{new Date(formulario.fecha).toLocaleDateString()}</td>
                        <td>
                          {nombreCliente}
                          <br />
                          <small>{identificacionCliente}</small>
                        </td>
                        <td>
                          {formulario.productos.map(p => (
                            <div key={p.producto.id}>
                              {p.producto.nombre} ({p.cantidad})
                            </div>
                          ))}
                        </td>
                        <td>
                          {formulario.factura ? (
                            <div>
                              <strong>{formulario.factura.codigo}</strong>
                              {formulario.factura.ncf && (
                                <div><small>NCF: {formulario.factura.ncf}</small></div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted">Sin generar</span>
                          )}
                        </td>
                        <td>
                          {formulario.factura ? (
                            <strong>RD$ {Number(formulario.factura.total).toFixed(2)}</strong>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge badge-${formulario.estado.nombre.toLowerCase()}`}>
                            {formulario.estado.nombre}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                            {formulario.estado.nombre === 'Pendiente' ? (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => abrirModalFactura(formulario)}
                                disabled={procesando}
                              >
                                Generar Factura
                              </button>
                            ) : formulario.factura?.estado?.nombre === 'Abierta' ? (
                              <>
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => {
                                    // Buscar la factura completa para pagarla
                                    const facturaParaPagar = facturasAbiertas.find(f => f.id === formulario.factura!.id);
                                    if (facturaParaPagar) {
                                      abrirModalPago(facturaParaPagar);
                                    }
                                  }}
                                  disabled={procesando}
                                >
                                  Pagar Factura
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => {
                                    const facturaParaAnularLocal = facturasAbiertas.find(f => f.id === formulario.factura!.id);
                                    if (facturaParaAnularLocal) {
                                      abrirModalAnular(facturaParaAnularLocal);
                                    }
                                  }}
                                  disabled={procesando}
                                >
                                  Anular
                                </button>
                                <button
                                  className="btn btn-info btn-sm"
                                  onClick={() => {
                                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                                    window.open(`${API_URL}/facturas/${formulario.factura!.id}/imprimir?token=${accessToken}`, '_blank');
                                  }}
                                >
                                  Ver
                                </button>
                              </>
                            ) : formulario.factura ? (
                              <button
                                className="btn btn-info btn-sm"
                                onClick={() => {
                                  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                                  window.open(`${API_URL}/facturas/${formulario.factura!.id}/imprimir?token=${accessToken}`, '_blank');
                                }}
                              >
                                Imprimir
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      </div>

      {/* Modal para Generar Factura */}
      {mostrarModalFactura && formularioSeleccionado && (
        <div className="modal-overlay" onClick={cerrarModalFactura}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Generar Factura (Estado: Abierta)</h2>
              <button className="modal-close" onClick={cerrarModalFactura}>&times;</button>
            </div>

            <div className="modal-body">
              {/* Información del Formulario */}
              <div className="factura-info-section">
                <h3>Información del Formulario</h3>
                <p><strong>Código:</strong> {formularioSeleccionado.codigo}</p>
                <p><strong>Cliente:</strong> {formularioSeleccionado.clientes[0]?.cliente.nombrecompleto}</p>
                <p><strong>Identificación:</strong> {formularioSeleccionado.clientes[0]?.cliente.identificacion}</p>
              </div>

              {/* Productos del Formulario */}
              <div className="factura-productos-section">
                <h3>Productos a Facturar</h3>
                <table className="tabla-productos-modal">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio Unit.</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formularioSeleccionado.productos.map((prod) => (
                      <tr key={prod.producto.id}>
                        <td>{prod.producto.nombre}</td>
                        <td>{prod.cantidad}</td>
                        <td>RD$ {(500).toFixed(2)}</td>
                        <td>RD$ {(500 * prod.cantidad).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Descuentos (según SIAONDA V1) */}
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={descuentoEstudiante}
                    onChange={(e) => {
                      setDescuentoEstudiante(e.target.checked);
                      if (e.target.checked) setDescuento100(false); // Solo uno a la vez
                    }}
                  />
                  Descuento Estudiante (80%)
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={descuento100}
                    onChange={(e) => {
                      setDescuento100(e.target.checked);
                      if (e.target.checked) setDescuentoEstudiante(false); // Solo uno a la vez
                    }}
                  />
                  Descuento 100% (Gratis)
                </label>
              </div>

              {/* Solicitar NCF */}
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={solicitarNCF}
                    onChange={(e) => setSolicitarNCF(e.target.checked)}
                  />
                  Solicitar Comprobante Fiscal (NCF)
                </label>
              </div>

              {/* RNC del Cliente (solo si solicita NCF) */}
              {solicitarNCF && (
                <div className="form-group">
                  <label>RNC del Cliente *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="000-0000000-0"
                    value={rnc}
                    onChange={(e) => setRnc(e.target.value)}
                    maxLength={13}
                  />
                  <small className="form-text">Formato: 000-0000000-0</small>
                </div>
              )}

              {/* Observaciones */}
              <div className="form-group">
                <label>Observaciones</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Observaciones adicionales (opcional)"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={cerrarModalFactura}
                disabled={procesando}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleGenerarFactura}
                disabled={procesando}
              >
                {procesando ? 'Generando...' : 'Generar Factura'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Pagar Factura */}
      {mostrarModalPago && facturaSeleccionada && (
        <div className="modal-overlay" onClick={cerrarModalPago}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Pagar Factura</h2>
              <button className="modal-close" onClick={cerrarModalPago}>&times;</button>
            </div>

            <div className="modal-body">
              {/* Información de la Factura */}
              <div className="factura-info-section">
                <h3>Información de la Factura</h3>
                <p><strong>Código:</strong> {facturaSeleccionada.codigo}</p>
                <p><strong>NCF:</strong> {facturaSeleccionada.ncf || 'N/A'}</p>
                <p><strong>Cliente:</strong> {facturaSeleccionada.cliente?.nombrecompleto || 'N/A'}</p>
                <p><strong>Total a Pagar:</strong> <span className="total-amount">RD$ {Number(facturaSeleccionada.total).toFixed(2)}</span></p>
              </div>

              {/* Método de Pago */}
              <div className="form-group">
                <label>Método de Pago *</label>
                <select
                  className="form-control"
                  value={metodoPagoSeleccionado}
                  onChange={(e) => setMetodoPagoSeleccionado(e.target.value)}
                >
                  {metodosPago.map((metodo) => (
                    <option key={metodo.id} value={metodo.nombre}>
                      {metodo.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Referencia de Pago (si es requerida) */}
              {metodosPago.find(m => m.nombre === metodoPagoSeleccionado)?.requiereReferencia && (
                <div className="form-group">
                  <label>Referencia de Pago *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Número de transacción/referencia"
                    value={referenciaPago}
                    onChange={(e) => setReferenciaPago(e.target.value)}
                  />
                  <small className="form-text">Ingrese el código de referencia del pago</small>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={cerrarModalPago}
                disabled={procesando}
              >
                Cancelar
              </button>
              <button
                className="btn btn-success"
                onClick={handlePagarFactura}
                disabled={procesando}
              >
                {procesando ? 'Procesando...' : 'Confirmar Pago'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Anular Factura */}
      {mostrarModalAnular && facturaParaAnular && (
        <div className="modal-overlay" onClick={cerrarModalAnular}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Anular Factura</h2>
              <button className="modal-close" onClick={cerrarModalAnular}>&times;</button>
            </div>

            <div className="modal-body">
              {/* Información de la Factura */}
              <div className="factura-info-section">
                <h3>Información de la Factura</h3>
                <p><strong>Código:</strong> {facturaParaAnular.codigo}</p>
                <p><strong>NCF:</strong> {facturaParaAnular.ncf || 'N/A'}</p>
                <p><strong>Cliente:</strong> {facturaParaAnular.cliente?.nombrecompleto || 'N/A'}</p>
                <p><strong>Total:</strong> <span className="total-amount">RD$ {Number(facturaParaAnular.total).toFixed(2)}</span></p>
              </div>

              <div className="alert alert-warning">
                <strong>⚠️ Advertencia:</strong> Esta acción no se puede deshacer. La factura quedará anulada permanentemente.
              </div>

              {/* Motivo de Anulación */}
              <div className="form-group">
                <label>Motivo de Anulación *</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Explique el motivo por el cual se anula esta factura"
                  value={motivoAnulacion}
                  onChange={(e) => setMotivoAnulacion(e.target.value)}
                  required
                />
                <small className="form-text">Este motivo quedará registrado en el sistema</small>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={cerrarModalAnular}
                disabled={procesando}
              >
                Cancelar
              </button>
              <button
                className="btn btn-danger"
                onClick={handleAnularFactura}
                disabled={procesando || !motivoAnulacion}
              >
                {procesando ? 'Anulando...' : 'Confirmar Anulación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CajaOperacionPage;
