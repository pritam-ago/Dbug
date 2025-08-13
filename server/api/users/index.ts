import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '../../db/connect'
import User from '../../db/models/User'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { githubId, githubUsername, email, name, avatarUrl } = body
    
    // Validate required fields
    if (!githubId || !githubUsername || !email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ githubId }, { email }] 
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }
    
    // Create new user
    const user = new User({
      githubId,
      githubUsername,
      email,
      name,
      avatarUrl,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    await user.save()
    
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        githubId: user.githubId,
        githubUsername: user.githubUsername,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl
      }
    })
    
  } catch (error) {
    console.error('User creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
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
    
    return NextResponse.json({
      success: true,
      users
    })
    
  } catch (error) {
    console.error('Users fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
