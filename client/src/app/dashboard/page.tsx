"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Footer } from "@/components/ui/footer"
import { Users, Code, Settings, Plus, Clock, GitBranch, Zap, Activity, ChevronRight, Star } from "lucide-react"

export default function Dashboard() {
  const [user] = useState({
    name: "John Doe",
    email: "john@example.com",
    avatar: "/diverse-user-avatars.png",
  })

  const recentProjects = [
    { name: "E-commerce API", language: "TypeScript", lastActive: "2 hours ago", status: "active" },
    { name: "React Dashboard", language: "JavaScript", lastActive: "1 day ago", status: "completed" },
    { name: "Python Analytics", language: "Python", lastActive: "3 days ago", status: "debugging" },
  ]

  const collaborators = [
    { name: "Sarah Chen", avatar: "/diverse-user-avatars.png", status: "online" },
    { name: "Mike Johnson", avatar: "/diverse-user-avatars.png", status: "away" },
    { name: "Alex Rivera", avatar: "/diverse-user-avatars.png", status: "offline" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Code className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-200 font-['Space_Grotesk']">DBug</h1>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />

              <Link href="/profile">
                <div className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2 transition-colors cursor-pointer">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback className="bg-indigo-600 text-white text-sm">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 font-['DM_Sans']">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-['DM_Sans']">{user.email}</p>
                  </div>
                </div>
              </Link>

              <Button variant="ghost" size="sm">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-700 dark:text-gray-200 font-['Space_Grotesk'] mb-2">
            Welcome back, {user.name.split(" ")[0]}! 👋
          </h2>
          <p className="text-gray-600 dark:text-gray-400 font-['DM_Sans'] text-lg">
            Ready to tackle your next bug? Choose your debugging adventure below.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors duration-300">
                  <Code className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-700 dark:text-gray-200 font-['Space_Grotesk']">
                    Solo Debugging
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400 font-['DM_Sans']">
                    Work privately with AI assistance
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/debugger">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105 group">
                  Start Solo Session
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors duration-300">
                  <Users className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-700 dark:text-gray-200 font-['Space_Grotesk']">
                    Team Collaboration
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400 font-['DM_Sans']">
                    Debug together in real-time
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/rooms">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105 group">
                  Manage Rooms
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-gray-700 dark:text-gray-200 font-['Space_Grotesk']">
                    Your Projects
                  </CardTitle>
                  <CardDescription className="font-['DM_Sans'] dark:text-gray-400">
                    Recent debugging sessions
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Plus className="w-4 h-4" />
                  New Project
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentProjects.length > 0 ? (
                  recentProjects.map((project, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                          <GitBranch className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-700 dark:text-gray-200 font-['DM_Sans']">
                            {project.name}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>{project.language}</span>
                            <span>•</span>
                            <Clock className="w-3 h-3" />
                            <span>{project.lastActive}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            project.status === "active"
                              ? "default"
                              : project.status === "completed"
                                ? "secondary"
                                : "destructive"
                          }
                          className="capitalize"
                        >
                          {project.status}
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Code className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 font-['DM_Sans']">
                      No projects yet. Start your first debugging session!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg text-gray-700 dark:text-gray-200 font-['Space_Grotesk']">
                  Collaborators
                </CardTitle>
                <CardDescription className="font-['DM_Sans'] dark:text-gray-400">
                  Your debugging partners
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {collaborators.map((collaborator, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={collaborator.avatar || "/placeholder.svg"} alt={collaborator.name} />
                        <AvatarFallback className="bg-indigo-600 text-white text-xs">
                          {collaborator.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                          collaborator.status === "online"
                            ? "bg-green-500"
                            : collaborator.status === "away"
                              ? "bg-yellow-500"
                              : "bg-gray-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200 font-['DM_Sans']">
                        {collaborator.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize font-['DM_Sans']">
                        {collaborator.status}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg text-gray-700 dark:text-gray-200 font-['Space_Grotesk']">
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-['DM_Sans']">
                      Sessions this week
                    </span>
                  </div>
                  <span className="font-semibold text-gray-700 dark:text-gray-200">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-['DM_Sans']">Bugs resolved</span>
                  </div>
                  <span className="font-semibold text-gray-700 dark:text-gray-200">47</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-['DM_Sans']">Streak</span>
                  </div>
                  <span className="font-semibold text-gray-700 dark:text-gray-200">5 days</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
