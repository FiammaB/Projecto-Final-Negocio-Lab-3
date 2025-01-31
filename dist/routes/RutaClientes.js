import { Router } from 'express';
import { ClienteController } from '../controllers/CtrlCliente.js';
const router = Router();
const controller = new ClienteController();
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
export default router;
