"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Code, Users, Plus, ArrowLeft, LogOut, Clock, GitBranch, Settings } from "lucide-react"

export default function RoomsPage() {
  const { data: session } = useSession()

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const mockRooms = [
    {
      id: "1",
      name: "Frontend Bug Fix",
      description: "Working on React component issues",
      participants: 3,
      lastActive: "2 hours ago",
      status: "active",
      language: "JavaScript",
      owner: "John Doe",
    },
    {
      id: "2",
      name: "API Integration",
      description: "Debugging REST API endpoints",
      participants: 2,
      lastActive: "1 day ago",
      status: "idle",
      language: "TypeScript",
      owner: "Jane Smith",
    },
    {
      id: "3",
      name: "Database Optimization",
      description: "Query performance improvements",
      participants: 4,
      lastActive: "3 hours ago",
      status: "active",
      language: "SQL",
      owner: "Mike Johnson",
    },
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-700/25 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
        
        <header className="relative border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                  </Button>
                </Link>
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Code className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-700 dark:text-gray-200 font-['Space_Grotesk']">DBug</h1>
              </div>

              <div className="flex items-center gap-4">
                <ThemeToggle />
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || 'User'} />
                    <AvatarFallback className="bg-indigo-600 text-white text-sm font-medium">
                      {session?.user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{session?.user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{session?.user?.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-700 dark:text-gray-200 mb-2 font-['Space_Grotesk']">
                  Collaboration Rooms
                </h2>
                <p className="text-gray-600 dark:text-gray-400 font-['DM_Sans']">
                  Join existing rooms or create new ones to collaborate with your team.
                </p>
              </div>
              <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4" />
                Create Room
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockRooms.map((room) => (
              <Card key={room.id} className="bg-card/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-['Space_Grotesk'] mb-1">{room.name}</CardTitle>
                      <CardDescription className="font-['DM_Sans'] text-sm mb-3">
                        {room.description}
                      </CardDescription>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <GitBranch className="w-3 h-3" />
                        <span>{room.language}</span>
                      </div>
                    </div>
                    <Badge
                      variant={room.status === "active" ? "default" : "secondary"}
                      className="ml-2"
                    >
                      {room.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">{room.participants} participants</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">{room.lastActive}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Owner: {room.owner}
                    </span>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                      Join Room
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {mockRooms.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">No rooms yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 font-['DM_Sans']">
                Create your first collaboration room to start debugging with your team.
              </p>
              <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4" />
                Create Room
              </Button>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
