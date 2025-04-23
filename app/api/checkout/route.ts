import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getEvent } from "@/lib/supabase"

// Initialize Stripe with the secret key
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    })
  : null

export async function POST(req: NextRequest) {
  console.log("API: Received checkout request")

  try {
    // If Stripe is not configured, return a mock response
    if (!stripe) {
      console.log("API: Stripe not configured, returning mock response")
      const body = await req.json()
      const { eventId } = body

      if (!eventId) {
        return NextResponse.json({ error: "Missing eventId" }, { status: 400 })
      }

      const mockSessionId = `mock_session_${Date.now()}`
      const mockUrl = `/events/${eventId}/purchase/success?session_id=${mockSessionId}`

      return NextResponse.json({
        success: true,
        sessionId: mockSessionId,
        url: mockUrl,
      })
    }

    const body = await req.json()
    console.log("API: Request body:", body)

    const { eventId, userId, price } = body

    // Validate the request
    if (!eventId) {
      console.log("API: Missing eventId")
      return NextResponse.json({ error: "Missing eventId" }, { status: 400 })
    }

    if (!userId) {
      console.log("API: Missing userId")
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    if (price === undefined || price === null) {
      console.log("API: Missing price")
      return NextResponse.json({ error: "Missing price" }, { status: 400 })
    }

    // Get event details
    console.log("API: Fetching event details for:", eventId)
    const event = await getEvent(eventId)

    if (!event) {
      console.log("API: Event not found")
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    console.log("API: Creating Stripe checkout session")
    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: event.title || "Event Ticket",
              description: `Ticket for ${event.title || "Event"}`,
            },
            unit_amount: Math.round((price || 0) * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin") || "http://localhost:3000"}/events/${eventId}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin") || "http://localhost:3000"}/events/${eventId}`,
      metadata: {
        eventId,
        userId,
        platformFee: Math.round((price || 0) * 0.07 * 100) / 100, // 7% platform fee
        hostRevenue: Math.round((price || 0) * 0.93 * 100) / 100, // 93% to host
      },
    })

    console.log("API: Checkout session created:", {
      id: session.id,
      url: session.url,
    })

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error("API: Error creating checkout session:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create checkout session",
      },
      { status: 500 },
    )
  }
}
