import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Time formatting utility
export function formatTime(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diffInHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 1) {
    return 'Just now'
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`
  } else {
    return d.toLocaleDateString()
  }
}

// Language detection utility
export function getLanguageFromFileName(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase()
  
  const languageMap: { [key: string]: string } = {
    'js': 'JavaScript',
    'ts': 'TypeScript',
    'jsx': 'React JSX',
    'tsx': 'React TSX',
    'py': 'Python',
    'java': 'Java',
    'cpp': 'C++',
    'c': 'C',
    'cs': 'C#',
    'php': 'PHP',
    'rb': 'Ruby',
    'go': 'Go',
    'rs': 'Rust',
    'swift': 'Swift',
    'kt': 'Kotlin',
    'scala': 'Scala',
    'html': 'HTML',
    'css': 'CSS',
    'scss': 'SCSS',
    'sass': 'Sass',
    'json': 'JSON',
    'xml': 'XML',
    'md': 'Markdown',
    'sql': 'SQL',
    'sh': 'Shell',
    'ps1': 'PowerShell',
    'bat': 'Batch',
    'yml': 'YAML',
    'yaml': 'YAML',
    'toml': 'TOML',
    'ini': 'INI'
  }
  
  return languageMap[extension || ''] || 'Text'
}

// User management utilities
export async function createOrUpdateUser(userData: {
  githubId: string
  githubUsername: string
  email: string
  name: string
  avatarUrl: string
  provider?: string
}) {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users`
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    if (response.ok) {
      const result = await response.json()
      return { success: true, data: result.user, message: result.message }
    } else if (response.status === 409) {
      const result = await response.json()
      return { success: true, data: result.existingUser, message: result.message, isExisting: true }
    } else {
      const errorText = await response.text()
      return { success: false, error: errorText, status: response.status }
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function getUserByGitHubId(githubId: string) {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/github/${githubId}`
    
    const response = await fetch(apiUrl)
    
    if (response.status === 200) {
      const result = await response.json()
      return { success: true, data: result.user }
    } else {
      return { success: false, error: 'User not found', status: response.status }
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
