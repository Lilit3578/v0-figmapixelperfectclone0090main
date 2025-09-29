"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"

export default function AuthPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("signin")
  const { user, signIn, signUp } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/")
    }
  }, [user, router])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await signIn(email, password)
      if (error) {
        toast({
          title: "Error signing in",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Signed in successfully!",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await signUp(email, password)
      if (error) {
        toast({
          title: "Error signing up",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Account created successfully! Please check your email for verification.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card rounded-lg border p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Sprint Tracker</h1>
          <p className="text-muted-foreground">Sign in to your account or create a new one</p>
        </div>

        <div className="mb-4">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("signin")}
              className={`px-4 py-2 -mb-px ${
                activeTab === "signin" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`px-4 py-2 -mb-px ${
                activeTab === "signup" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {activeTab === "signin" && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label htmlFor="signin-email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id="signin-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="signin-password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                id="signin-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button className="w-full" disabled={isLoading} onClick={handleSignIn}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        )}

        {activeTab === "signup" && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button className="w-full" disabled={isLoading} onClick={handleSignUp}>
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
