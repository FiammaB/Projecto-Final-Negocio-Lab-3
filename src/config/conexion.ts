import mysql, { Pool, PoolConnection } from 'mysql2/promise';

export class Database {
    private static pool: Pool;

    static async init() {
        this.pool = mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'negocio',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }

    static async getConnection(): Promise<PoolConnection> {
        if (!this.pool) {
            await this.init();
        }
        return await this.pool.getConnection();
    }
}