export type Industry = "Technology" | "Marketing" | "Finance" | "Design" | "Education" | "Health" | "Business"

export type EventStatus = "upcoming" | "live" | "completed"

export interface User {
  id: string
  name: string
  email: string
  image?: string
  industry: Industry
  bio?: string
  isHost: boolean
  createdAt: string
}

export interface Event {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  price: number
  hostId: string
  host?: User
  maxAttendees: number
  attendees: string[]
  industry: Industry
  status: EventStatus
  roomUrl?: string
  createdAt: string
  updatedAt: string
  featured?: boolean
}

export interface Ticket {
  id: string
  eventId: string
  userId: string
  purchasedAt: string
  price: number
  status: "confirmed" | "cancelled" | "pending"
}

export interface Follow {
  id: string
  followerId: string
  followingId: string
  createdAt: string
}

// Mock Users
export const mockUsers: User[] = [
  {
    id: "user-1",
    name: "Alex Johnson",
    email: "alex@example.com",
    image: "/diverse-founders-brainstorm.png",
    industry: "Technology",
    bio: "Startup founder with 10+ years of experience in SaaS",
    isHost: true,
    createdAt: "2023-01-15T08:00:00Z",
  },
  {
    id: "user-2",
    name: "Sarah Williams",
    email: "sarah@example.com",
    image: "/strategic-marketing-session.png",
    industry: "Marketing",
    bio: "Digital marketing specialist focused on growth strategies",
    isHost: true,
    createdAt: "2023-02-10T10:30:00Z",
  },
  {
    id: "user-3",
    name: "Michael Chen",
    email: "michael@example.com",
    image: "/financial-advisor-meeting.png",
    industry: "Finance",
    bio: "Investment advisor helping startups secure funding",
    isHost: true,
    createdAt: "2023-03-05T14:15:00Z",
  },
  {
    id: "user-4",
    name: "Emma Davis",
    email: "emma@example.com",
    image: "/fashion-designer-at-work.png",
    industry: "Design",
    bio: "UX/UI designer with a passion for user-centered design",
    isHost: true,
    createdAt: "2023-04-20T09:45:00Z",
  },
  {
    id: "user-5",
    name: "James Wilson",
    email: "james@example.com",
    image: "/diverse-founders-brainstorm.png",
    industry: "Business",
    bio: "Serial entrepreneur with 3 successful exits",
    isHost: true,
    createdAt: "2023-05-12T11:20:00Z",
  },
  {
    id: "user-6",
    name: "Guest User",
    email: "guest@example.com",
    industry: "Technology",
    isHost: false,
    createdAt: "2023-06-01T00:00:00Z",
  },
]

// Calculate dates relative to current date
const now = new Date()
const tomorrow = new Date(now)
tomorrow.setDate(tomorrow.getDate() + 1)
const nextWeek = new Date(now)
nextWeek.setDate(nextWeek.getDate() + 7)
const twoWeeksLater = new Date(now)
twoWeeksLater.setDate(twoWeeksLater.getDate() + 14)

// Mock Events
export const mockEvents: Event[] = [
  {
    id: "event-1",
    title: "Startup Pitch Practice",
    description:
      "Practice your startup pitch and get feedback from experienced founders and investors. Perfect your elevator pitch in a supportive environment.",
    startTime: tomorrow.toISOString(),
    endTime: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    price: 25,
    hostId: "user-1",
    maxAttendees: 50,
    attendees: ["user-3", "user-4", "user-6"],
    industry: "Business",
    status: "upcoming",
    createdAt: "2023-06-15T08:00:00Z",
    updatedAt: "2023-06-15T08:00:00Z",
    featured: true,
  },
  {
    id: "event-2",
    title: "Digital Marketing Masterclass",
    description:
      "Learn the latest digital marketing strategies to grow your business. From SEO to social media, this masterclass covers it all.",
    startTime: nextWeek.toISOString(),
    endTime: new Date(nextWeek.getTime() + 3 * 60 * 60 * 1000).toISOString(),
    price: 50,
    hostId: "user-2",
    maxAttendees: 50,
    attendees: ["user-1", "user-5"],
    industry: "Marketing",
    status: "upcoming",
    createdAt: "2023-06-20T10:30:00Z",
    updatedAt: "2023-06-20T10:30:00Z",
  },
  {
    id: "event-3",
    title: "Fundraising Strategies for Startups",
    description:
      "Discover effective fundraising strategies for your startup. Learn how to approach investors and create compelling pitch decks.",
    startTime: twoWeeksLater.toISOString(),
    endTime: new Date(twoWeeksLater.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    price: 35,
    hostId: "user-3",
    maxAttendees: 50,
    attendees: ["user-2", "user-4"],
    industry: "Finance",
    status: "upcoming",
    createdAt: "2023-07-01T14:15:00Z",
    updatedAt: "2023-07-01T14:15:00Z",
  },
  {
    id: "event-4",
    title: "UX Design Workshop",
    description:
      "Hands-on workshop on user experience design principles. Create intuitive and engaging user interfaces for your products.",
    startTime: new Date(twoWeeksLater.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(twoWeeksLater.getTime() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
    price: 40,
    hostId: "user-4",
    maxAttendees: 50,
    attendees: ["user-1", "user-2"],
    industry: "Design",
    status: "upcoming",
    createdAt: "2023-07-10T09:45:00Z",
    updatedAt: "2023-07-10T09:45:00Z",
  },
  {
    id: "event-5",
    title: "Business Model Innovation",
    description:
      "Explore innovative business models that can disrupt industries. Learn from case studies of successful business model transformations.",
    startTime: new Date(twoWeeksLater.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(twoWeeksLater.getTime() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    price: 30,
    hostId: "user-5",
    maxAttendees: 50,
    attendees: ["user-3"],
    industry: "Business",
    status: "upcoming",
    createdAt: "2023-07-15T11:20:00Z",
    updatedAt: "2023-07-15T11:20:00Z",
  },
]

// Add host data to events
export const mockEventsWithHosts = mockEvents.map((event) => {
  const host = mockUsers.find((user) => user.id === event.hostId)
  return { ...event, host }
})

// Mock Tickets
export const mockTickets: Ticket[] = [
  {
    id: "ticket-1",
    eventId: "event-1",
    userId: "user-3",
    purchasedAt: "2023-06-16T09:30:00Z",
    price: 25,
    status: "confirmed",
  },
  {
    id: "ticket-2",
    eventId: "event-1",
    userId: "user-4",
    purchasedAt: "2023-06-17T14:45:00Z",
    price: 25,
    status: "confirmed",
  },
  {
    id: "ticket-3",
    eventId: "event-1",
    userId: "user-6",
    purchasedAt: "2023-06-18T11:15:00Z",
    price: 25,
    status: "confirmed",
  },
  {
    id: "ticket-4",
    eventId: "event-2",
    userId: "user-1",
    purchasedAt: "2023-06-21T10:00:00Z",
    price: 50,
    status: "confirmed",
  },
  {
    id: "ticket-5",
    eventId: "event-2",
    userId: "user-5",
    purchasedAt: "2023-06-22T16:30:00Z",
    price: 50,
    status: "confirmed",
  },
  {
    id: "ticket-6",
    eventId: "event-3",
    userId: "user-2",
    purchasedAt: "2023-07-02T13:20:00Z",
    price: 35,
    status: "confirmed",
  },
  {
    id: "ticket-7",
    eventId: "event-3",
    userId: "user-4",
    purchasedAt: "2023-07-03T09:10:00Z",
    price: 35,
    status: "confirmed",
  },
  {
    id: "ticket-8",
    eventId: "event-4",
    userId: "user-1",
    purchasedAt: "2023-07-11T15:40:00Z",
    price: 40,
    status: "confirmed",
  },
  {
    id: "ticket-9",
    eventId: "event-4",
    userId: "user-2",
    purchasedAt: "2023-07-12T11:55:00Z",
    price: 40,
    status: "confirmed",
  },
  {
    id: "ticket-10",
    eventId: "event-5",
    userId: "user-3",
    purchasedAt: "2023-07-16T14:25:00Z",
    price: 30,
    status: "confirmed",
  },
]

// Mock Follows
export const mockFollows: Follow[] = [
  {
    id: "follow-1",
    followerId: "user-3",
    followingId: "user-1",
    createdAt: "2023-06-17T10:15:00Z",
  },
  {
    id: "follow-2",
    followerId: "user-4",
    followingId: "user-1",
    createdAt: "2023-06-18T14:30:00Z",
  },
  {
    id: "follow-3",
    followerId: "user-1",
    followingId: "user-2",
    createdAt: "2023-06-22T09:45:00Z",
  },
  {
    id: "follow-4",
    followerId: "user-5",
    followingId: "user-2",
    createdAt: "2023-06-23T16:20:00Z",
  },
  {
    id: "follow-5",
    followerId: "user-2",
    followingId: "user-3",
    createdAt: "2023-07-03T11:10:00Z",
  },
  {
    id: "follow-6",
    followerId: "user-4",
    followingId: "user-3",
    createdAt: "2023-07-04T15:35:00Z",
  },
  {
    id: "follow-7",
    followerId: "user-1",
    followingId: "user-4",
    createdAt: "2023-07-13T10:50:00Z",
  },
  {
    id: "follow-8",
    followerId: "user-2",
    followingId: "user-4",
    createdAt: "2023-07-14T13:25:00Z",
  },
  {
    id: "follow-9",
    followerId: "user-3",
    followingId: "user-5",
    createdAt: "2023-07-17T09:40:00Z",
  },
]

// Helper functions to work with mock data
export function getEventById(id: string): Event | undefined {
  const event = mockEvents.find((event) => event.id === id)
  if (!event) return undefined

  const host = mockUsers.find((user) => user.id === event.hostId)
  return { ...event, host }
}

export function getEventsByHostId(hostId: string): Event[] {
  return mockEvents
    .filter((event) => event.hostId === hostId)
    .map((event) => {
      const host = mockUsers.find((user) => user.id === event.hostId)
      return { ...event, host }
    })
}

export function getEventsByAttendeeId(attendeeId: string): Event[] {
  return mockEvents
    .filter((event) => event.attendees.includes(attendeeId))
    .map((event) => {
      const host = mockUsers.find((user) => user.id === event.hostId)
      return { ...event, host }
    })
}

export function getUserById(id: string): User | undefined {
  return mockUsers.find((user) => user.id === id)
}

export function getTicketsByEventId(eventId: string): Ticket[] {
  return mockTickets.filter((ticket) => ticket.eventId === eventId)
}

export function getTicketsByUserId(userId: string): Ticket[] {
  return mockTickets.filter((ticket) => ticket.userId === userId)
}

export function getFollowersByUserId(userId: string): User[] {
  const followerIds = mockFollows.filter((follow) => follow.followingId === userId).map((follow) => follow.followerId)

  return mockUsers.filter((user) => followerIds.includes(user.id))
}

export function getFollowingByUserId(userId: string): User[] {
  const followingIds = mockFollows.filter((follow) => follow.followerId === userId).map((follow) => follow.followingId)

  return mockUsers.filter((user) => followingIds.includes(user.id))
}

export function isFollowing(followerId: string, followingId: string): boolean {
  return mockFollows.some((follow) => follow.followerId === followerId && follow.followingId === followingId)
}

export function getFeaturedEvent(): Event | undefined {
  const featuredEvent = mockEvents.find((event) => event.featured)
  if (!featuredEvent) return mockEvents[0]

  const host = mockUsers.find((user) => user.id === featuredEvent.hostId)
  return { ...featuredEvent, host }
}

export function getUpcomingEvents(limit?: number): Event[] {
  const upcoming = mockEvents
    .filter((event) => event.status === "upcoming")
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .map((event) => {
      const host = mockUsers.find((user) => user.id === event.hostId)
      return { ...event, host }
    })

  return limit ? upcoming.slice(0, limit) : upcoming
}

export function filterEvents(options: {
  industry?: Industry
  minPrice?: number
  maxPrice?: number
  startDate?: string
  endDate?: string
}): Event[] {
  return mockEvents
    .filter((event) => {
      if (options.industry && event.industry !== options.industry) return false
      if (options.minPrice !== undefined && event.price < options.minPrice) return false
      if (options.maxPrice !== undefined && event.price > options.maxPrice) return false

      const eventDate = new Date(event.startTime)
      if (options.startDate && eventDate < new Date(options.startDate)) return false
      if (options.endDate && eventDate > new Date(options.endDate)) return false

      return true
    })
    .map((event) => {
      const host = mockUsers.find((user) => user.id === event.hostId)
      return { ...event, host }
    })
}
