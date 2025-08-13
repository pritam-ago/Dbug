import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import { connectToDatabase } from '../db/connect'

dotenv.config()

const app = express()
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
import usersRouter from '../api/users/index.js'
import usersGitHubRouter from '../api/users/github.js'
import githubRouter from '../api/github/index.js'
import sandboxRouter from '../api/sandbox/route.js'
import aiRouter from '../api/ai/debug.js'

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

// NextAuth is now handled by the client-side Next.js app

app.listen(PORT, async () => {
  try {
    await connectToDatabase()
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📊 Database connected successfully`)
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
})
