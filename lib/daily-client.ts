"use client"

// Client-side Daily.co utilities that don't expose API keys

// Join a room with the given URL
export function joinRoom(roomUrl: string) {
  if (!roomUrl) {
    return {
      success: false,
      error: "No room URL provided",
    }
  }

  try {
    // This function would typically integrate with the Daily.co client library
    // For now, we just return the URL that would be used in an iframe
    return {
      success: true,
      url: roomUrl,
    }
  } catch (error) {
    console.error("Error joining Daily.co room:", error)
    return {
      success: false,
      error: "Failed to join video room",
    }
  }
}

// Leave a room
export function leaveRoom() {
  // This function would typically integrate with the Daily.co client library
  // For now, it's just a placeholder
  return { success: true }
}
