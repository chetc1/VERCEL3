"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Calendar, Clock, CreditCard, Info, Users } from "lucide-react"
import { format, isValid } from "date-fns"

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
    // Credit card fields
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    cardName: "",
  })

  // Fetch event data
  useEffect(() => {
    async function fetchEvent() {
      try {
        setLoading(true)
        const eventData = await getEvent(params.id)

        if (!eventData) {
          toast({
            title: "Event Not Found",
            description: "The event you're looking for doesn't exist.",
            variant: "destructive",
          })
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

    // Format card number with spaces
    if (name === "cardNumber") {
      const formatted = value
        .replace(/\s/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim()
      setFormData((prev) => ({ ...prev, [name]: formatted }))
      return
    }

    // Format card expiry with slash
    if (name === "cardExpiry") {
      const cleaned = value.replace(/\D/g, "")
      if (cleaned.length <= 2) {
        setFormData((prev) => ({ ...prev, [name]: cleaned }))
      } else {
        const month = cleaned.substring(0, 2)
        const year = cleaned.substring(2, 4)
        setFormData((prev) => ({ ...prev, [name]: `${month}/${year}` }))
      }
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleIndustryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, industry: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!event) {
      toast({
        title: "Error",
        description: "Event details not available. Please try again.",
        variant: "destructive",
      })
      return
    }

    if (!isSignedIn && (!formData.name || !formData.email)) {
      toast({
        title: "Missing Information",
        description: "Please sign in or provide your name and email.",
        variant: "destructive",
      })
      return
    }

    // Validate credit card details
    if (!formData.cardNumber || !formData.cardExpiry || !formData.cardCvc || !formData.cardName) {
      toast({
        title: "Missing Payment Information",
        description: "Please enter all credit card details.",
        variant: "destructive",
      })
      return
    }

    try {
      setPurchasing(true)

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Create checkout session
      const userId = isSignedIn && user ? user.id : "guest"
      const price = event.price || 0

      toast({
        title: "Payment Successful",
        description: "Your ticket has been purchased successfully.",
      })

      // Redirect to success page
      router.push(`/events/${params.id}/purchase/success?session_id=mock_session_${Date.now()}`)
    } catch (error) {
      console.error("Error during checkout:", error)
      toast({
        title: "Checkout Error",
        description: "There was a problem processing your payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setPurchasing(false)
    }
  }

  // Safe date parsing and formatting
  const parseDate = (dateString?: string) => {
    if (!dateString) return new Date()
    try {
      const date = new Date(dateString)
      return isValid(date) ? date : new Date()
    } catch (error) {
      console.error(`Error parsing date: ${dateString}`, error)
      return new Date()
    }
  }

  const formatDateSafely = (date: Date, formatStr: string, fallback = "N/A") => {
    try {
      return isValid(date) ? format(date, formatStr) : fallback
    } catch (error) {
      console.error(`Error formatting date: ${date}`, error)
      return fallback
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
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
            <p className="mb-4">The event you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link href="/events">Browse Events</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const startDate = parseDate(event.startTime)
  const endDate = parseDate(event.endTime)

  const formattedDate = formatDateSafely(startDate, "MMMM d, yyyy")
  const formattedTime = `${formatDateSafely(startDate, "h:mm a")} - ${formatDateSafely(endDate, "h:mm a")}`

  // Ensure attendees is an array
  const attendees = Array.isArray(event.attendees) ? event.attendees : []
  const maxAttendees = event.maxAttendees || 100

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
                  {isSignedIn && user ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Name</Label>
                          <p className="text-sm mt-1">{user.name || "N/A"}</p>
                        </div>
                        <div>
                          <Label>Email</Label>
                          <p className="text-sm mt-1">{user.email || "N/A"}</p>
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
                  <CardDescription>Enter your credit card details to complete the purchase.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardName">Name on Card</Label>
                      <Input
                        id="cardName"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="cardNumber"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          placeholder="4242 4242 4242 4242"
                          className="pl-10"
                          maxLength={19}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardExpiry">Expiry Date</Label>
                        <Input
                          id="cardExpiry"
                          name="cardExpiry"
                          value={formData.cardExpiry}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          maxLength={5}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardCvc">CVC</Label>
                        <Input
                          id="cardCvc"
                          name="cardCvc"
                          value={formData.cardCvc}
                          onChange={handleInputChange}
                          placeholder="123"
                          maxLength={3}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={handleSubmit} disabled={purchasing}>
                    {purchasing ? "Processing..." : `Pay $${(event.price || 0).toFixed(2)}`}
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
                      src={
                        event.imageUrl ||
                        `/abstract-geometric-shapes.png?height=80&width=80&query=${encodeURIComponent(event.title)}`
                      }
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
                          {attendees.length} registered, {maxAttendees - attendees.length} spots left
                        </p>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span>Ticket Price</span>
                      <span>${(event.price || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Platform Fee</span>
                      <span>$0.00</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>${(event.price || 0).toFixed(2)}</span>
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
                    <Link href={`/events/${params.id}`}>Back to Event</Link>
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
