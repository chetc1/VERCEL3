"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Calendar, Check, ChevronRight, Clock } from "lucide-react"
import { format, isValid } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useToast } from "@/components/ui/use-toast"
import { getEvent } from "@/lib/supabase"

export default function SuccessPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      toast({
        title: "Missing Information",
        description: "No purchase information found. Redirecting to event page.",
        variant: "destructive",
      })
      router.push(`/events/${params.id}`)
      return
    }

    const fetchEventData = async () => {
      try {
        if (!params.id) {
          throw new Error("Invalid event ID")
        }

        const eventData = await getEvent(params.id)

        if (!eventData) {
          throw new Error("Event not found")
        }

        setEvent(eventData)
      } catch (error) {
        console.error("Error fetching event:", error)
        toast({
          title: "Error",
          description: "Failed to load event details. Please try again.",
          variant: "destructive",
        })
        router.push(`/events/${params.id}`)
      } finally {
        setLoading(false)
      }
    }

    fetchEventData()
  }, [params.id, router, searchParams, toast])

  // Safe date parsing and formatting
  const parseDate = (dateString?: string) => {
    if (!dateString) return new Date()
    try {
      const date = new Date(dateString)
      return isValid(date) ? date : new Date()
    } catch (error) {
      console.error(`Error parsing date: ${dateString}`, error)
      return new Date()
    }
  }

  const formatDateSafely = (date: Date, formatStr: string, fallback = "N/A") => {
    try {
      return isValid(date) ? format(date, formatStr) : fallback
    } catch (error) {
      console.error(`Error formatting date: ${date}`, error)
      return fallback
    }
  }

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

  if (!event) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
            <p className="mb-4">The event you purchased a ticket for could not be found.</p>
            <Button asChild>
              <Link href="/events">Browse Events</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const startDate = parseDate(event.startTime)
  const formattedDate = formatDateSafely(startDate, "MMMM d, yyyy")
  const formattedTime = formatDateSafely(startDate, "h:mm a")

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
                <h2 className="text-2xl font-bold">{event.title || "Event"}</h2>
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
