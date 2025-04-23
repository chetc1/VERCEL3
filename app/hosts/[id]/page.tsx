import { notFound } from "next/navigation"
import Link from "next/link"
import { Mail, MapPin, Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { mockUsers, mockEvents } from "@/lib/mock-data"
import { EventCard } from "@/components/event-card"

export const revalidate = 86400 // Revalidate every 24 hours

interface HostPageProps {
  params: {
    id: string
  }
}

export default function HostPage({ params }: HostPageProps) {
  // Find the host
  const host = mockUsers.find((user) => user.id === params.id)

  if (!host) {
    notFound()
  }

  // Find events by this host
  const hostEvents = mockEvents
    .filter((event) => event.hostId === host.id)
    .map((event) => ({
      ...event,
      host,
    }))

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{host.industry}</Badge>
                  <Badge variant="secondary">Event Host</Badge>
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{host.name}</h1>
                <p className="text-muted-foreground md:text-xl">{host.bio}</p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span>Virtual</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span>{host.email}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/events">Browse Events</Link>
                  </Button>
                  <Button variant="outline" size="lg">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Profile
                  </Button>
                </div>
              </div>
              <div className="flex justify-center">
                <Avatar className="h-64 w-64">
                  <AvatarImage src={host.image || "/placeholder.svg"} alt={host.name} />
                  <AvatarFallback className="text-4xl">{host.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Upcoming Events</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Check out the upcoming events hosted by {host.name}.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              {hostEvents.length > 0 ? (
                hostEvents.map((event) => <EventCard key={event.id} event={event} />)
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <h3 className="mt-2 text-lg font-semibold">No upcoming events</h3>
                  <p className="mb-4 mt-1 text-sm text-muted-foreground">
                    {host.name} doesn't have any upcoming events at the moment.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
