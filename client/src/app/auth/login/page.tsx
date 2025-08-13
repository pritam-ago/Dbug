'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Code, Github, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (status === 'authenticated' && session) {
      router.push('/dashboard')
      return
    }
  }, [session, status, router])

  const handleGitHubLogin = async () => {
    setIsLoading(true)
    try {
      await signIn('github', { 
        callbackUrl: '/dashboard',
        redirect: false 
      })
    } catch (error) {
      console.error('GitHub login error:', error)
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

          <CardTitle className="text-2xl text-gray-700 font-['Space_Grotesk']">Welcome Back</CardTitle>
          <CardDescription className="text-gray-600 font-['DM_Sans']">
            Sign in to continue debugging collaboratively
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            onClick={handleGitHubLogin}
            disabled={isLoading}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 font-['DM_Sans']"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing in...
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
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-indigo-600 hover:text-indigo-700 hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
