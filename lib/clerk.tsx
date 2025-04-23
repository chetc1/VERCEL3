"use client"

import type React from "react"

import { ClerkProvider as BaseClerkProvider } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { useTheme } from "next-themes"
import { mockUsers } from "./mock-data"
import { createContext, useContext, useState } from "react"
import { useAuth as useClerkAuth, useUser } from "@clerk/nextjs"

// Mock user for guest mode
const GUEST_USER = mockUsers.find((user) => user.id === "user-6")

// Check if Clerk is configured - do this safely without exposing the key
const isClerkConfigured = () => {
  return (
    typeof process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === "string" &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_")
  )
}

// Mock Auth Context for when Clerk is not configured
interface MockAuthContextType {
  isSignedIn: boolean
  user: typeof GUEST_USER | null
  signIn: () => void
  signOut: () => void
  signInWithEmailPassword: (email: string, password: string) => Promise<boolean>
}

const MockAuthContext = createContext<MockAuthContextType>({
  isSignedIn: false,
  user: null,
  signIn: () => {},
  signOut: () => {},
  signInWithEmailPassword: async () => false,
})

function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [user, setUser] = useState<typeof GUEST_USER | null>(null)

  const signIn = () => {
    setIsSignedIn(true)
    setUser(GUEST_USER)
  }

  const signOut = () => {
    setIsSignedIn(false)
    setUser(null)
  }

  const signInWithEmailPassword = async (email: string, password: string) => {
    // Simple mock validation - in a real app, this would validate against a database
    if (email && password.length >= 6) {
      const matchedUser = mockUsers.find((u) => u.email === email) || GUEST_USER
      setIsSignedIn(true)
      setUser(matchedUser)
      return true
    }
    return false
  }

  return (
    <MockAuthContext.Provider value={{ isSignedIn, user, signIn, signOut, signInWithEmailPassword }}>
      {children}
    </MockAuthContext.Provider>
  )
}

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()

  // If Clerk is not configured, render children directly with mock auth context
  if (!isClerkConfigured()) {
    return <MockAuthProvider>{children}</MockAuthProvider>
  }

  return (
    <BaseClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        baseTheme: theme === "dark" ? dark : undefined,
        elements: {
          formButtonPrimary: "bg-primary hover:bg-primary/90",
        },
      }}
    >
      {children}
    </BaseClerkProvider>
  )
}

export function useAuth() {
  const isConfigured = isClerkConfigured()
  const clerkAuth = isConfigured ? useClerkAuth() : { isSignedIn: false }
  const clerkUserHook = isConfigured ? useUser() : { user: null }
  const { isSignedIn } = clerkAuth
  const { user: clerkUser } = clerkUserHook

  // If Clerk is configured, use the real auth
  if (isConfigured) {
    try {
      return {
        isSignedIn,
        user: clerkUser,
        signInWithEmailPassword: async () => false, // Not implemented for real Clerk
      }
    } catch (error) {
      // Fallback to mock auth if there's an error with Clerk
      console.error("Error using Clerk auth:", error)
      return useContext(MockAuthContext)
    }
  }

  // Otherwise use the mock auth
  return useContext(MockAuthContext)
}
