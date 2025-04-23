import Link from "next/link"
import { Calendar, Clock, DollarSign, Users } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

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
  const startDate = new Date(event.startTime)
  const endDate = new Date(event.endTime)

  const formattedDate = format(startDate, "MMMM d, yyyy")
  const formattedTime = `${format(startDate, "h:mm a")} - ${format(endDate, "h:mm a")}`
  const timeFromNow = formatDistanceToNow(startDate, { addSuffix: true })

  return (
    <Card className={featured ? "border-primary" : ""}>
      {featured && (
        <div className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 absolute right-4 top-0 rounded-b-md">
          Featured
        </div>
      )}
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{event.industry}</Badge>
          <Badge variant="secondary">{timeFromNow}</Badge>
        </div>
        <CardTitle className="line-clamp-1">{event.title}</CardTitle>
        <CardDescription className="line-clamp-2">{event.description}</CardDescription>
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
            <span className="text-sm">${event.price.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {event.attendees.length}/{event.maxAttendees} attendees
            </span>
          </div>
        </div>
        {event.host && (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={event.host.image || "/placeholder.svg"} alt={event.host.name} />
              <AvatarFallback>{event.host.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">Hosted by {event.host.name}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/events/${event.id}`}>Buy Ticket</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
