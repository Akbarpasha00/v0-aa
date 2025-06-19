import { Hono } from "hono"
import { cors } from "hono/cors"
import { setCookie, getCookie, deleteCookie } from "hono/cookie"
import { sign, verify } from "hono/jwt"
import type { KVNamespace, D1Database } from "@cloudflare/workers-types"

// Define the environment bindings
interface Env {
  PLACEMENT_DATA?: KVNamespace
  DB?: D1Database
  JWT_SECRET: string
  MICROSOFT_CLIENT_ID: string
  MICROSOFT_CLIENT_SECRET: string
  MICROSOFT_TENANT_ID: string
  REDIRECT_URI: string
}

// Create the Hono app with proper typing
const app = new Hono<{ Bindings: Env }>()

// Enable CORS for all routes
app.use(
  "*",
  cors({
    origin: ["https://agilevu.com", "https://dashboard.agilevu.com", "https://login.microsoftonline.com"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "Cookie"],
    credentials: true,
  }),
)

// Microsoft Graph API endpoints
const MICROSOFT_AUTH_URL = "https://login.microsoftonline.com"
const GRAPH_API_URL = "https://graph.microsoft.com/v1.0"

// Authentication middleware
const requireAuth = async (c: any, next: any) => {
  try {
    const token = getCookie(c, "auth_token")
    if (!token) {
      return c.redirect("https://agilevu.com/login")
    }

    const payload = await verify(token, c.env.JWT_SECRET)
    if (!payload || !payload.sub) {
      return c.redirect("https://agilevu.com/login")
    }

    c.set("user", payload)
    await next()
  } catch (error) {
    console.error("Auth error:", error)
    return c.redirect("https://agilevu.com/login")
  }
}

// Root route - redirect based on subdomain
app.get("/", (c) => {
  const host = c.req.header("host") || ""

  if (host.includes("dashboard.")) {
    return c.redirect("/dashboard")
  } else {
    return c.redirect("/login")
  }
})

// Login page route (main domain only)
app.get("/login", (c) => {
  const host = c.req.header("host") || ""

  // Redirect dashboard subdomain to main domain for login
  if (host.includes("dashboard.")) {
    return c.redirect("https://agilevu.com/login")
  }

  const error = c.req.query("error")
  const errorDescription = c.req.query("error_description")

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Secure Login - Placement CMS</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        .login-container {
            background: linear-gradient(135deg, #0078d4 0%, #106ebe 50%, #005a9e 100%);
            min-height: 100vh;
        }
        .login-card {
            backdrop-filter: blur(15px);
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .microsoft-btn {
            background: linear-gradient(135deg, #0078d4 0%, #106ebe 100%);
            transition: all 0.3s ease;
        }
        .microsoft-btn:hover {
            background: linear-gradient(135deg, #106ebe 0%, #005a9e 100%);
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 120, 212, 0.3);
        }
        .security-badge {
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        .feature-item {
            transition: transform 0.2s ease;
        }
        .feature-item:hover {
            transform: translateX(5px);
        }
    </style>
</head>
<body class="login-container flex items-center justify-center p-4">
    <div class="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        <!-- Left Side - Branding & Features -->
        <div class="text-white space-y-8">
            <div>
                <div class="flex items-center mb-6">
                    <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                        <i class="fas fa-graduation-cap text-white text-2xl"></i>
                    </div>
                    <div>
                        <h1 class="text-4xl font-bold">Placement CMS</h1>
                        <p class="text-blue-100">College Placement Management System</p>
                    </div>
                </div>
                <div class="w-24 h-1 bg-white bg-opacity-30 rounded-full"></div>
            </div>

            <div class="space-y-6">
                <h2 class="text-2xl font-semibold">Enterprise-Grade Security</h2>
                
                <div class="space-y-4">
                    <div class="feature-item flex items-center">
                        <div class="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                            <i class="fas fa-shield-alt text-white"></i>
                        </div>
                        <div>
                            <h3 class="font-medium">Microsoft Authenticator</h3>
                            <p class="text-blue-100 text-sm">Multi-factor authentication required</p>
                        </div>
                    </div>
                    
                    <div class="feature-item flex items-center">
                        <div class="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                            <i class="fas fa-cloud text-white"></i>
                        </div>
                        <div>
                            <h3 class="font-medium">Azure AD Integration</h3>
                            <p class="text-blue-100 text-sm">Enterprise identity management</p>
                        </div>
                    </div>
                    
                    <div class="feature-item flex items-center">
                        <div class="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                            <i class="fas fa-lock text-white"></i>
                        </div>
                        <div>
                            <h3 class="font-medium">Zero Trust Security</h3>
                            <p class="text-blue-100 text-sm">Verify every access request</p>
                        </div>
                    </div>
                    
                    <div class="feature-item flex items-center">
                        <div class="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                            <i class="fas fa-mobile-alt text-white"></i>
                        </div>
                        <div>
                            <h3 class="font-medium">Mobile App Required</h3>
                            <p class="text-blue-100 text-sm">Microsoft Authenticator app needed</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right Side - Login Form -->
        <div class="login-card p-8 rounded-2xl shadow-2xl">
            <div class="text-center mb-8">
                <div class="security-badge w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-shield-check text-white text-3xl"></i>
                </div>
                <h2 class="text-2xl font-bold text-gray-800 mb-2">Secure Access</h2>
                <p class="text-gray-600">Microsoft Authenticator Required</p>
                <div class="w-16 h-1 bg-gradient-to-r from-blue-500 to-green-500 mx-auto mt-3 rounded-full"></div>
            </div>
            
            <!-- Error Message -->
            ${
              error
                ? `
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                <i class="fas fa-exclamation-triangle mr-3 text-red-500"></i>
                <div>
                    <p class="font-medium">Authentication Failed</p>
                    <p class="text-sm">${errorDescription || "Please try again with Microsoft Authenticator."}</p>
                </div>
            </div>
            `
                : ""
            }
            
            <!-- Microsoft Login Button -->
            <div class="space-y-6">
                <button
                    onclick="loginWithMicrosoft()"
                    class="microsoft-btn w-full py-4 px-6 text-white rounded-lg font-semibold shadow-lg flex items-center justify-center space-x-3"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" fill="white"/>
                    </svg>
                    <span>Continue with Microsoft</span>
                    <i class="fas fa-arrow-right"></i>
                </button>
                
                <div class="text-center">
                    <p class="text-sm text-gray-500">
                        <i class="fas fa-info-circle mr-1"></i>
                        You'll be redirected to Microsoft login
                    </p>
                </div>
            </div>
            
            <!-- Requirements -->
            <div class="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 class="font-semibold text-blue-800 mb-3 flex items-center">
                    <i class="fas fa-mobile-alt mr-2"></i>
                    Requirements
                </h4>
                <ul class="space-y-2 text-sm text-blue-700">
                    <li class="flex items-center">
                        <i class="fas fa-check-circle mr-2 text-green-600"></i>
                        Microsoft Authenticator app installed
                    </li>
                    <li class="flex items-center">
                        <i class="fas fa-check-circle mr-2 text-green-600"></i>
                        Valid organizational account
                    </li>
                    <li class="flex items-center">
                        <i class="fas fa-check-circle mr-2 text-green-600"></i>
                        Multi-factor authentication enabled
                    </li>
                </ul>
                
                <div class="mt-4 pt-3 border-t border-blue-200">
                    <p class="text-xs text-blue-600">
                        <i class="fas fa-download mr-1"></i>
                        <a href="https://aka.ms/authapp" target="_blank" class="underline hover:text-blue-800">
                            Download Microsoft Authenticator
                        </a>
                    </p>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="mt-8 text-center">
                <p class="text-xs text-gray-500">
                    <i class="fas fa-shield-alt mr-1"></i>
                    Protected by Microsoft Azure AD
                </p>
            </div>
        </div>
    </div>

    <script>
        function loginWithMicrosoft() {
            // Show loading state
            const button = event.target.closest('button');
            const originalContent = button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Redirecting to Microsoft...';
            button.disabled = true;
            
            // Redirect to Microsoft OAuth
            const clientId = '${c.env?.MICROSOFT_CLIENT_ID || "YOUR_CLIENT_ID"}';
            const tenantId = '${c.env?.MICROSOFT_TENANT_ID || "common"}';
            const redirectUri = encodeURIComponent('https://agilevu.com/auth/callback');
            const scope = encodeURIComponent('openid profile email User.Read');
            const state = encodeURIComponent(Math.random().toString(36).substring(7));
            
            // Store state for validation
            sessionStorage.setItem('oauth_state', state.replace(/%../g, ''));
            
            const authUrl = \`https://login.microsoftonline.com/\${tenantId}/oauth2/v2.0/authorize?\` +
                \`client_id=\${clientId}&\` +
                \`response_type=code&\` +
                \`redirect_uri=\${redirectUri}&\` +
                \`scope=\${scope}&\` +
                \`state=\${state}&\` +
                \`response_mode=query&\` +
                \`prompt=select_account\`;
            
            setTimeout(() => {
                window.location.href = authUrl;
            }, 1000);
        }
        
        // Add some interactive effects
        document.addEventListener('DOMContentLoaded', function() {
            // Animate security badge
            const badge = document.querySelector('.security-badge');
            if (badge) {
                setInterval(() => {
                    badge.style.transform = 'scale(1.05)';
                    setTimeout(() => {
                        badge.style.transform = 'scale(1)';
                    }, 200);
                }, 3000);
            }
        });
    </script>
</body>
</html>`

  return c.html(html)
})

// Microsoft OAuth callback
app.get("/auth/callback", async (c) => {
  try {
    const code = c.req.query("code")
    const state = c.req.query("state")
    const error = c.req.query("error")
    const errorDescription = c.req.query("error_description")

    if (error) {
      return c.redirect(`/login?error=${error}&error_description=${encodeURIComponent(errorDescription || "")}`)
    }

    if (!code) {
      return c.redirect("/login?error=missing_code")
    }

    // Exchange code for token
    const tokenResponse = await fetch(`${MICROSOFT_AUTH_URL}/${c.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: c.env.MICROSOFT_CLIENT_ID,
        client_secret: c.env.MICROSOFT_CLIENT_SECRET,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: c.env.REDIRECT_URI,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error("Token exchange failed:", tokenData)
      return c.redirect("/login?error=token_exchange_failed")
    }

    // Get user info from Microsoft Graph
    const userResponse = await fetch(`${GRAPH_API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const userData = await userResponse.json()

    if (!userResponse.ok) {
      console.error("User info fetch failed:", userData)
      return c.redirect("/login?error=user_info_failed")
    }

    // Create JWT token
    const jwtPayload = {
      sub: userData.id,
      email: userData.mail || userData.userPrincipalName,
      name: userData.displayName,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
    }

    const jwtToken = await sign(jwtPayload, c.env.JWT_SECRET)

    // Set secure cookie
    setCookie(c, "auth_token", jwtToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      maxAge: 86400, // 24 hours
      domain: ".agilevu.com", // Allow access from subdomains
    })

    // Redirect to dashboard subdomain
    return c.redirect("https://dashboard.agilevu.com/dashboard")
  } catch (error) {
    console.error("OAuth callback error:", error)
    return c.redirect("/login?error=callback_error")
  }
})

// Dashboard route (dashboard subdomain only)
app.get("/dashboard", requireAuth, async (c) => {
  const host = c.req.header("host") || ""

  // Ensure we're on the dashboard subdomain
  if (!host.includes("dashboard.")) {
    return c.redirect("https://dashboard.agilevu.com/dashboard")
  }

  const user = c.get("user")

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Placement CMS</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        .sidebar-gradient {
            background: linear-gradient(180deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%);
        }
        .nav-item.active {
            background: rgba(255, 255, 255, 0.1);
            border-right: 4px solid #60a5fa;
        }
        .stat-card {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
    </style>
</head>
<body class="bg-gray-50">
    <div class="flex h-screen">
        <!-- Sidebar -->
        <div class="w-64 sidebar-gradient shadow-xl">
            <div class="p-6 border-b border-blue-400 border-opacity-30">
                <div class="flex items-center">
                    <div class="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                        <i class="fas fa-graduation-cap text-white text-xl"></i>
                    </div>
                    <div>
                        <h1 class="text-xl font-bold text-white">Placement CMS</h1>
                        <p class="text-blue-200 text-xs">Secure Dashboard</p>
                    </div>
                </div>
            </div>
            
            <nav class="mt-6">
                <div class="px-6 py-2">
                    <p class="text-xs font-semibold text-blue-200 uppercase tracking-wider">Main Menu</p>
                </div>
                
                <a href="#" onclick="showSection('dashboard')" class="nav-item active flex items-center px-6 py-3 text-white hover:bg-white hover:bg-opacity-10 transition-all">
                    <i class="fas fa-home w-5 h-5 mr-3"></i>
                    <span>Dashboard</span>
                </a>
                
                <a href="#" onclick="showSection('students')" class="nav-item flex items-center px-6 py-3 text-white hover:bg-white hover:bg-opacity-10 transition-all">
                    <i class="fas fa-user-graduate w-5 h-5 mr-3"></i>
                    <span>Students</span>
                </a>
                
                <a href="#" onclick="showSection('companies')" class="nav-item flex items-center px-6 py-3 text-white hover:bg-white hover:bg-opacity-10 transition-all">
                    <i class="fas fa-building w-5 h-5 mr-3"></i>
                    <span>Companies</span>
                </a>
                
                <a href="#" onclick="showSection('placements')" class="nav-item flex items-center px-6 py-3 text-white hover:bg-white hover:bg-opacity-10 transition-all">
                    <i class="fas fa-handshake w-5 h-5 mr-3"></i>
                    <span>Placements</span>
                </a>
                
                <a href="#" onclick="showSection('analytics')" class="nav-item flex items-center px-6 py-3 text-white hover:bg-white hover:bg-opacity-10 transition-all">
                    <i class="fas fa-chart-line w-5 h-5 mr-3"></i>
                    <span>Analytics</span>
                </a>
                
                <a href="#" onclick="showSection('reports')" class="nav-item flex items-center px-6 py-3 text-white hover:bg-white hover:bg-opacity-10 transition-all">
                    <i class="fas fa-file-alt w-5 h-5 mr-3"></i>
                    <span>Reports</span>
                </a>
                
                <div class="px-6 py-2 mt-6">
                    <p class="text-xs font-semibold text-blue-200 uppercase tracking-wider">Account</p>
                </div>
                
                <a href="#" onclick="showSection('settings')" class="nav-item flex items-center px-6 py-3 text-white hover:bg-white hover:bg-opacity-10 transition-all">
                    <i class="fas fa-cog w-5 h-5 mr-3"></i>
                    <span>Settings</span>
                </a>
                
                <button onclick="logout()" class="w-full flex items-center px-6 py-3 text-white hover:bg-red-500 hover:bg-opacity-20 transition-all">
                    <i class="fas fa-sign-out-alt w-5 h-5 mr-3"></i>
                    <span>Logout</span>
                </button>
            </nav>
        </div>

        <!-- Main Content -->
        <div class="flex-1 flex flex-col overflow-hidden">
            <!-- Header -->
            <header class="bg-white shadow-sm border-b">
                <div class="flex items-center justify-between px-6 py-4">
                    <div>
                        <h2 id="page-title" class="text-2xl font-semibold text-gray-800">Dashboard</h2>
                        <p class="text-sm text-gray-600">Secure access via Microsoft Authenticator</p>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span class="text-xs text-green-700 font-medium">Authenticated</span>
                        </div>
                        <button class="p-2 text-gray-400 hover:text-gray-600 relative">
                            <i class="fas fa-bell"></i>
                            <span class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                        </button>
                        <div class="flex items-center space-x-2">
                            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                ${user?.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <div class="hidden md:block">
                                <p class="text-sm font-medium text-gray-700">${user?.name || "User"}</p>
                                <p class="text-xs text-gray-500">${user?.email || ""}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Content Area -->
            <main class="flex-1 overflow-y-auto p-6">
                <!-- Dashboard Section -->
                <div id="dashboard-section" class="content-section">
                    <!-- Security Status Banner -->
                    <div class="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg mb-6 flex items-center">
                        <i class="fas fa-shield-check text-2xl mr-4"></i>
                        <div>
                            <h3 class="font-semibold">Secure Session Active</h3>
                            <p class="text-sm text-green-100">Authenticated via Microsoft Authenticator • Session expires in 24 hours</p>
                        </div>
                    </div>
                    
                    <!-- Stats Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div class="stat-card bg-white p-6 rounded-xl shadow-sm">
                            <div class="flex items-center">
                                <div class="p-3 bg-blue-100 rounded-lg">
                                    <i class="fas fa-user-graduate text-blue-600 text-xl"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600">Total Students</p>
                                    <p class="text-2xl font-bold text-gray-900">2,847</p>
                                    <p class="text-xs text-green-600">↗ +12% from last month</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="stat-card bg-white p-6 rounded-xl shadow-sm">
                            <div class="flex items-center">
                                <div class="p-3 bg-green-100 rounded-lg">
                                    <i class="fas fa-building text-green-600 text-xl"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600">Partner Companies</p>
                                    <p class="text-2xl font-bold text-gray-900">156</p>
                                    <p class="text-xs text-green-600">↗ +8% from last month</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="stat-card bg-white p-6 rounded-xl shadow-sm">
                            <div class="flex items-center">
                                <div class="p-3 bg-purple-100 rounded-lg">
                                    <i class="fas fa-handshake text-purple-600 text-xl"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600">Successful Placements</p>
                                    <p class="text-2xl font-bold text-gray-900">1,923</p>
                                    <p class="text-xs text-green-600">↗ +15% from last month</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="stat-card bg-white p-6 rounded-xl shadow-sm">
                            <div class="flex items-center">
                                <div class="p-3 bg-orange-100 rounded-lg">
                                    <i class="fas fa-percentage text-orange-600 text-xl"></i>
                                </div>
                                <div class="ml-4">
                                    <p class="text-sm font-medium text-gray-600">Placement Rate</p>
                                    <p class="text-2xl font-bold text-gray-900">87.5%</p>
                                    <p class="text-xs text-green-600">↗ +3% from last month</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Main Content Grid -->
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <!-- Recent Activities -->
                        <div class="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                            <div class="flex items-center justify-between mb-6">
                                <h3 class="text-lg font-semibold text-gray-800">Recent Activities</h3>
                                <button class="text-blue-600 hover:text-blue-800 text-sm font-medium">View All</button>
                            </div>
                            <div class="space-y-4">
                                <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                                    <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                                        <i class="fas fa-user-plus text-green-600"></i>
                                    </div>
                                    <div class="flex-1">
                                        <p class="text-sm font-medium text-gray-800">New student registered</p>
                                        <p class="text-xs text-gray-500">Sarah Johnson - Computer Science • 2 minutes ago</p>
                                    </div>
                                </div>
                                
                                <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                                    <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                        <i class="fas fa-building text-blue-600"></i>
                                    </div>
                                    <div class="flex-1">
                                        <p class="text-sm font-medium text-gray-800">Company partnership confirmed</p>
                                        <p class="text-xs text-gray-500">Microsoft India - 50 positions • 1 hour ago</p>
                                    </div>
                                </div>
                                
                                <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                                    <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                                        <i class="fas fa-handshake text-purple-600"></i>
                                    </div>
                                    <div class="flex-1">
                                        <p class="text-sm font-medium text-gray-800">Placement confirmed</p>
                                        <p class="text-xs text-gray-500">Alex Kumar at Google - ₹28,00,000 LPA • 3 hours ago</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Quick Actions -->
                        <div class="bg-white rounded-xl shadow-sm p-6">
                            <h3 class="text-lg font-semibold text-gray-800 mb-6">Quick Actions</h3>
                            <div class="space-y-3">
                                <button onclick="showSection('students')" class="w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left">
                                    <div class="flex items-center">
                                        <i class="fas fa-user-plus text-blue-600 text-lg mr-3"></i>
                                        <div>
                                            <p class="font-medium text-blue-800">Add Student</p>
                                            <p class="text-xs text-blue-600">Register new student</p>
                                        </div>
                                    </div>
                                </button>
                                
                                <button onclick="showSection('companies')" class="w-full p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left">
                                    <div class="flex items-center">
                                        <i class="fas fa-building text-green-600 text-lg mr-3"></i>
                                        <div>
                                            <p class="font-medium text-green-800">Add Company</p>
                                            <p class="text-xs text-green-600">New partnership</p>
                                        </div>
                                    </div>
                                </button>
                                
                                <button onclick="showSection('placements')" class="w-full p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left">
                                    <div class="flex items-center">
                                        <i class="fas fa-handshake text-purple-600 text-lg mr-3"></i>
                                        <div>
                                            <p class="font-medium text-purple-800">Record Placement</p>
                                            <p class="text-xs text-purple-600">Log new placement</p>
                                        </div>
                                    </div>
                                </button>
                                
                                <button onclick="showSection('reports')" class="w-full p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left">
                                    <div class="flex items-center">
                                        <i class="fas fa-chart-bar text-orange-600 text-lg mr-3"></i>
                                        <div>
                                            <p class="font-medium text-orange-800">Generate Report</p>
                                            <p class="text-xs text-orange-600">Analytics & insights</p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Other sections (Students, Companies, etc.) -->
                <div id="students-section" class="content-section hidden">
                    <div class="bg-white rounded-xl shadow-sm">
                        <div class="p-6 border-b">
                            <div class="flex justify-between items-center">
                                <h3 class="text-lg font-semibold text-gray-800">Student Management</h3>
                                <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                    <i class="fas fa-plus mr-2"></i>Add Student
                                </button>
                            </div>
                        </div>
                        <div class="p-6">
                            <p class="text-gray-600">Student management interface will be implemented here.</p>
                        </div>
                    </div>
                </div>

                <div id="companies-section" class="content-section hidden">
                    <div class="bg-white rounded-xl shadow-sm">
                        <div class="p-6 border-b">
                            <div class="flex justify-between items-center">
                                <h3 class="text-lg font-semibold text-gray-800">Company Management</h3>
                                <button class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                                    <i class="fas fa-plus mr-2"></i>Add Company
                                </button>
                            </div>
                        </div>
                        <div class="p-6">
                            <p class="text-gray-600">Company management interface will be implemented here.</p>
                        </div>
                    </div>
                </div>

                <div id="placements-section" class="content-section hidden">
                    <div class="bg-white rounded-xl shadow-sm">
                        <div class="p-6 border-b">
                            <div class="flex justify-between items-center">
                                <h3 class="text-lg font-semibold text-gray-800">Placement Management</h3>
                                <button class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                                    <i class="fas fa-plus mr-2"></i>Record Placement
                                </button>
                            </div>
                        </div>
                        <div class="p-6">
                            <p class="text-gray-600">Placement management interface will be implemented here.</p>
                        </div>
                    </div>
                </div>

                <div id="analytics-section" class="content-section hidden">
                    <div class="bg-white rounded-xl shadow-sm">
                        <div class="p-6 border-b">
                            <h3 class="text-lg font-semibold text-gray-800">Analytics Dashboard</h3>
                        </div>
                        <div class="p-6">
                            <p class="text-gray-600">Analytics and reporting interface will be implemented here.</p>
                        </div>
                    </div>
                </div>

                <div id="reports-section" class="content-section hidden">
                    <div class="bg-white rounded-xl shadow-sm">
                        <div class="p-6 border-b">
                            <h3 class="text-lg font-semibold text-gray-800">Reports & Downloads</h3>
                        </div>
                        <div class="p-6">
                            <p class="text-gray-600">Report generation interface will be implemented here.</p>
                        </div>
                    </div>
                </div>

                <div id="settings-section" class="content-section hidden">
                    <div class="bg-white rounded-xl shadow-sm">
                        <div class="p-6 border-b">
                            <h3 class="text-lg font-semibold text-gray-800">System Settings</h3>
                        </div>
                        <div class="p-6">
                            <p class="text-gray-600">System configuration interface will be implemented here.</p>
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
            navItems.forEach(item => item.classList.remove('active'));
            
            // Add active class to clicked nav item
            event.target.closest('.nav-item').classList.add('active');
            
            // Update page title
            const titles = {
                'dashboard': 'Dashboard',
                'students': 'Student Management',
                'companies': 'Company Management', 
                'placements': 'Placement Management',
                'analytics': 'Analytics Dashboard',
                'reports': 'Reports & Downloads',
                'settings': 'System Settings'
            };
            
            document.getElementById('page-title').textContent = titles[sectionName] || 'Dashboard';
        }
        
        function logout() {
            if (confirm('Are you sure you want to logout?')) {
                fetch('/api/logout', { method: 'POST' })
                    .then(() => {
                        window.location.href = 'https://agilevu.com/login';
                    })
                    .catch(() => {
                        window.location.href = 'https://agilevu.com/login';
                    });
            }
        }
        
        // Initialize with dashboard active
        document.addEventListener('DOMContentLoaded', function() {
            showSection('dashboard');
        });
    </script>
</body>
</html>`

  return c.html(html)
})

// Logout endpoint
app.post("/api/logout", (c) => {
  deleteCookie(c, "auth_token", {
    domain: ".agilevu.com",
  })
  return c.json({ success: true })
})

// Health check endpoint
app.get("/api/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "Secure Placement CMS API",
    version: "2.0.0",
    authentication: "Microsoft Azure AD",
  })
})

// API endpoints (protected)
app.get("/api/students", requireAuth, async (c) => {
  return c.json({
    success: true,
    data: [
      { id: 1, name: "John Doe", email: "john@example.com", course: "Computer Science", year: "2024" },
      { id: 2, name: "Jane Smith", email: "jane@example.com", course: "Electronics", year: "2024" },
    ],
    source: "secure_api",
  })
})

app.get("/api/companies", requireAuth, async (c) => {
  return c.json({
    success: true,
    data: [
      { id: 1, name: "Microsoft", industry: "Technology", location: "Redmond", contact_email: "careers@microsoft.com" },
      { id: 2, name: "Google", industry: "Technology", location: "Mountain View", contact_email: "jobs@google.com" },
    ],
    source: "secure_api",
  })
})

// Catch all other routes
app.get("*", (c) => {
  const host = c.req.header("host") || ""

  if (host.includes("dashboard.")) {
    return c.redirect("https://dashboard.agilevu.com/dashboard")
  } else {
    return c.redirect("https://agilevu.com/login")
  }
})

// Export the app for Cloudflare Workers
export default app
