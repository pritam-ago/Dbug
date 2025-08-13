# AI-Powered Collaborative Code Editor - Backend Server

A robust, scalable backend server for an AI-powered collaborative code editor built with Next.js API routes, TypeScript, and MongoDB.

## 🚀 Features

- **GitHub Integration**: OAuth authentication, repository management, and file operations
- **AI-Powered Debugging**: Integration with Google Gemini and OpenAI for intelligent code analysis
- **Real-time Collaboration**: WebSocket-based live code synchronization and collaboration
- **Project Management**: Create, manage, and collaborate on coding projects
- **MongoDB Database**: Scalable data storage with Mongoose ODM
- **Authentication**: Secure NextAuth.js integration with GitHub OAuth

## 🏗️ Architecture

```
server/
├── api/                    # Next.js API routes
│   ├── auth/              # Authentication endpoints
│   ├── github/            # GitHub integration APIs
│   ├── ai/                # AI debugging endpoints
│   ├── project/           # Project management APIs
│   └── collab/            # Collaboration WebSocket handler
├── db/                    # Database layer
│   ├── connect.ts         # MongoDB connection logic
│   └── models/            # Mongoose schemas
├── utils/                 # Utility functions
├── middleware/            # Authentication and security middleware
└── types/                 # TypeScript type definitions
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js with GitHub OAuth
- **AI Services**: Google Gemini API, OpenAI API
- **Real-time**: WebSocket for collaboration
- **GitHub Integration**: Octokit for GitHub API

## 📋 Prerequisites

- Node.js 18+
- MongoDB instance (local or cloud)
- GitHub OAuth App credentials
- Google Gemini API key (optional)
- OpenAI API key (optional)

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd server
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file in the server directory:

   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/ai-code-editor

   # GitHub OAuth
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret

   # NextAuth
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000

   # AI Services (optional)
   OPENAI_API_KEY=your_openai_api_key
   GEMINI_API_KEY=your_gemini_api_key

   # JWT
   JWT_SECRET=your_jwt_secret
   ```

4. **Database Setup**

   ```bash
   # Start MongoDB (if running locally)
   mongod

   # Or use MongoDB Atlas cloud instance
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

## 🔐 Authentication Setup

### GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL to: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret to your `.env.local`

### Environment Variables

Ensure all required environment variables are set:

```env
# Required
MONGODB_URI=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Optional
OPENAI_API_KEY=
GEMINI_API_KEY=
JWT_SECRET=
```

## 📚 API Endpoints

### Authentication

- `GET/POST /api/auth/[...nextauth]` - NextAuth.js authentication

### GitHub Integration

- `GET /api/github/repos` - Fetch user repositories
- `GET /api/github/files/[owner]/[repo]` - Get repository files
- `PUT /api/github/files/[owner]/[repo]/content` - Update file content
- `DELETE /api/github/files/[owner]/[repo]/content` - Delete file

### AI Debugging

- `POST /api/ai/debug` - Debug code using AI
- `POST /api/ai/debug/suggestions` - Get code improvement suggestions
- `POST /api/ai/debug/analyze` - Analyze code quality
- `GET /api/ai/debug/providers` - Get available AI providers

### Project Management

- `POST /api/project/create` - Create new project
- `GET /api/project/create/templates` - Get project templates

### Collaboration

- `GET /api/collab/socket` - WebSocket connection for real-time collaboration
- `GET /api/collab/socket/stats` - Get collaboration statistics

## 🗄️ Database Models

### User

- Basic profile information
- GitHub integration details
- Authentication tokens

### Project

- Project metadata and settings
- GitHub repository linkage
- Collaboration permissions
- Access control settings

### Session

- Collaborative coding sessions
- Participant tracking
- Real-time activity monitoring

## 🔒 Security Features

- **Authentication Guards**: Protected API routes
- **Rate Limiting**: Request throttling
- **CORS Protection**: Cross-origin request handling
- **Input Validation**: Request data sanitization
- **Secure Headers**: Security middleware

## 🚀 Development

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
```

### Code Structure

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Modular Design**: Clean separation of concerns
- **Error Handling**: Comprehensive error management
- **Logging**: Structured logging for debugging

## 🔧 Configuration

### MongoDB Connection

The server automatically handles:

- Connection pooling
- Reconnection logic
- Connection health monitoring
- Graceful shutdown

### AI Service Configuration

- Automatic fallback between providers
- Configurable model selection
- Rate limiting and error handling
- Response parsing and validation

### WebSocket Management

- Connection lifecycle management
- Heartbeat monitoring
- Automatic cleanup of dead connections
- Project-based room management

## 📊 Monitoring & Logging

- **Connection Statistics**: Real-time WebSocket metrics
- **Error Logging**: Comprehensive error tracking
- **Performance Monitoring**: Database query optimization
- **User Activity**: Collaboration session tracking

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run start
```

### Environment Variables

Ensure production environment variables are set:

- Use strong, unique secrets
- Configure production MongoDB URI
- Set production OAuth callback URLs
- Enable production logging

### Scaling Considerations

- **Database**: Use MongoDB Atlas or managed MongoDB service
- **WebSockets**: Consider Redis for horizontal scaling
- **Caching**: Implement Redis caching for frequently accessed data
- **Load Balancing**: Use reverse proxy for multiple server instances

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the code examples

## 🔮 Future Enhancements

- **Real-time Video/Audio**: Integrated communication features
- **Advanced AI Models**: Support for more AI providers
- **Plugin System**: Extensible architecture for custom features
- **Advanced Analytics**: Detailed collaboration insights
- **Mobile Support**: Responsive design and mobile optimization
