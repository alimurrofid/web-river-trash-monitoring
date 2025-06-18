import { db } from "../drizzle/db.js";
import { users, trafficWaste } from "../drizzle/schema.js";
import { hash } from "bcryptjs";

// Seeder untuk Users
async function seedUsers() {
  try {
    const hashedPassword = await hash("admin", 10);

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

// Seeder untuk Traffic Waste
async function seedTrafficWaste() {
  try {
    const now = new Date();

    await db.insert(trafficWaste).values([
      {
        timestamp: now,
        plastic_makro: 10,
        plastic_meso: 5,
        nonplastic_makro: 3,
        nonplastic_meso: 1,
      },
      {
        timestamp: now,
        plastic_makro: 7,
        plastic_meso: 8,
        nonplastic_makro: 2,
        nonplastic_meso: 0,
      },
    ]);

    console.log("✅ Traffic waste seeding selesai.");
  } catch (err) {
    console.error("❌ Error saat seeding traffic waste:", err);
  }
}

// Jalankan keduanya
async function seedAll() {
  await seedUsers();
  // await seedTrafficWaste();
  process.exit(0);
}

seedAll();
