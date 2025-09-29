"use client"

import React, { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ErrorBoundary } from "@/components/shared/ErrorBoundary"
import { AuthProvider } from "@/hooks/useAuth"
import { Toaster } from "@/components/ui/toaster"

export default function Providers({ children }: { children: React.ReactNode }) {
  // Ensure QueryClient instance persists on client
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorBoundary>
          {children}
          <Toaster />
        </ErrorBoundary>
      </AuthProvider>
    </QueryClientProvider>
  )
}
