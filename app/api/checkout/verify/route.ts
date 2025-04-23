import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

// Initialize Stripe with the secret key
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    })
  : null

export async function GET(req: NextRequest) {
  try {
    // If Stripe is not configured, return a mock response
    if (!stripe) {
      const url = new URL(req.url)
      const sessionId = url.searchParams.get("session_id") || `mock_session_${Date.now()}`
      const eventId = sessionId.split("_")[2] || "mock-event"

      return NextResponse.json({
        success: true,
        status: "complete",
        eventId,
        userId: "user-6", // Guest user
        amount: 2500, // $25.00
      })
    }

    const url = new URL(req.url)
    const sessionId = url.searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session ID" }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      status: session.status,
      eventId: session.metadata?.eventId,
      userId: session.metadata?.userId,
      amount: session.amount_total,
    })
  } catch (error) {
    console.error("Error verifying checkout session:", error)
    return NextResponse.json({ error: "Failed to verify checkout session" }, { status: 500 })
  }
}
