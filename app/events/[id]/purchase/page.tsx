"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Calendar, Clock, CreditCard, Info, Users } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/clerk"
import { getEvent } from "@/lib/supabase"
import { createCheckoutSession, redirectToCheckout } from "@/lib/stripe"

export default function PurchasePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { isSignedIn, user, signIn } = useAuth()
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    industry: "",
  })

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventData = await getEvent(params.id)
        if (!eventData) {
          router.push("/events")
          return
        }
        setEvent(eventData)
      } catch (error) {
        console.error("Error fetching event:", error)
        toast({
          title: "Error",
          description: "Failed to load event details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [params.id, router, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleIndustryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, industry: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isSignedIn && !formData.name && !formData.email) {
      toast({
        title: "Missing information",
        description: "Please sign in or provide your name and email.",
        variant: "destructive",
      })
      return
    }

    try {
      setPurchasing(true)

      // Create checkout session
      const userId = isSignedIn ? user?.id : "guest"
      const result = await createCheckoutSession(event.id, userId, event.price)

      if (!result.success) {
        throw new Error(result.error || "Failed to create checkout session")
      }

      // Redirect to checkout
      if (result.url) {
        window.location.href = result.url
      } else {
        await redirectToCheckout(result.sessionId)
      }
    } catch (error) {
      console.error("Error during checkout:", error)
      toast({
        title: "Checkout Error",
        description: "There was a problem processing your payment. Please try again.",
        variant: "destructive",
      })
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading event details...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Event not found.</p>
        </main>
        <Footer />
      </div>
    )
  }

  const startDate = new Date(event.startTime)
  const endDate = new Date(event.endTime)

  const formattedDate = format(startDate, "MMMM d, yyyy")
  const formattedTime = `${format(startDate, "h:mm a")} - ${format(endDate, "h:mm a")}`

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tighter">Purchase Ticket</h1>
                <p className="text-muted-foreground">Complete your purchase to attend this event.</p>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Attendee Information</CardTitle>
                  <CardDescription>
                    {isSignedIn
                      ? "Your information will be used for this event."
                      : "Please sign in or provide your information below."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSignedIn ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Name</Label>
                          <p className="text-sm mt-1">{user?.name}</p>
                        </div>
                        <div>
                          <Label>Email</Label>
                          <p className="text-sm mt-1">{user?.email}</p>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="industry">Industry</Label>
                        <Select value={formData.industry} onValueChange={handleIndustryChange}>
                          <SelectTrigger id="industry" className="mt-1">
                            <SelectValue placeholder="Select your industry" />
                          </SelectTrigger>
                          <SelectContent>
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
                    </div>
                  ) : (
                    <form className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="industry">Industry</Label>
                          <Select value={formData.industry} onValueChange={handleIndustryChange}>
                            <SelectTrigger id="industry">
                              <SelectValue placeholder="Select your industry" />
                            </SelectTrigger>
                            <SelectContent>
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
                      </div>
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          Already have an account?{" "}
                          <button type="button" className="text-primary underline" onClick={() => signIn()}>
                            Sign in
                          </button>
                        </p>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                  <CardDescription>Secure payment processing via Stripe.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <p className="font-medium">Credit Card</p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        You'll be redirected to our secure payment processor to complete your purchase.
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={handleSubmit} disabled={purchasing}>
                    {purchasing ? "Processing..." : `Pay $${event.price.toFixed(2)}`}
                  </Button>
                </CardFooter>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={`/abstract-geometric-shapes.png?key=8qr21&height=80&width=80&query=${encodeURIComponent(event.title)}`}
                      alt={event.title}
                      className="rounded-lg object-cover"
                      width={80}
                      height={80}
                    />
                    <div>
                      <h3 className="font-medium">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formattedDate} • {formattedTime}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Date and Time</p>
                        <p className="text-sm text-muted-foreground">{formattedDate}</p>
                        <p className="text-sm text-muted-foreground">{formattedTime}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Attendees</p>
                        <p className="text-sm text-muted-foreground">
                          {event.attendees.length} registered, {event.maxAttendees - event.attendees.length} spots left
                        </p>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span>Ticket Price</span>
                      <span>${event.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Platform Fee</span>
                      <span>$0.00</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>${event.price.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Access details will be sent to your email after purchase.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/events/${event.id}`}>Back to Event</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
