export interface DatabaseConfig {
  host: string
  port: number
  database: string
  username: string
  password: string
}

export interface AuthConfig {
  providers: string[]
  sessionTimeout: number
  jwtExpiry: string
}

export interface AppConfig {
  name: string
  version: string
  environment: "development" | "staging" | "production"
  debug: boolean
}

export interface FeatureFlags {
  enableRegistration: boolean
  enablePasswordReset: boolean
  enableEmailVerification: boolean
  enableTwoFactor: boolean
  enableFileUpload: boolean
  enableNotifications: boolean
}
