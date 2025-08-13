"use client"

import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Code, Users, Plus, ArrowLeft, LogOut, Clock, GitBranch, Settings, X, Check } from "lucide-react"

interface Room {
  _id: string
  name: string
  description: string
  joinCode: string
  owner: string
  collaborators: string[]
  createdAt: string
  updatedAt: string
}

export default function RoomsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [joinCode, setJoinCode] = useState("")
  const [newRoom, setNewRoom] = useState({
    name: "",
    description: "",
    language: "JavaScript"
  })
  const [loading, setLoading] = useState(false)
  const [apiUrl] = useState(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000')

  useEffect(() => {
    if (session?.user) {
      loadRooms()
    }
  }, [session])

  const loadRooms = async () => {
    try {
      // For now, we'll use mock data since we need to implement user ID handling
      // In a real app, you'd fetch from the API using the user's ID
      const mockRooms: Room[] = [
        {
          _id: "1",
          name: "Frontend Bug Fix",
          description: "Working on React component issues",
          joinCode: "ABC123",
          owner: "John Doe",
          collaborators: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: "2",
          name: "API Integration",
          description: "Debugging REST API endpoints",
          joinCode: "DEF456",
          owner: "Jane Smith",
          collaborators: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      setRooms(mockRooms)
    } catch (error) {
      console.error("Failed to load rooms:", error)
    }
  }

  const handleCreateRoom = async () => {
    if (!newRoom.name.trim() || !session?.user) return
    
    setLoading(true)
    try {
      // For now, create a mock room
      // In a real app, you'd call the API
      const room: Room = {
        _id: Date.now().toString(),
        name: newRoom.name,
        description: newRoom.description,
        joinCode: generateJoinCode(),
        owner: session.user.name || "You",
        collaborators: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      setRooms(prev => [room, ...prev])
      setShowCreateModal(false)
      setNewRoom({ name: "", description: "", language: "JavaScript" })
      
      // Navigate to the new room
      router.push(`/rooms/${room._id}`)
    } catch (error) {
      console.error("Failed to create room:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinRoom = async () => {
    if (!joinCode.trim() || !session?.user) return
    
    setLoading(true)
    try {
      // For now, navigate to a mock room
      // In a real app, you'd call the API to join
      const roomId = "joined-" + Date.now()
      router.push(`/rooms/${roomId}`)
    } catch (error) {
      console.error("Failed to join room:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateJoinCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-700/25 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
        
        <header className="relative border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                  </Button>
                </Link>
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Code className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-700 dark:text-gray-200 font-['Space_Grotesk']">DBug</h1>
              </div>

              <div className="flex items-center gap-4">
                <ThemeToggle />
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || 'User'} />
                    <AvatarFallback className="bg-indigo-600 text-white text-sm font-medium">
                      {session?.user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{session?.user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{session?.user?.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-700 dark:text-gray-200 mb-2 font-['Space_Grotesk']">
                  Collaboration Rooms
                </h2>
                <p className="text-gray-600 dark:text-gray-400 font-['DM_Sans']">
                  Join existing rooms or create new ones to collaborate with your team.
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowJoinModal(true)}
                  className="gap-2"
                >
                  <Users className="w-4 h-4" />
                  Join Room
                </Button>
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4" />
                  Create Room
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <Card key={room._id} className="bg-card/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-['Space_Grotesk'] mb-1">{room.name}</CardTitle>
                      <CardDescription className="font-['DM_Sans'] text-sm mb-3">
                        {room.description}
                      </CardDescription>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <GitBranch className="w-3 h-3" />
                        <span>JavaScript</span>
                      </div>
                    </div>
                    <Badge variant="default" className="ml-2">
                      active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {room.collaborators.length + 1} participant{room.collaborators.length !== 0 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">{formatDate(room.updatedAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Owner: {room.owner}
                    </span>
                    <Button 
                      size="sm" 
                      className="bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => router.push(`/rooms/${room._id}`)}
                    >
                      Join Room
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {rooms.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">No rooms yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 font-['DM_Sans']">
                Create your first collaboration room to start debugging with your team.
              </p>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4" />
                Create Room
              </Button>
            </div>
          )}
        </main>

        {/* Create Room Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Create New Room
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateModal(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="room-name">Room Name</Label>
                  <Input
                    id="room-name"
                    value={newRoom.name}
                    onChange={(e) => setNewRoom(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter room name"
                  />
                </div>
                <div>
                  <Label htmlFor="room-description">Description</Label>
                  <Input
                    id="room-description"
                    value={newRoom.description}
                    onChange={(e) => setNewRoom(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter room description"
                  />
                </div>
                <div>
                  <Label htmlFor="room-language">Primary Language</Label>
                  <select
                    id="room-language"
                    value={newRoom.language}
                    onChange={(e) => setNewRoom(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full p-2 border border-input rounded-md bg-background"
                  >
                    <option value="JavaScript">JavaScript</option>
                    <option value="Python">Python</option>
                    <option value="TypeScript">TypeScript</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateRoom}
                    disabled={loading || !newRoom.name.trim()}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  >
                    {loading ? "Creating..." : "Create Room"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Join Room Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Join Room
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowJoinModal(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="join-code">Join Code</Label>
                  <Input
                    id="join-code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="font-mono text-center text-lg tracking-widest"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the 6-digit alphanumeric code provided by the room creator
                  </p>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowJoinModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleJoinRoom}
                    disabled={loading || joinCode.length !== 6}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  >
                    {loading ? "Joining..." : "Join Room"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
