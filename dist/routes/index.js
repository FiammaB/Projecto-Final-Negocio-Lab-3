import { Router } from 'express';
import clienteRoutes from './RutaClientes.js';
import productoRoutes from './RutaProductos.js';
import pedidoRoutes from './RutaPedidos.js';
const router = Router();
// Prefix cada conjunto de rutas con su entidad
router.use('/clientes', clienteRoutes);
router.use('/productos', productoRoutes);
router.use('/pedidos', pedidoRoutes);
export default router;
