import { sql } from "drizzle-orm";
import {
  mysqlTable,
  varchar,
  int,
  timestamp,
  primaryKey,
  text,
} from "drizzle-orm/mysql-core";

// User login table (tanpa JWT)
export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  created_at: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Traffic billboard data table
export const trafficBillboard = mysqlTable("traffic_billboard", {
  id: int("id").primaryKey().autoincrement(),
  created_at: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  timestamp: timestamp("timestamp").notNull(),
  billboard_name: varchar("billboard_name", { length: 50 }).notNull(), // "A", "B", or "C"
  motorcycle_down: int("motorcycle_down").default(0).notNull(),
  motorcycle_up: int("motorcycle_up").default(0).notNull(),
  car_down: int("car_down").default(0).notNull(),
  car_up: int("car_up").default(0).notNull(),
  big_vehicle_down: int("big_vehicle_down").default(0).notNull(),
  big_vehicle_up: int("big_vehicle_up").default(0).notNull(),
});

// Streaming links table
export const streaming = mysqlTable("streaming", {
  id: int("id").primaryKey().autoincrement(),
  link: varchar("link", { length: 255 }).notNull(),
  created_at: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  id_traffic_billboard: int("id_traffic_billboard").notNull(),
  billboard_name: varchar("billboard_name", { length: 50 }).notNull(),
});

// Sessions table untuk autentikasi sederhana tanpa JWT
export const sessions = mysqlTable("sessions", {
  id: int("id").primaryKey().autoincrement(),
  user_id: int("user_id").notNull(),
  session_id: varchar("session_id", { length: 255 }).notNull().unique(),
  created_at: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  expires_at: timestamp("expires_at").notNull(),
});

// Relations for better type safety and query building
export const relations = {
  streaming: {
    trafficBillboard: {
      relationField: "id_traffic_billboard",
      referencedTable: trafficBillboard,
      referencedField: "id",
    },
  },
  sessions: {
    users: {
      relationField: "user_id",
      referencedTable: users,
      referencedField: "id",
    },
  },
};
