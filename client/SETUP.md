# DBug Platform Setup Guide

## Environment Variables Setup

To get the GitHub authentication working, you need to create a `.env.local` file in the `client` directory with the following variables:

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the following details:
   - **Application name**: DBug Platform
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy the Client ID and Client Secret to your `.env.local` file

## NextAuth Secret

Generate a random secret for NEXTAUTH_SECRET:

```bash
openssl rand -base64 32
```

## Running the Application

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Testing Authentication

1. Navigate to `/test-auth` to test the authentication
2. Or go to `/auth/login` for the main login page
3. Click "Continue with GitHub"
4. Authorize the application
5. You should be redirected to the dashboard

## Troubleshooting

- If you see "TypeError: r is not a function", make sure you have the correct environment variables set
- Check the browser console and terminal for any error messages
- Ensure your GitHub OAuth app has the correct callback URL
- The server is running on port 3000
