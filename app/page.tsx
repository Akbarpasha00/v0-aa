"use client"

import { useState } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { Dashboard } from "@/components/dashboard/dashboard"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return (
    <main className="min-h-screen">
      {!isLoggedIn ? <LoginForm onLogin={() => setIsLoggedIn(true)} /> : <Dashboard />}
    </main>
  )
}
