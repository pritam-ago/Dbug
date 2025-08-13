"use client"

import { useState, useRef, useEffect } from "react"
import { Editor } from "@monaco-editor/react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, RotateCcw, Download, Upload, Terminal, Code, Zap } from "lucide-react"
import { useTheme } from "next-themes"

const defaultJavaScriptCode = `// JavaScript Sandbox
// Write your JavaScript code here

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci sequence:");
for (let i = 0; i < 10; i++) {
  console.log(\`fib(\${i}) = \${fibonacci(i)}\`);
}

// You can also use modern JavaScript features
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled numbers:", doubled);`

const defaultPythonCode = `# Python Sandbox
# Write your Python code here

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print("Fibonacci sequence:")
for i in range(10):
    print(f"fib({i}) = {fibonacci(i)}")

# You can also use list comprehensions
numbers = [1, 2, 3, 4, 5]
doubled = [n * 2 for n in numbers]
print(f"Doubled numbers: {doubled}")

# And f-strings
name = "World"
print(f"Hello, {name}!")`

interface ExecutionResult {
  success: boolean
  output: string
  error?: string
  executionTime: number
  timestamp: Date
}

export default function SandboxPage() {
  const { theme } = useTheme()
  const [activeLanguage, setActiveLanguage] = useState<'javascript' | 'python'>('javascript')
  const [javascriptCode, setJavaScriptCode] = useState(defaultJavaScriptCode)
  const [pythonCode, setPythonCode] = useState(defaultPythonCode)
  const [isRunning, setIsRunning] = useState(false)
  const [executionHistory, setExecutionHistory] = useState<ExecutionResult[]>([])
  const [terminalOutput, setTerminalOutput] = useState<string[]>([])
  const [showTerminal, setShowTerminal] = useState(true)

  const addToTerminal = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'
    setTerminalOutput(prev => [...prev, `[${timestamp}] ${prefix} ${message}`])
  }

  const clearTerminal = () => {
    setTerminalOutput([])
  }

  const executeCode = async () => {
    const code = activeLanguage === 'javascript' ? javascriptCode : pythonCode
    
    if (!code.trim()) {
      addToTerminal('No code to execute', 'error')
      return
    }

    setIsRunning(true)
    addToTerminal(`Executing ${activeLanguage} code...`, 'info')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'}/api/sandbox/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language: activeLanguage,
          timeout: 30000 // 30 seconds
        }),
      })

      const result: ExecutionResult = await response.json()
      result.timestamp = new Date()

      if (result.success) {
        addToTerminal(`Code executed successfully in ${result.executionTime}ms`, 'success')
        if (result.output) {
          addToTerminal(`Output:\n${result.output}`, 'info')
        }
      } else {
        addToTerminal(`Execution failed: ${result.error}`, 'error')
      }

      setExecutionHistory(prev => [result, ...prev.slice(0, 9)]) // Keep last 10 results
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      addToTerminal(`Execution error: ${errorMessage}`, 'error')
    } finally {
      setIsRunning(false)
    }
  }

  const resetCode = () => {
    if (activeLanguage === 'javascript') {
      setJavaScriptCode(defaultJavaScriptCode)
    } else {
      setPythonCode(defaultPythonCode)
    }
    addToTerminal('Code reset to default', 'info')
  }

  const downloadCode = () => {
    const code = activeLanguage === 'javascript' ? javascriptCode : pythonCode
    const extension = activeLanguage === 'javascript' ? 'js' : 'py'
    const filename = `sandbox-code.${extension}`
    
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    addToTerminal(`Code downloaded as ${filename}`, 'success')
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (activeLanguage === 'javascript') {
        setJavaScriptCode(content)
      } else {
        setPythonCode(content)
      }
      addToTerminal(`Code loaded from ${file.name}`, 'success')
    }
    reader.readAsText(file)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Code Sandbox</h1>
          <p className="text-muted-foreground">
            A safe environment to run JavaScript and Python code with real-time execution
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Sandboxed
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Terminal className="h-3 w-3" />
            Terminal Access
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Editor Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Code Editor
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetCode}
                  disabled={isRunning}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadCode}
                  disabled={isRunning}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".js,.py,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </span>
                  </Button>
                </label>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeLanguage} onValueChange={(value) => setActiveLanguage(value as 'javascript' | 'python')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
              </TabsList>
              <TabsContent value="javascript" className="mt-4">
                <Editor
                  height="400px"
                  defaultLanguage="javascript"
                  value={javascriptCode}
                  onChange={(value) => setJavaScriptCode(value || '')}
                  theme={theme === 'dark' ? 'vs-dark' : 'light'}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </TabsContent>
              <TabsContent value="python" className="mt-4">
                <Editor
                  height="400px"
                  defaultLanguage="python"
                  value={pythonCode}
                  onChange={(value) => setPythonCode(value || '')}
                  theme={theme === 'dark' ? 'vs-dark' : 'light'}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </TabsContent>
            </Tabs>
            
            <div className="mt-4 flex justify-center">
              <Button
                onClick={executeCode}
                disabled={isRunning}
                size="lg"
                className="px-8"
              >
                {isRunning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Code
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Terminal Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Terminal Output
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearTerminal}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTerminal(!showTerminal)}
                >
                  {showTerminal ? 'Hide' : 'Show'}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showTerminal && (
              <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm h-[400px] overflow-y-auto">
                {terminalOutput.length === 0 ? (
                  <div className="text-gray-500">
                    Terminal ready. Click "Run Code" to execute your code.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {terminalOutput.map((line, index) => (
                      <div key={index} className="whitespace-pre-wrap">
                        {line}
                      </div>
                    ))}
                    {isRunning && (
                      <div className="flex items-center gap-2 text-yellow-400">
                        <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
                        <span>Executing...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Execution History */}
      {executionHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Execution History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {executionHistory.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.success
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                      : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={result.success ? 'default' : 'destructive'}>
                        {result.success ? 'Success' : 'Error'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {result.timestamp.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {result.executionTime}ms
                    </span>
                  </div>
                  {result.output && (
                    <div className="mb-2">
                      <strong>Output:</strong>
                      <pre className="mt-1 p-2 bg-muted rounded text-sm overflow-x-auto">
                        {result.output}
                      </pre>
                    </div>
                  )}
                  {result.error && (
                    <div>
                      <strong>Error:</strong>
                      <pre className="mt-1 p-2 bg-red-100 dark:bg-red-900 rounded text-sm overflow-x-auto">
                        {result.error}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Notice */}
      <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-bold">
              !
            </div>
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                Security Notice
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                This sandbox environment is designed for safe code execution. Certain functions and modules are restricted for security reasons. 
                Code runs in an isolated environment with timeout limits and resource constraints.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
