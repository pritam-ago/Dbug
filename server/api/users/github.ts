import express from 'express'
import { connectToDatabase } from '../../db/connect'
import User from '../../db/models/User'

const router = express.Router()

// Get user by GitHub ID
router.get('/:id', async (req, res) => {
  try {
    await connectToDatabase()
    
    const githubId = req.params.id
    
    if (!githubId) {
      return res.status(400).json({ error: 'GitHub ID is required' })
    }
    
    const user = await User.findOne({ githubId })
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
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
    console.error('GitHub user lookup error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
