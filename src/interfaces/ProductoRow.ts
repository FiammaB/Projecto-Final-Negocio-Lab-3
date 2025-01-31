import { RowDataPacket } from 'mysql2/promise';

export interface ProductoRow extends RowDataPacket {
    id: number;
    codigoProducto: string;
    denominacion: string;
    precioVenta: number;
}