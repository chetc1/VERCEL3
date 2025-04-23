"use server"

import { createClient } from "@supabase/supabase-js"
import {
  getEventById,
  getUserById,
  getEventsByHostId,
  getEventsByAttendeeId,
  getTicketsByEventId,
  getTicketsByUserId,
  getFollowersByUserId,
  getFollowingByUserId,
  isFollowing,
  filterEvents,
  getFeaturedEvent as getMockFeaturedEvent,
  getUpcomingEvents as getMockUpcomingEvents,
} from "./mock-data"

// Initialize Supabase client if environment variables are available
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

let supabase: ReturnType<typeof createClient> | null = null

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey)
}

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!supabase
}

// Event functions
export async function getEvent(id: string) {
  if (!isSupabaseConfigured()) {
    return getEventById(id)
  }

  const { data, error } = await supabase!.from("events").select("*, host:users(*)").eq("id", id).single()

  if (error) {
    console.error("Error fetching event:", error)
    return null
  }

  return data
}

export async function getEvents(limit?: number) {
  if (!isSupabaseConfigured()) {
    return getUpcomingEvents(limit)
  }

  const query = supabase!
    .from("events")
    .select("*, host:users(*)")
    .eq("status", "upcoming")
    .order("start_time", { ascending: true })

  if (limit) {
    query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching events:", error)
    return []
  }

  return data
}

export async function getUpcomingEvents(limit?: number) {
  if (!isSupabaseConfigured()) {
    return getMockUpcomingEvents(limit)
  }

  const { data, error } = await supabase!
    .from("events")
    .select("*, host:users(*)")
    .eq("status", "upcoming")
    .order("start_time", { ascending: true })
    .limit(limit || 10)

  if (error) {
    console.error("Error fetching upcoming events:", error)
    return []
  }

  return data
}

export async function getEventsByHost(hostId: string) {
  if (!isSupabaseConfigured()) {
    return getEventsByHostId(hostId)
  }

  const { data, error } = await supabase!
    .from("events")
    .select("*, host:users(*)")
    .eq("host_id", hostId)
    .order("start_time", { ascending: true })

  if (error) {
    console.error("Error fetching host events:", error)
    return []
  }

  return data
}

export async function getEventsByAttendee(attendeeId: string) {
  if (!isSupabaseConfigured()) {
    return getEventsByAttendeeId(attendeeId)
  }

  const { data, error } = await supabase!.from("tickets").select("event_id").eq("user_id", attendeeId)

  if (error) {
    console.error("Error fetching attendee tickets:", error)
    return []
  }

  const eventIds = data.map((ticket) => ticket.event_id)

  if (eventIds.length === 0) {
    return []
  }

  const { data: events, error: eventsError } = await supabase!
    .from("events")
    .select("*, host:users(*)")
    .in("id", eventIds)
    .order("start_time", { ascending: true })

  if (eventsError) {
    console.error("Error fetching attendee events:", eventsError)
    return []
  }

  return events
}

export async function getFeaturedEvent() {
  if (!isSupabaseConfigured()) {
    return getMockFeaturedEvent()
  }

  const { data, error } = await supabase!.from("events").select("*, host:users(*)").eq("featured", true).single()

  if (error) {
    // If no featured event, return the first upcoming event
    const { data: firstEvent, error: firstEventError } = await supabase!
      .from("events")
      .select("*, host:users(*)")
      .eq("status", "upcoming")
      .order("start_time", { ascending: true })
      .limit(1)
      .single()

    if (firstEventError) {
      console.error("Error fetching featured event:", firstEventError)
      return null
    }

    return firstEvent
  }

  return data
}

export async function filterEventsList(options: {
  industry?: string
  minPrice?: number
  maxPrice?: number
  startDate?: string
  endDate?: string
}) {
  if (!isSupabaseConfigured()) {
    return filterEvents(options)
  }

  let query = supabase!.from("events").select("*, host:users(*)").eq("status", "upcoming")

  if (options.industry) {
    query = query.eq("industry", options.industry)
  }

  if (options.minPrice !== undefined) {
    query = query.gte("price", options.minPrice)
  }

  if (options.maxPrice !== undefined) {
    query = query.lte("price", options.maxPrice)
  }

  if (options.startDate) {
    query = query.gte("start_time", options.startDate)
  }

  if (options.endDate) {
    query = query.lte("start_time", options.endDate)
  }

  query = query.order("start_time", { ascending: true })

  const { data, error } = await query

  if (error) {
    console.error("Error filtering events:", error)
    return []
  }

  return data
}

// User functions
export async function getUser(id: string) {
  if (!isSupabaseConfigured()) {
    return getUserById(id)
  }

  const { data, error } = await supabase!.from("users").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching user:", error)
    return null
  }

  return data
}

// Ticket functions
export async function getTicketsByEvent(eventId: string) {
  if (!isSupabaseConfigured()) {
    return getTicketsByEventId(eventId)
  }

  const { data, error } = await supabase!.from("tickets").select("*").eq("event_id", eventId)

  if (error) {
    console.error("Error fetching event tickets:", error)
    return []
  }

  return data
}

export async function getTicketsByUser(userId: string) {
  if (!isSupabaseConfigured()) {
    return getTicketsByUserId(userId)
  }

  const { data, error } = await supabase!.from("tickets").select("*, event:events(*)").eq("user_id", userId)

  if (error) {
    console.error("Error fetching user tickets:", error)
    return []
  }

  return data
}

// Follow functions
export async function getFollowers(userId: string) {
  if (!isSupabaseConfigured()) {
    return getFollowersByUserId(userId)
  }

  const { data, error } = await supabase!.from("follows").select("follower:users(*)").eq("following_id", userId)

  if (error) {
    console.error("Error fetching followers:", error)
    return []
  }

  return data.map((item) => item.follower)
}

export async function getFollowing(userId: string) {
  if (!isSupabaseConfigured()) {
    return getFollowingByUserId(userId)
  }

  const { data, error } = await supabase!.from("follows").select("following:users(*)").eq("follower_id", userId)

  if (error) {
    console.error("Error fetching following:", error)
    return []
  }

  return data.map((item) => item.following)
}

export async function checkIsFollowing(followerId: string, followingId: string) {
  if (!isSupabaseConfigured()) {
    return isFollowing(followerId, followingId)
  }

  const { data, error } = await supabase!
    .from("follows")
    .select("id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .single()

  if (error) {
    return false
  }

  return !!data
}

// Create functions with fallbacks to mock data
export async function createEvent(eventData: any) {
  if (!isSupabaseConfigured()) {
    // In mock mode, just return a success response
    return {
      success: true,
      data: {
        ...eventData,
        id: `event-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }
  }

  const { data, error } = await supabase!
    .from("events")
    .insert([
      {
        title: eventData.title,
        description: eventData.description,
        start_time: eventData.startTime,
        end_time: eventData.endTime,
        price: eventData.price,
        host_id: eventData.hostId,
        max_attendees: eventData.maxAttendees,
        industry: eventData.industry,
        status: eventData.status,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Error creating event:", error)
    return { success: false, error }
  }

  return { success: true, data }
}

export async function createTicket(ticketData: { eventId: string; userId: string; price: number }) {
  if (!isSupabaseConfigured()) {
    // In mock mode, just return a success response
    return {
      success: true,
      data: {
        id: `ticket-${Date.now()}`,
        eventId: ticketData.eventId,
        userId: ticketData.userId,
        purchasedAt: new Date().toISOString(),
        price: ticketData.price,
        status: "confirmed",
      },
    }
  }

  const { data, error } = await supabase!
    .from("tickets")
    .insert([
      {
        event_id: ticketData.eventId,
        user_id: ticketData.userId,
        purchased_at: new Date().toISOString(),
        price: ticketData.price,
        status: "confirmed",
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Error creating ticket:", error)
    return { success: false, error }
  }

  return { success: true, data }
}

export async function toggleFollow(followerId: string, followingId: string) {
  if (!isSupabaseConfigured()) {
    // In mock mode, just return a success response
    return { success: true }
  }

  // Check if already following
  const isAlreadyFollowing = await checkIsFollowing(followerId, followingId)

  if (isAlreadyFollowing) {
    // Unfollow
    const { error } = await supabase!
      .from("follows")
      .delete()
      .eq("follower_id", followerId)
      .eq("following_id", followingId)

    if (error) {
      console.error("Error unfollowing:", error)
      return { success: false, error }
    }
  } else {
    // Follow
    const { error } = await supabase!.from("follows").insert([
      {
        follower_id: followerId,
        following_id: followingId,
        created_at: new Date().toISOString(),
      },
    ])

    if (error) {
      console.error("Error following:", error)
      return { success: false, error }
    }
  }

  return { success: true }
}

// Function to check if Supabase is configured - safe for client components
export async function checkSupabaseConfigured() {
  return isSupabaseConfigured()
}
