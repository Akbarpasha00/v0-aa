export const config = {
  // App Configuration
  app: {
    name: "Placement CMS",
    version: "1.0.0",
    description: "College Placement Management System",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL!,
    maxConnections: 10,
    connectionTimeout: 30000,
  },

  // Supabase Configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },

  // Authentication Configuration
  auth: {
    secret: process.env.NEXTAUTH_SECRET!,
    jwtSecret: process.env.JWT_SECRET!,
    sessionMaxAge: 24 * 60 * 60, // 24 hours
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      tenantId: process.env.MICROSOFT_TENANT_ID!,
    },
  },

  // File Upload Configuration
  upload: {
    maxFileSize: Number.parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || "5242880"), // 5MB
    allowedTypes: ["image/jpeg", "image/png", "image/gif", "application/pdf"],
    uploadDir: process.env.UPLOAD_DIR || "./uploads",
  },

  // Email Configuration
  email: {
    host: process.env.SMTP_HOST!,
    port: Number.parseInt(process.env.SMTP_PORT || "587"),
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },

  // WhatsApp Configuration
  whatsapp: {
    apiUrl: process.env.WHATSAPP_API_URL!,
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
  },

  // Cloudflare Configuration
  cloudflare: {
    apiToken: process.env.CLOUDFLARE_API_TOKEN!,
    zoneId: process.env.CLOUDFLARE_ZONE_ID!,
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
  },

  // Feature Flags
  features: {
    enableWhatsApp: process.env.ENABLE_WHATSAPP === "true",
    enableEmailNotifications: process.env.ENABLE_EMAIL === "true",
    enableFileUpload: process.env.ENABLE_UPLOAD === "true",
    enableAnalytics: process.env.ENABLE_ANALYTICS === "true",
  },

  // API Configuration
  api: {
    baseUrl: process.env.API_BASE_URL || "http://localhost:3000/api",
    timeout: 30000,
    retries: 3,
  },
}

// Validate required environment variables
export function validateConfig() {
  const required = [
    "DATABASE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXTAUTH_SECRET",
    "JWT_SECRET",
  ]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
  }
}
