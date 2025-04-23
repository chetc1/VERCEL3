import { loadStripe } from "@stripe/stripe-js"

// Initialize Stripe if publishable key is available
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
let stripePromise: ReturnType<typeof loadStripe> | null = null

if (stripePublishableKey) {
  stripePromise = loadStripe(stripePublishableKey)
}

// Check if Stripe is configured
const isStripeConfigured = () => {
  return !!stripePublishableKey && !!process.env.STRIPE_SECRET_KEY
}

// Create a checkout session for an event ticket
export async function createCheckoutSession(eventId: string, userId: string, price: number) {
  if (!isStripeConfigured()) {
    // In mock mode, return a success response with a mock session ID
    return {
      success: true,
      sessionId: `mock_session_${Date.now()}`,
      url: `/events/${eventId}/purchase/success?session_id=mock_session_${Date.now()}`,
    }
  }

  try {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventId,
        userId,
        price,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to create checkout session")
    }

    return {
      success: true,
      sessionId: data.sessionId,
      url: data.url,
    }
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return {
      success: false,
      error: "Failed to create checkout session",
    }
  }
}

// Redirect to Stripe Checkout
export async function redirectToCheckout(sessionId: string) {
  if (!isStripeConfigured()) {
    // In mock mode, redirect to success page
    window.location.href = `/events/${sessionId.split("_")[2]}/purchase/success?session_id=${sessionId}`
    return { success: true }
  }

  try {
    const stripe = await stripePromise

    if (!stripe) {
      throw new Error("Stripe not initialized")
    }

    const { error } = await stripe.redirectToCheckout({ sessionId })

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error("Error redirecting to checkout:", error)
    return {
      success: false,
      error: "Failed to redirect to checkout",
    }
  }
}

// Verify a checkout session
export async function verifyCheckoutSession(sessionId: string) {
  if (!isStripeConfigured()) {
    // In mock mode, return a success response
    return {
      success: true,
      status: "complete",
      eventId: sessionId.split("_")[2],
      userId: "user-6", // Guest user
      amount: 2500, // $25.00
    }
  }

  try {
    const response = await fetch(`/api/checkout/verify?session_id=${sessionId}`, {
      method: "GET",
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to verify checkout session")
    }

    return {
      success: true,
      ...data,
    }
  } catch (error) {
    console.error("Error verifying checkout session:", error)
    return {
      success: false,
      error: "Failed to verify checkout session",
    }
  }
}
