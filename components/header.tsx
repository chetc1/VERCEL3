"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Home, LogIn, LogOut, Menu, User, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/lib/clerk"
import { cn } from "@/lib/utils"

export function Header() {
  const pathname = usePathname()
  const { isSignedIn, user, signIn, signOut } = useAuth()

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
      icon: Home,
    },
    {
      href: "/events",
      label: "Events",
      active: pathname === "/events",
      icon: Calendar,
    },
    {
      href: "/hosts",
      label: "Hosts",
      active: pathname === "/hosts",
      icon: Users,
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl">IndieEvent</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 ml-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                route.active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {route.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {isSignedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    {user?.image ? (
                      <img
                        src={user.image || "/placeholder.svg"}
                        alt={user.name || "User"}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/calendar">My Calendar</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="default" onClick={() => signIn()}>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            )}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="pr-0">
                <nav className="grid gap-6 text-lg font-medium">
                  {routes.map((route) => (
                    <Link
                      key={route.href}
                      href={route.href}
                      className={cn(
                        "flex items-center px-4 py-2 hover:bg-accent hover:text-accent-foreground rounded-l-md",
                        route.active ? "bg-accent text-accent-foreground" : "",
                      )}
                    >
                      <route.icon className="mr-2 h-5 w-5" />
                      {route.label}
                    </Link>
                  ))}
                  {isSignedIn && (
                    <>
                      <Link
                        href="/dashboard"
                        className={cn(
                          "flex items-center px-4 py-2 hover:bg-accent hover:text-accent-foreground rounded-l-md",
                          pathname === "/dashboard" ? "bg-accent text-accent-foreground" : "",
                        )}
                      >
                        <User className="mr-2 h-5 w-5" />
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard/calendar"
                        className={cn(
                          "flex items-center px-4 py-2 hover:bg-accent hover:text-accent-foreground rounded-l-md",
                          pathname === "/dashboard/calendar" ? "bg-accent text-accent-foreground" : "",
                        )}
                      >
                        <Calendar className="mr-2 h-5 w-5" />
                        My Calendar
                      </Link>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </nav>
        </div>
      </div>
    </header>
  )
}
