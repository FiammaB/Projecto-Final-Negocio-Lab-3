export class DetallePedido {
    constructor(id, idPedidoVenta, idProducto, cantidad, subtotal, pedidoVenta, producto) {
        this.id = id;
        this.idPedidoVenta = idPedidoVenta;
        this.idProducto = idProducto;
        this.cantidad = cantidad;
        this.subtotal = subtotal;
        this.pedidoVenta = pedidoVenta;
        this.producto = producto;
    }
}
