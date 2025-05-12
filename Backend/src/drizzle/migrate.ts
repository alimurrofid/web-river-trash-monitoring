import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import * as schema from "./schema"; // Import your schema file

async function main() {
  console.log("Starting database migration...");

  // Create the connection
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  });

  // Create the database if it doesn't exist
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || "skripsi"}`
  );

  // Use the database
  await connection.query(`USE ${process.env.DB_NAME || "skripsi"}`);

  // Konfigurasi Drizzle dengan mode
  const db = drizzle(connection, {
    schema: schema,
    mode: "default", // Properti mode diperlukan
  });

  // Run migrations
  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations completed successfully");

  await connection.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});