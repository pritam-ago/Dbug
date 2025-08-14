"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChatMessage } from "@/types/code-debugger"
import { MessageSquare, X, Users, Send, Sparkles, Zap, Lightbulb } from "lucide-react"
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
    <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-gradient-to-b from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl flex flex-col shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Chat Room
              </h2>
              <Badge variant="secondary" className="text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 mt-1">
                <Zap className="h-3 w-3 mr-1" />
                {onlineUsers.length} online
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-all duration-200"
            title="Close Chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-full flex items-center justify-center">
            <Users className="h-3 w-3 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            {Array.isArray(onlineUsers) ? onlineUsers.join(", ") : 'Online'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-900/50">
        {chatMessages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">No messages yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Start the conversation!</p>
          </div>
        ) : (
          chatMessages.map((message) => {
            const displayName = message.username || message.user || 'Unknown'
            const isCurrentUser = displayName === "You" || (message.userId && message.userId === "You")
            
            return (
              <div key={message.id} className="space-y-2 animate-in fade-in-50 slide-in-from-bottom-2 duration-200">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      message.type === "ai"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        : message.type === "system"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : isCurrentUser
                            ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 dark:from-indigo-900/30 dark:to-purple-900/30 dark:text-indigo-300"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {displayName}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{formatTime(message.timestamp)}</span>
                </div>
                <Card
                  className={`p-3 border-0 shadow-sm ${
                    isCurrentUser
                      ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 ml-4 border-l-4 border-indigo-500"
                      : message.type === "ai"
                        ? "bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-l-4 border-blue-500"
                        : message.type === "system"
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-l-4 border-green-500"
                          : "bg-white dark:bg-gray-800 border-l-4 border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{message.message}</p>
                </Card>
              </div>
            )
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 text-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500"
          />
          <Button 
            size="sm" 
            onClick={handleSendMessage} 
            disabled={!newMessage.trim()} 
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 dark:hover:from-blue-800/30 dark:hover:to-cyan-800/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 rounded-lg transition-all duration-200"
            onClick={() => {
              setNewMessage("Can someone help me debug this function?")
            }}
          >
            <Lightbulb className="h-3 w-3 mr-1" />
            Ask for help
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 dark:hover:from-green-800/30 dark:hover:to-emerald-800/30 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 rounded-lg transition-all duration-200"
            onClick={() => {
              setNewMessage("I found the solution! Check line 25")
            }}
          >
            <Zap className="h-3 w-3 mr-1" />
            Share solution
          </Button>
        </div>
      </div>
    </div>
  )
}
