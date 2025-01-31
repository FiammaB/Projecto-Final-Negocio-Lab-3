import { RowDataPacket } from 'mysql2/promise';

export interface DetallePedidoRow extends RowDataPacket{
    id: number;
    idpedidoventa: number;
    idproducto: number;
    cantidad: number;
    subtotal: number;
    codigoProducto: string;
    denominacion: string;
    precioVenta: number;
}