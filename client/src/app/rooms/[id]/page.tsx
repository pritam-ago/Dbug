"use client"

import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { RoomEditor } from '@/components/room-editor/room-editor'

interface RoomData {
  _id: string
  name: string
  description: string
  joinCode: string
  owner: string
  collaborators: string[]
  createdAt: string
  updatedAt: string
}

export default function RoomPage() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [roomData, setRoomData] = useState<RoomData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiUrl] = useState(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000')

  // Extract room ID from pathname
  const getRoomId = () => {
    if (pathname) {
      const pathParts = pathname.split('/')
      const roomIdIndex = pathParts.indexOf('rooms') + 1
      if (roomIdIndex > 0 && pathParts[roomIdIndex]) {
        return pathParts[roomIdIndex]
      }
    }
    return null
  }

  const roomId = getRoomId()

  useEffect(() => {
    console.log('RoomPage useEffect - pathname:', pathname)
    console.log('RoomPage useEffect - roomId:', roomId)
    console.log('RoomPage useEffect - session:', session)
    
    if (roomId && session?.user) {
      fetchRoomData()
    } else if (!roomId) {
      setError('Invalid room ID')
      setLoading(false)
    }
  }, [roomId, session, pathname])

  const fetchRoomData = async () => {
    if (!roomId) {
      setError('Invalid room ID')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching room data for ID:', roomId)
      const response = await fetch(`${apiUrl}/api/rooms/${roomId}`)
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setRoomData(result.data)
        } else {
          setError(result.error || 'Failed to load room')
        }
      } else {
        if (response.status === 404) {
          setError('Room not found')
        } else {
          const errorData = await response.json()
          setError(errorData.error || `Failed to load room: ${response.status}`)
        }
      }
    } catch (error) {
      console.error('Failed to fetch room data:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Show loading while pathname is being resolved
  if (!pathname) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading route...</p>
        </div>
      </div>
    )
  }

  // Early return if no room ID
  if (!roomId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Invalid Room ID
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The room ID in the URL is invalid or missing.
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Debug info: pathname={pathname}, parsed roomId={roomId}
          </p>
          <button
            onClick={() => router.push('/rooms')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Rooms
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading room...</p>
          <p className="text-sm text-gray-500 mt-2">Room ID: {roomId}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {error === 'Room not found' ? 'Room Not Found' : 'Error Loading Room'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error === 'Room not found' 
              ? 'The room you are looking for does not exist or has been deleted.'
              : error
            }
          </p>
          <p className="text-xs text-gray-500 mb-4">Room ID: {roomId}</p>
          <button
            onClick={() => router.push('/rooms')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Rooms
          </button>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please sign in to access this room.
          </p>
        </div>
      </div>
    )
  }

  if (!roomData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Room Data Not Available
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Unable to load room information.
          </p>
          <p className="text-xs text-gray-500 mt-2">Room ID: {roomId}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <RoomEditor 
        roomId={roomData._id}
        roomName={roomData.name}
        joinCode={roomData.joinCode}
        user={session.user}
      />
    </div>
  )
}
