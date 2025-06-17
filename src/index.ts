"use client"

import { Hono } from "hono"
import { cors } from "hono/cors"
import { serveStatic } from "hono/cloudflare-workers"

type Bindings = {
  PLACEMENT_DATA: KVNamespace
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS
app.use("*", cors())

// Serve static files
app.use("/static/*", serveStatic({ root: "./" }))

// API Routes
app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  })
})

app.get("/api/students", async (c) => {
  // Example of using D1 database
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM students LIMIT 10").all()

    return c.json({ students: results || [] })
  } catch (error) {
    // Return mock data if DB is not set up yet
    return c.json({
      students: [
        { id: 1, name: "John Doe", email: "john@example.com", course: "Computer Science" },
        { id: 2, name: "Jane Smith", email: "jane@example.com", course: "Electronics" },
        { id: 3, name: "Bob Johnson", email: "bob@example.com", course: "Mechanical" },
      ],
    })
  }
})

// Companies API
app.get("/api/companies", async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM companies ORDER BY created_at DESC").all()

    return c.json({
      success: true,
      data: results,
      count: results.length,
    })
  } catch (error) {
    return c.json(
      {
        success: false,
        error: "Failed to fetch companies",
      },
      500,
    )
  }
})

app.post("/api/companies", async (c) => {
  try {
    const body = await c.req.json()
    const { name, industry, location, contact_email, requirements } = body

    const result = await c.env.DB.prepare(
      "INSERT INTO companies (name, industry, location, contact_email, requirements, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    )
      .bind(name, industry, location, contact_email, requirements, new Date().toISOString())
      .run()

    return c.json({
      success: true,
      message: "Company added successfully",
      id: result.meta.last_row_id,
    })
  } catch (error) {
    return c.json(
      {
        success: false,
        error: "Failed to add company",
      },
      500,
    )
  }
})

// Placements API
app.get("/api/placements", async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT p.*, s.name as student_name, c.name as company_name 
      FROM placements p 
      JOIN students s ON p.student_id = s.id 
      JOIN companies c ON p.company_id = c.id 
      ORDER BY p.created_at DESC
    `).all()

    return c.json({
      success: true,
      data: results,
      count: results.length,
    })
  } catch (error) {
    return c.json(
      {
        success: false,
        error: "Failed to fetch placements",
      },
      500,
    )
  }
})

// Dashboard stats
app.get("/api/stats", async (c) => {
  try {
    const [studentsCount, companiesCount, placementsCount] = await Promise.all([
      c.env.DB.prepare("SELECT COUNT(*) as count FROM students").first(),
      c.env.DB.prepare("SELECT COUNT(*) as count FROM companies").first(),
      c.env.DB.prepare("SELECT COUNT(*) as count FROM placements").first(),
    ])

    return c.json({
      success: true,
      data: {
        students: studentsCount?.count || 0,
        companies: companiesCount?.count || 0,
        placements: placementsCount?.count || 0,
        success_rate: placementsCount?.count > 0 ? Math.round((placementsCount.count / studentsCount?.count) * 100) : 0,
      },
    })
  } catch (error) {
    return c.json(
      {
        success: false,
        error: "Failed to fetch stats",
      },
      500,
    )
  }
})

// Main app route - serve the React app
app.get("*", (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Placement CMS</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-50">
      <div class="min-h-screen flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 class="text-3xl font-bold text-blue-600 mb-4">🎓 Placement CMS</h1>
          <p class="text-gray-600 mb-6">College Placement Management System</p>
          
          <div class="bg-green-100 p-4 rounded-lg mb-6">
            <p class="text-green-800 font-medium">✅ Successfully deployed on Cloudflare!</p>
          </div>
          
          <div class="space-y-4">
            <div class="bg-blue-50 p-4 rounded-lg">
              <h3 class="font-medium text-blue-800">API Endpoints:</h3>
              <ul class="mt-2 space-y-1 text-sm">
                <li><code class="bg-blue-100 px-2 py-1 rounded">/api/health</code> - Check API status</li>
                <li><code class="bg-blue-100 px-2 py-1 rounded">/api/students</code> - Get student data</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `)
})

// Export for Cloudflare Workers
export default app
