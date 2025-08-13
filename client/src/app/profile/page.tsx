"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Code, Users, GitBranch, Settings, LogOut, ArrowLeft, Edit, Globe, Calendar, Mail, MapPin } from "lucide-react"

export default function ProfilePage() {
  const { data: session } = useSession()

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-700/25 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
        
        <header className="relative border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
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

        <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-700 dark:text-gray-200 mb-2 font-['Space_Grotesk']">
              Profile
            </h2>
            <p className="text-gray-600 dark:text-gray-400 font-['DM_Sans']">
              Manage your account settings and preferences.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-['Space_Grotesk']">Personal Information</CardTitle>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || 'User'} />
                      <AvatarFallback className="bg-indigo-600 text-white text-2xl font-medium">
                        {session?.user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 font-['Space_Grotesk']">
                        {session?.user?.name || 'User Name'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 font-['DM_Sans']">
                        {session?.user?.email || 'user@example.com'}
                      </p>
                      {session?.user?.githubUsername && (
                        <div className="flex items-center gap-2 mt-2">
                          <GitBranch className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            @{session.user.githubUsername}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Email</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{session?.user?.email || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Member Since</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">January 2024</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Location</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Not specified</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Timezone</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">UTC</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="font-['Space_Grotesk']">GitHub Integration</CardTitle>
                  <CardDescription className="font-['DM_Sans']">
                    Manage your GitHub account connection and repository access.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {session?.user?.githubUsername ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-3">
                          <GitBranch className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <div>
                            <p className="font-medium text-green-800 dark:text-green-200">Connected to GitHub</p>
                            <p className="text-sm text-green-600 dark:text-green-400">
                              @{session.user.githubUsername}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                          Connected
                        </Badge>
                      </div>
                      <Button variant="outline" className="w-full">
                        Manage Repositories
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <GitBranch className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">No GitHub Connection</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4 font-['DM_Sans']">
                        Connect your GitHub account to access repositories and collaborate on code.
                      </p>
                      <Button className="gap-2">
                        <GitBranch className="w-4 h-4" />
                        Connect GitHub
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="font-['Space_Grotesk']">Account Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Projects Created</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-200">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Collaborations</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-200">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Debug Sessions</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-200">24</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Bugs Resolved</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-200">47</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="font-['Space_Grotesk']">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Settings className="w-4 h-4" />
                    Account Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Users className="w-4 h-4" />
                    Manage Collaborators
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Code className="w-4 h-4" />
                    View Projects
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
