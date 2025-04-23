// Daily.co integration with fallback to mock data
"use server"

// Check if Daily.co API key is configured
const isDailyConfigured = () => {
  return !!process.env.DAILY_API_KEY
}

// Create a new room for an event
export async function createRoom(eventId: string, eventTitle: string) {
  if (!isDailyConfigured()) {
    // In mock mode, return a mock room URL
    return {
      success: true,
      url: `https://indieevent.daily.co/${eventId}`,
    }
  }

  try {
    const response = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: eventId,
        properties: {
          max_participants: 50,
          enable_chat: true,
          enable_knocking: true,
          start_audio_off: true,
          start_video_off: true,
          exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
          eject_at_room_exp: true,
        },
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to create room")
    }

    return {
      success: true,
      url: data.url,
    }
  } catch (error) {
    console.error("Error creating Daily.co room:", error)
    return {
      success: false,
      error: "Failed to create video room",
    }
  }
}

// Get a room by ID
export async function getRoom(roomName: string) {
  if (!isDailyConfigured()) {
    // In mock mode, return a mock room URL
    return {
      success: true,
      url: `https://indieevent.daily.co/${roomName}`,
    }
  }

  try {
    const response = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to get room")
    }

    return {
      success: true,
      url: data.url,
    }
  } catch (error) {
    console.error("Error getting Daily.co room:", error)
    return {
      success: false,
      error: "Failed to get video room",
    }
  }
}

// Update room properties (e.g., extend expiration)
export async function updateRoom(roomName: string, properties: any) {
  if (!isDailyConfigured()) {
    // In mock mode, return success
    return { success: true }
  }

  try {
    const response = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
      },
      body: JSON.stringify({ properties }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to update room")
    }

    return { success: true }
  } catch (error) {
    console.error("Error updating Daily.co room:", error)
    return {
      success: false,
      error: "Failed to update video room",
    }
  }
}

// Delete a room
export async function deleteRoom(roomName: string) {
  if (!isDailyConfigured()) {
    // In mock mode, return success
    return { success: true }
  }

  try {
    const response = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
      },
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || "Failed to delete room")
    }

    return { success: true }
  } catch (error) {
    console.error("Error deleting Daily.co room:", error)
    return {
      success: false,
      error: "Failed to delete video room",
    }
  }
}

// Client-safe function to check if Daily is configured
export async function checkDailyConfigured() {
  return isDailyConfigured()
}
