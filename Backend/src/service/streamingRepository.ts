// src/services/streamingRepository.ts
import { eq, and, gte, desc } from "drizzle-orm";
import { db } from "../drizzle/db.js";
import { streaming } from "../drizzle/schema.js";

/**
 * Tipe data untuk input streaming
 */
export interface StreamingInput {
  link: string;
  expired_at: Date;
  id_traffic_billboard: number;
  billboard_name: string;
}

/**
 * Membuat link streaming baru
 */
export async function createStreamingLink(data: StreamingInput) {
  // Insert data dan kemudian query untuk mendapatkan ID terakhir
  await db.insert(streaming).values(data);
  
  // Ambil data streaming terakhir yang baru saja dimasukkan
  // Berdasarkan kombinasi unik dari input data (link + billboard_name)
  const lastInserted = await db.select()
    .from(streaming)
    .where(
      and(
        eq(streaming.link, data.link),
        eq(streaming.billboard_name, data.billboard_name),
        eq(streaming.id_traffic_billboard, data.id_traffic_billboard)
      )
    )
    .orderBy(desc(streaming.created_at))
    .limit(1);
  
  return lastInserted.length > 0 ? lastInserted[0].id : null;
}

/**
 * Mendapatkan semua link streaming yang aktif
 */
export async function getActiveStreamingLinks() {
  const now = new Date();
  return await db.select()
    .from(streaming)
    .where(gte(streaming.expired_at, now))
    .orderBy(desc(streaming.created_at));
}

/**
 * Mendapatkan link streaming aktif berdasarkan billboard
 */
export async function getActiveStreamingLinkByBillboard(billboardName: string) {
  const now = new Date();
  const result = await db.select()
    .from(streaming)
    .where(
      and(
        eq(streaming.billboard_name, billboardName),
        gte(streaming.expired_at, now)
      )
    )
    .orderBy(desc(streaming.created_at))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

/**
 * Memperbarui link streaming
 */
export async function updateStreamingLink(id: number, data: Partial<StreamingInput>) {
  await db.update(streaming)
    .set(data)
    .where(eq(streaming.id, id));
  
  // Ambil data yang sudah diupdate
  const result = await db.select()
    .from(streaming)
    .where(eq(streaming.id, id))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

/**
 * Menghapus link streaming
 */
export async function deleteStreamingLink(id: number) {
  await db.delete(streaming)
    .where(eq(streaming.id, id));
}