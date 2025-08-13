import 'dotenv/config'
import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import { env, validateEnv } from './env'

// Validate environment variables
validateEnv()

export const authConfig = {
  secret: env.NEXTAUTH_SECRET,
  providers: [
    GithubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'read:user user:email repo',
          prompt: 'consent', // Force consent prompt every time
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account?.provider === 'github') {
        console.log('GitHub sign in attempt:', { 
          githubId: profile?.id, 
          username: profile?.login, 
          email: user?.email 
        })
        
        try {
          // Automatically create user in MongoDB
          const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users`
          console.log('Attempting to call API:', apiUrl)
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              githubId: profile.id,
              githubUsername: profile.login,
              email: user.email,
              name: user.name,
              avatarUrl: `https://github.com/${profile.login}.png`,
            }),
          })

          console.log('API response status:', response.status)
          
          if (response.ok) {
            const result = await response.json()
            console.log('User created/updated in MongoDB successfully:', result)
          } else if (response.status === 409) {
            // User already exists, that's fine
            console.log('User already exists in MongoDB')
          } else {
            const errorText = await response.text()
            console.error('Failed to create user in MongoDB:', response.status, response.statusText, errorText)
          }
          
          // Always allow sign in regardless of database operation result
          console.log('Allowing GitHub sign in')
          return true
        } catch (error) {
          console.error('Error creating user in MongoDB:', error)
          // Still allow sign in even if database operation fails
          console.log('Allowing GitHub sign in despite database error')
          return true
        }
      }
      console.log('Non-GitHub sign in attempt, denying')
      return false
    },
    
    async jwt({ token, account, profile }: any) {
      if (account?.provider === 'github' && profile) {
        const githubProfile = profile as any
        token.githubId = githubProfile.id
        token.githubUsername = githubProfile.login
        token.githubAccessToken = account.access_token
        token.provider = 'github'
      }
      return token
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub || ''
        session.user.githubId = token.githubId as string || ''
        session.user.githubUsername = token.githubUsername as string || ''
        session.user.githubAccessToken = token.githubAccessToken as string || ''
        session.user.provider = token.provider as string || ''
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  debug: env.NODE_ENV === 'development',
  session: {
    strategy: 'jwt' as const,
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
}
