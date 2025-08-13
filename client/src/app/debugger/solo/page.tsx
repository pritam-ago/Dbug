'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Code, Github, ArrowRight, ArrowLeft, Loader2 } from "lucide-react"
import { GitHubRepo } from "@/types/code-debugger"

export default function SoloDebuggingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(false)
  const [showImport, setShowImport] = useState(false)

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }
  }, [status, router])

  const fetchRepositories = async () => {
    if (!session?.user?.githubAccessToken) {
      alert('GitHub access required. Please connect your GitHub account.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/github/repos')
      if (response.ok) {
        const data = await response.json()
        setRepos(data.data || [])
        setShowImport(true)
      } else {
        throw new Error('Failed to fetch repositories')
      }
    } catch (error) {
      console.error('Error fetching repositories:', error)
      alert('Failed to fetch repositories. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleImportRepo = (repo: GitHubRepo) => {
    // Navigate to debugger with repo info
    router.push(`/debugger?repo=${repo.full_name}&branch=${repo.default_branch}`)
  }

  const handleCreateFromScratch = () => {
    router.push('/debugger')
  }

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-700/25 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Code className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-700 dark:text-gray-200 font-['Space_Grotesk']">Solo Debugging</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-700 dark:text-gray-200 mb-4 font-['Space_Grotesk']">
              Choose Your Debugging Mode
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 font-['DM_Sans']">
              Start debugging solo with your preferred approach
            </p>
          </div>

          {!showImport ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Create from Scratch */}
              <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Code className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <CardTitle className="text-2xl text-gray-700 dark:text-gray-200">Create from Scratch</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Start with a blank editor and write your code from the beginning
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button 
                    onClick={handleCreateFromScratch}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg py-3"
                  >
                    Start Coding
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Import from GitHub */}
                            <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Github className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-2xl text-gray-700 dark:text-gray-200">Import from GitHub</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Import an existing repository and start debugging immediately
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button 
                    onClick={fetchRepositories}
                    className="w-full bg-green-600 hover:bg-green-700 text-lg py-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        Browse Repositories
                        <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Back Button */}
              <div className="flex justify-start">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowImport(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Options
                </Button>
              </div>

              {/* Repository List */}
              <div className="bg-card/80 backdrop-blur-sm rounded-lg border border-border p-6">
                <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-6 flex items-center gap-2">
                  <Github className="w-6 h-6" />
                  Your GitHub Repositories
                </h3>
                
                {repos.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No repositories found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {repos.map((repo) => (
                      <Card key={repo.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg text-gray-700 dark:text-gray-200">
                              {repo.name}
                            </CardTitle>
                            {repo.private && (
                              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                                Private
                              </span>
                            )}
                          </div>
                          <CardDescription className="text-gray-600 dark:text-gray-400">
                            {repo.description || 'No description'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                            <span>Branch: {repo.default_branch}</span>
                            <span>Updated: {new Date(repo.updated_at).toLocaleDateString()}</span>
                          </div>
                          <Button 
                            onClick={() => handleImportRepo(repo)}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            Import Repository
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
