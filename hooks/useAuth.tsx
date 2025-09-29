"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

export interface User {
  id: string
  email: string
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (
    email: string,
    password: string
  ) => Promise<{ error?: { message: string } }>
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error?: { message: string } }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user)
        }
      })
      .catch(() => {
        // Session check failed
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const signUp = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!data.success) {
        return { error: { message: data.error || "Sign up failed" } }
      }

      return {}
    } catch (error) {
      return { error: { message: "Network error" } }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!data.success) {
        return { error: { message: data.error || "Sign in failed" } }
      }

      setUser(data.user)
      return {}
    } catch (error) {
      return { error: { message: "Network error" } }
    }
  }

  const signOut = async () => {
    try {
      await fetch("/api/auth/signout", {
        method: "POST",
      })
    } catch (error) {
      console.error("Error signing out:", error)
    }

    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
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
