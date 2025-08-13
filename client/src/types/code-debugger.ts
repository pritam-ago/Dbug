export interface BugResult {
  type: "error" | "warning" | "suggestion"
  line: number
  message: string
  fix?: string
  aiFixedCode?: string
  codeSnippet?: string
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

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string
  private: boolean
  html_url: string
  clone_url: string
  default_branch: string
  updated_at: string
  permissions: {
    admin: boolean
    push: boolean
    pull: boolean
  }
}
