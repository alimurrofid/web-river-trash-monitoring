import { eq } from "drizzle-orm";
import { db } from "../drizzle/db.js";
import { users } from "../drizzle/schema.js";
import bcrypt from "bcrypt";
/**
 * Cari user berdasarkan email
 */
export async function findUserByEmail(email) {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result.length > 0 ? result[0] : null;
}
/**
 * Cari user berdasarkan ID
 */
export async function findUserById(id) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
}
/**
 * Membuat user baru
 */
export async function createUser(email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insert user baru
    await db.insert(users).values({
        email,
        password: hashedPassword,
    });
    // Dapatkan user yang baru dibuat
    const newUser = await findUserByEmail(email);
    return newUser;
}
/**
 * Memvalidasi password
 */
export async function validatePassword(email, password) {
    const user = await findUserByEmail(email);
    if (!user) {
        return false;
    }
    return await bcrypt.compare(password, user.password);
}
/**
 * Mendapatkan semua user (untuk admin)
 */
export async function getAllUsers() {
    return await db.select({
        id: users.id,
        email: users.email,
        created_at: users.created_at
    }).from(users);
}
//# sourceMappingURL=userRepository.js.map