// src/services/trafficRepository.ts
import { eq, and, gte, lte, desc, sql, SQL, asc } from "drizzle-orm";
import { db } from "../drizzle/db.js";
import { trafficWaste } from "../drizzle/schema.js";

// Tipe data untuk input traffic recording
export interface TrafficInput {
  timestamp: Date;
  plastic_makro: number;
  plastic_meso: number;
  nonplastic_makro: number;
  nonplastic_meso: number;
}

/**
 * Mencatat data traffic baru
 */
export async function recordTraffic(data: TrafficInput) {
  // Insert data
  await db.insert(trafficWaste).values(data);
  
  // Ambil data terakhir yang diinsert berdasarkan timestamp
  const lastInserted = await db.select()
    .from(trafficWaste)
    .where(
        eq(trafficWaste.timestamp, data.timestamp)
      )
    .orderBy(desc(trafficWaste.created_at))
    .limit(1);
  
  return lastInserted.length > 0 ? lastInserted[0].id : null;
}

/**
 * Mendapatkan data traffic
 */
export async function getTrafficAll(limit: number = 100) {
  return await db.select()
    .from(trafficWaste)
    .orderBy(desc(trafficWaste.timestamp))
    .limit(limit);
}

/**
 * Mendapatkan data traffic berdasarkan rentang tanggal
 */
export async function getTrafficByDateRange(
  startDate: Date, 
  endDate: Date, 
) {
  const whereCondition = and(
    gte(trafficWaste.timestamp, startDate),
    lte(trafficWaste.timestamp, endDate)
  );

  return await db.select()
    .from(trafficWaste)
    .where(whereCondition)
    .orderBy(asc(trafficWaste.timestamp))
    .execute();
}

/**
 * Mendapatkan data agregat untuk dashboard berdasarkan pengelompokan waktu
 */
export async function getAggregatedTrafficData(
  groupBy: "hour" | "day" | "week" | "month",
  billboardName?: string
) {
  let timeFormat: SQL<unknown>;
  
  switch(groupBy) {
    case "hour":
      timeFormat = sql`DATE_FORMAT(${trafficWaste.timestamp}, '%Y-%m-%d %H:00')`;
      break;
    case "day":
      timeFormat = sql`DATE(${trafficWaste.timestamp})`;
      break;
    case "week":
      timeFormat = sql`DATE_FORMAT(${trafficWaste.timestamp}, '%Y-%u')`;
      break;
    case "month":
      timeFormat = sql`DATE_FORMAT(${trafficWaste.timestamp}, '%Y-%m')`;
      break;
    default:
      timeFormat = sql`DATE(${trafficWaste.timestamp})`;
  }
  
  const selectQuery = db.select({
        time_period: timeFormat,
        plastic_makro: sql`SUM(${trafficWaste.plastic_makro})`,
        plastic_meso: sql`SUM(${trafficWaste.plastic_meso})`
      })
      .from(trafficWaste);
  
  return await selectQuery.groupBy(timeFormat).orderBy(asc(timeFormat));
}

export async function getTrafficStatistics() {
  const selectQuery = db.select({
        total_plastic: sql`SUM(${trafficWaste.plastic_makro} + ${trafficWaste.plastic_meso})`,
        total_nonplastic: sql`SUM(${trafficWaste.nonplastic_makro} + ${trafficWaste.nonplastic_meso})`,
        total_all: sql`SUM(${trafficWaste.plastic_makro} + ${trafficWaste.plastic_meso} + ${trafficWaste.nonplastic_makro} + ${trafficWaste.nonplastic_meso})`,
      })
      .from(trafficWaste);
  
  const result = await selectQuery.execute();
  return result[0];
}

/**
 * Mendapatkan data terbaru
 */
export async function getLatestTrafficData() {
  const latest = await db
    .select()
    .from(trafficWaste)
    .orderBy(desc(trafficWaste.timestamp))
    .limit(1);

  return latest[0] ?? null;
}