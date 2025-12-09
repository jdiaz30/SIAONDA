import { Router } from 'express';
import {
  crearCaso,
  asignarInspector,
  reportarPrimeraVisita,
  reportarSegundaVisita,
  tramitarAJuridico,
  cerrarPorPago,
  listarCasos,
  obtenerCaso
} from '../../controllers/inspectoria/casos.controller';

const router = Router();

// Listar y obtener
router.get('/', listarCasos);
router.get('/:id', obtenerCaso);

// Crear caso
router.post('/', crearCaso);

// Asignar inspector (Encargado)
router.put('/:id/asignar', asignarInspector);

// Reportar visitas (Inspector)
router.post('/:id/primera-visita', reportarPrimeraVisita);
router.post('/:id/segunda-visita', reportarSegundaVisita);

// Tramitar a Jurídico (Encargado)
router.post('/:id/tramitar-juridico', tramitarAJuridico);

// Webhook - Cerrar por pago (desde Cajas)
router.post('/webhook/cerrar-por-pago', cerrarPorPago);

export default router;
