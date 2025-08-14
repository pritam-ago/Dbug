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
import { Code, Users, Plus, ArrowLeft, LogOut, Clock, GitBranch, Settings, X, Check, Sparkles, Zap, Star } from "lucide-react"

interface Room {
  _id: string
  id?: string
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
  const [error, setError] = useState("")
  const [apiUrl] = useState(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000')

  useEffect(() => {
    if (session?.user) {
      loadRooms()
    }
  }, [session])

  const loadRooms = async () => {
    try {
      // Get user email from session - NextAuth provides email, not ID
      const userEmail = session?.user?.email
      if (!userEmail) return

      const response = await fetch(`${apiUrl}/api/rooms/user/${encodeURIComponent(userEmail)}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setRooms(result.data)
        } else {
          console.error("Failed to load rooms:", result.error)
        }
      } else {
        console.error("Failed to load rooms:", response.statusText)
      }
    } catch (error) {
      console.error("Failed to load rooms:", error)
    }
  }

  const handleCreateRoom = async () => {
    if (!newRoom.name.trim() || !session?.user) return
    
    setLoading(true)
    setError("")
    
    try {
      const userEmail = session?.user?.email
      if (!userEmail) {
        setError("User not authenticated")
        return
      }

      const response = await fetch(`${apiUrl}/api/rooms/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newRoom.name.trim(),
          description: newRoom.description.trim(),
          language: newRoom.language,
          userId: userEmail,
          email: userEmail,
          userName: session.user.name,
          image: session.user.image
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Room creation response:', result)
        console.log('Result data:', result.data)
        console.log('Result data _id:', result.data?._id)
        
        if (result.success) {
          // Add the new room to the list
          setRooms(prev => [result.data, ...prev])
          setShowCreateModal(false)
          setNewRoom({ name: "", description: "", language: "JavaScript" })
          
          // Navigate to the new room
          if (result.data?.id) {
            router.push(`/rooms/${result.data.id}`)
          } else if (result.data?._id) {
            // Fallback to _id if id is not available
            router.push(`/rooms/${result.data._id}`)
          } else {
            console.error('Room ID is undefined, cannot navigate')
            setError('Room created but ID is missing')
          }
        } else {
          setError(result.error || "Failed to create room")
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || `Failed to create room: ${response.status}`)
      }
    } catch (error) {
      console.error("Failed to create room:", error)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleJoinRoom = async () => {
    if (!joinCode.trim() || !session?.user) return
    
    setLoading(true)
    setError("")
    
    try {
      const userEmail = session?.user?.email
      if (!userEmail) {
        setError("User not authenticated")
        return
      }

      const response = await fetch(`${apiUrl}/api/rooms/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: joinCode.trim().toUpperCase(),
          userId: userEmail,
          email: userEmail,
          userName: session.user.name,
          image: session.user.image
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Refresh rooms list to include the joined room
          await loadRooms()
          setShowJoinModal(false)
          setJoinCode("")
          
          // Navigate to the joined room
          if (result.data?.id) {
            router.push(`/rooms/${result.data.id}`)
          } else if (result.data?._id) {
            // Fallback to _id if id is not available
            router.push(`/rooms/${result.data._id}`)
          } else {
            console.error('Room ID is undefined, cannot navigate')
            setError('Room joined but ID is missing')
          }
        } else {
          setError(result.error || "Failed to join room")
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || `Failed to join room: ${response.status}`)
      }
    } catch (error) {
      console.error("Failed to join room:", error)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <header className="relative border-b border-border/50 bg-background/80 backdrop-blur-xl shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2 hover:bg-background/60 transition-all duration-200">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                  </Button>
                </Link>
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-['Space_Grotesk']">
                  DBug
                </h1>
              </div>

              <div className="flex items-center gap-4">
                <ThemeToggle />
                <div className="flex items-center gap-3">
                  <Avatar className="w-9 h-9 ring-2 ring-indigo-200 dark:ring-indigo-800">
                    <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || 'User'} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-sm font-medium">
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
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-12">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 dark:from-gray-100 dark:via-indigo-200 dark:to-purple-200 bg-clip-text text-transparent font-['Space_Grotesk']">
                      Collaboration Rooms
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 font-['DM_Sans'] mt-1">
                      Join existing rooms or create new ones to collaborate with your team.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  <span>Real-time collaboration with AI-powered debugging</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowJoinModal(true)}
                  className="gap-2 border-2 hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200"
                >
                  <Users className="w-4 h-4" />
                  Join Room
                </Button>
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Create Room
                </Button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-8 p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-xl shadow-lg">
              <div className="flex items-center gap-3 text-red-700 dark:text-red-300">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <X className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError("")}
                  className="ml-auto h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room, index) => (
              <Card 
                key={room._id} 
                className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="pb-4 relative">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-['Space_Grotesk'] mb-2 text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                        {room.name}
                      </CardTitle>
                      <CardDescription className="font-['DM_Sans'] text-sm mb-4 text-gray-600 dark:text-gray-400 line-clamp-2">
                        {room.description}
                      </CardDescription>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <GitBranch className="w-3 h-3" />
                        <span className="font-medium">JavaScript</span>
                      </div>
                    </div>
                    <Badge variant="default" className="ml-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-md">
                      <Zap className="w-3 h-3 mr-1" />
                      active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 relative">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {room.collaborators.length + 1} participant{room.collaborators.length !== 0 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{formatDate(room.updatedAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Owner: {room.owner}
                    </span>
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                      onClick={() => router.push(`/rooms/${room.id || room._id}`)}
                    >
                      <Star className="w-3 h-3 mr-1" />
                      Join Room
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {rooms.length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Users className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3 font-['Space_Grotesk']">No rooms yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 font-['DM_Sans'] text-lg max-w-md mx-auto">
                Create your first collaboration room to start debugging with your team and experience real-time collaboration.
              </p>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg px-8 py-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                Create Your First Room
              </Button>
            </div>
          )}
        </main>

        {/* Create Room Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
            <Card className="w-full max-w-lg mx-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-0 shadow-2xl animate-in zoom-in-95 duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Create New Room
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateModal(false)}
                    className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="room-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Room Name
                  </Label>
                  <Input
                    id="room-name"
                    value={newRoom.name}
                    onChange={(e) => setNewRoom(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter room name"
                    className="h-11 border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room-description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </Label>
                  <Input
                    id="room-description"
                    value={newRoom.description}
                    onChange={(e) => setNewRoom(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter room description"
                    className="h-11 border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room-language" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Primary Language
                  </Label>
                  <select
                    id="room-language"
                    value={newRoom.language}
                    onChange={(e) => setNewRoom(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full h-11 p-3 border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl bg-white dark:bg-gray-800 transition-all duration-200"
                  >
                    <option value="JavaScript">JavaScript</option>
                    <option value="Python">Python</option>
                    <option value="TypeScript">TypeScript</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 h-11 border-2 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateRoom}
                    disabled={loading || !newRoom.name.trim()}
                    className="flex-1 h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating...
                      </div>
                    ) : (
                      "Create Room"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Join Room Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
            <Card className="w-full max-w-lg mx-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-0 shadow-2xl animate-in zoom-in-95 duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      Join Room
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowJoinModal(false)}
                    className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="join-code" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Join Code
                  </Label>
                  <Input
                    id="join-code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="h-11 border-2 border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400 rounded-xl font-mono text-center text-lg tracking-widest transition-all duration-200"
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Enter the 6-digit alphanumeric code provided by the room creator
                  </p>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowJoinModal(false)}
                    className="flex-1 h-11 border-2 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleJoinRoom}
                    disabled={loading || joinCode.length !== 6}
                    className="flex-1 h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Joining...
                      </div>
                    ) : (
                      "Join Room"
                    )}
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
