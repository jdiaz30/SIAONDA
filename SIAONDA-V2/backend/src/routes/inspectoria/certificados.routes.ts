import { Router } from 'express';
import { obtenerCertificadosPendientesFirma } from '../../controllers/inspectoria/solicitudes.controller';

const router = Router();

// Obtener certificados pendientes de firma
router.get('/pendientes-firma', obtenerCertificadosPendientesFirma);

export default router;
