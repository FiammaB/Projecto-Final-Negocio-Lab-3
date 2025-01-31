export class Pedido {
    constructor(id, idCliente, fechaPedido, nroComprobante, formaPago, observaciones, totalPedido, detalles = [], // Inicializado como un array vacío
    cliente) {
        this.id = id;
        this.idCliente = idCliente;
        this.fechaPedido = fechaPedido;
        this.nroComprobante = nroComprobante;
        this.formaPago = formaPago;
        this.observaciones = observaciones;
        this.totalPedido = totalPedido;
        this.detalles = detalles;
        this.cliente = cliente;
    }
    // Método para agregar un detalle
    agregarDetalle(detalle) {
        this.detalles.push(detalle);
        this.totalPedido += detalle.subtotal; // Actualizar el total automáticamente
    }
}
