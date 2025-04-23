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
  try {
    // If Stripe is not configured, return a mock response
    if (!stripe) {
      const { eventId } = await req.json()
      return NextResponse.json({
        success: true,
        sessionId: `mock_session_${Date.now()}`,
        url: `/events/${eventId}/purchase/success?session_id=mock_session_${Date.now()}`,
      })
    }

    const { eventId, userId, price } = await req.json()

    // Validate the request
    if (!eventId || !userId || !price) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Get event details
    const event = await getEvent(eventId)
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: event.title,
              description: `Ticket for ${event.title}`,
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/events/${eventId}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/events/${eventId}`,
      metadata: {
        eventId,
        userId,
        platformFee: Math.round(price * 0.07 * 100) / 100, // 7% platform fee
        hostRevenue: Math.round(price * 0.93 * 100) / 100, // 93% to host
      },
    })

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    // If Stripe is not configured, return a mock response
    if (!stripe) {
      return NextResponse.json({
        success: true,
        status: "complete",
        eventId: req.url.split("event_id=")[1]?.split("&")[0] || "mock-event",
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
