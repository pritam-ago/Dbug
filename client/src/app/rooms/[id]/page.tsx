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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <div className="w-24 h-24 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <p className="text-xl font-medium text-gray-700 dark:text-gray-300 font-['Space_Grotesk']">Loading route...</p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Preparing your collaboration space</p>
        </div>
      </div>
    )
  }

  // Early return if no room ID
  if (!roomId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 font-['Space_Grotesk']">
            Invalid Room ID
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
            The room ID in the URL is invalid or missing.
          </p>
          <p className="text-sm text-gray-500 mb-6 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono">
            Debug info: pathname={pathname}, parsed roomId={roomId}
          </p>
          <button
            onClick={() => router.push('/rooms')}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 font-medium"
          >
            Back to Rooms
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <div className="w-24 h-24 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <p className="text-xl font-medium text-gray-700 dark:text-gray-300 font-['Space_Grotesk'] mb-2">Loading room...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
            Room ID: {roomId}
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 font-['Space_Grotesk']">
            {error === 'Room not found' ? 'Room Not Found' : 'Error Loading Room'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
            {error === 'Room not found' 
              ? 'The room you are looking for does not exist or has been deleted.'
              : error
            }
          </p>
          <p className="text-sm text-gray-500 mb-6 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono">
            Room ID: {roomId}
          </p>
          <button
            onClick={() => router.push('/rooms')}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 font-medium"
          >
            Back to Rooms
          </button>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 font-['Space_Grotesk']">
            Authentication Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Please sign in to access this room.
          </p>
        </div>
      </div>
    )
  }

  if (!roomData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-800 dark:to-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 font-['Space_Grotesk']">
            Room Data Not Available
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
            Unable to load room information.
          </p>
          <p className="text-sm text-gray-500 mb-6 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono">
            Room ID: {roomId}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      <RoomEditor 
        roomId={roomData._id}
        roomName={roomData.name}
        joinCode={roomData.joinCode}
        user={session.user}
      />
    </div>
  )
}
