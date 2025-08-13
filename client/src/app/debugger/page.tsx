import { CodeDebugger } from "@/components/code-debugger/code-debugger"
import { ThemeProvider } from "@/components/theme-provider"

export default function DebuggerPage() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="h-screen w-full">
        <CodeDebugger />
      </div>
    </ThemeProvider>
  )
}
