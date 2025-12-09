import { Router } from 'express';
import {
  getCategoriasIRC,
  getCategoriaIRC,
  getStatusInspeccion,
  getEstadosJuridicos,
  getConclusiones,
  getStatusExternos,
  getProvincias,
  getEstadosSolicitud,
  getEstadosCaso,
  getTodosCatalogos,
  getEstadosNuevoFlujo,
  getInspectores
} from '../../controllers/inspectoria/catalogos.controller';

const router = Router();

// Ruta para obtener todos los catálogos en una sola llamada
router.get('/', getTodosCatalogos);
router.get('/todos', getTodosCatalogos);

// Categorías IRC
router.get('/categorias-irc', getCategoriasIRC);
router.get('/categorias-irc/:id', getCategoriaIRC);

// Status de Inspección
router.get('/status-inspeccion', getStatusInspeccion);

// Estados Jurídicos
router.get('/estados-juridicos', getEstadosJuridicos);

// Conclusiones
router.get('/conclusiones', getConclusiones);

// Status Externos
router.get('/status-externos', getStatusExternos);

// Provincias
router.get('/provincias', getProvincias);

// Estados de Solicitud
router.get('/estados-solicitud', getEstadosSolicitud);

// Estados de Caso
router.get('/estados-caso', getEstadosCaso);

// Estados del nuevo flujo de inspecciones
router.get('/estados-nuevo-flujo', getEstadosNuevoFlujo);

// Inspectores
router.get('/inspectores', getInspectores);

export default router;
