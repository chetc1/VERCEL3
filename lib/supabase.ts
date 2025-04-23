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
  try {
    supabase = createClient(supabaseUrl, supabaseKey)
    console.log("Supabase client initialized successfully")
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error)
  }
}

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!supabase
}

// Event functions
export async function getEvent(id: string) {
  try {
    if (!id) {
      console.error("getEvent: Missing event ID")
      return null
    }

    if (!isSupabaseConfigured()) {
      console.log(`getEvent: Using mock data for event ${id}`)
      return getEventById(id)
    }

    console.log(`getEvent: Fetching event ${id} from Supabase`)
    const { data, error } = await supabase!.from("events").select("*, host:users(*)").eq("id", id).single()

    if (error) {
      console.error("Error fetching event:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getEvent:", error)
    return null
  }
}

export async function getEvents(limit?: number) {
  try {
    if (!isSupabaseConfigured()) {
      console.log("getEvents: Using mock data")
      return getMockUpcomingEvents(limit)
    }

    console.log("getEvents: Fetching events from Supabase")
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

    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error("Error in getEvents:", error)
    return []
  }
}

export async function getUpcomingEvents(limit?: number) {
  try {
    if (!isSupabaseConfigured()) {
      console.log("getUpcomingEvents: Using mock data")
      return getMockUpcomingEvents(limit)
    }

    console.log("getUpcomingEvents: Fetching upcoming events from Supabase")
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

    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error("Error in getUpcomingEvents:", error)
    return []
  }
}

export async function getEventsByHost(hostId: string) {
  try {
    if (!hostId) {
      console.error("getEventsByHost: Missing host ID")
      return []
    }

    if (!isSupabaseConfigured()) {
      console.log(`getEventsByHost: Using mock data for host ${hostId}`)
      return getEventsByHostId(hostId)
    }

    console.log(`getEventsByHost: Fetching events for host ${hostId} from Supabase`)
    const { data, error } = await supabase!
      .from("events")
      .select("*, host:users(*)")
      .eq("host_id", hostId)
      .order("start_time", { ascending: true })

    if (error) {
      console.error("Error fetching host events:", error)
      return []
    }

    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error("Error in getEventsByHost:", error)
    return []
  }
}

export async function getEventsByAttendee(attendeeId: string) {
  try {
    if (!attendeeId) {
      console.error("getEventsByAttendee: Missing attendee ID")
      return []
    }

    if (!isSupabaseConfigured()) {
      console.log(`getEventsByAttendee: Using mock data for attendee ${attendeeId}`)
      return getEventsByAttendeeId(attendeeId)
    }

    console.log(`getEventsByAttendee: Fetching events for attendee ${attendeeId} from Supabase`)
    const { data, error } = await supabase!.from("tickets").select("event_id").eq("user_id", attendeeId)

    if (error) {
      console.error("Error fetching attendee tickets:", error)
      return []
    }

    const eventIds = Array.isArray(data) ? data.map((ticket) => ticket.event_id) : []

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

    return Array.isArray(events) ? events : []
  } catch (error) {
    console.error("Error in getEventsByAttendee:", error)
    return []
  }
}

export async function getFeaturedEvent() {
  try {
    if (!isSupabaseConfigured()) {
      console.log("getFeaturedEvent: Using mock data")
      return getMockFeaturedEvent()
    }

    console.log("getFeaturedEvent: Fetching featured event from Supabase")
    const { data, error } = await supabase!.from("events").select("*, host:users(*)").eq("featured", true).single()

    if (error) {
      console.log("No featured event found, fetching first upcoming event")
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
  } catch (error) {
    console.error("Error in getFeaturedEvent:", error)
    return null
  }
}

export async function filterEventsList(options: {
  industry?: string
  minPrice?: number
  maxPrice?: number
  startDate?: string
  endDate?: string
}) {
  try {
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

    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error("Error in filterEventsList:", error)
    return []
  }
}

// User functions
export async function getUser(id: string) {
  try {
    if (!isSupabaseConfigured()) {
      return getUserById(id)
    }

    const { data, error } = await supabase!.from("users").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching user:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getUser:", error)
    return null
  }
}

// Ticket functions
export async function getTicketsByEvent(eventId: string) {
  try {
    if (!isSupabaseConfigured()) {
      return getTicketsByEventId(eventId)
    }

    const { data, error } = await supabase!.from("tickets").select("*").eq("event_id", eventId)

    if (error) {
      console.error("Error fetching event tickets:", error)
      return []
    }

    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error("Error in getTicketsByEvent:", error)
    return []
  }
}

export async function getTicketsByUser(userId: string) {
  try {
    if (!isSupabaseConfigured()) {
      return getTicketsByUserId(userId)
    }

    const { data, error } = await supabase!.from("tickets").select("*, event:events(*)").eq("user_id", userId)

    if (error) {
      console.error("Error fetching user tickets:", error)
      return []
    }

    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error("Error in getTicketsByUser:", error)
    return []
  }
}

// Follow functions
export async function getFollowers(userId: string) {
  try {
    if (!isSupabaseConfigured()) {
      return getFollowersByUserId(userId)
    }

    const { data, error } = await supabase!.from("follows").select("follower:users(*)").eq("following_id", userId)

    if (error) {
      console.error("Error fetching followers:", error)
      return []
    }

    return Array.isArray(data) ? data.map((item) => item.follower) : []
  } catch (error) {
    console.error("Error in getFollowers:", error)
    return []
  }
}

export async function getFollowing(userId: string) {
  try {
    if (!isSupabaseConfigured()) {
      return getFollowingByUserId(userId)
    }

    const { data, error } = await supabase!.from("follows").select("following:users(*)").eq("follower_id", userId)

    if (error) {
      console.error("Error fetching following:", error)
      return []
    }

    return Array.isArray(data) ? data.map((item) => item.following) : []
  } catch (error) {
    console.error("Error in getFollowing:", error)
    return []
  }
}

export async function checkIsFollowing(followerId: string, followingId: string) {
  try {
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
  } catch (error) {
    console.error("Error in checkIsFollowing:", error)
    return false
  }
}

// Create functions with fallbacks to mock data
export async function createEvent(eventData: any) {
  try {
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
  } catch (error) {
    console.error("Error in createEvent:", error)
    return { success: false, error }
  }
}

export async function createTicket(ticketData: { eventId: string; userId: string; price: number }) {
  try {
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
  } catch (error) {
    console.error("Error in createTicket:", error)
    return { success: false, error }
  }
}

export async function toggleFollow(followerId: string, followingId: string) {
  try {
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
  } catch (error) {
    console.error("Error in toggleFollow:", error)
    return { success: false, error }
  }
}

// Function to check if Supabase is configured - safe for client components
export async function checkSupabaseConfigured() {
  return isSupabaseConfigured()
}
