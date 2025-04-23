import { Suspense } from "react"
import { Calendar, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { EventCard } from "@/components/event-card"
import { getEvents } from "@/lib/supabase"

export const revalidate = 86400 // Revalidate every 24 hours

export default async function EventsPage() {
  const events = await getEvents()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="space-y-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Upcoming Events</h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Browse and join virtual events hosted by entrepreneurs from around the world.
              </p>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col gap-8 md:flex-row">
              <div className="md:w-1/4 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">Filters</h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="search" className="text-sm font-medium">
                        Search
                      </label>
                      <Input id="search" placeholder="Search events..." className="w-full" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="industry" className="text-sm font-medium">
                        Industry
                      </label>
                      <Select>
                        <SelectTrigger id="industry">
                          <SelectValue placeholder="All Industries" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Industries</SelectItem>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="date" className="text-sm font-medium">
                        Date
                      </label>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <Input id="date" type="date" className="w-full" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="price" className="text-sm font-medium">
                        Price Range
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input id="min-price" type="number" placeholder="Min" className="w-full" />
                        <Input id="max-price" type="number" placeholder="Max" className="w-full" />
                      </div>
                    </div>
                    <Button className="w-full">
                      <Filter className="mr-2 h-4 w-4" />
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </div>
              <div className="md:w-3/4">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <Suspense fallback={<p>Loading events...</p>}>
                    {events.length > 0 ? (
                      events.map((event) => <EventCard key={event.id} event={event} />)
                    ) : (
                      <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                        <h3 className="mt-2 text-lg font-semibold">No events found</h3>
                        <p className="mb-4 mt-1 text-sm text-muted-foreground">
                          Try adjusting your filters or check back later.
                        </p>
                      </div>
                    )}
                  </Suspense>
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
