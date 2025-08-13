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
    
    const { searchParams } = new URL(request.url)
    const repo = searchParams.get('repo')
    const branch = searchParams.get('branch')
    
    if (!repo || !branch) {
      return NextResponse.json(
        { error: 'Repository and branch parameters are required' },
        { status: 400 }
      )
    }
    
    // Forward the request to the server API
    const serverResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'}/api/github/import?repo=${repo}&branch=${branch}`, {
      headers: {
        'Authorization': `Bearer ${session.user.githubAccessToken}`,
        'Content-Type': 'application/json',
      },
    })
    
    if (!serverResponse.ok) {
      throw new Error(`Server responded with ${serverResponse.status}`)
    }
    
    const data = await serverResponse.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching repository files:', error)
    return NextResponse.json(
      { error: 'Failed to fetch repository files' },
      { status: 500 }
    )
  }
}
