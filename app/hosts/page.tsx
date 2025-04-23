import { Suspense } from "react"
import Link from "next/link"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { mockUsers } from "@/lib/mock-data"

export const revalidate = 86400 // Revalidate every 24 hours

export default function HostsPage() {
  // Filter only users who are hosts
  const hosts = mockUsers.filter((user) => user.isHost)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="space-y-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Event Hosts</h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Discover talented entrepreneurs and experts hosting events on our platform.
              </p>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col gap-8 md:flex-row">
              <div className="md:w-1/4 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">Find Hosts</h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="search" className="text-sm font-medium">
                        Search
                      </label>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input id="search" placeholder="Search hosts..." className="pl-8" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="industry" className="text-sm font-medium">
                        Filter by Industry
                      </label>
                      <select
                        id="industry"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      >
                        <option value="all">All Industries</option>
                        <option value="Technology">Technology</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Finance">Finance</option>
                        <option value="Design">Design</option>
                        <option value="Business">Business</option>
                        <option value="Education">Education</option>
                        <option value="Health">Health</option>
                      </select>
                    </div>
                    <Button className="w-full">Apply Filters</Button>
                  </div>
                </div>
              </div>
              <div className="md:w-3/4">
                <Suspense fallback={<p>Loading hosts...</p>}>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {hosts.map((host) => (
                      <Card key={host.id}>
                        <CardHeader>
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={host.image || "/placeholder.svg"} alt={host.name} />
                              <AvatarFallback>{host.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg">{host.name}</CardTitle>
                              <CardDescription>{host.industry}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-3">{host.bio}</p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Badge variant="outline">Event Host</Badge>
                            <Badge variant="secondary">{host.industry}</Badge>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button asChild className="w-full">
                            <Link href={`/hosts/${host.id}`}>View Profile</Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </Suspense>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
