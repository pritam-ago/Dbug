const express = require('express')
const User = require('../../db/models/User').default
const router = express.Router()

// Create or update user
router.post('/', async (req, res) => {
  try {
    const { githubId, githubUsername, email, name, avatarUrl, provider = 'github' } = req.body

    // Validate required fields
    if (!githubId || !githubUsername || !email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: githubId, githubUsername, email, name'
      })
    }

    console.log('Creating/updating user:', { githubId, githubUsername, email, name })

    // Try to find existing user by githubId first
    let user = await User.findOne({ githubId })

    if (user) {
      // Update existing user
      console.log('Updating existing user:', user.githubUsername)
      user.githubUsername = githubUsername
      user.email = email
      user.name = name
      user.avatarUrl = avatarUrl
      user.provider = provider
      user.lastSignIn = new Date()
      user.updatedAt = new Date()
      
      await user.save()
      
      return res.status(200).json({
        success: true,
        message: 'User updated successfully',
        user: {
          id: user._id,
          githubId: user.githubId,
          githubUsername: user.githubUsername,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
          lastSignIn: user.lastSignIn,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      })
    } else {
      // Check if user exists with same email or username
      const existingUser = await User.findOne({
        $or: [
          { email: email },
          { githubUsername: githubUsername }
        ]
      })

      if (existingUser) {
        console.log('User with same email or username exists:', existingUser.githubUsername)
        return res.status(409).json({
          success: false,
          message: 'User with same email or GitHub username already exists',
          existingUser: {
            id: existingUser._id,
            githubUsername: existingUser.githubUsername,
            email: existingUser.email
          }
        })
      }

      // Create new user
      console.log('Creating new user:', githubUsername)
      const newUser = new User({
        githubId,
        githubUsername,
        email,
        name,
        avatarUrl,
        provider,
        lastSignIn: new Date()
      })

      await newUser.save()

      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        user: {
          id: newUser._id,
          githubId: newUser.githubId,
          githubUsername: newUser.githubUsername,
          email: newUser.email,
          name: newUser.name,
          avatarUrl: newUser.avatarUrl,
          lastSignIn: newUser.lastSignIn,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt
        }
      })
    }
  } catch (error) {
    console.error('Error in user creation/update:', error)
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]
      return res.status(409).json({
        success: false,
        message: `User with this ${field} already exists`,
        field: field
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    })
  }
})

// Get user by GitHub ID
router.get('/github/:githubId', async (req, res) => {
  try {
    const { githubId } = req.params
    
    const user = await User.findOne({ githubId })
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        githubId: user.githubId,
        githubUsername: user.githubUsername,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        lastSignIn: user.lastSignIn,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    })
  }
})

// Get all users (for debugging)
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, '-__v')
    
    return res.status(200).json({
      success: true,
      count: users.length,
      users: users.map(user => ({
        id: user._id,
        githubId: user.githubId,
        githubUsername: user.githubUsername,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        lastSignIn: user.lastSignIn,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }))
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    })
  }
})

module.exports = router
