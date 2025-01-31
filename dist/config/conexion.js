import mysql from 'mysql2/promise';
export class Database {
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
    static async getConnection() {
        if (!this.pool) {
            await this.init();
        }
        return await this.pool.getConnection();
    }
}
