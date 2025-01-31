import { PedidoService } from "../services/PedidoService.js";
import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
// Controller para Pedido
export class PedidoController {
    private pedidoService: PedidoService;

    constructor() {
        this.pedidoService = new PedidoService();
    }

    getAll = async (req: Request, res: Response): Promise<void> => {
        try {
            const pedidos = await this.pedidoService.getAll();
            res.json(pedidos);
        } catch (error) {
            console.error('Error al obtener pedidos:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    };

    getById = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            const pedido = await this.pedidoService.getById(id);

            if (pedido) {
                res.json(pedido);
            } else {
                res.status(404).json({ message: 'Pedido no encontrado' });
            }
        } catch (error) {
            console.error('Error al obtener pedido:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    };

    create = async (req: Request, res: Response): Promise<void> => {
        try {
            const pedidoData = req.body;
            const nuevoPedido = await this.pedidoService.create(pedidoData);
            res.status(201).json(nuevoPedido);
        } catch (error) {
            res.status(500).json({
                error: 'Error al crear el pedido',
                message: (error as Error).message
            });
        }
    };

    update = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            const pedidoData = req.body;
            const pedidoActualizado = await this.pedidoService.update(id, pedidoData);

            if (!pedidoActualizado) {
                res.status(404).json({ error: 'Pedido no encontrado' });
                return;
            }

            res.json(pedidoActualizado);
        } catch (error) {
            res.status(500).json({
                error: 'Error al actualizar el pedido',
                message: (error as Error).message
            });
        }
    };

    delete = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            const resultado = await this.pedidoService.delete(id);

            if (!resultado) {
                res.status(404).json({ error: 'Pedido no encontrado' });
                return;
            }

            res.status(200).json({ message: 'Pedido eliminado correctamente' });
        } catch (error) {
            res.status(500).json({
                error: 'Error al eliminar el pedido',
                message: (error as Error).message
            });
        }
    };

    //obtener por numero de Comprobante 
    getByNroComprobante = async (req: Request, res: Response): Promise<void> => {
        try {

            const nroComprobante = parseInt(req.params.nroComprobante);
            const pedido = await this.pedidoService.getByNroComprobante(nroComprobante);

            if (pedido) {
                res.json(pedido);
            } else {
                res.status(404).json({ message: 'Pedido no encontrado' });
            }
        } catch (error) {
            console.error('Error al obtener pedido por nroComprobante:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    };

    //Obtener un arreglo de pedidos mediante un rango de fechas 
    getByDateRange = async (req: Request, res: Response): Promise<void> => {
        try {
            const { fechaInicio, fechaFin } = req.query;

            if (!fechaInicio || !fechaFin) {
                res.status(400).json({ message: 'Debe proporcionar fechaInicio y fechaFin' });
                return;
            }

            // Convertir las fechas a objetos Date
            const inicio = new Date(fechaInicio as string);
            const fin = new Date(fechaFin as string);

            if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
                res.status(400).json({ message: 'Las fechas proporcionadas no son válidas' });
                return;
            }

            const pedidos = await this.pedidoService.getByDateRange(inicio, fin);

            if (pedidos.length > 0) {
                res.json(pedidos);
            } else {
                res.status(404).json({ message: 'No se encontraron pedidos en el rango de fechas' });
            }
        } catch (error) {
            console.error('Error al obtener pedidos por rango de fechas:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    };
    generarPDF = async (req: Request, res: Response): Promise<void> => {
        try {
            // Obtener los datos desde el servicio
            const pedidos = await this.pedidoService.getAll();

            if (pedidos.length === 0) {
                res.status(404).json({ message: 'No hay pedidos disponibles.' });
                return;
            }

            // Crear el PDF
            const doc = new PDFDocument();
            const chunks: Buffer[] = [];

            // Capturar el PDF en memoria
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(chunks);
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename=pedidos.pdf');
                res.send(pdfBuffer);  // Enviar el PDF como respuesta
            });

            // Escribir el contenido del PDF
            doc.fontSize(18).text('Reporte de Pedidos', { align: 'center' }).moveDown();

            // Recorrer los pedidos y agregar su información al PDF
            pedidos.forEach((pedido) => {
                doc.fontSize(14).text(`Pedido ID: ${pedido.id}`).moveDown();
                if (pedido.cliente) {
                    doc.text(`Cliente: ${pedido.cliente.razonSocial} (CUIT: ${pedido.cliente.cuit})`);
                }
                doc.text(`Fecha: ${pedido.fechaPedido.toLocaleDateString()}`);
                doc.text(`Forma de Pago: ${pedido.formaPago}`);
                doc.text(`Nro Comprobante: ${pedido.nroComprobante}`);
                doc.text(`Total: $${pedido.totalPedido}`).moveDown();

                // Detalles del pedido
                doc.fontSize(12).text('Detalles del Pedido:', { underline: true }).moveDown();
                pedido.detalles.forEach((detalle) => {
                    doc.text(
                        `Producto: ${detalle.producto?.denominacion} (Código: ${detalle.producto?.codigoProducto})`
                    );
                    doc.text(
                        `Cantidad: ${detalle.cantidad} - Precio Unitario: $${detalle.producto?.precioVenta} - Subtotal: $${detalle.subtotal}`
                    ).moveDown();
                });

                doc.moveDown();  // Agregar un salto de línea entre pedidos
            });

            // Finalizar el documento PDF
            doc.end();
        } catch (error) {
            console.error('Error generando el PDF:', error);
            res.status(500).json({ message: 'Error al generar el PDF' });
        }
    };
}



