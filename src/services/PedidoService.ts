import { Database } from "../config/conexion.js";
import { Pedido } from "../models/Pedido.js";
import { Cliente } from "../models/Cliente.js";
import { Producto } from "../models/Producto.js";
import { DetallePedido } from "../models/DetallePedido.js";
import { PedidoRow } from "../interfaces/PedidoRow.js";
import { DetallePedidoRow } from "../interfaces/DetallePedidoRow.js";
import { ResultSetHeader } from "mysql2";

export class PedidoService {

    // Traer pedidos 
    async getAll(): Promise<Pedido[]> {
        const connection = await Database.getConnection();
        try {
            const [rows] = await connection.execute<PedidoRow[]>(
                `
                SELECT p.id AS pedidoId, p.idcliente, p.fechaPedido, p.nroComprobante, 
                       p.formaPago, p.observaciones, p.totalPedido, 
                       c.id AS clienteId, c.cuit, c.razonSocial
                FROM pedido_venta p
                INNER JOIN cliente c ON p.idcliente = c.id
                `
            );

            const pedidos: Pedido[] = [];

            for (const row of rows) {
                const cliente = new Cliente(row.idcliente, row.cuit, row.razonSocial);

                const [detallesRows] = await connection.execute<DetallePedidoRow[]>(
                    `
                    SELECT d.id AS detalleId, d.idpedidoventa, d.idproducto, d.cantidad, 
                           d.subtotal, pr.codigoProducto, pr.denominacion, pr.precioVenta
                    FROM pedido_venta_detalle d
                    INNER JOIN producto pr ON d.idproducto = pr.id
                    WHERE d.idpedidoventa = ?
                    `,
                    [row.pedidoId]
                );

                const detalles = detallesRows.map(det => {
                    const producto = new Producto(
                        det.idproducto,
                        det.codigoProducto,
                        det.denominacion,
                        det.precioVenta
                    );
                    return new DetallePedido(
                        det.id,
                        det.idpedidoventa,
                        det.idproducto,
                        det.cantidad,
                        det.subtotal,
                        undefined,
                        producto
                    )
                })

                pedidos.push(new Pedido(
                    row.pedidoId,
                    new Date(row.fechaPedido),
                    row.nroComprobante,
                    row.formaPago,
                    row.observaciones,
                    row.totalPedido,
                    detalles,
                    cliente
                ))
            }

            return pedidos;
        } finally {
            connection.release();
        }
    }


    // Obtener un pedido por ID
    async getById(id: number): Promise<Pedido | null> {
        const connection = await Database.getConnection();
        try {
            // Obtener el pedido con datos del cliente
            const [rows] = await connection.execute<PedidoRow[]>(
                `
                SELECT p.id AS pedidoId, p.idcliente, p.fechaPedido, p.nroComprobante, 
                       p.formaPago, p.observaciones, p.totalPedido, 
                       c.id AS clienteId, c.cuit, c.razonSocial
                FROM pedido_venta p
                INNER JOIN cliente c ON p.idcliente = c.id
                WHERE p.id = ?
                `, [id]
            );

            if (rows.length === 0) {
                return null;
            }

            const row = rows[0];
            const cliente = new Cliente(row.idcliente, row.cuit, row.razonSocial);

            // Obtener los detalles del pedido
            const [detallesRows] = await connection.execute<DetallePedidoRow[]>(
                `SELECT d.*, pr.* 
                FROM pedido_venta_detalle d 
                INNER JOIN producto pr ON d.idproducto = pr.id 
                WHERE d.idpedidoventa = ?`,
                [id]
            );

            const detalles = detallesRows.map(det => {
                const producto = new Producto(
                    det.idproducto,
                    det.codigoProducto,
                    det.denominacion,
                    det.precioVenta
                );
                return new DetallePedido(
                    det.id,
                    det.idpedidoventa,
                    det.idproducto,
                    det.cantidad,
                    det.subtotal,
                    undefined,
                    producto
                );
            });

            return new Pedido(
                row.pedidoId,
                new Date(row.fechaPedido),
                row.nroComprobante,
                row.formaPago,
                row.observaciones,
                row.totalPedido,
                detalles,
                cliente
            );
        } finally {
            connection.release();
        }
    }

    // Crear pedido
    async create(pedido: Pedido): Promise<Pedido> {
        const connection = await Database.getConnection();
        await connection.beginTransaction();

        try {
            // Validar datos
            if (!pedido.cliente?.id || !pedido.detalles.length) {
                throw new Error('Datos de pedido incompletos');
            }

            const [rows] = await connection.execute<any[]>(
                `SELECT COUNT(*) AS count 
                 FROM pedido_venta 
                 WHERE nroComprobante = ?`,
                [pedido.nroComprobante]
            );

            if (rows[0]?.count > 0) {
                throw new Error(`El número de comprobante "${pedido.nroComprobante}" ya existe.`);
            }

            // Calcular total
            pedido.totalPedido = pedido.detalles.reduce(
                (total, detalle) => total + (detalle.cantidad * (detalle.producto?.precioVenta ?? 0)),
                0
            );

            // Insertar pedido
            const [result] = await connection.execute<ResultSetHeader>(
                `INSERT INTO pedido_venta 
                (idcliente, fechaPedido, nroComprobante, formaPago, observaciones, totalPedido) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    pedido.cliente.id,
                    pedido.fechaPedido,
                    pedido.nroComprobante,
                    pedido.formaPago,
                    pedido.observaciones,
                    pedido.totalPedido
                ]
            );

            const pedidoId = result.insertId;

            // Insertar detalles
            for (const detalle of pedido.detalles) {
                // Calcula el subtotal
                detalle.subtotal = detalle.cantidad * (detalle.producto?.precioVenta ?? 0);
                await connection.execute(
                    `INSERT INTO pedido_venta_detalle 
                    (idpedidoventa, idproducto, cantidad, subtotal) 
                    VALUES (?, ?, ?, ?)`,
                    [pedidoId, detalle.producto?.id, detalle.cantidad, detalle.subtotal]
                );
            }

            await connection.commit();
            return await this.getById(pedidoId) as Pedido;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Actualizar pedido
    async update(id: number, pedido: Pedido): Promise<Pedido | null> {
        const connection = await Database.getConnection();
        await connection.beginTransaction();

        try {
            // Validar datos
            if (!pedido.cliente?.id || !pedido.detalles.length) {
                throw new Error('Datos de pedido incompletos');
            }

            // Verificar si existe el pedido
            const pedidoExistente = await this.getById(id);
            if (!pedidoExistente) {
                throw new Error('Pedido no encontrado');
            }

            // Calcular total
            pedido.totalPedido = pedido.detalles.reduce(
                (total, detalle) => total + (detalle.cantidad * (detalle.producto?.precioVenta ?? 0)),
                0
            );

            // Actualizar pedido
            await connection.execute(
                `UPDATE pedido_venta 
                SET idcliente = ?, fechaPedido = ?, nroComprobante = ?, 
                    formaPago = ?, observaciones = ?, totalPedido = ?
                WHERE id = ?`,
                [
                    pedido.cliente.id,
                    pedido.fechaPedido,
                    pedido.nroComprobante,
                    pedido.formaPago,
                    pedido.observaciones,
                    pedido.totalPedido,
                    id
                ]
            );

            // Eliminar detalles antiguos
            await connection.execute(
                'DELETE FROM pedido_venta_detalle WHERE idpedidoventa = ?',
                [id]
            );

            // Insertar nuevos detalles
            for (const detalle of pedido.detalles) {
                // Calcula el subtotal
                detalle.subtotal = detalle.cantidad * (detalle.producto?.precioVenta ?? 0);
                await connection.execute(
                    `INSERT INTO pedido_venta_detalle 
                    (idpedidoventa, idproducto, cantidad, subtotal) 
                    VALUES (?, ?, ?, ?)`,
                    [id, detalle.producto?.id, detalle.cantidad, detalle.subtotal]
                );
            }

            await connection.commit();
            return await this.getById(id);

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }


    // Eliminar
    async delete(id: number): Promise<boolean> {
        const connection = await Database.getConnection();
        await connection.beginTransaction();

        try {
            // Verificar si existe el pedido
            const pedido = await this.getById(id);
            if (!pedido) {
                return false;
            }

            // Eliminar detalles
            await connection.execute(
                'DELETE FROM pedido_venta_detalle WHERE idpedidoventa = ?',
                [id]
            );

            // Eliminar pedido
            const [result] = await connection.execute<ResultSetHeader>(
                'DELETE FROM pedido_venta WHERE id = ?',
                [id]
            );

            await connection.commit();
            return result.affectedRows > 0;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Obtener Pedido mediante su numero de comprobante 
    async getByNroComprobante(nroComprobante: number): Promise<Pedido | null> {
        const connection = await Database.getConnection();
        try {
            // Obtener el pedido con datos del cliente
            const [rows] = await connection.execute<PedidoRow[]>(
                `
                SELECT p.id AS pedidoId, p.idcliente, p.fechaPedido, p.nroComprobante, 
                       p.formaPago, p.observaciones, p.totalPedido, 
                       c.id AS clienteId, c.cuit, c.razonSocial
                FROM pedido_venta p
                INNER JOIN cliente c ON p.idcliente = c.id
                WHERE p.nroComprobante = ?
                `, [nroComprobante]
            );

            if (rows.length === 0) {
                return null;
            }

            const row = rows[0];
            const cliente = new Cliente(row.idcliente, row.cuit, row.razonSocial);

            // Obtener los detalles del pedido
            const [detallesRows] = await connection.execute<DetallePedidoRow[]>(
                `SELECT d.*, pr.* 
                FROM pedido_venta_detalle d 
                INNER JOIN producto pr ON d.idproducto = pr.id 
                WHERE d.idpedidoventa = ?`,
                [row.pedidoId]
            );

            const detalles = detallesRows.map(det => {
                const producto = new Producto(
                    det.idproducto,
                    det.codigoProducto,
                    det.denominacion,
                    det.precioVenta
                );
                return new DetallePedido(
                    det.id,
                    det.idpedidoventa,
                    det.idproducto,
                    det.cantidad,
                    det.subtotal,
                    undefined,
                    producto
                );
            });

            return new Pedido(
                row.pedidoId,
                new Date(row.fechaPedido),
                row.nroComprobante,
                row.formaPago,
                row.observaciones,
                row.totalPedido,
                detalles,
                cliente
            );
        } finally {
            connection.release();
        }
    }

    //Obtener pedido mediante un rango de fechas
    async getByDateRange(fechaInicio: Date, fechaFin: Date): Promise<Pedido[]> {
        const connection = await Database.getConnection();
        try {
            // Obtener pedidos dentro del rango de fechas con datos del cliente
            const [rows] = await connection.execute<PedidoRow[]>(
                `
                SELECT p.id AS pedidoId, p.idcliente, p.fechaPedido, p.nroComprobante, 
                       p.formaPago, p.observaciones, p.totalPedido, 
                       c.id AS clienteId, c.cuit, c.razonSocial
                FROM pedido_venta p
                INNER JOIN cliente c ON p.idcliente = c.id
                WHERE p.fechaPedido BETWEEN ? AND ?
                `,
                [fechaInicio.toISOString(), fechaFin.toISOString()]
            );

            if (rows.length === 0) {
                return [];
            }

            // Para cada pedido, obtener los detalles
            const pedidos = await Promise.all(rows.map(async row => {
                const cliente = new Cliente(row.idcliente, row.cuit, row.razonSocial);

                const [detallesRows] = await connection.execute<DetallePedidoRow[]>(
                    `SELECT d.* , pr.*
                    FROM pedido_venta_detalle d 
                    INNER JOIN producto pr ON d.idproducto = pr.id 
                    WHERE d.idpedidoventa = ?`,
                    [row.pedidoId]
                );

                const detalles = detallesRows.map(det => {
                    const producto = new Producto(
                        det.idproducto,
                        det.codigoProducto,
                        det.denominacion,
                        det.precioVenta
                    );
                    return new DetallePedido(
                        det.id,
                        det.idpedidoventa,
                        det.idproducto,
                        det.cantidad,
                        det.subtotal,
                        undefined,
                        producto
                    );
                });

                return new Pedido(
                    row.pedidoId,
                    new Date(row.fechaPedido),
                    row.nroComprobante,
                    row.formaPago,
                    row.observaciones,
                    row.totalPedido,
                    detalles,
                    cliente
                );
            }));

            return pedidos;
        } finally {
            connection.release();
        }
    }

}