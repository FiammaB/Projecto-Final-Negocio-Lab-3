import { Producto } from "../models/Producto.js";
import { Database } from "../config/conexion.js";
import { ProductoRow } from "../interfaces/ProductoRow.js";

// Servicio de Producto
export class ProductoService {
    async getAll(): Promise<Producto[]> {
        const connection = await Database.getConnection();
        try {
            const [rows] = await connection.execute<ProductoRow[]>(
                'SELECT * FROM producto'
            );

            return rows.map(row => new Producto(
                row.id,
                row.codigoProducto,
                row.denominacion,
                row.precioVenta
            ));
        } finally {
            connection.release();
        }
    }

    async getById(id: number): Promise<Producto | null> {
        const connection = await Database.getConnection();
        try {
            const [rows] = await connection.execute<ProductoRow[]>(
                'SELECT * FROM producto WHERE id = ?',
                [id]
            );

            if (rows.length === 0) {
                return null;
            }

            const row = rows[0];
            return new Producto(
                row.id,
                row.codigoProducto,
                row.denominacion,
                row.precioVenta
            );
        } finally {
            connection.release();
        }
    }
}