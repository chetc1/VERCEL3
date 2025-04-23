"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CalendarIcon, ChevronLeft, ChevronRight, Clock, DollarSign } from "lucide-react"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO,
} from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/clerk"
import { getEventsByAttendee } from "@/lib/supabase"

export default function CalendarPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { isSignedIn, user, signIn } = useAuth()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedEvents, setSelectedEvents] = useState<any[]>([])

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (!isSignedIn) {
          return
        }

        const userId = user?.id
        const attendingEvents = await getEventsByAttendee(userId)
        setEvents(attendingEvents)
      } catch (error) {
        console.error("Error fetching events:", error)
        toast({
          title: "Error",
          description: "Failed to load your events. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [isSignedIn, user, toast])

  useEffect(() => {
    // Filter events for the selected date
    const filtered = events.filter((event) => {
      const eventDate = parseISO(event.startTime)
      return isSameDay(eventDate, selectedDate)
    })
    setSelectedEvents(filtered)
  }, [selectedDate, events])

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  const hasEventOnDay = (day: Date) => {
    return events.some((event) => {
      const eventDate = parseISO(event.startTime)
      return isSameDay(eventDate, day)
    })
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Sign In Required</h1>
            <p className="text-muted-foreground">Please sign in to access your calendar.</p>
            <Button onClick={() => signIn()}>Sign In</Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tighter">My Calendar</h1>
              <p className="text-muted-foreground">View and manage your upcoming events.</p>
            </div>
            <Button asChild className="mt-4 md:mt-0">
              <Link href="/events">Browse More Events</Link>
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Calendar</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={prevMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="font-medium">{format(currentMonth, "MMMM yyyy")}</div>
                    <Button variant="outline" size="icon" onClick={nextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 text-center">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-sm font-medium py-2">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-12 rounded-md" />
                  ))}
                  {days.map((day) => {
                    const hasEvent = hasEventOnDay(day)
                    const isSelected = isSameDay(day, selectedDate)
                    const isCurrentMonth = isSameMonth(day, currentMonth)

                    return (
                      <button
                        key={day.toString()}
                        className={`h-12 rounded-md flex flex-col items-center justify-center relative ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : isCurrentMonth
                              ? "hover:bg-muted"
                              : "text-muted-foreground hover:bg-muted/50"
                        }`}
                        onClick={() => setSelectedDate(day)}
                      >
                        <span className="text-sm">{format(day, "d")}</span>
                        {hasEvent && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                              isSelected ? "bg-primary-foreground" : "bg-primary"
                            }`}
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Events on {format(selectedDate, "MMMM d, yyyy")}</CardTitle>
                <CardDescription>
                  {selectedEvents.length === 0
                    ? "No events scheduled for this day."
                    : `You have ${selectedEvents.length} event${selectedEvents.length > 1 ? "s" : ""} scheduled.`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <p>Loading events...</p>
                  ) : selectedEvents.length > 0 ? (
                    selectedEvents.map((event) => (
                      <Card key={event.id}>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <h3 className="font-medium">{event.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>
                                {format(parseISO(event.startTime), "h:mm a")} -{" "}
                                {format(parseISO(event.endTime), "h:mm a")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <DollarSign className="h-4 w-4" />
                              <span>${event.price.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium">Host:</span>
                              <span>{event.host?.name}</span>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Button asChild size="sm" className="w-full">
                                <Link href={`/events/${event.id}/join`}>Join Event</Link>
                              </Button>
                              <Button asChild variant="outline" size="sm" className="w-full">
                                <Link href={`/events/${event.id}`}>Details</Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                      <CalendarIcon className="h-8 w-8 text-muted-foreground mb-2" />
                      <h3 className="text-lg font-semibold">No events</h3>
                      <p className="text-sm text-muted-foreground mt-1 mb-4">No events scheduled for this day.</p>
                      <Button asChild>
                        <Link href="/events">Browse Events</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
