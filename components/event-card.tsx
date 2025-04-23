import Link from "next/link"
import { Calendar, Clock, DollarSign, Users } from "lucide-react"
import { formatDistanceToNow, format, isValid } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Event } from "@/lib/mock-data"

interface EventCardProps {
  event: Event
  featured?: boolean
}

export function EventCard({ event, featured = false }: EventCardProps) {
  // Ensure event has an id
  const eventId = event?.id || "unknown"

  // Safely parse dates with error handling
  const parseDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (!isValid(date)) {
        console.error(`Invalid date: ${dateString}`)
        return new Date() // Fallback to current date
      }
      return date
    } catch (error) {
      console.error(`Error parsing date: ${dateString}`, error)
      return new Date() // Fallback to current date
    }
  }

  const startDate = event?.startTime ? parseDate(event.startTime) : new Date()
  const endDate = event?.endTime ? parseDate(event.endTime) : new Date()

  // Safe formatting with fallbacks
  const formatDateSafely = (date: Date, formatStr: string, fallback = "N/A") => {
    try {
      return isValid(date) ? format(date, formatStr) : fallback
    } catch (error) {
      console.error(`Error formatting date: ${date}`, error)
      return fallback
    }
  }

  const formatDistanceSafely = (date: Date, fallback = "upcoming") => {
    try {
      return isValid(date) ? formatDistanceToNow(date, { addSuffix: true }) : fallback
    } catch (error) {
      console.error(`Error calculating distance: ${date}`, error)
      return fallback
    }
  }

  const formattedDate = formatDateSafely(startDate, "MMMM d, yyyy")
  const formattedTime = `${formatDateSafely(startDate, "h:mm a")} - ${formatDateSafely(endDate, "h:mm a")}`
  const timeFromNow = formatDistanceSafely(startDate)

  // Ensure price is a number
  const price = typeof event?.price === "number" ? event.price : 0

  // Ensure attendees is an array
  const attendees = Array.isArray(event?.attendees) ? event.attendees : []
  const maxAttendees = event?.maxAttendees || 50

  return (
    <Card className={featured ? "border-primary" : ""}>
      {featured && (
        <div className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 absolute right-4 top-0 rounded-b-md">
          Featured
        </div>
      )}
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{event?.industry || "General"}</Badge>
          <Badge variant="secondary">{timeFromNow}</Badge>
        </div>
        <CardTitle className="line-clamp-1">{event?.title || "Untitled Event"}</CardTitle>
        <CardDescription className="line-clamp-2">{event?.description || "No description available."}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{formattedTime}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">${price.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {attendees.length}/{maxAttendees} attendees
            </span>
          </div>
        </div>
        {event?.host && (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={event.host.image || "/placeholder.svg"} alt={event.host.name || "Host"} />
              <AvatarFallback>{(event.host.name || "H").charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">Hosted by {event.host.name || "Anonymous"}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/events/${eventId}`}>View Event</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
