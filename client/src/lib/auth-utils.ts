import { signOut } from 'next-auth/react'

export const handleLogout = async () => {
  try {
    // Clear NextAuth session
    await signOut({ 
      callbackUrl: '/',
      redirect: false 
    })
    
    // Clear any local storage items
    if (typeof window !== 'undefined') {
      // Store essential app settings to preserve them
      const theme = localStorage.getItem('theme')
      const allySupportsCache = localStorage.getItem('ally-supports-cache')
      
      // Clear ALL localStorage
      localStorage.clear()
      
      // Restore essential app settings
      if (theme) localStorage.setItem('theme', theme)
      if (allySupportsCache) localStorage.setItem('ally-supports-cache', allySupportsCache)
    }
    
    // Clear session storage
    if (typeof window !== 'undefined') {
      sessionStorage.clear()
    }
    
    // Force a hard refresh to clear any cached state
    window.location.href = '/'
  } catch (error) {
    console.error('Logout error:', error)
    // Fallback: just redirect to home
    window.location.href = '/'
  }
}
