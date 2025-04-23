import { Suspense } from "react"
import Link from "next/link"
import { ArrowRight, Calendar, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { EventCard } from "@/components/event-card"
import { getFeaturedEvent, getEvents } from "@/lib/supabase"

export const revalidate = 86400 // Revalidate every 24 hours

export default async function HomePage() {
  const featuredEvent = await getFeaturedEvent()
  const upcomingEvents = await getEvents(6)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Connect with entrepreneurs at virtual events
                </h1>
                <p className="text-muted-foreground md:text-xl">
                  IndieEvent is a platform for entrepreneurs to host and attend virtual events. Learn from experts,
                  network with peers, and grow your business.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/events">Browse Events</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/dashboard">Host an Event</Link>
                  </Button>
                </div>
              </div>
              <div className="flex justify-center">
                <img
                  src="/interconnected-virtual-event.png"
                  alt="Virtual Event Platform"
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
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Featured Event</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Don't Miss Out</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join our featured event and connect with like-minded entrepreneurs.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-1">
              {featuredEvent ? (
                <EventCard event={featuredEvent} featured />
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <h3 className="mt-2 text-lg font-semibold">No featured event</h3>
                  <p className="mb-4 mt-1 text-sm text-muted-foreground">
                    Check back soon for upcoming featured events.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Upcoming Events</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Browse our upcoming events and find the perfect one for you.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <Suspense fallback={<p>Loading events...</p>}>
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event) => <EventCard key={event.id} event={event} />)
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                    <h3 className="mt-2 text-lg font-semibold">No upcoming events</h3>
                    <p className="mb-4 mt-1 text-sm text-muted-foreground">Check back soon for upcoming events.</p>
                  </div>
                )}
              </Suspense>
            </div>
            <div className="flex justify-center">
              <Button asChild variant="outline" size="lg">
                <Link href="/events">
                  View All Events
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex justify-center">
                <img
                  src="/virtual-event-host.png"
                  alt="Host a Virtual Event"
                  className="rounded-lg object-cover aspect-video"
                  width={600}
                  height={400}
                />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Host your own virtual event
                </h2>
                <p className="text-muted-foreground md:text-xl">
                  Share your expertise, build your audience, and earn revenue by hosting virtual events on IndieEvent.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Calendar className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-bold">Easy Scheduling</h3>
                      <p className="text-muted-foreground">Create and schedule your events with just a few clicks.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Users className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-bold">Grow Your Audience</h3>
                      <p className="text-muted-foreground">
                        Connect with entrepreneurs who are interested in your expertise.
                      </p>
                    </div>
                  </div>
                </div>
                <Button asChild size="lg">
                  <Link href="/dashboard">Start Hosting</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
