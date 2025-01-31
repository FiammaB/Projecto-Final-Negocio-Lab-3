import { ProductoService } from "../services/ProductoService.js";
import { Request, Response } from 'express';

// Controller para Producto
export class ProductoController {
    private productoService: ProductoService;

    constructor() {
        this.productoService = new ProductoService();
    }

    getAll = async (req: Request, res: Response): Promise<void> => {
        try {
            const productos = await this.productoService.getAll();
            res.json(productos);
        } catch (error) {
            console.error('Error al obtener productos:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    };

    getById = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            const producto = await this.productoService.getById(id);

            if (producto) {
                res.json(producto);
            } else {
                res.status(404).json({ message: 'Producto no encontrado' });
            }
        } catch (error) {
            console.error('Error al obtener producto:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    };
}