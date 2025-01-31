import { RowDataPacket } from 'mysql2/promise';

export interface ClienteRow extends RowDataPacket {
    id: number;
    cuit: string;
    razonSocial: string;
}