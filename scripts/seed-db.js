
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcrypt";
import { users, restaurants, menuItems } from "../shared/schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function seedDatabase() {
  console.log("Seeding database...");
  
  try {
    // Create admin user
    const adminPassword = await bcrypt.hash("admin123", 10);
    await db.insert(users).values({
      username: "admin",
      email: "admin@example.com",
      password: adminPassword,
      role: "admin",
    });

    // Create sample customer
    const customerPassword = await bcrypt.hash("customer123", 10);
    await db.insert(users).values({
      username: "customer",
      email: "customer@example.com",
      password: customerPassword,
      role: "customer",
    });

    // Create sample driver
    const driverPassword = await bcrypt.hash("driver123", 10);
    await db.insert(users).values({
      username: "driver",
      email: "driver@example.com",
      password: driverPassword,
      role: "driver",
    });

    // Create sample restaurants
    const restaurantData = [
      {
        name: "Spice Palace",
        description: "Authentic Sri Lankan cuisine",
        address: "123 Main Street, Colombo",
        phone: "+94701234567",
      },
      {
        name: "Rice & Curry House",
        description: "Traditional rice and curry",
        address: "456 Galle Road, Colombo",
        phone: "+94707654321",
      },
    ];

    const insertedRestaurants = await db.insert(restaurants).values(restaurantData).returning();

    // Create sample menu items
    const menuItemsData = [
      {
        restaurantId: insertedRestaurants[0].id,
        name: "Chicken Curry",
        description: "Spicy chicken curry with coconut milk",
        price: "850.00",
        category: "Main Course",
      },
      {
        restaurantId: insertedRestaurants[0].id,
        name: "Fish Curry",
        description: "Fresh fish curry with spices",
        price: "950.00",
        category: "Main Course",
      },
      {
        restaurantId: insertedRestaurants[0].id,
        name: "Kottu Roti",
        description: "Chopped roti with vegetables and meat",
        price: "750.00",
        category: "Main Course",
      },
      {
        restaurantId: insertedRestaurants[1].id,
        name: "Rice and Curry",
        description: "Traditional rice with mixed curries",
        price: "650.00",
        category: "Main Course",
      },
      {
        restaurantId: insertedRestaurants[1].id,
        name: "Hoppers",
        description: "Bowl-shaped pancakes with curry",
        price: "450.00",
        category: "Breakfast",
      },
    ];

    await db.insert(menuItems).values(menuItemsData);

    console.log("Database seeded successfully!");
    console.log("Login credentials:");
    console.log("Admin: admin / admin123");
    console.log("Customer: customer / customer123");
    console.log("Driver: driver / driver123");

  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seedDatabase();
