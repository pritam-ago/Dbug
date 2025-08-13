'use client'

import { useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const router = useRouter()

  useEffect(() => {
    signIn('github', { callbackUrl: '/dashboard' })
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Redirecting to GitHub...</h2>
        <p className="text-gray-600 dark:text-gray-400">Please wait while we redirect you to GitHub for authentication.</p>
      </div>
    </div>
  )
}
