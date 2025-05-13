// src/services/trafficRepository.ts
import { eq, and, gte, lte, desc, sql, asc } from "drizzle-orm";
import { db } from "../drizzle/db.js";
import { trafficBillboard } from "../drizzle/schema.js";
/**
 * Mencatat data traffic baru
 */
export async function recordTraffic(data) {
    // Insert data
    await db.insert(trafficBillboard).values(data);
    // Ambil data terakhir yang diinsert berdasarkan timestamp dan billboard_name
    const lastInserted = await db.select()
        .from(trafficBillboard)
        .where(and(eq(trafficBillboard.billboard_name, data.billboard_name), eq(trafficBillboard.timestamp, data.timestamp)))
        .orderBy(desc(trafficBillboard.created_at))
        .limit(1);
    return lastInserted.length > 0 ? lastInserted[0].id : null;
}
/**
 * Mendapatkan data traffic berdasarkan billboard
 */
export async function getTrafficByBillboard(billboardName, limit = 100) {
    return await db.select()
        .from(trafficBillboard)
        .where(eq(trafficBillboard.billboard_name, billboardName))
        .orderBy(desc(trafficBillboard.timestamp))
        .limit(limit);
}
/**
 * Mendapatkan data traffic berdasarkan rentang tanggal dan billboard (opsional)
 */
export async function getTrafficByDateRange(startDate, endDate, billboardName) {
    // Basic where condition
    const whereCondition = and(gte(trafficBillboard.timestamp, startDate), lte(trafficBillboard.timestamp, endDate));
    // Jika billboard_name disediakan, tambahkan ke kondisi
    const fullCondition = billboardName
        ? and(whereCondition, eq(trafficBillboard.billboard_name, billboardName))
        : whereCondition;
    return await db.select()
        .from(trafficBillboard)
        .where(fullCondition)
        .orderBy(asc(trafficBillboard.timestamp))
        .execute();
}
/**
 * Mendapatkan data agregat untuk dashboard berdasarkan pengelompokan waktu
 * dan billboard (opsional)
 */
export async function getAggregatedTrafficData(groupBy, billboardName) {
    let timeFormat;
    switch (groupBy) {
        case "hour":
            timeFormat = sql `DATE_FORMAT(${trafficBillboard.timestamp}, '%Y-%m-%d %H:00')`;
            break;
        case "day":
            timeFormat = sql `DATE(${trafficBillboard.timestamp})`;
            break;
        case "week":
            timeFormat = sql `DATE_FORMAT(${trafficBillboard.timestamp}, '%Y-%u')`;
            break;
        case "month":
            timeFormat = sql `DATE_FORMAT(${trafficBillboard.timestamp}, '%Y-%m')`;
            break;
        default:
            timeFormat = sql `DATE(${trafficBillboard.timestamp})`;
    }
    // Buat select query dengan kondisi where jika billboard_name disediakan
    const selectQuery = billboardName
        ? db.select({
            time_period: timeFormat,
            motorcycle_down: sql `SUM(${trafficBillboard.motorcycle_down})`,
            motorcycle_up: sql `SUM(${trafficBillboard.motorcycle_up})`,
            car_down: sql `SUM(${trafficBillboard.car_down})`,
            car_up: sql `SUM(${trafficBillboard.car_up})`,
            big_vehicle_down: sql `SUM(${trafficBillboard.big_vehicle_down})`,
            big_vehicle_up: sql `SUM(${trafficBillboard.big_vehicle_up})`,
        })
            .from(trafficBillboard)
            .where(eq(trafficBillboard.billboard_name, billboardName))
        : db.select({
            time_period: timeFormat,
            motorcycle_down: sql `SUM(${trafficBillboard.motorcycle_down})`,
            motorcycle_up: sql `SUM(${trafficBillboard.motorcycle_up})`,
            car_down: sql `SUM(${trafficBillboard.car_down})`,
            car_up: sql `SUM(${trafficBillboard.car_up})`,
            big_vehicle_down: sql `SUM(${trafficBillboard.big_vehicle_down})`,
            big_vehicle_up: sql `SUM(${trafficBillboard.big_vehicle_up})`,
        })
            .from(trafficBillboard);
    return await selectQuery.groupBy(timeFormat).orderBy(asc(timeFormat));
}
/**
 * Mendapatkan statistik total kendaraan
 */
export async function getTrafficStatistics(billboardName) {
    // Buat select query dengan kondisi where jika billboard_name disediakan
    const selectQuery = billboardName
        ? db.select({
            total_motorcycle: sql `SUM(${trafficBillboard.motorcycle_down} + ${trafficBillboard.motorcycle_up})`,
            total_car: sql `SUM(${trafficBillboard.car_down} + ${trafficBillboard.car_up})`,
            total_big_vehicle: sql `SUM(${trafficBillboard.big_vehicle_down} + ${trafficBillboard.big_vehicle_up})`,
            total_up: sql `SUM(${trafficBillboard.motorcycle_up} + ${trafficBillboard.car_up} + ${trafficBillboard.big_vehicle_up})`,
            total_down: sql `SUM(${trafficBillboard.motorcycle_down} + ${trafficBillboard.car_down} + ${trafficBillboard.big_vehicle_down})`,
            total_all: sql `SUM(${trafficBillboard.motorcycle_down} + ${trafficBillboard.motorcycle_up} + ${trafficBillboard.car_down} + ${trafficBillboard.car_up} + ${trafficBillboard.big_vehicle_down} + ${trafficBillboard.big_vehicle_up})`,
        })
            .from(trafficBillboard)
            .where(eq(trafficBillboard.billboard_name, billboardName))
        : db.select({
            total_motorcycle: sql `SUM(${trafficBillboard.motorcycle_down} + ${trafficBillboard.motorcycle_up})`,
            total_car: sql `SUM(${trafficBillboard.car_down} + ${trafficBillboard.car_up})`,
            total_big_vehicle: sql `SUM(${trafficBillboard.big_vehicle_down} + ${trafficBillboard.big_vehicle_up})`,
            total_up: sql `SUM(${trafficBillboard.motorcycle_up} + ${trafficBillboard.car_up} + ${trafficBillboard.big_vehicle_up})`,
            total_down: sql `SUM(${trafficBillboard.motorcycle_down} + ${trafficBillboard.car_down} + ${trafficBillboard.big_vehicle_down})`,
            total_all: sql `SUM(${trafficBillboard.motorcycle_down} + ${trafficBillboard.motorcycle_up} + ${trafficBillboard.car_down} + ${trafficBillboard.car_up} + ${trafficBillboard.big_vehicle_down} + ${trafficBillboard.big_vehicle_up})`,
        })
            .from(trafficBillboard);
    const result = await selectQuery.execute();
    return result[0];
}
/**
 * Mendapatkan data terbaru per billboard
 */
export async function getLatestTrafficData() {
    // Sub-query untuk mendapatkan timestamp terbaru untuk setiap billboard
    const latestTimestampSubquery = db
        .select({
        billboard_name: trafficBillboard.billboard_name,
        latest_timestamp: sql `MAX(${trafficBillboard.timestamp})`,
    })
        .from(trafficBillboard)
        .groupBy(trafficBillboard.billboard_name)
        .as('latest_timestamps');
    // Join dengan tabel utama untuk mendapatkan data lengkap
    const result = await db
        .select()
        .from(trafficBillboard)
        .where(sql `(${trafficBillboard.billboard_name}, ${trafficBillboard.timestamp}) IN 
          (SELECT latest_timestamps.billboard_name, latest_timestamps.latest_timestamp 
           FROM ${latestTimestampSubquery})`)
        .execute();
    return result;
}
//# sourceMappingURL=trafficRepository.js.map