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
    async signIn({ user, account, profile }) {
      if (account?.provider === 'github') {
        // For now, allow all GitHub sign-ins
        // We'll handle user creation/validation in the signup page
        return true
      }
      return false
    },
    
    async jwt({ token, account, profile }) {
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
