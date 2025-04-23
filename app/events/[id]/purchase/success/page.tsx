"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Calendar, Check, ChevronRight, Clock } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useToast } from "@/components/ui/use-toast"
import { getEvent } from "@/lib/supabase"
import { verifyCheckoutSession } from "@/lib/stripe"

export default function SuccessPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      router.push(`/events/${params.id}`)
      return
    }

    const verifyPurchase = async () => {
      try {
        // Verify the checkout session
        const result = await verifyCheckoutSession(sessionId)

        if (!result.success) {
          throw new Error(result.error || "Failed to verify purchase")
        }

        setVerified(true)

        // Fetch event details
        const eventData = await getEvent(params.id)
        if (!eventData) {
          router.push("/events")
          return
        }

        setEvent(eventData)
      } catch (error) {
        console.error("Error verifying purchase:", error)
        toast({
          title: "Verification Error",
          description: "There was a problem verifying your purchase. Please contact support.",
          variant: "destructive",
        })
        router.push(`/events/${params.id}`)
      } finally {
        setLoading(false)
      }
    }

    verifyPurchase()
  }, [params.id, router, searchParams, toast])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Verifying your purchase...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!verified || !event) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Purchase verification failed. Please try again.</p>
        </main>
        <Footer />
      </div>
    )
  }

  const startDate = new Date(event.startTime)
  const formattedDate = format(startDate, "MMMM d, yyyy")
  const formattedTime = format(startDate, "h:mm a")

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6 max-w-2xl mx-auto">
          <Card className="border-green-500">
            <CardHeader className="bg-green-50 dark:bg-green-950 border-b">
              <div className="flex items-center gap-2">
                <div className="bg-green-500 text-white p-1 rounded-full">
                  <Check className="h-5 w-5" />
                </div>
                <CardTitle>Purchase Successful</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold">{event.title}</h2>
                <p className="text-muted-foreground">Your ticket has been confirmed and is ready to use.</p>
              </div>
              <div className="rounded-lg border p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Date</span>
                  </div>
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Time</span>
                  </div>
                  <span>{formattedTime}</span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">What's Next?</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-sm">You'll receive a confirmation email with event details.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-sm">
                      The event link will be sent to you 30 minutes before the event starts.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-sm">You can also access the event from your calendar in the dashboard.</span>
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button asChild className="w-full">
                <Link href="/dashboard/calendar">View in My Calendar</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/events">Browse More Events</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
