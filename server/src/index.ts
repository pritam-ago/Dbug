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
