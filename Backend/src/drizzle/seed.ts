import { db } from "../drizzle/db.js"; // Sesuaikan path jika berbeda
import { users } from "../drizzle/schema.js"; // Sesuaikan path
import { hash } from "bcryptjs";

async function seedUsers() {
  try {
    // Enkripsi password
    const hashedPassword = await hash("admin", 10); // 10 adalah salt rounds

    await db.insert(users).values([
      {
        email: "admin@gmail.com",
        password: hashedPassword,
      },
    ]);

    console.log("✅ User seeding selesai.");
  } catch (err) {
    console.error("❌ Error saat seeding users:", err);
  }
}

seedUsers();
