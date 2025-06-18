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

// Protected dashboard route - COMPLETE CMS DASHBOARD
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
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
</head>
<body class="bg-gray-50">
    <div class="flex h-screen">
        <!-- Sidebar -->
        <div class="w-64 bg-white shadow-lg">
            <div class="p-6">
                <h1 class="text-2xl font-bold text-blue-600">🎓 Placement CMS</h1>
                <p class="text-sm text-gray-500 mt-1">College Management</p>
            </div>
            
            <nav class="mt-6">
                <div class="px-6 py-2">
                    <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Main</p>
                </div>
                <a href="#" onclick="showSection('dashboard')" class="nav-item active flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                    <i class="fas fa-home w-5 h-5 mr-3"></i>
                    Dashboard
                </a>
                <a href="#" onclick="showSection('students')" class="nav-item flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                    <i class="fas fa-user-graduate w-5 h-5 mr-3"></i>
                    Students
                </a>
                <a href="#" onclick="showSection('companies')" class="nav-item flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                    <i class="fas fa-building w-5 h-5 mr-3"></i>
                    Companies
                </a>
                <a href="#" onclick="showSection('placements')" class="nav-item flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                    <i class="fas fa-handshake w-5 h-5 mr-3"></i>
                    Placements
                </a>
                <a href="#" onclick="showSection('tpo')" class="nav-item flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                    <i class="fas fa-user-tie w-5 h-5 mr-3"></i>
                    TPO Dashboard
                </a>
                <a href="#" onclick="showSection('eligibility')" class="nav-item flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                    <i class="fas fa-check-circle w-5 h-5 mr-3"></i>
                    Eligibility
                </a>
                <a href="#" onclick="showSection('whatsapp')" class="nav-item flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                    <i class="fab fa-whatsapp w-5 h-5 mr-3"></i>
                    WhatsApp
                </a>
                
                <div class="px-6 py-2 mt-6">
                    <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</p>
                </div>
                <form method="POST" action="/api/logout" class="px-6">
                    <button type="submit" class="w-full flex items-center py-3 text-gray-700 hover:bg-red-50 hover:text-red-600">
                        <i class="fas fa-sign-out-alt w-5 h-5 mr-3"></i>
                        Logout
                    </button>
                </form>
            </nav>
        </div>

        <!-- Main Content -->
        <div class="flex-1 flex flex-col overflow-hidden">
            <!-- Header -->
            <header class="bg-white shadow-sm border-b">
                <div class="flex items-center justify-between px-6 py-4">
                    <div>
                        <h2 id="page-title" class="text-2xl font-semibold text-gray-800">Dashboard</h2>
                        <p class="text-sm text-gray-600">Welcome back, ${user.username} (${user.role})</p>
                    </div>
                    <div class="flex items-center space-x-4">
                        <button class="p-2 text-gray-400 hover:text-gray-600">
                            <i class="fas fa-bell"></i>
                        </button>
                        <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            ${user.username.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>
            </header>

            <!-- Content Area -->
            <main class="flex-1 overflow-y-auto p-6">
                <!-- Dashboard Section -->
                <div id="dashboard-section" class="content-section">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div class="bg-white p-6 rounded-lg shadow">
                            <div class="flex items-center">
                                <div class="p-2 bg-blue-100 rounded-lg">
                                    <i class="fas fa-user-graduate text-blue-600 text-xl"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600">Total Students</p>
                                    <p class="text-2xl font-semibold text-gray-900">1,234</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-white p-6 rounded-lg shadow">
                            <div class="flex items-center">
                                <div class="p-2 bg-green-100 rounded-lg">
                                    <i class="fas fa-building text-green-600 text-xl"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600">Companies</p>
                                    <p class="text-2xl font-semibold text-gray-900">56</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-white p-6 rounded-lg shadow">
                            <div class="flex items-center">
                                <div class="p-2 bg-purple-100 rounded-lg">
                                    <i class="fas fa-handshake text-purple-600 text-xl"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600">Placements</p>
                                    <p class="text-2xl font-semibold text-gray-900">789</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-white p-6 rounded-lg shadow">
                            <div class="flex items-center">
                                <div class="p-2 bg-orange-100 rounded-lg">
                                    <i class="fas fa-chart-line text-orange-600 text-xl"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600">Success Rate</p>
                                    <p class="text-2xl font-semibold text-gray-900">85%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div class="bg-white p-6 rounded-lg shadow">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h3>
                            <div class="space-y-4">
                                <div class="flex items-center">
                                    <div class="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                    <p class="text-sm text-gray-600">New student registered: John Doe</p>
                                </div>
                                <div class="flex items-center">
                                    <div class="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                    <p class="text-sm text-gray-600">Company TechCorp added new job posting</p>
                                </div>
                                <div class="flex items-center">
                                    <div class="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                                    <p class="text-sm text-gray-600">Placement confirmed: Jane Smith at InnovateLabs</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-white p-6 rounded-lg shadow">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                            <div class="grid grid-cols-2 gap-4">
                                <button onclick="showSection('students')" class="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                                    <i class="fas fa-user-plus text-blue-600 text-xl mb-2"></i>
                                    <p class="text-sm font-medium text-blue-600">Add Student</p>
                                </button>
                                <button onclick="showSection('companies')" class="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                                    <i class="fas fa-building text-green-600 text-xl mb-2"></i>
                                    <p class="text-sm font-medium text-green-600">Add Company</p>
                                </button>
                                <button onclick="showSection('placements')" class="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                                    <i class="fas fa-handshake text-purple-600 text-xl mb-2"></i>
                                    <p class="text-sm font-medium text-purple-600">New Placement</p>
                                </button>
                                <button onclick="showSection('tpo')" class="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                                    <i class="fas fa-chart-bar text-orange-600 text-xl mb-2"></i>
                                    <p class="text-sm font-medium text-orange-600">View Reports</p>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Students Section -->
                <div id="students-section" class="content-section hidden">
                    <div class="bg-white rounded-lg shadow">
                        <div class="p-6 border-b">
                            <div class="flex justify-between items-center">
                                <h3 class="text-lg font-semibold text-gray-800">Student Management</h3>
                                <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                                    <i class="fas fa-plus mr-2"></i>Add Student
                                </button>
                            </div>
                        </div>
                        <div class="p-6">
                            <div class="overflow-x-auto">
                                <table class="min-w-full">
                                    <thead>
                                        <tr class="border-b">
                                            <th class="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                                            <th class="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                                            <th class="text-left py-3 px-4 font-medium text-gray-600">Course</th>
                                            <th class="text-left py-3 px-4 font-medium text-gray-600">Year</th>
                                            <th class="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                                            <th class="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr class="border-b hover:bg-gray-50">
                                            <td class="py-3 px-4">John Doe</td>
                                            <td class="py-3 px-4">john@example.com</td>
                                            <td class="py-3 px-4">Computer Science</td>
                                            <td class="py-3 px-4">2024</td>
                                            <td class="py-3 px-4"><span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Active</span></td>
                                            <td class="py-3 px-4">
                                                <button class="text-blue-600 hover:text-blue-800 mr-2"><i class="fas fa-edit"></i></button>
                                                <button class="text-red-600 hover:text-red-800"><i class="fas fa-trash"></i></button>
                                            </td>
                                        </tr>
                                        <tr class="border-b hover:bg-gray-50">
                                            <td class="py-3 px-4">Jane Smith</td>
                                            <td class="py-3 px-4">jane@example.com</td>
                                            <td class="py-3 px-4">Electronics</td>
                                            <td class="py-3 px-4">2024</td>
                                            <td class="py-3 px-4"><span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Placed</span></td>
                                            <td class="py-3 px-4">
                                                <button class="text-blue-600 hover:text-blue-800 mr-2"><i class="fas fa-edit"></i></button>
                                                <button class="text-red-600 hover:text-red-800"><i class="fas fa-trash"></i></button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Companies Section -->
                <div id="companies-section" class="content-section hidden">
                    <div class="bg-white rounded-lg shadow">
                        <div class="p-6 border-b">
                            <div class="flex justify-between items-center">
                                <h3 class="text-lg font-semibold text-gray-800">Company Management</h3>
                                <button class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                                    <i class="fas fa-plus mr-2"></i>Add Company
                                </button>
                            </div>
                        </div>
                        <div class="p-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div class="flex items-center mb-3">
                                        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <i class="fas fa-building text-blue-600"></i>
                                        </div>
                                        <div class="ml-3">
                                            <h4 class="font-medium text-gray-800">TechCorp Inc.</h4>
                                            <p class="text-sm text-gray-600">Technology</p>
                                        </div>
                                    </div>
                                    <p class="text-sm text-gray-600 mb-2">📍 San Francisco</p>
                                    <p class="text-sm text-gray-600 mb-3">✉️ hr@techcorp.com</p>
                                    <div class="flex space-x-2">
                                        <button class="text-blue-600 hover:text-blue-800"><i class="fas fa-edit"></i></button>
                                        <button class="text-green-600 hover:text-green-800"><i class="fas fa-eye"></i></button>
                                        <button class="text-red-600 hover:text-red-800"><i class="fas fa-trash"></i></button>
                                    </div>
                                </div>
                                
                                <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div class="flex items-center mb-3">
                                        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                            <i class="fas fa-building text-green-600"></i>
                                        </div>
                                        <div class="ml-3">
                                            <h4 class="font-medium text-gray-800">InnovateLabs</h4>
                                            <p class="text-sm text-gray-600">Software</p>
                                        </div>
                                    </div>
                                    <p class="text-sm text-gray-600 mb-2">📍 New York</p>
                                    <p class="text-sm text-gray-600 mb-3">✉️ careers@innovatelabs.com</p>
                                    <div class="flex space-x-2">
                                        <button class="text-blue-600 hover:text-blue-800"><i class="fas fa-edit"></i></button>
                                        <button class="text-green-600 hover:text-green-800"><i class="fas fa-eye"></i></button>
                                        <button class="text-red-600 hover:text-red-800"><i class="fas fa-trash"></i></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Placements Section -->
                <div id="placements-section" class="content-section hidden">
                    <div class="bg-white rounded-lg shadow">
                        <div class="p-6 border-b">
                            <div class="flex justify-between items-center">
                                <h3 class="text-lg font-semibold text-gray-800">Placement Management</h3>
                                <button class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                                    <i class="fas fa-plus mr-2"></i>Record Placement
                                </button>
                            </div>
                        </div>
                        <div class="p-6">
                            <div class="space-y-4">
                                <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div class="flex justify-between items-start">
                                        <div>
                                            <h4 class="font-medium text-gray-800">Jane Smith → InnovateLabs</h4>
                                            <p class="text-sm text-gray-600">Software Developer Position</p>
                                            <p class="text-sm text-gray-500 mt-1">Placed on: March 15, 2024</p>
                                        </div>
                                        <div class="text-right">
                                            <p class="font-medium text-green-600">₹12,00,000 LPA</p>
                                            <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Confirmed</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div class="flex justify-between items-start">
                                        <div>
                                            <h4 class="font-medium text-gray-800">Bob Johnson → TechCorp Inc.</h4>
                                            <p class="text-sm text-gray-600">Backend Engineer Position</p>
                                            <p class="text-sm text-gray-500 mt-1">Placed on: March 10, 2024</p>
                                        </div>
                                        <div class="text-right">
                                            <p class="font-medium text-green-600">₹15,00,000 LPA</p>
                                            <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Pending</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- TPO Section -->
                <div id="tpo-section" class="content-section hidden">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div class="bg-white rounded-lg shadow p-6">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">TPO Analytics</h3>
                            <div class="space-y-4">
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-600">Placement Target</span>
                                    <span class="font-medium">1000 students</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-600">Current Placements</span>
                                    <span class="font-medium text-green-600">789 students</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-gray-600">Remaining</span>
                                    <span class="font-medium text-orange-600">211 students</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-green-600 h-2 rounded-full" style="width: 78.9%"></div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-white rounded-lg shadow p-6">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">Recent Reports</h3>
                            <div class="space-y-3">
                                <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
                                    <span class="text-sm">Monthly Placement Report</span>
                                    <button class="text-blue-600 hover:text-blue-800">
                                        <i class="fas fa-download"></i>
                                    </button>
                                </div>
                                <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
                                    <span class="text-sm">Company Feedback Summary</span>
                                    <button class="text-blue-600 hover:text-blue-800">
                                        <i class="fas fa-download"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Eligibility Section -->
                <div id="eligibility-section" class="content-section hidden">
                    <div class="bg-white rounded-lg shadow">
                        <div class="p-6 border-b">
                            <h3 class="text-lg font-semibold text-gray-800">Eligibility Criteria Management</h3>
                        </div>
                        <div class="p-6">
                            <div class="space-y-4">
                                <div class="border rounded-lg p-4">
                                    <h4 class="font-medium text-gray-800 mb-2">TechCorp Inc. - Software Developer</h4>
                                    <div class="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span class="text-gray-600">Min CGPA:</span>
                                            <span class="font-medium ml-2">7.5</span>
                                        </div>
                                        <div>
                                            <span class="text-gray-600">Eligible Branches:</span>
                                            <span class="font-medium ml-2">CSE, IT, ECE</span>
                                        </div>
                                        <div>
                                            <span class="text-gray-600">Max Backlogs:</span>
                                            <span class="font-medium ml-2">0</span>
                                        </div>
                                        <div>
                                            <span class="text-gray-600">Eligible Students:</span>
                                            <span class="font-medium ml-2 text-green-600">234</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- WhatsApp Section -->
                <div id="whatsapp-section" class="content-section hidden">
                    <div class="bg-white rounded-lg shadow">
                        <div class="p-6 border-b">
                            <h3 class="text-lg font-semibold text-gray-800">WhatsApp Integration</h3>
                        </div>
                        <div class="p-6">
                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <h4 class="font-medium text-gray-800 mb-4">Send Notifications</h4>
                                    <div class="space-y-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">Message Type</label>
                                            <select class="w-full border border-gray-300 rounded-lg px-3 py-2">
                                                <option>Placement Update</option>
                                                <option>Interview Schedule</option>
                                                <option>Document Reminder</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
                                            <select class="w-full border border-gray-300 rounded-lg px-3 py-2">
                                                <option>All Students</option>
                                                <option>Final Year Students</option>
                                                <option>Eligible Students</option>
                                            </select>
                                        </div>
                                        <button class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                                            <i class="fab fa-whatsapp mr-2"></i>Send Message
                                        </button>
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 class="font-medium text-gray-800 mb-4">Recent Messages</h4>
                                    <div class="space-y-3">
                                        <div class="p-3 bg-green-50 rounded border-l-4 border-green-500">
                                            <p class="text-sm font-medium">Interview Schedule - TechCorp</p>
                                            <p class="text-xs text-gray-600">Sent to 45 students • 2 hours ago</p>
                                        </div>
                                        <div class="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                                            <p class="text-sm font-medium">Document Submission Reminder</p>
                                            <p class="text-xs text-gray-600">Sent to 123 students • 1 day ago</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <script>
        function showSection(sectionName) {
            // Hide all sections
            const sections = document.querySelectorAll('.content-section');
            sections.forEach(section => section.classList.add('hidden'));
            
            // Show selected section
            document.getElementById(sectionName + '-section').classList.remove('hidden');
            
            // Update navigation
            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => item.classList.remove('active', 'bg-blue-50', 'text-blue-600'));
            
            // Add active class to clicked nav item
            event.target.closest('.nav-item').classList.add('active', 'bg-blue-50', 'text-blue-600');
            
            // Update page title
            const titles = {
                'dashboard': 'Dashboard',
                'students': 'Student Management',
                'companies': 'Company Management', 
                'placements': 'Placement Management',
                'tpo': 'TPO Dashboard',
                'eligibility': 'Eligibility Management',
                'whatsapp': 'WhatsApp Integration'
            };
            
            document.getElementById('page-title').textContent = titles[sectionName] || 'Dashboard';
        }
        
        // Initialize with dashboard active
        document.addEventListener('DOMContentLoaded', function() {
            showSection('dashboard');
        });
    </script>

    <style>
        .nav-item.active {
            background-color: #eff6ff;
            color: #2563eb;
            border-right: 3px solid #2563eb;
        }
    </style>
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
