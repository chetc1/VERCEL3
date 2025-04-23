"use client"

import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client for client-side operations
// This only uses the public URL and anon key which are safe to expose
let supabaseClient: ReturnType<typeof createClient> | null = null

// Only initialize if both URL and anon key are available
if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

// Check if Supabase client is configured
export const isSupabaseClientConfigured = () => {
  return !!supabaseClient
}

// Get the Supabase client instance
export const getSupabaseClient = () => {
  return supabaseClient
}

// Client-side authentication functions can be added here
// These would use the public anon key which is safe to expose
