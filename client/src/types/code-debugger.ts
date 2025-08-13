export interface BugResult {
  type: "error" | "warning" | "suggestion"
  line: number
  message: string
  fix?: string
}

export interface FileNode {
  name: string
  type: "file" | "folder"
  children?: FileNode[]
  isOpen?: boolean
}

export interface OpenFile {
  name: string
  content: string
  language: string
  isDirty: boolean
}

export interface ChatMessage {
  id: string
  user: string
  message: string
  timestamp: Date
  type: "user" | "system" | "ai"
}
