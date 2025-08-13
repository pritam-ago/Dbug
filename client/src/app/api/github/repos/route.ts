import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth-config'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.githubAccessToken) {
      return NextResponse.json(
        { error: 'GitHub access required' },
        { status: 401 }
      )
    }

    const serverResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'}/api/github/repos`, {
      headers: {
        'Authorization': `Bearer ${session.user.githubAccessToken}`,
        'Content-Type': 'application/json',
      },
    })
    
    if (!serverResponse.ok) {
      const errorText = await serverResponse.text()
      console.error('Server error response:', serverResponse.status, errorText)
      throw new Error(`Server responded with ${serverResponse.status}: ${errorText}`)
    }
    
    const data = await serverResponse.json()
    console.log('Server response data:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching repositories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    )
  }
}
