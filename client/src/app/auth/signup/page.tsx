"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, Code } from "lucide-react"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleGitHubConnect = async () => {
    setIsLoading(true)
    console.log("Connecting to GitHub...", formData)
    setTimeout(() => {
      setIsLoading(false)
      window.location.href = "/dashboard"
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-700/25 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />

      <Card className="relative w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="text-center">
          <div className="inline-flex items-center gap-3 mb-4 justify-center">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-700 font-['Space_Grotesk']">DBug</h1>
          </div>

          <CardTitle className="text-2xl text-gray-700 font-['Space_Grotesk']">Join DBug</CardTitle>
          <CardDescription className="text-gray-600 font-['DM_Sans']">
            Create your account to start debugging collaboratively
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">
                Full Name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-indigo-600 focus:ring-indigo-600 font-['DM_Sans']"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 font-['DM_Sans']">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-indigo-600 focus:ring-indigo-600 font-['DM_Sans']"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <Button
            onClick={handleGitHubConnect}
            disabled={!formData.name || !formData.email || isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 font-['DM_Sans']"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Connecting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Github className="w-5 h-5" />
                Connect with GitHub
              </div>
            )}
          </Button>

          <div className="text-center">
            <p className="text-gray-600 text-sm font-['DM_Sans']">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-700 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
