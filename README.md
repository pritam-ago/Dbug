# DBug - AI-Powered Collaborative Debugging Platform

A modern web application that combines AI-powered code debugging with real-time collaboration features.

## Features

- 🔐 **GitHub Authentication** - Secure sign-in/sign-up using GitHub OAuth
- 🤖 **AI-Powered Debugging** - Intelligent code analysis and bug fixing suggestions
- 👥 **Real-time Collaboration** - Work together with your team in debugging sessions
- 📁 **GitHub Integration** - Connect your repositories for seamless development
- 🎨 **Modern UI** - Beautiful, responsive interface built with Next.js and Tailwind CSS
- 🌙 **Dark/Light Mode** - Theme switching for comfortable coding sessions

## Tech Stack

### Frontend (Client)
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful UI components
- **NextAuth.js** - Authentication library
- **Monaco Editor** - Powerful code editor

### Backend (Server)
- **Express.js** - Node.js web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **NextAuth.js** - Authentication backend
- **GitHub API** - Repository integration

## Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud)
- GitHub OAuth App credentials

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Dbug
```

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Copy environment template
cp env.example .env.local

# Edit .env.local with your credentials
# - MongoDB URI
# - GitHub OAuth credentials
# - NextAuth secret
# - AI API keys (optional)

# Start the server
npm run dev
```

### 3. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Copy environment template
cp env.example .env.local

# Edit .env.local with your credentials
# - GitHub OAuth credentials
# - NextAuth secret
# - Backend API URL

# Start the development server
npm run dev
```

### 4. GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Homepage URL to `http://localhost:3000`
4. Set Authorization callback URL to `http://localhost:3000/api/auth/callback/github`
5. Copy Client ID and Client Secret to your environment files

### 5. MongoDB Setup

1. Install MongoDB locally or use MongoDB Atlas
2. Create a database named `dbug`
3. Update the `MONGODB_URI` in your server environment file

## Environment Variables

### Server (.env.local)
```env
MONGODB_URI=mongodb://localhost:27017/dbug
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
PORT=5000
```

### Client (.env.local)
```env
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Usage

1. **Sign Up/In**: Use GitHub OAuth to create an account
2. **Dashboard**: Access your projects and collaboration rooms
3. **Debug Sessions**: Start solo or team debugging sessions
4. **Code Editor**: Use the integrated Monaco editor with AI assistance
5. **Collaboration**: Invite team members to debugging rooms

## Project Structure

```
Dbug/
├── client/                 # Frontend application
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── components/    # React components
│   │   └── lib/          # Utility functions
│   └── package.json
├── server/                # Backend API server
│   ├── api/              # API endpoints
│   ├── db/               # Database models and connection
│   └── src/              # Server source code
└── README.md
```

## Development

### Running Both Servers

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
cd client
npm run dev
```

### Available Scripts

**Backend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please open an issue in the repository.