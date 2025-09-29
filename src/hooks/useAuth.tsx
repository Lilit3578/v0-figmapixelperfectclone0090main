"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface User {
  id: string
  email: string
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string) => Promise<{ success: boolean; error?: string }>
  verifySignUp: (email: string, code: string) => Promise<{ success: boolean; error?: string }>
  signIn: (email: string) => Promise<{ success: boolean; error?: string }>
  verifySignIn: (email: string, code: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const token = localStorage.getItem("auth_token")
    if (token) {
      fetch("/api/auth/session", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user)
          } else {
            localStorage.removeItem("auth_token")
          }
        })
        .catch(() => {
          localStorage.removeItem("auth_token")
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const signUp = async (email: string) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      return data
    } catch (error) {
      return { success: false, error: "Network error" }
    }
  }

  const verifySignUp = async (email: string, code: string) => {
    try {
      const response = await fetch("/api/auth/verify-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      })

      const data = await response.json()

      if (data.success && data.user) {
        setUser(data.user)
        if (data.token) {
          localStorage.setItem("auth_token", data.token)
        }
      }

      return data
    } catch (error) {
      return { success: false, error: "Network error" }
    }
  }

  const signIn = async (email: string) => {
    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      return data
    } catch (error) {
      return { success: false, error: "Network error" }
    }
  }

  const verifySignIn = async (email: string, code: string) => {
    try {
      const response = await fetch("/api/auth/verify-signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      })

      const data = await response.json()

      if (data.success && data.user) {
        setUser(data.user)
        if (data.token) {
          localStorage.setItem("auth_token", data.token)
        }
      }

      return data
    } catch (error) {
      return { success: false, error: "Network error" }
    }
  }

  const signOut = async () => {
    const token = localStorage.getItem("auth_token")
    if (token) {
      try {
        await fetch("/api/auth/signout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch (error) {
        console.error("Error signing out:", error)
      }
    }

    localStorage.removeItem("auth_token")
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        verifySignUp,
        signIn,
        verifySignIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
