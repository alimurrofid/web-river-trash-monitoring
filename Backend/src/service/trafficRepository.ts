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
 * Mencatat data traffic baru dengan pendekatan yang lebih reliable
 */
export async function recordTraffic(data: TrafficInput): Promise<number | null> {
  try {
    // Direct insert dengan Drizzle ORM
    const insertResult = await db.insert(trafficWaste).values(data);
    
    // Query untuk mendapatkan record yang baru saja diinsert
    // Menggunakan kombinasi timestamp dan nilai untuk identifikasi unique
    const recentRecord = await db
      .select({ id: trafficWaste.id })
      .from(trafficWaste)
      .where(
        and(
          eq(trafficWaste.plastic_makro, data.plastic_makro),
          eq(trafficWaste.plastic_meso, data.plastic_meso),
          eq(trafficWaste.nonplastic_makro, data.nonplastic_makro),
          eq(trafficWaste.nonplastic_meso, data.nonplastic_meso),
          // Timestamp dalam range 10 detik untuk mengatasi precision issues
          gte(trafficWaste.timestamp, new Date(data.timestamp.getTime() - 10000)),
          lte(trafficWaste.timestamp, new Date(data.timestamp.getTime() + 10000))
        )
      )
      .orderBy(desc(trafficWaste.id))
      .limit(1);
    
    const insertId = recentRecord.length > 0 ? recentRecord[0].id : null;
    
    if (!insertId) {
      console.error("❌ Could not retrieve insertId for traffic record");
    }
    
    return insertId;
    
  } catch (error) {
    console.error("❌ Error in recordTraffic:", error);
    
    // Type-safe error handling
    if (error instanceof Error) {
      console.error("📝 Error message:", error.message);
    }
    
    return null;
  }
}

/**
 * Alternative method menggunakan transaction untuk memastikan atomicity
 */
export async function recordTrafficWithTransaction(data: TrafficInput): Promise<number | null> {
  try {
    const result = await db.transaction(async (tx) => {
      // Insert data
      await tx.insert(trafficWaste).values(data);
      
      // Immediately query for the inserted record
      const insertedRecord = await tx
        .select({ id: trafficWaste.id })
        .from(trafficWaste)
        .where(
          and(
            eq(trafficWaste.plastic_makro, data.plastic_makro),
            eq(trafficWaste.plastic_meso, data.plastic_meso),
            eq(trafficWaste.nonplastic_makro, data.nonplastic_makro),
            eq(trafficWaste.nonplastic_meso, data.nonplastic_meso),
            gte(trafficWaste.timestamp, new Date(data.timestamp.getTime() - 5000)),
            lte(trafficWaste.timestamp, new Date(data.timestamp.getTime() + 5000))
          )
        )
        .orderBy(desc(trafficWaste.id))
        .limit(1);
      
      return insertedRecord.length > 0 ? insertedRecord[0].id : null;
    });
    
    return result;
    
  } catch (error) {
    console.error("❌ Transaction failed:", error);
    return null;
  }
}

/**
 * Method menggunakan raw SQL (jika method lain gagal)
 */
export async function recordTrafficWithRawSQL(data: TrafficInput): Promise<number | null> {
  try {
    // Insert dengan raw SQL
    await db.execute(sql`
      INSERT INTO traffic_waste (timestamp, plastic_makro, plastic_meso, nonplastic_makro, nonplastic_meso)
      VALUES (${data.timestamp}, ${data.plastic_makro}, ${data.plastic_meso}, ${data.nonplastic_makro}, ${data.nonplastic_meso})
    `);
    
    // Get LAST_INSERT_ID()
    const lastIdResult = await db.execute(sql`SELECT LAST_INSERT_ID() as id`);
    
    // Extract ID dari result
    const insertId = Array.isArray(lastIdResult) && lastIdResult.length > 0 
      ? (lastIdResult[0] as any)?.id 
      : null;
    
    return insertId || null;
    
  } catch (error) {
    console.error("❌ Raw SQL method failed:", error);
    return null;
  }
}

/**
 * Test method untuk memverifikasi bahwa data berhasil disimpan
 */
export async function verifyDataSaved(data: TrafficInput): Promise<number | null> {
  try {
    const record = await db
      .select({ id: trafficWaste.id })
      .from(trafficWaste)
      .where(
        and(
          eq(trafficWaste.plastic_makro, data.plastic_makro),
          eq(trafficWaste.plastic_meso, data.plastic_meso),
          eq(trafficWaste.nonplastic_makro, data.nonplastic_makro),
          eq(trafficWaste.nonplastic_meso, data.nonplastic_meso),
          gte(trafficWaste.timestamp, new Date(data.timestamp.getTime() - 30000)), // 30 seconds range
          lte(trafficWaste.timestamp, new Date(data.timestamp.getTime() + 30000))
        )
      )
      .orderBy(desc(trafficWaste.id))
      .limit(1);
    
    return record.length > 0 ? record[0].id : null;
  } catch (error) {
    console.error("❌ Verification failed:", error);
    return null;
  }
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

/**
 * Test function untuk debug database connection
 */
export async function testDatabaseConnection() {
  try {
    const result = await db.select().from(trafficWaste).limit(1);
    console.log("✅ Database connection test successful");
    return true;
  } catch (error) {
    console.error("❌ Database connection test failed:", error);
    return false;
  }
}