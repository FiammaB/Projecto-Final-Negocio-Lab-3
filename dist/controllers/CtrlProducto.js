import { ProductoService } from "../services/ProductoService.js";
// Controller para Producto
export class ProductoController {
    constructor() {
        this.getAll = async (req, res) => {
            try {
                const productos = await this.productoService.getAll();
                res.json(productos);
            }
            catch (error) {
                console.error('Error al obtener productos:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        };
        this.getById = async (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const producto = await this.productoService.getById(id);
                if (producto) {
                    res.json(producto);
                }
                else {
                    res.status(404).json({ message: 'Producto no encontrado' });
                }
            }
            catch (error) {
                console.error('Error al obtener producto:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        };
        this.productoService = new ProductoService();
    }
}
