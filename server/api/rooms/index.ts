import { Router } from 'express'
import { connectToDatabase } from '../../db/connect'
import { Project } from '../../db/models/Project'
import User from '../../db/models/User'
import crypto from 'node:crypto'

const router = Router()

function generateJoinCode(length: number = 6): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  const bytes = crypto.randomBytes(length)
  for (let i = 0; i < length; i++) {
    code += alphabet[bytes[i] % alphabet.length]
  }
  return code
}

// Helper function to get or create user
async function getOrCreateUser(userId: string, userData: any) {
  let user = null
  
  // First try to find by email (most common case for NextAuth)
  if (userId.includes('@')) {
    user = await User.findOne({ email: userId })
  } else {
    // Try to find by ObjectId if it's a valid MongoDB ObjectId
    try {
      user = await User.findById(userId)
    } catch (error) {
      // Invalid ObjectId, continue to email search
    }
  }
  
  if (!user) {
    // Create new user from NextAuth session data
    user = new User({
      email: userData.email || userId,
      name: userData.userName || userData.name || 'Anonymous User',
      avatarUrl: userData.image || '',
      provider: 'nextauth'
    })
    await user.save()
  }
  
  return user
}

// Create a new room
router.post('/create', async (req, res) => {
  try {
    const { name, description, language, userId } = req.body
    
    if (!name || !userId) {
      return res.status(400).json({ error: 'Name and userId are required' })
    }
    
    await connectToDatabase()
    
    // Get or create user
    const user = await getOrCreateUser(userId, req.body)
    
    let joinCode = generateJoinCode(6)
    for (let attempts = 0; attempts < 3; attempts++) {
      const existing = await Project.findOne({ joinCode })
      if (!existing) break
      joinCode = generateJoinCode(6)
    }

    const roomData = {
      name,
      joinCode,
      description: description || '',
      owner: user._id,
      collaborators: [],
      isPublic: false,
      settings: {
        allowCollaboration: true,
        requireApproval: false,
        maxCollaborators: 10,
      },
    }
    
    const room = new Project(roomData)
    await room.save()
    
    // Convert to JSON to get the transformed document with virtual fields
    const roomObject = room.toJSON()
    console.log('Created room object:', roomObject)
    console.log('Room id:', roomObject.id)
    console.log('Room _id:', roomObject._id)
    
    // Ensure we have an ID field for the client
    if (!roomObject.id && roomObject._id) {
      roomObject.id = roomObject._id.toString()
    }
    
    return res.status(201).json({
      success: true,
      data: roomObject,
      message: 'Room created successfully'
    })
  } catch (error) {
    console.error('Error creating room:', error)
    return res.status(500).json({ error: `Failed to create room: ${error}` })
  }
})

// Join a room by code
router.post('/join', async (req, res) => {
  try {
    const { code, userId } = req.body
    
    if (!code || !userId) {
      return res.status(400).json({ error: 'Join code and userId are required' })
    }
    
    await connectToDatabase()
    
    // Get or create user
    const user = await getOrCreateUser(userId, req.body)
    
    const normalized = code.trim().toUpperCase()
    const room = await Project.findOne({ joinCode: normalized })
    if (!room) {
      return res.status(404).json({ error: 'Room not found' })
    }
    
    const userIdStr = user._id.toString()
    if (!room.isOwner(userIdStr) && !room.isCollaborator(userIdStr)) {
      const added = room.addCollaborator(userIdStr)
      if (!added) {
        return res.status(400).json({ error: 'Room is full' })
      }
      await room.save()
    }
    
    return res.status(200).json({
      success: true,
      data: room,
      message: 'Joined room successfully'
    })
  } catch (error) {
    console.error('Error joining room:', error)
    return res.status(500).json({ error: `Failed to join room: ${error}` })
  }
})

// Get user's rooms - MUST come before /:roomId route
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }
    
    await connectToDatabase()
    
    // Get or create user
    const user = await getOrCreateUser(userId, {})
    
    const rooms = await Project.find({
      $or: [
        { owner: user._id },
        { collaborators: user._id }
      ]
    }).sort({ createdAt: -1 })
    
    return res.status(200).json({
      success: true,
      data: rooms
    })
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return res.status(500).json({ error: `Failed to fetch rooms: ${error}` })
  }
})

// Get room by ID - MUST come after more specific routes
router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params
    
    console.log('GET /:roomId - roomId:', roomId)
    console.log('GET /:roomId - req.params:', req.params)
    
    if (!roomId || roomId === 'undefined') {
      return res.status(400).json({ error: 'Room ID is required' })
    }
    
    await connectToDatabase()
    
    const room = await Project.findById(roomId)
    if (!room) {
      return res.status(404).json({ error: 'Room not found' })
    }
    
    return res.status(200).json({
      success: true,
      data: room
    })
  } catch (error) {
    console.error('Error fetching room:', error)
    return res.status(500).json({ error: `Failed to fetch room: ${error}` })
  }
})

export default router
