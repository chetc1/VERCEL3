"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Calendar, MessageSquare, Mic, MicOff, Users, Video, VideoOff } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/clerk"
import { getEvent, getTicketsByUser } from "@/lib/supabase"
import { getRoom, checkDailyConfigured } from "@/lib/daily"

export default function JoinPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { isSignedIn, user } = useAuth()
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [hasTicket, setHasTicket] = useState(false)
  const [roomUrl, setRoomUrl] = useState<string | null>(null)
  const [isDailyAvailable, setIsDailyAvailable] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [videoEnabled, setVideoEnabled] = useState(false)

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Check if user is signed in
        if (!isSignedIn || !user) {
          toast({
            title: "Authentication Required",
            description: "Please sign in to join this event.",
            variant: "destructive",
          })
          router.push(`/events/${params.id}`)
          return
        }

        // Fetch event details
        const eventData = await getEvent(params.id)
        if (!eventData) {
          toast({
            title: "Event Not Found",
            description: "The event you're trying to join doesn't exist.",
            variant: "destructive",
          })
          router.push("/events")
          return
        }

        setEvent(eventData)

        // Check if user has a ticket
        const tickets = await getTicketsByUser(user.id)
        const hasValidTicket = tickets.some((ticket) => ticket.eventId === params.id && ticket.status === "confirmed")

        setHasTicket(hasValidTicket)

        if (!hasValidTicket) {
          toast({
            title: "No Ticket Found",
            description: "You need to purchase a ticket to join this event.",
            variant: "destructive",
          })
          router.push(`/events/${params.id}/purchase`)
          return
        }

        // Check if Daily is configured
        const dailyConfigured = await checkDailyConfigured()
        setIsDailyAvailable(dailyConfigured)

        // Get room URL
        const roomResult = await getRoom(params.id)
        if (!roomResult.success) {
          throw new Error(roomResult.error || "Failed to get room URL")
        }

        setRoomUrl(roomResult.url)
      } catch (error) {
        console.error("Error checking access:", error)
        toast({
          title: "Error",
          description: "There was a problem joining the event. Please try again.",
          variant: "destructive",
        })
        router.push(`/events/${params.id}`)
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [params.id, router, toast, isSignedIn, user])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading event...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!event || !hasTicket) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>You don't have access to this event.</p>
        </main>
        <Footer />
      </div>
    )
  }

  const startDate = new Date(event.startTime)
  const formattedDate = format(startDate, "MMMM d, yyyy")
  const formattedTime = format(startDate, "h:mm a")

  // If Daily.co is not configured, show a placeholder UI
  if (!isDailyAvailable) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-6">
          <div className="container px-4 md:px-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">{event.title}</h1>
              <p className="text-muted-foreground">
                {formattedDate} • {formattedTime}
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Video Call</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center p-6">
                        <h3 className="text-lg font-semibold mb-2">Video Call Placeholder</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          This is a placeholder for the video call interface. In a real deployment, this would be
                          replaced with a Daily.co video call once the API key is configured.
                        </p>
                        <div className="flex justify-center gap-2">
                          <Button
                            variant={videoEnabled ? "default" : "outline"}
                            size="sm"
                            onClick={() => setVideoEnabled(!videoEnabled)}
                          >
                            {videoEnabled ? <Video className="h-4 w-4 mr-2" /> : <VideoOff className="h-4 w-4 mr-2" />}
                            {videoEnabled ? "Camera On" : "Camera Off"}
                          </Button>
                          <Button
                            variant={audioEnabled ? "default" : "outline"}
                            size="sm"
                            onClick={() => setAudioEnabled(!audioEnabled)}
                          >
                            {audioEnabled ? <Mic className="h-4 w-4 mr-2" /> : <MicOff className="h-4 w-4 mr-2" />}
                            {audioEnabled ? "Mic On" : "Mic Off"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Tabs defaultValue="chat">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="chat">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Chat
                    </TabsTrigger>
                    <TabsTrigger value="participants">
                      <Users className="h-4 w-4 mr-2" />
                      Participants
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="chat" className="border rounded-md p-4 h-[300px] overflow-y-auto">
                    <div className="space-y-4">
                      <div className="flex items-start gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={event.host?.image || "/placeholder.svg"} alt={event.host?.name} />
                          <AvatarFallback>{event.host?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{event.host?.name}</span>
                            <span className="text-xs text-muted-foreground">10:30 AM</span>
                          </div>
                          <p className="text-sm">Welcome everyone to the event! We'll be starting in a few minutes.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/vibrant-street-market.png" alt="Participant" />
                          <AvatarFallback>P</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">Participant</span>
                            <span className="text-xs text-muted-foreground">10:32 AM</span>
                          </div>
                          <p className="text-sm">Looking forward to this session!</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="participants" className="border rounded-md p-4 h-[300px] overflow-y-auto">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 hover:bg-muted rounded-md">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={event.host?.image || "/placeholder.svg"} alt={event.host?.name} />
                            <AvatarFallback>{event.host?.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{event.host?.name}</span>
                        </div>
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">Host</span>
                      </div>
                      <div className="flex items-center justify-between p-2 hover:bg-muted rounded-md">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.image || "/placeholder.svg"} alt={user?.name} />
                            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user?.name} (You)</span>
                        </div>
                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                          Attendee
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 hover:bg-muted rounded-md">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/vibrant-street-market.png" alt="Participant" />
                            <AvatarFallback>P</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">Participant</span>
                        </div>
                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                          Attendee
                        </span>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Event Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">{event.title}</h3>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {formattedDate} • {formattedTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{event.attendees.length} attendees</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">About This Event</h3>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Host</h3>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={event.host?.image || "/placeholder.svg"} alt={event.host?.name} />
                          <AvatarFallback>{event.host?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{event.host?.name}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/dashboard/calendar">Back to Calendar</Link>
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-6">
        <div className="container px-4 md:px-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{event.title}</h1>
            <p className="text-muted-foreground">
              {formattedDate} • {formattedTime}
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Video Call</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-lg">
                    {roomUrl ? (
                      <iframe
                        title="Event Video Call"
                        src={roomUrl}
                        allow="camera; microphone; fullscreen; speaker; display-capture"
                        className="w-full h-full rounded-lg"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p>Loading video call...</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              {/* Chat and participants tabs would be here */}
            </div>
            <div className="space-y-4">{/* Event information card would be here */}</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
