import { DetallePedido } from "./DetallePedido";
import { Cliente } from "./Cliente";

export class Pedido {
    id: number;
    cliente?: Cliente; // Relación con Cliente
    fechaPedido: Date;
    nroComprobante: number;
    formaPago: string;
    observaciones: string;
    totalPedido: number;
    detalles: DetallePedido[]; // Relación con DetallePedido

    constructor(
        id: number,
        fechaPedido: Date,
        nroComprobante: number,
        formaPago: string,
        observaciones: string,
        totalPedido: number,
        detalles: DetallePedido[] = [], // Inicializado como un array vacío
        cliente?: Cliente
    ) {
        this.id = id;
        this.fechaPedido = fechaPedido;
        this.nroComprobante = nroComprobante;
        this.formaPago = formaPago;
        this.observaciones = observaciones;
        this.totalPedido = totalPedido;
        this.detalles = detalles;
        this.cliente = cliente;
    }

    // Método para agregar un detalle
    agregarDetalle(detalle: DetallePedido) {
        this.detalles.push(detalle);
        this.totalPedido += detalle.subtotal; // Actualizar el total automáticamente
    }
}
