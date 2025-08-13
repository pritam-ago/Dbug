import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import { connectToDatabase } from '../db/connect'

dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    credentials: true
  }
})

const PORT = process.env.PORT || 5000

app.use(cors({
  origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  credentials: true
}))

app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'DBug Server is running' })
})

app.get('/test-github', (req, res) => {
  res.json({ status: 'OK', message: 'GitHub routes are accessible' })
})

// API Routes
console.log('Loading API routes...')
import usersRouter from '../api/users/index'
import usersGitHubRouter from '../api/users/github'
import githubRouter from '../api/github/index'
import sandboxRouter from '../api/sandbox/route'
import aiRouter from '../api/ai/debug'
import projectRouter from '../api/project/index'
import roomsRouter from '../api/rooms/index'

app.use('/api/users', usersRouter)
app.use('/api/users/github', usersGitHubRouter)

// GitHub API Routes
console.log('Loading GitHub API routes...')
app.use('/api/github', githubRouter)
console.log('GitHub API routes loaded successfully')

// Sandbox API Routes
console.log('Loading Sandbox API routes...')
app.use('/api/sandbox', sandboxRouter)
console.log('Sandbox API routes loaded successfully')

// AI API Routes
console.log('Loading AI API routes...')
app.use('/api/ai', aiRouter)
console.log('AI API routes loaded successfully')

// Project/Room API Routes
console.log('Loading Project/Room API routes...')
app.use('/api/project', projectRouter)
app.use('/api/rooms', roomsRouter)
console.log('Project/Room API routes loaded successfully')

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)
  
  socket.on('join_room', (data) => {
    const { roomId, userId, username } = data
    socket.join(roomId)
    socket.to(roomId).emit('user_joined', { userId, username, timestamp: new Date() })
    console.log(`User ${username} joined room ${roomId}`)
  })
  
  socket.on('leave_room', (data) => {
    const { roomId, userId, username } = data
    socket.leave(roomId)
    socket.to(roomId).emit('user_left', { userId, username, timestamp: new Date() })
    console.log(`User ${username} left room ${roomId}`)
  })
  
  socket.on('chat_message', (data) => {
    const { roomId, userId, username, message } = data
    socket.to(roomId).emit('chat_message', { userId, username, message, timestamp: new Date() })
  })
  
  socket.on('code_change', (data) => {
    const { roomId, userId, username, filePath, changes } = data
    socket.to(roomId).emit('code_change', { userId, username, filePath, changes, timestamp: new Date() })
  })
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

// NextAuth is now handled by the client-side Next.js app

server.listen(PORT, async () => {
  try {
    await connectToDatabase()
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📊 Database connected successfully`)
    console.log(`🔌 Socket.IO server initialized`)
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
})
