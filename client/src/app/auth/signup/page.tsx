'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Code, Github, User, Mail, UserCheck } from 'lucide-react'
import { createUser } from '@/lib/db'

export default function SignupPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    githubUsername: '',
    githubId: '',
  })
  const [step, setStep] = useState<'initial' | 'form' | 'complete'>('initial')

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (status === 'authenticated' && session) {
      router.push('/dashboard')
      return
    }

    // Check if we have GitHub data from OAuth
    const githubId = searchParams.get('githubId')
    const githubUsername = searchParams.get('githubUsername')
    const email = searchParams.get('email')
    const name = searchParams.get('name')

    if (githubId && githubUsername) {
      setFormData({
        name: name ? decodeURIComponent(name) : '',
        email: email ? decodeURIComponent(email) : '',
        githubUsername: decodeURIComponent(githubUsername),
        githubId: decodeURIComponent(githubId),
      })
      setStep('form')
    }
  }, [searchParams, session, status, router])

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
      // Validate required fields
      if (!formData.name || !formData.email || !formData.githubId || !formData.githubUsername) {
        alert('Please fill in all required fields')
        return
      }

      // Create user in database
      const result = await createUser({
        githubId: formData.githubId,
        githubUsername: formData.githubUsername,
        email: formData.email,
        name: formData.name,
        avatarUrl: `https://github.com/${formData.githubUsername}.png`,
      })

      if (result.success) {
        setStep('complete')
        // Sign in with NextAuth
        await signIn('github', { 
          callbackUrl: '/dashboard',
          redirect: false 
        })
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      }
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
      // Sign in with GitHub and redirect back to signup page
      await signIn('github', { 
        callbackUrl: `${window.location.origin}/auth/signup`,
        redirect: false 
      })
    } catch (error) {
      console.error('GitHub signup error:', error)
      setIsLoading(false)
    }
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

  // Show completion message
  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="relative w-full max-w-md bg-card/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-gray-700">Account Created!</CardTitle>
            <CardDescription className="text-gray-600">
              Redirecting to dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-700/25 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />

      <Card className="relative w-full max-w-md bg-card/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="text-center">
          <div className="inline-flex items-center gap-3 mb-4 justify-center">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-700 font-['Space_Grotesk']">DBug</h1>
          </div>

          <CardTitle className="text-2xl text-gray-700 font-['Space_Grotesk']">
            {step === 'form' ? 'Complete Your Profile' : 'Create Account'}
          </CardTitle>
          <CardDescription className="text-gray-600 font-['DM_Sans']">
            {step === 'form' ? 'Add your details to complete registration' : 'Join the debugging revolution'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 'form' ? (
            // Profile completion form
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
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
                  disabled
                  className="w-full bg-muted"
                />
                <p className="text-xs text-gray-500">Connected from GitHub</p>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !formData.name || !formData.email}
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
                    Complete Registration
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
