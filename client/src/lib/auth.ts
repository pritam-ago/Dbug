import NextAuth from 'next-auth'
import { authConfig } from './auth-config'
import { env } from './env'

// Debug environment variables
console.log('Environment variables check:', {
  NEXTAUTH_SECRET: env.NEXTAUTH_SECRET ? 'Set' : 'Missing',
  NEXTAUTH_URL: env.NEXTAUTH_URL || 'Missing',
  GITHUB_CLIENT_ID: env.GITHUB_CLIENT_ID ? 'Set' : 'Missing',
  GITHUB_CLIENT_SECRET: env.GITHUB_CLIENT_SECRET ? 'Set' : 'Missing',
  NODE_ENV: env.NODE_ENV || 'Missing',
})

export default NextAuth(authConfig)