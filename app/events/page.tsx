"use client"

import { useState } from "react"
import { Calendar, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { EventCard } from "@/components/event-card"
import { mockEvents, mockUsers } from "@/lib/mock-data"

export default function EventsPage() {
  const [events, setEvents] = useState(
    mockEvents.map((event) => {
      const host = mockUsers.find((user) => user.id === event.hostId)
      return { ...event, host }
    }),
  )

  const [filteredEvents, setFilteredEvents] = useState(events)
  const [searchTerm, setSearchTerm] = useState("")
  const [industry, setIndustry] = useState("all")
  const [date, setDate] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [loading, setLoading] = useState(false)

  // Apply filters when filter button is clicked
  const applyFilters = () => {
    setLoading(true)

    let filtered = events

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply industry filter
    if (industry && industry !== "all") {
      filtered = filtered.filter((event) => event.industry === industry)
    }

    // Apply date filter
    if (date) {
      const selectedDate = new Date(date)
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.startTime)
        return eventDate.toDateString() === selectedDate.toDateString()
      })
    }

    // Apply price filters
    if (minPrice) {
      filtered = filtered.filter((event) => event.price >= Number.parseFloat(minPrice))
    }

    if (maxPrice) {
      filtered = filtered.filter((event) => event.price <= Number.parseFloat(maxPrice))
    }

    setFilteredEvents(filtered)
    setLoading(false)
  }

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("")
    setIndustry("all")
    setDate("")
    setMinPrice("")
    setMaxPrice("")
    setFilteredEvents(events)
  }

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
                      <Input
                        id="search"
                        placeholder="Search events..."
                        className="w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="industry" className="text-sm font-medium">
                        Industry
                      </label>
                      <Select value={industry} onValueChange={setIndustry}>
                        <SelectTrigger id="industry">
                          <SelectValue placeholder="All Industries" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Industries</SelectItem>
                          <SelectItem value="Technology">Technology</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Design">Design</SelectItem>
                          <SelectItem value="Business">Business</SelectItem>
                          <SelectItem value="Education">Education</SelectItem>
                          <SelectItem value="Health">Health</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="date" className="text-sm font-medium">
                        Date
                      </label>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="date"
                          type="date"
                          className="w-full"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="price" className="text-sm font-medium">
                        Price Range
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          id="min-price"
                          type="number"
                          placeholder="Min"
                          className="w-full"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                        />
                        <Input
                          id="max-price"
                          type="number"
                          placeholder="Max"
                          className="w-full"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={applyFilters}>
                        <Filter className="mr-2 h-4 w-4" />
                        Apply Filters
                      </Button>
                      <Button variant="outline" onClick={resetFilters}>
                        Reset
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:w-3/4">
                {loading ? (
                  <div className="flex justify-center">
                    <p>Loading events...</p>
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredEvents.length > 0 ? (
                      filteredEvents.map((event) => <EventCard key={event.id} event={event} />)
                    ) : (
                      <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                        <h3 className="mt-2 text-lg font-semibold">No events found</h3>
                        <p className="mb-4 mt-1 text-sm text-muted-foreground">
                          Try adjusting your filters or check back later.
                        </p>
                        <Button onClick={resetFilters}>Reset Filters</Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
