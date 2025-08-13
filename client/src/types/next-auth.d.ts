import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      githubId?: string;
      githubUsername?: string;
      githubAccessToken?: string;
      provider?: string;
    }
  }
  
  interface JWT {
    githubId?: string;
    githubUsername?: string;
    githubAccessToken?: string;
    provider?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    githubId?: string;
    githubUsername?: string;
    githubAccessToken?: string;
    provider?: string;
  }
}
