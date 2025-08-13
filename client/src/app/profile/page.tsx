"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Footer } from "@/components/ui/footer"
import { Code, Settings, User, Mail, Calendar, Github, ArrowLeft } from "lucide-react"

export default function ProfilePage() {
  const [user] = useState({
    name: "John Doe",
    email: "john@example.com",
    avatar: "/diverse-user-avatars.png",
    joinDate: "January 2024",
    githubUsername: "johndoe",
  })

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

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <Avatar className="w-24 h-24 mx-auto mb-4">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback className="bg-indigo-600 text-white text-2xl">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-3xl font-bold text-gray-700 dark:text-gray-200 font-['Space_Grotesk'] mb-2">
            {user.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 font-['DM_Sans'] text-lg">
            Debugging enthusiast & Code explorer
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-gray-700 dark:text-gray-200 font-['Space_Grotesk'] flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300 font-['DM_Sans']">{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300 font-['DM_Sans']">Member since {user.joinDate}</span>
              </div>
              <div className="flex items-center gap-3">
                <Github className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300 font-['DM_Sans']">@{user.githubUsername}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-gray-700 dark:text-gray-200 font-['Space_Grotesk'] flex items-center gap-2">
                <Code className="w-5 h-5 text-indigo-600" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 font-['DM_Sans']">Debugging Sessions</span>
                <span className="font-semibold text-gray-700 dark:text-gray-200">47</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 font-['DM_Sans']">Bugs Resolved</span>
                <span className="font-semibold text-gray-700 dark:text-gray-200">156</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 font-['DM_Sans']">Collaboration Hours</span>
                <span className="font-semibold text-gray-700 dark:text-gray-200">89</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Link href="/dashboard">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
