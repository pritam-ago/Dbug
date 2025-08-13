'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Code, Users, Zap, Github, ArrowRight, LogOut, User, Mail } from "lucide-react"
import { handleLogout } from "@/lib/auth-utils"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }
  }, [status, router])

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-700/25 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Code className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-700 dark:text-gray-200 font-['Space_Grotesk']">DBug</h1>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-700 dark:text-gray-200">{session?.user?.name}</p>
                    <p className="text-gray-500 dark:text-gray-400">{session?.user?.email}</p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-700 dark:text-gray-200 mb-4 font-['Space_Grotesk']">
              Welcome to DBug, {session?.user?.name}! 👋
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 font-['DM_Sans']">
              Ready to debug some code? Let's get started!
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
                  <Code className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-gray-700 dark:text-gray-200">Start Debugging</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Create a new debugging session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/debugger">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-gray-700 dark:text-gray-200">Join Room</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Collaborate with your team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/rooms">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Join Room
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-gray-700 dark:text-gray-200">Quick Debug</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Fast debugging session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/debug">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Quick Start
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* User Info */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <Github className="w-5 h-5" />
                Your GitHub Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">Username:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-200">{session?.user?.githubUsername}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">Email:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-200">{session?.user?.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
