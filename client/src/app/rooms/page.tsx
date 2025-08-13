"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Footer } from "@/components/ui/footer"
import { Code, Users, Plus, ArrowLeft, Clock, GitBranch, Settings } from "lucide-react"

export default function RoomsPage() {
  const [rooms] = useState([
    {
      id: 1,
      name: "E-commerce API Debug",
      language: "TypeScript",
      participants: 3,
      lastActive: "2 hours ago",
      status: "active",
    },
    {
      id: 2,
      name: "React Dashboard Issues",
      language: "JavaScript",
      participants: 2,
      lastActive: "1 day ago",
      status: "idle",
    },
    {
      id: 3,
      name: "Python Analytics Bug",
      language: "Python",
      participants: 4,
      lastActive: "3 days ago",
      status: "completed",
    },
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Code className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-200 font-['Space_Grotesk']">DBug</h1>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-700 dark:text-gray-200 font-['Space_Grotesk'] mb-2">
              Collaboration Rooms
            </h2>
            <p className="text-gray-600 dark:text-gray-400 font-['DM_Sans'] text-lg">
              Join your team's debugging sessions or create a new one
            </p>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
            <Plus className="w-5 h-5 mr-2" />
            Create Room
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Card key={room.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg text-gray-700 dark:text-gray-200 font-['Space_Grotesk']">
                      {room.name}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400 font-['DM_Sans']">
                      {room.language}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{room.participants} participants</span>
                  </div>
                  <Badge
                    variant={
                      room.status === "active"
                        ? "default"
                        : room.status === "idle"
                          ? "secondary"
                          : "destructive"
                    }
                    className="capitalize"
                  >
                    {room.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>Last active {room.lastActive}</span>
                </div>
                <Link href={`/rooms/${room.id}`}>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105">
                    Join Room
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {rooms.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-['DM_Sans'] text-lg mb-4">
              No collaboration rooms yet
            </p>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Room
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
