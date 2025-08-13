// Environment variable configuration
export const env = {
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development-only',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:5000',
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
  NODE_ENV: process.env.NODE_ENV || 'development',
}

// Validate required environment variables
export function validateEnv() {
  const required = ['NEXTAUTH_SECRET', 'GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET']
  const missing = required.filter(key => !env[key as keyof typeof env])
  
  if (missing.length > 0) {
    console.warn('Missing required environment variables:', missing)
    console.warn('Please set these variables in your .env.local file')
    return false
  }
  
  return true
}
