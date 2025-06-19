import { safeQuery } from "./neon-client"

export async function setupDatabase() {
  console.log("🔧 Setting up Neon database...")

  try {
    // Test connection first
    const testResult = await safeQuery("SELECT 1 as test")

    if (!testResult.success) {
      throw new Error("Database connection failed")
    }

    console.log("✅ Database connection successful")

    // Create tables
    const createTables = `
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        course VARCHAR(100),
        year INTEGER,
        cgpa DECIMAL(3,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        industry VARCHAR(100),
        location VARCHAR(255),
        website VARCHAR(255),
        contact_person VARCHAR(255),
        contact_email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS placements (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id),
        company_id INTEGER REFERENCES companies(id),
        position VARCHAR(255),
        package DECIMAL(10,2),
        placement_date DATE,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    const result = await safeQuery(createTables)

    if (result.success) {
      console.log("✅ Database tables created successfully")
      return { success: true, message: "Database setup complete" }
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    console.error("❌ Database setup failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
