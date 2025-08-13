"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Users, Code } from 'lucide-react'
import { CodeDebugger } from '@/components/code-debugger/code-debugger'

interface RoomEditorProps {
  roomId: string
  roomName: string
  joinCode: string
  user: any
}

interface ChatMessage {
  id: string
  userId: string
  username: string
  message: string
  timestamp: Date
}

interface RoomParticipant {
  userId: string
  username: string
  avatar?: string
}

export function RoomEditor({ roomId, roomName, joinCode, user }: RoomEditorProps) {
  const router = useRouter()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [participants, setParticipants] = useState<RoomParticipant[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])

  useEffect(() => {
    // Initialize Socket.IO connection
    const newSocket = io('http://localhost:5000', {
      auth: {
        userId: user.id || user.email,
        username: user.name || user.email,
        roomId: roomId
      }
    })

    newSocket.on('connect', () => {
      console.log('Connected to room:', roomId)
      setIsConnected(true)
      newSocket.emit('join_room', {
        roomId,
        userId: user.id || user.email,
        username: user.name || user.email
      })
    })

    newSocket.on('user_joined', (data) => {
      setParticipants(prev => {
        if (!prev.find(p => p.userId === data.userId)) {
          return [...prev, { userId: data.userId, username: data.username }]
        }
        return prev
      })
      addSystemMessage(`${data.username} joined the room`)
      setOnlineUsers(prev => [...prev, data.userId])
    })

    newSocket.on('user_left', (data) => {
      setParticipants(prev => prev.filter(p => p.userId !== data.userId))
      addSystemMessage(`${data.username} left the room`)
      setOnlineUsers(prev => prev.filter(id => id !== data.userId))
    })

    newSocket.on('chat_message', (data) => {
      addMessage({
        id: Date.now().toString(),
        userId: data.userId,
        username: data.username,
        message: data.message,
        timestamp: new Date(data.timestamp)
      })
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
      addSystemMessage('Disconnected from server')
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [roomId, user])

  useEffect(() => {
    // Add current user to participants
    setParticipants([{
      userId: user.id || user.email,
      username: user.name || user.email,
      avatar: user.image
    }])
    setOnlineUsers([user.id || user.email])
  }, [user])

  const addMessage = (message: ChatMessage) => {
    setChatMessages(prev => [...prev, message])
  }

  const addSystemMessage = (text: string) => {
    addMessage({
      id: Date.now().toString(),
      userId: 'system',
      username: 'System',
      message: text,
      timestamp: new Date()
    })
  }

  const sendMessage = (message: string) => {
    if (!message.trim() || !socket) return

    const messageData = {
      roomId,
      userId: user.id || user.email,
      username: user.name || user.email,
      message: message.trim()
    }

    socket.emit('chat_message', messageData)
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/rooms')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Rooms
            </Button>
            <div className="flex items-center gap-3">
              <Code className="w-6 h-6 text-indigo-600" />
              <div>
                <h1 className="text-xl font-bold text-foreground">{roomName}</h1>
                <p className="text-sm text-muted-foreground">
                  Join Code: <Badge variant="secondary" className="font-mono">{joinCode}</Badge>
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {participants.length} participant{participants.length !== 1 ? 's' : ''}
              </span>
            </div>
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content - CodeDebugger with integrated chat */}
      <div className="flex-1 overflow-hidden">
        <CodeDebugger 
          isRoomMode={true}
          roomId={roomId}
          chatMessages={chatMessages}
          onlineUsers={onlineUsers}
          onSendMessage={sendMessage}
        />
      </div>
    </div>
  )
}
