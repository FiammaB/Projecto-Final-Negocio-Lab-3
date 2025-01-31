import { Router } from 'express';
import { ProductoController } from '../controllers/CtrlProducto.js';
const router = Router();
const controller = new ProductoController();
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
export default router;
