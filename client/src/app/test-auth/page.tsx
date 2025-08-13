'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Github, LogOut, User } from 'lucide-react'

export default function TestAuthPage() {
  const { data: session, status } = useSession()

  const handleGitHubLogin = async () => {
    try {
      await signIn('github', { callbackUrl: '/dashboard' })
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Loading...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-gray-700">Authentication Test</CardTitle>
          <CardDescription className="text-gray-600">
            Test NextAuth configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {session ? (
            <div className="space-y-4">
              <div className="text-center">
                <User className="w-16 h-16 mx-auto mb-4 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-700">Authenticated!</h3>
                <p className="text-sm text-gray-600">Welcome, {session.user?.name}</p>
                {session.user?.email && (
                  <p className="text-xs text-gray-500">{session.user.email}</p>
                )}
                {session.user?.githubUsername && (
                  <p className="text-xs text-gray-500">GitHub: @{session.user.githubUsername}</p>
                )}
              </div>
              
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-700">Not Authenticated</h3>
                <p className="text-sm text-gray-600">Sign in to test the authentication</p>
              </div>
              
              <Button
                onClick={handleGitHubLogin}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
              >
                <Github className="w-4 h-4 mr-2" />
                Continue with GitHub
              </Button>
            </div>
          )}
          
          <div className="text-center text-xs text-gray-500">
            <p>Status: {status}</p>
            <p>Session: {session ? 'Active' : 'None'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
