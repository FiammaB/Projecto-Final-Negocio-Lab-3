import { RowDataPacket } from 'mysql2/promise';

export interface PedidoRow extends RowDataPacket{
    id: number;
    idcliente: number;
    fechaPedido: Date;
    nroComprobante: number;
    formaPago: string;
    observaciones: string;
    totalPedido: number;
    cuit: string;
    razonSocial: string;
}

