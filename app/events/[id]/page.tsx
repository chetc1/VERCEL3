import { notFound } from "next/navigation"
import Link from "next/link"
import { Calendar, Clock, DollarSign, MapPin, Share2, Users } from "lucide-react"
import { format, isValid } from "date-fns"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getEvent } from "@/lib/supabase"

export const revalidate = 86400 // Revalidate every 24 hours

interface EventPageProps {
  params: {
    id: string
  }
}

export default async function EventPage({ params }: EventPageProps) {
  let event = null

  try {
    event = await getEvent(params.id)
  } catch (error) {
    console.error("Error fetching event:", error)
  }

  if (!event) {
    notFound()
  }

  // Safely parse dates
  const parseDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return isValid(date) ? date : new Date()
    } catch (error) {
      console.error(`Error parsing date: ${dateString}`, error)
      return new Date()
    }
  }

  const startDate = parseDate(event.startTime)
  const endDate = parseDate(event.endTime)

  // Safe formatting
  const formatDateSafely = (date: Date, formatStr: string, fallback = "N/A") => {
    try {
      return isValid(date) ? format(date, formatStr) : fallback
    } catch (error) {
      console.error(`Error formatting date: ${date}`, error)
      return fallback
    }
  }

  const formattedDate = formatDateSafely(startDate, "MMMM d, yyyy")
  const formattedTime = `${formatDateSafely(startDate, "h:mm a")} - ${formatDateSafely(endDate, "h:mm a")}`
  const duration = Math.max(0, (endDate.getTime() - startDate.getTime()) / (1000 * 60)) // in minutes

  // Ensure attendees is an array
  const attendees = Array.isArray(event.attendees) ? event.attendees : []
  const maxAttendees = event.maxAttendees || 50

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{event.industry}</Badge>
                  <Badge variant="secondary">
                    {event.status === "upcoming" ? "Upcoming" : event.status === "live" ? "Live" : "Completed"}
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{event.title}</h1>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={event.host?.image || "/placeholder.svg"} alt={event.host?.name || "Host"} />
                    <AvatarFallback>{event.host?.name?.charAt(0) || "H"}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">Hosted by {event.host?.name || "Anonymous"}</span>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span>{formattedTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <span>${(event.price || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span>
                      {attendees.length}/{maxAttendees} attendees
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href={`/events/${event.id}/purchase`}>Buy Ticket</Link>
                  </Button>
                  <Button variant="outline" size="lg">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
              <div className="flex justify-center">
                <img
                  src={`/abstract-geometric-shapes.png?height=400&width=600&query=${encodeURIComponent(event.title)}`}
                  alt={event.title}
                  className="rounded-lg object-cover aspect-video"
                  width={600}
                  height={400}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">About This Event</h2>
                  <p className="text-muted-foreground whitespace-pre-line">{event.description}</p>
                </div>
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">What You'll Learn</h2>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Practical insights from experienced entrepreneurs</li>
                    <li>Strategies to grow your business</li>
                    <li>Networking opportunities with like-minded individuals</li>
                    <li>Q&A session with the host</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-6">
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                  <div className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold">Event Details</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-2">
                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Date and Time</p>
                          <p className="text-sm text-muted-foreground">{formattedDate}</p>
                          <p className="text-sm text-muted-foreground">{formattedTime}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Duration</p>
                          <p className="text-sm text-muted-foreground">{duration} minutes</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Location</p>
                          <p className="text-sm text-muted-foreground">Virtual Event</p>
                          <p className="text-sm text-muted-foreground">Link provided after registration</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Attendees</p>
                          <p className="text-sm text-muted-foreground">
                            {attendees.length} registered, {maxAttendees - attendees.length} spots left
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button asChild className="w-full">
                      <Link href={`/events/${event.id}/purchase`}>Buy Ticket - ${(event.price || 0).toFixed(2)}</Link>
                    </Button>
                  </div>
                </div>
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                  <div className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold">About the Host</h3>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={event.host?.image || "/placeholder.svg"} alt={event.host?.name || "Host"} />
                        <AvatarFallback>{event.host?.name?.charAt(0) || "H"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{event.host?.name || "Anonymous"}</p>
                        <p className="text-sm text-muted-foreground">{event.host?.industry || "Various Industries"}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {event.host?.bio || "Experienced entrepreneur sharing insights and knowledge."}
                    </p>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/hosts/${event.hostId || "unknown"}`}>View Profile</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
