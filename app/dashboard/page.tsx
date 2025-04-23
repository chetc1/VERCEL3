"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Calendar, Plus, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/clerk"
import { getEventsByHost, getEventsByAttendee, getFollowers } from "@/lib/supabase"

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { isSignedIn, user, signIn } = useAuth()
  const [hostedEvents, setHostedEvents] = useState<any[]>([])
  const [attendingEvents, setAttendingEvents] = useState<any[]>([])
  const [followers, setFollowers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!isSignedIn) {
          return
        }

        const userId = user?.id

        // Fetch hosted events
        const hostEvents = await getEventsByHost(userId)
        setHostedEvents(hostEvents)

        // Fetch attending events
        const attendEvents = await getEventsByAttendee(userId)
        setAttendingEvents(attendEvents)

        // Fetch followers
        const userFollowers = await getFollowers(userId)
        setFollowers(userFollowers)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [isSignedIn, user, toast])

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Sign In Required</h1>
            <p className="text-muted-foreground">Please sign in to access your dashboard.</p>
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
              <h1 className="text-3xl font-bold tracking-tighter">Dashboard</h1>
              <p className="text-muted-foreground">Manage your events and view your stats.</p>
            </div>
            <Button asChild className="mt-4 md:mt-0">
              <Link href="/dashboard/events/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Events Hosted</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hostedEvents.length}</div>
                <p className="text-xs text-muted-foreground">
                  +
                  {
                    hostedEvents.filter((e) => new Date(e.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
                      .length
                  }{" "}
                  in the last 30 days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Events Attending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{attendingEvents.length}</div>
                <p className="text-xs text-muted-foreground">
                  +
                  {
                    attendingEvents.filter(
                      (e) => new Date(e.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    ).length
                  }{" "}
                  in the last 30 days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Followers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{followers.length}</div>
                <p className="text-xs text-muted-foreground">People following your events</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="hosted" className="mb-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="hosted">
                <Calendar className="mr-2 h-4 w-4" />
                Events You're Hosting
              </TabsTrigger>
              <TabsTrigger value="attending">
                <Users className="mr-2 h-4 w-4" />
                Events You're Attending
              </TabsTrigger>
            </TabsList>
            <TabsContent value="hosted" className="space-y-4">
              {loading ? (
                <p>Loading your hosted events...</p>
              ) : hostedEvents.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {hostedEvents.map((event) => (
                    <Card key={event.id}>
                      <CardHeader>
                        <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                        <CardDescription>
                          {new Date(event.startTime).toLocaleDateString()} at{" "}
                          {new Date(event.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Attendees</span>
                            <span className="text-sm font-medium">
                              {event.attendees.length}/{event.maxAttendees}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Price</span>
                            <span className="text-sm font-medium">${event.price.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Status</span>
                            <span className="text-sm font-medium capitalize">{event.status}</span>
                          </div>
                        </div>
                      </CardContent>
                      <div className="p-4 pt-0 flex gap-2">
                        <Button asChild variant="outline" size="sm" className="flex-1">
                          <Link href={`/dashboard/events/${event.id}/edit`}>Edit</Link>
                        </Button>
                        <Button asChild size="sm" className="flex-1">
                          <Link href={`/events/${event.id}`}>View</Link>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <h3 className="mt-2 text-lg font-semibold">No events hosted</h3>
                  <p className="mb-4 mt-1 text-sm text-muted-foreground">
                    You haven't hosted any events yet. Create your first event to get started.
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/events/create">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Event
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>
            <TabsContent value="attending" className="space-y-4">
              {loading ? (
                <p>Loading events you're attending...</p>
              ) : attendingEvents.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {attendingEvents.map((event) => (
                    <Card key={event.id}>
                      <CardHeader>
                        <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                        <CardDescription>
                          {new Date(event.startTime).toLocaleDateString()} at{" "}
                          {new Date(event.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Hosted by:</span>
                            <span className="text-sm font-medium">{event.host?.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Status</span>
                            <span className="text-sm font-medium capitalize">{event.status}</span>
                          </div>
                        </div>
                      </CardContent>
                      <div className="p-4 pt-0">
                        <Button asChild className="w-full">
                          <Link href={`/events/${event.id}`}>View Event</Link>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <h3 className="mt-2 text-lg font-semibold">No events attending</h3>
                  <p className="mb-4 mt-1 text-sm text-muted-foreground">
                    You're not attending any events yet. Browse events to find something interesting.
                  </p>
                  <Button asChild>
                    <Link href="/events">Browse Events</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tighter">Your Followers</h2>
            {loading ? (
              <p>Loading your followers...</p>
            ) : followers.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {followers.map((follower) => (
                  <Card key={follower.id}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        {follower.image ? (
                          <img
                            src={follower.image || "/placeholder.svg"}
                            alt={follower.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-semibold">{follower.name.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{follower.name}</p>
                        <p className="text-sm text-muted-foreground">{follower.industry}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <h3 className="mt-2 text-lg font-semibold">No followers yet</h3>
                <p className="mb-4 mt-1 text-sm text-muted-foreground">
                  As you host more events, people will start following you.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
