import { Cliente } from "../models/Cliente.js";
import { Database } from "../config/conexion.js";
import { ClienteRow } from "../interfaces/ClienteRow.js";

// Servicio de Cliente
export class ClienteService {
    async getAll(): Promise<Cliente[]> {
        const connection = await Database.getConnection();
        try {
            const [rows] = await connection.execute<ClienteRow[]>(
                'SELECT * FROM cliente'
            );

            return rows.map(row => new Cliente(
                row.id,
                row.cuit,
                row.razonSocial
            ));
        } finally {
            connection.release();
        }
    }

    async getById(id: number): Promise<Cliente | null> {
        const connection = await Database.getConnection();
        try {
            const [rows] = await connection.execute<ClienteRow[]>(
                'SELECT * FROM cliente WHERE id = ?',
                [id]
            );

            if (rows.length === 0) {
                return null;
            }

            const row = rows[0];
            return new Cliente(
                row.id,
                row.cuit,
                row.razonSocial
            );
        } finally {
            connection.release();
        }
    }
}