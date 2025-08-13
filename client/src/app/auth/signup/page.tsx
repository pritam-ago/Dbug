'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Code, Github, User } from 'lucide-react'
import { createUser } from '@/lib/db'

export default function SignupPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    githubUsername: '',
    githubId: '',
  })

  useEffect(() => {
    // Pre-fill form with GitHub data if available
    const githubId = searchParams.get('githubId')
    const githubUsername = searchParams.get('githubUsername')
    const email = searchParams.get('email')
    const name = searchParams.get('name')

    if (githubId && githubUsername && email && name) {
      setFormData({
        name: decodeURIComponent(name),
        email: decodeURIComponent(email),
        githubUsername: decodeURIComponent(githubUsername),
        githubId: decodeURIComponent(githubId),
      })
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Create user in database
      await createUser({
        githubId: formData.githubId,
        githubUsername: formData.githubUsername,
        email: formData.email,
        name: formData.name,
        avatarUrl: `https://github.com/${formData.githubUsername}.png`,
      })

      // Sign in with NextAuth
      await signIn('github', { 
        callbackUrl: '/dashboard',
        redirect: false 
      })

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Signup error:', error)
      alert('Signup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGitHubSignup = async () => {
    setIsLoading(true)
    try {
      await signIn('github', { callbackUrl: '/auth/signup' })
    } catch (error) {
      console.error('GitHub signup error:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-700/25 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />

      <Card className="relative w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="text-center">
          <div className="inline-flex items-center gap-3 mb-4 justify-center">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-700 font-['Space_Grotesk']">DBug</h1>
          </div>

          <CardTitle className="text-2xl text-gray-700 font-['Space_Grotesk']">Create Account</CardTitle>
          <CardDescription className="text-gray-600 font-['DM_Sans']">
            Join the debugging revolution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {formData.githubId ? (
            // Pre-filled form with GitHub data
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="githubUsername">GitHub Username</Label>
                <Input
                  id="githubUsername"
                  name="githubUsername"
                  type="text"
                  value={formData.githubUsername}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 font-['DM_Sans']"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Complete Signup
                  </div>
                )}
              </Button>
            </form>
          ) : (
            // Initial signup with GitHub
            <div className="space-y-4">
              <Button
                onClick={handleGitHubSignup}
                disabled={isLoading}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 font-['DM_Sans']"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Connecting to GitHub...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Github className="w-5 h-5" />
                    Continue with GitHub
                  </div>
                )}
              </Button>

              <div className="text-center">
                <p className="text-gray-600 text-sm font-['DM_Sans']">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-700 hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
