import express from 'express'
import { connectDB } from '../../db/connect'
import User from '../../db/models/User'

const router = express.Router()

// Create or update user (upsert)
router.post('/', async (req, res) => {
  try {
    await connectDB()
    
    const { githubId, githubUsername, email, name, avatarUrl } = req.body
    
    // Validate required fields
    if (!githubId || !githubUsername || !email || !name) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    
    // Use findOneAndUpdate with upsert to create or update user
    const user = await User.findOneAndUpdate(
      { githubId }, // Find by GitHub ID
      {
        githubId,
        githubUsername,
        email,
        name,
        avatarUrl,
        updatedAt: new Date()
      },
      {
        upsert: true, // Create if doesn't exist, update if exists
        new: true, // Return the updated document
        setDefaultsOnInsert: true // Set default values on insert
      }
    )
    
    console.log(`User ${user.githubUsername} ${user._id ? 'updated' : 'created'} in MongoDB`)
    
    res.json({
      success: true,
      user: {
        id: user._id,
        githubId: user.githubId,
        githubUsername: user.githubUsername,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    })
    
  } catch (error) {
    console.error('User upsert error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get all users
router.get('/', async (req, res) => {
  try {
    await connectDB()
    
    const users = await User.find({}, { 
      githubId: 1, 
      githubUsername: 1, 
      email: 1, 
      name: 1, 
      avatarUrl: 1,
      createdAt: 1 
    })
    
    res.json({
      success: true,
      users
    })
    
  } catch (error) {
    console.error('Users fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
