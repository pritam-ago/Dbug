'use client'

import { CodeDebugger } from "@/components/code-debugger/code-debugger"
import { ThemeProvider } from "@/components/theme-provider"
import { useSearchParams } from "next/navigation"

export default function DebuggerPage() {
  const searchParams = useSearchParams()
  const repo = searchParams.get('repo')
  const branch = searchParams.get('branch')

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="h-screen w-full">
        <CodeDebugger repoFullName={repo || undefined} branch={branch || undefined} />
      </div>
    </ThemeProvider>
  )
}
