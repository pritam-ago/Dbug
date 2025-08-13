import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '../../../../db/connect'
import User from '../../../../db/models/User'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const githubId = params.id
    
    if (!githubId) {
      return NextResponse.json(
        { error: 'GitHub ID is required' },
        { status: 400 }
      )
    }
    
    const user = await User.findOne({ githubId })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
