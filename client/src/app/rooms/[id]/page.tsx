"use client"

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { RoomEditor } from '@/components/room-editor/room-editor'

export default function RoomPage() {
  const params = useParams()
  const { data: session } = useSession()
  const [roomData, setRoomData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      // In a real app, you'd fetch room data here
      setRoomData({
        id: params.id,
        name: `Room ${params.id}`,
        joinCode: 'ABC123'
      })
      setLoading(false)
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading room...</p>
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

  return (
    <div className="min-h-screen bg-background">
      <RoomEditor 
        roomId={params.id as string}
        roomName={roomData?.name}
        joinCode={roomData?.joinCode}
        user={session.user}
      />
    </div>
  )
}
