// src/drizzle/db.ts
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import "dotenv/config";
// Fungsi untuk membuat koneksi database
async function createDbConnection() {
    try {
        const connection = await mysql.createConnection({
            host: "localhost", // Hardcode localhost dulu
            user: "root", // Hardcode user dulu
            password: "", // Kosong jika tidak ada password
            database: "skripsi",
        });
        console.log("Database connection successful!");
        return connection;
    }
    catch (error) {
        console.error("Database connection error:", error);
        throw error;
    }
}
// Export koneksi dan db
export const connection = await createDbConnection();
export const db = drizzle(connection);
//# sourceMappingURL=db.js.map