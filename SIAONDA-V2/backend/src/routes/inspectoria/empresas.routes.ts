import { Router, Request, Response, NextFunction } from 'express';
import {
  crearEmpresa,
  listarEmpresas,
  obtenerEmpresa,
  buscarPorRNC,
  actualizarEmpresa,
  obtenerEmpresasVencidas,
  obtenerEmpresasPorVencer
} from '../../controllers/inspectoria/empresas.controller';

const router = Router();

// Middleware para prevenir caché en todas las rutas de empresas
const noCacheMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
};

router.use(noCacheMiddleware);

// Rutas especiales (antes de las rutas con :id)
router.get('/vencidas', obtenerEmpresasVencidas);
router.get('/por-vencer', obtenerEmpresasPorVencer);
router.get('/buscar/rnc/:rnc', buscarPorRNC);

// CRUD básico
router.post('/', crearEmpresa);
router.get('/', listarEmpresas);
router.get('/:id', obtenerEmpresa);
router.put('/:id', actualizarEmpresa);

export default router;
