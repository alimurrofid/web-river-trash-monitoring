import { sql } from "drizzle-orm";
import {
  mysqlTable,
  varchar,
  int,
  timestamp,
} from "drizzle-orm/mysql-core";

// User login table (tanpa JWT)
export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  created_at: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Traffic waste data table
export const trafficWaste = mysqlTable("traffic_waste", {
  id: int("id").primaryKey().autoincrement(),
  timestamp: timestamp("timestamp").notNull(),
  plastic_makro: int("plastic_makro").default(0).notNull(),
  plastic_meso: int("plastic_meso").default(0).notNull(),
  nonplastic_makro: int("nonplastic_makro").default(0).notNull(),
  nonplastic_meso: int("nonplastic_meso").default(0).notNull(),
  created_at: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Sessions table untuk autentikasi sederhana tanpa JWT
export const sessions = mysqlTable("sessions", {
  id: int("id").primaryKey().autoincrement(),
  user_id: int("user_id").notNull(),
  session_id: varchar("session_id", { length: 255 }).notNull().unique(),
  created_at: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  expires_at: timestamp("expires_at").notNull(),
});