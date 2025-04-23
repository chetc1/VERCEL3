"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Calendar, Clock, DollarSign, Info, Upload, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/clerk"
import { createEvent } from "@/lib/supabase"
import { createRoom } from "@/lib/daily"
import { Slider } from "@/components/ui/slider"

export default function CreateEventPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { isSignedIn, user, signIn } = useAuth()
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [duration, setDuration] = useState(60) // Default duration in minutes
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    image: null as File | null,
    price: "",
    maxAttendees: "100", // Increased from 50 to 100
    industry: "",
    bankAccount: "",
    routingNumber: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }))

      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isSignedIn) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create an event.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      // Validate form data
      if (
        !formData.title ||
        !formData.description ||
        !formData.date ||
        !formData.startTime ||
        !formData.price ||
        !formData.maxAttendees ||
        !formData.industry
      ) {
        throw new Error("Please fill in all required fields")
      }

      // Parse dates and times
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`)

      // Calculate end time based on duration
      const endDateTime = new Date(startDateTime.getTime() + duration * 60000)

      // Create event
      const eventData = {
        title: formData.title,
        description: formData.description,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        price: Number.parseFloat(formData.price),
        hostId: user?.id,
        maxAttendees: Number.parseInt(formData.maxAttendees),
        attendees: [],
        industry: formData.industry,
        status: "upcoming",
        imageUrl: imagePreview, // Store the image URL
        bankAccount: formData.bankAccount,
        routingNumber: formData.routingNumber,
      }

      const result = await createEvent(eventData)

      if (!result.success) {
        throw new Error(result.error || "Failed to create event")
      }

      // Create video room
      const eventId = result.data.id
      await createRoom(eventId, formData.title)

      toast({
        title: "Event Created",
        description: "Your event has been created successfully.",
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Error creating event:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Sign In Required</h1>
            <p className="text-muted-foreground">Please sign in to create an event.</p>
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
        <div className="container px-4 md:px-6 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tighter">Create Event</h1>
            <p className="text-muted-foreground">Fill in the details below to create your event.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                  <CardDescription>Basic information about your event.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Startup Pitch Practice"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your event..."
                      rows={5}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select
                      value={formData.industry}
                      onValueChange={(value) => handleSelectChange("industry", value)}
                      required
                    >
                      <SelectTrigger id="industry">
                        <SelectValue placeholder="Select an industry" />
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
                  <div className="space-y-2">
                    <Label>Event Thumbnail</Label>
                    <div className="flex items-center gap-4">
                      <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                      </Button>
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                      <span className="text-sm text-muted-foreground">
                        {formData.image ? formData.image.name : "No file selected"}
                      </span>
                    </div>
                    {imagePreview && (
                      <div className="mt-4">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Event thumbnail preview"
                          className="max-h-40 rounded-md"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Date and Time</CardTitle>
                  <CardDescription>When will your event take place?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="startTime"
                        name="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        defaultValue={[60]}
                        min={15}
                        max={100}
                        step={5}
                        onValueChange={(value) => setDuration(value[0])}
                        className="flex-1"
                      />
                      <span className="w-12 text-center">{duration}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Event will end at{" "}
                      {formData.startTime && formData.date
                        ? new Date(
                            new Date(`${formData.date}T${formData.startTime}`).getTime() + duration * 60000,
                          ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "--:--"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Info className="h-4 w-4" />
                    <span>Events are limited to 100 minutes maximum duration.</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pricing and Capacity</CardTitle>
                  <CardDescription>Set your ticket price and attendee limit.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Ticket Price ($)</Label>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      You will receive 93% of the ticket price. 7% goes to platform fees.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxAttendees">Maximum Attendees</Label>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="maxAttendees"
                        name="maxAttendees"
                        type="number"
                        min="1"
                        max="100"
                        value={formData.maxAttendees}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">Maximum 100 attendees per event.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                  <CardDescription>Where should we send your earnings?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankAccount">Bank Account Number</Label>
                    <Input
                      id="bankAccount"
                      name="bankAccount"
                      value={formData.bankAccount}
                      onChange={handleInputChange}
                      placeholder="Enter your bank account number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="routingNumber">Routing Number</Label>
                    <Input
                      id="routingNumber"
                      name="routingNumber"
                      value={formData.routingNumber}
                      onChange={handleInputChange}
                      placeholder="Enter your routing number"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your payment information is securely stored and only used for sending your event earnings.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button asChild variant="outline">
                    <Link href="/dashboard">Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Event"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
