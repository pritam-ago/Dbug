// Database connection utility for client-side operations
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`)
  }

  return response.json()
}

export async function createUser(userData: {
  githubId: string
  githubUsername: string
  email: string
  name: string
  avatarUrl?: string
}) {
  return apiRequest('/api/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  })
}

export async function getUserByGitHubId(githubId: string) {
  return apiRequest(`/api/users/github/${githubId}`)
}

export async function updateUser(userId: string, userData: any) {
  return apiRequest(`/api/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  })
}
