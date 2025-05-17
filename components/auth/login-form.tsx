"use client"

import type React from "react"

import { useState } from "react"

interface LoginFormProps {
  onLogin: () => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Sample login credentials
    const validCredentials = [
      { username: "admin", password: "admin123" },
      { username: "tpo", password: "tpo123" },
      { username: "coordinator", password: "coord123" },
      { username: "staff", password: "staff123" },
    ]

    const isValidUser = validCredentials.some((cred) => cred.username === username && cred.password === password)

    if (isValidUser) {
      onLogin()
    } else {
      setError("Invalid username or password")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-primary">PlacementCMS</h2>
          <p className="text-gray-600 mt-2">Admin Login</p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
              placeholder="Enter your password"
              required
            />
          </div>
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors rounded-button whitespace-nowrap"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}
