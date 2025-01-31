import { ClienteService } from '../services/ClienteService.js';
// Controller para Cliente
export class ClienteController {
    constructor() {
        this.getAll = async (req, res) => {
            try {
                const clientes = await this.clienteService.getAll();
                res.json(clientes);
            }
            catch (error) {
                console.error('Error al obtener clientes:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        };
        this.getById = async (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const cliente = await this.clienteService.getById(id);
                if (cliente) {
                    res.json(cliente);
                }
                else {
                    res.status(404).json({ message: 'Cliente no encontrado' });
                }
            }
            catch (error) {
                console.error('Error al obtener cliente:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            }
        };
        this.clienteService = new ClienteService();
    }
}
