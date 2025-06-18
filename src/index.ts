import { Hono } from "hono"
import { cors } from "hono/cors"
import { setCookie, getCookie } from "hono/cookie"

// Define the environment bindings
interface Env {
  PLACEMENT_DATA?: KVNamespace
  DB?: D1Database
}

// Create the Hono app with proper typing
const app = new Hono<{ Bindings: Env }>()

// Enable CORS for all routes
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
)

// Sample credentials for demo
const validCredentials = [
  { username: "admin", password: "admin123", role: "Administrator" },
  { username: "tpo", password: "tpo123", role: "TPO Officer" },
  { username: "coordinator", password: "coord123", role: "Coordinator" },
  { username: "staff", password: "staff123", role: "Staff" },
]

// Authentication middleware
const requireAuth = async (c: any, next: any) => {
  const token = getCookie(c, "auth_token")
  if (!token || token !== "authenticated") {
    return c.redirect("/login")
  }
  await next()
}

// Login page route
app.get("/login", (c) => {
  const error = c.req.query("error")

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Placement CMS</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-xl w-96 max-w-md">
        <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-blue-600 mb-2">🎓 PlacementCMS</h1>
            <p class="text-gray-600">Admin Login Portal</p>
        </div>
        
        ${
          error
            ? `
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <i class="fas fa-exclamation-circle mr-2"></i>
            Invalid username or password
        </div>
        `
            : ""
        }
        
        <form method="POST" action="/api/login" class="space-y-6">
            <div>
                <label class="block text-gray-700 text-sm font-medium mb-2">
                    <i class="fas fa-user mr-2"></i>Username
                </label>
                <input
                    type="text"
                    name="username"
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your username"
                />
            </div>
            
            <div>
                <label class="block text-gray-700 text-sm font-medium mb-2">
                    <i class="fas fa-lock mr-2"></i>Password
                </label>
                <input
                    type="password"
                    name="password"
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                />
            </div>
            
            <button
                type="submit"
                class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
                <i class="fas fa-sign-in-alt mr-2"></i>Login
            </button>
        </form>
        
        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 class="font-medium text-gray-800 mb-2">Demo Credentials:</h3>
            <div class="text-sm space-y-1">
                <div><strong>Admin:</strong> admin / admin123</div>
                <div><strong>TPO:</strong> tpo / tpo123</div>
                <div><strong>Coordinator:</strong> coordinator / coord123</div>
                <div><strong>Staff:</strong> staff / staff123</div>
            </div>
        </div>
        
        <div class="mt-4 text-center text-sm text-gray-500">
            <i class="fas fa-shield-alt mr-1"></i>
            Powered by Cloudflare Workers
        </div>
    </div>
</body>
</html>`

  return c.html(html)
})

// Login API endpoint
app.post("/api/login", async (c) => {
  try {
    const body = await c.req.formData()
    const username = body.get("username")?.toString()
    const password = body.get("password")?.toString()

    if (!username || !password) {
      return c.redirect("/login?error=missing")
    }

    const user = validCredentials.find((cred) => cred.username === username && cred.password === password)

    if (user) {
      // Set authentication cookie
      setCookie(c, "auth_token", "authenticated", {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 86400, // 24 hours
      })

      // Set user info cookie
      setCookie(
        c,
        "user_info",
        JSON.stringify({
          username: user.username,
          role: user.role,
        }),
        {
          httpOnly: false,
          secure: true,
          sameSite: "Strict",
          maxAge: 86400,
        },
      )

      return c.redirect("/dashboard")
    } else {
      return c.redirect("/login?error=invalid")
    }
  } catch (error) {
    console.error("Login error:", error)
    return c.redirect("/login?error=server")
  }
})

// Logout endpoint
app.post("/api/logout", (c) => {
  setCookie(c, "auth_token", "", { maxAge: 0 })
  setCookie(c, "user_info", "", { maxAge: 0 })
  return c.redirect("/login")
})

// Protected dashboard route
app.get("/dashboard", requireAuth, (c) => {
  const userInfo = getCookie(c, "user_info")
  let user = { username: "User", role: "User" }

  try {
    if (userInfo) {
      user = JSON.parse(userInfo)
    }
  } catch (e) {
    console.error("Error parsing user info:", e)
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Placement CMS</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-4">
                <div class="flex items-center">
                    <h1 class="text-2xl font-bold text-blue-600">🎓 Placement CMS</h1>
                </div>
                <div class="flex items-center space-x-4">
                    <div class="text-sm">
                        <span class="text-gray-600">Welcome,</span>
                        <span class="font-medium text-gray-900">${user.username}</span>
                        <span class="text-xs text-gray-500 ml-1">(${user.role})</span>
                    </div>
                    <form method="POST" action="/api/logout" class="inline">
                        <button type="submit" class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm">
                            <i class="fas fa-sign-out-alt mr-1"></i>Logout
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </header>

    <div class="container mx-auto px-4 py-8">
        <div class="max-w-6xl mx-auto">
            <!-- Welcome Message -->
            <div class="bg-white rounded-lg shadow-xl p-6 mb-8">
                <div class="text-center">
                    <h2 class="text-3xl font-bold text-gray-800 mb-2">Welcome to Your Dashboard</h2>
                    <p class="text-gray-600">College Placement Management System</p>
                    <div class="inline-flex items-center bg-green-100 px-4 py-2 rounded-full mt-4">
                        <span class="text-green-800 font-semibold">✅ Successfully Authenticated</span>
                    </div>
                </div>
            </div>
            
            <!-- Stats Grid -->
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" id="stats-grid">
                <div class="bg-blue-100 p-6 rounded-lg text-center hover:shadow-lg transition-shadow">
                    <div class="text-4xl mb-3">👥</div>
                    <h3 class="text-xl font-bold text-blue-800 mb-2">Students</h3>
                    <p class="text-blue-600 mb-2">Registered students</p>
                    <div class="text-2xl font-bold text-blue-700" id="students-count">Loading...</div>
                </div>
                
                <div class="bg-green-100 p-6 rounded-lg text-center hover:shadow-lg transition-shadow">
                    <div class="text-4xl mb-3">🏢</div>
                    <h3 class="text-xl font-bold text-green-800 mb-2">Companies</h3>
                    <p class="text-green-600 mb-2">Partner companies</p>
                    <div class="text-2xl font-bold text-green-700" id="companies-count">Loading...</div>
                </div>
                
                <div class="bg-purple-100 p-6 rounded-lg text-center hover:shadow-lg transition-shadow">
                    <div class="text-4xl mb-3">✅</div>
                    <h3 class="text-xl font-bold text-purple-800 mb-2">Placements</h3>
                    <p class="text-purple-600 mb-2">Successful placements</p>
                    <div class="text-2xl font-bold text-purple-700" id="placements-count">Loading...</div>
                </div>
                
                <div class="bg-orange-100 p-6 rounded-lg text-center hover:shadow-lg transition-shadow">
                    <div class="text-4xl mb-3">📊</div>
                    <h3 class="text-xl font-bold text-orange-800 mb-2">Success Rate</h3>
                    <p class="text-orange-600 mb-2">Placement success</p>
                    <div class="text-2xl font-bold text-orange-700" id="success-rate">Loading...</div>
                </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="bg-white rounded-lg shadow-xl p-6 mb-8">
                <h3 class="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
                <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button class="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors">
                        <i class="fas fa-user-plus text-2xl mb-2"></i>
                        <div class="font-medium">Add Student</div>
                    </button>
                    <button class="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition-colors">
                        <i class="fas fa-building text-2xl mb-2"></i>
                        <div class="font-medium">Add Company</div>
                    </button>
                    <button class="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 transition-colors">
                        <i class="fas fa-handshake text-2xl mb-2"></i>
                        <div class="font-medium">New Placement</div>
                    </button>
                    <button class="bg-orange-500 text-white p-4 rounded-lg hover:bg-orange-600 transition-colors">
                        <i class="fas fa-chart-bar text-2xl mb-2"></i>
                        <div class="font-medium">View Reports</div>
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // Load dashboard stats
        async function loadStats() {
            try {
                const response = await fetch('/api/stats');
                const result = await response.json();
                
                if (result.success) {
                    const stats = result.data;
                    document.getElementById('students-count').textContent = stats.students.toLocaleString();
                    document.getElementById('companies-count').textContent = stats.companies.toLocaleString();
                    document.getElementById('placements-count').textContent = stats.placements.toLocaleString();
                    document.getElementById('success-rate').textContent = stats.success_rate + '%';
                }
            } catch (error) {
                console.error('Error loading stats:', error);
            }
        }
        
        document.addEventListener('DOMContentLoaded', loadStats);
    </script>
</body>
</html>`

  return c.html(html)
})

// Health check endpoint
app.get("/api/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "Placement CMS API",
    version: "1.0.0",
  })
})

// Students API endpoint
app.get("/api/students", async (c) => {
  try {
    if (c.env.DB) {
      const { results } = await c.env.DB.prepare("SELECT * FROM students ORDER BY created_at DESC LIMIT 10").all()
      return c.json({
        success: true,
        data: results || [],
        source: "database",
      })
    } else {
      return c.json({
        success: true,
        data: [
          { id: 1, name: "John Doe", email: "john@example.com", course: "Computer Science", year: "2024" },
          { id: 2, name: "Jane Smith", email: "jane@example.com", course: "Electronics", year: "2024" },
          { id: 3, name: "Bob Johnson", email: "bob@example.com", course: "Mechanical", year: "2023" },
          { id: 4, name: "Alice Brown", email: "alice@example.com", course: "Information Technology", year: "2024" },
          { id: 5, name: "Charlie Wilson", email: "charlie@example.com", course: "Civil Engineering", year: "2023" },
        ],
        source: "mock",
      })
    }
  } catch (error) {
    console.error("Error fetching students:", error)
    return c.json(
      {
        success: false,
        error: "Failed to fetch students",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    )
  }
})

// Companies API endpoint
app.get("/api/companies", async (c) => {
  try {
    if (c.env.DB) {
      const { results } = await c.env.DB.prepare("SELECT * FROM companies ORDER BY created_at DESC LIMIT 10").all()
      return c.json({
        success: true,
        data: results || [],
        source: "database",
      })
    } else {
      return c.json({
        success: true,
        data: [
          {
            id: 1,
            name: "TechCorp Inc.",
            industry: "Technology",
            location: "San Francisco",
            contact_email: "hr@techcorp.com",
          },
          {
            id: 2,
            name: "InnovateLabs",
            industry: "Software",
            location: "New York",
            contact_email: "careers@innovatelabs.com",
          },
          {
            id: 3,
            name: "DataSystems Ltd.",
            industry: "Data Analytics",
            location: "Austin",
            contact_email: "jobs@datasystems.com",
          },
        ],
        source: "mock",
      })
    }
  } catch (error) {
    console.error("Error fetching companies:", error)
    return c.json(
      {
        success: false,
        error: "Failed to fetch companies",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    )
  }
})

// Dashboard stats endpoint
app.get("/api/stats", async (c) => {
  try {
    if (c.env.DB) {
      const [studentsResult, companiesResult, placementsResult] = await Promise.all([
        c.env.DB.prepare("SELECT COUNT(*) as count FROM students").first(),
        c.env.DB.prepare("SELECT COUNT(*) as count FROM companies").first(),
        c.env.DB.prepare("SELECT COUNT(*) as count FROM placements").first(),
      ])

      const students = (studentsResult as any)?.count || 0
      const companies = (companiesResult as any)?.count || 0
      const placements = (placementsResult as any)?.count || 0

      return c.json({
        success: true,
        data: {
          students,
          companies,
          placements,
          success_rate: students > 0 ? Math.round((placements / students) * 100) : 0,
        },
        source: "database",
      })
    } else {
      return c.json({
        success: true,
        data: {
          students: 1234,
          companies: 56,
          placements: 789,
          success_rate: 85,
        },
        source: "mock",
      })
    }
  } catch (error) {
    console.error("Error fetching stats:", error)
    return c.json(
      {
        success: false,
        error: "Failed to fetch stats",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    )
  }
})

// Root route - redirect to login or dashboard based on auth
app.get("/", (c) => {
  const token = getCookie(c, "auth_token")
  if (token === "authenticated") {
    return c.redirect("/dashboard")
  } else {
    return c.redirect("/login")
  }
})

// Catch all other routes
app.get("*", (c) => {
  return c.redirect("/login")
})

// Export the app for Cloudflare Workers
export default app
