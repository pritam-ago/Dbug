"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChatMessage } from "@/types/code-debugger"
import { MessageSquare, X, Users, Send } from "lucide-react"
import { formatTime } from "@/lib/utils"

interface ChatRoomProps {
  isOpen: boolean
  onToggle: () => void
  chatMessages: ChatMessage[]
  onlineUsers: string[]
  onSendMessage: (message: string) => void
}

export function ChatRoom({
  isOpen,
  onToggle,
  chatMessages,
  onlineUsers,
  onSendMessage,
}: ChatRoomProps) {
  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    onSendMessage(newMessage)
    setNewMessage("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="w-80 border-l bg-card flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-lg">Chat Room</h2>
            <Badge variant="secondary" className="text-xs">
              {onlineUsers.length} online
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-6 w-6 p-0"
            title="Close Chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1 mt-2">
          <Users className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {Array.isArray(onlineUsers) ? onlineUsers.join(", ") : 'Online'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatMessages.map((message) => {
          const displayName = message.username || message.user || 'Unknown'
          const isCurrentUser = displayName === "You" || (message.userId && message.userId === "You")
          
          return (
            <div key={message.id} className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-medium ${
                    message.type === "ai"
                      ? "text-blue-500"
                      : message.type === "system"
                        ? "text-green-500"
                        : isCurrentUser
                          ? "text-purple-500"
                          : "text-foreground"
                  }`}
                >
                  {displayName}
                </span>
                <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
              </div>
              <Card
                className={`p-3 ${
                  isCurrentUser
                    ? "bg-primary/10 ml-4"
                    : message.type === "ai"
                      ? "bg-blue-50 dark:bg-blue-950/20"
                      : message.type === "system"
                        ? "bg-green-50 dark:bg-green-950/20"
                        : ""
                }`}
              >
                <p className="text-sm text-foreground">{message.message}</p>
              </Card>
            </div>
          )
        })}
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button size="sm" onClick={handleSendMessage} disabled={!newMessage.trim()} className="px-3">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs bg-transparent"
            onClick={() => {
              setNewMessage("Can someone help me debug this function?")
            }}
          >
            Ask for help
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs bg-transparent"
            onClick={() => {
              setNewMessage("I found the solution! Check line 25")
            }}
          >
            Share solution
          </Button>
        </div>
      </div>
    </div>
  )
}
