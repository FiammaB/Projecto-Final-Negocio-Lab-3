import { Pedido } from "./Pedido";
import { Producto } from "./Producto";

export class DetallePedido {
    id: number;
    pedidoVenta?: Pedido; // Relación con Pedido (opcional)
    producto?: Producto; // Relación con Producto (opcional)
    cantidad: number;
    subtotal: number;

    constructor(
        id: number,
        idPedidoVenta: number,
        idProducto: number,
        cantidad: number,
        subtotal: number,
        pedidoVenta?: Pedido,
        producto?: Producto
    ) {
        this.id = id;
        this.cantidad = cantidad;
        this.subtotal = subtotal;
        this.pedidoVenta = pedidoVenta;
        this.producto = producto;
    }
}