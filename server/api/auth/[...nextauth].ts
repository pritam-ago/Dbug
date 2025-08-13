import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { clientPromise } from '../../db/connect';
import { User } from '../../db/models/User';
import { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email repo',
        },
      },
    }),
  ],
  adapter: MongoDBAdapter(clientPromise as any),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account?.provider === 'github' && profile) {
        try {
          const existingUser = await User.findOne({ email: user.email });
          
          if (existingUser) {
            await User.findByIdAndUpdate(existingUser._id, {
              githubId: profile.id.toString(),
              githubUsername: profile.login,
              githubAccessToken: account.access_token,
            });
          } else {
            await User.create({
              email: user.email,
              name: user.name,
              githubId: profile.id.toString(),
              githubUsername: profile.login,
              githubAccessToken: account.access_token,
            });
          }
          
          return true;
        } catch (error) {
          console.error('Error during sign in:', error);
          return false;
        }
      }
      return true;
    },
    
    async jwt({ token, account, profile }: any) {
      if (account?.provider === 'github' && profile) {
        token.githubId = profile.id;
        token.githubUsername = profile.login;
        token.githubAccessToken = account.access_token;
      }
      return token;
    },
    
    async session({ session, token }: any) {
      if (token) {
        session.user.githubId = token.githubId;
        session.user.githubUsername = token.githubUsername;
        session.user.githubAccessToken = token.githubAccessToken;
      }
      return session;
    },
    
    async redirect({ url, baseUrl }: any) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
