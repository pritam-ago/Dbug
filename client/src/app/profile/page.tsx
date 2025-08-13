'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Code, ArrowLeft, User, Mail, Github, Save, Edit, X, Check, LogOut } from 'lucide-react'
import { handleLogout } from '@/lib/auth-utils'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    githubUsername: '',
  })

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    // Set form data when session is available
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
        githubUsername: session.user.githubUsername || '',
      })
    }
  }, [session, status, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Here you would typically update the user data in your database
      // For now, we'll just simulate a save
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsEditing(false)
      // You could also update the session here if needed
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save changes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    // Reset form data to original session data
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
        githubUsername: session.user.githubUsername || '',
      })
    }
    setIsEditing(false)
  }

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
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <Code className="w-4 h-4 text-white" />
                  </div>
                  <h1 className="text-xl font-bold text-gray-700 dark:text-gray-200 font-['Space_Grotesk']">DBug</h1>
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
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-700 dark:text-gray-200 mb-4 font-['Space_Grotesk']">
              Profile Settings
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 font-['DM_Sans']">
              Manage your account information and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Picture Section */}
            <div className="lg:col-span-1">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="text-gray-700 dark:text-gray-200">Profile Picture</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4">
                    <Avatar className="w-full h-full">
                      <AvatarImage 
                        src={session?.user?.image || `https://github.com/${session?.user?.githubUsername}.png`} 
                        alt={session?.user?.name || 'User'} 
                      />
                      <AvatarFallback className="bg-indigo-600 text-white text-4xl font-medium">
                        {session?.user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Connected via GitHub
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    Change Picture
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Profile Information Section */}
            <div className="lg:col-span-2">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-gray-700 dark:text-gray-200">Personal Information</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Update your profile details
                      </CardDescription>
                    </div>
                    {!isEditing ? (
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={handleSave}
                          disabled={isLoading}
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          Save
                        </Button>
                        <Button
                          onClick={handleCancel}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="githubUsername" className="flex items-center gap-2">
                      <Github className="w-4 h-4" />
                      GitHub Username
                    </Label>
                    <Input
                      id="githubUsername"
                      name="githubUsername"
                      type="text"
                      value={formData.githubUsername}
                      onChange={handleInputChange}
                      disabled
                      className="w-full bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">
                      GitHub username cannot be changed
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Account Information */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mt-6">
                <CardHeader>
                  <CardTitle className="text-gray-700 dark:text-gray-200">Account Information</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Your account details and connected services
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <Github className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-200">GitHub</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Connected</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                        <Code className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-200">Account Type</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Free</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-200">Member Since</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {session?.user?.createdAt ? new Date(session.user.createdAt).toLocaleDateString() : 'Recently'}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" disabled>
                        Upgrade Plan
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
