"use client"

import { useState, useRef } from "react"
import { Editor } from "@monaco-editor/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Play,
  MessageSquare,
  FileIcon as FileOpen,
  Save,
  Sun,
  Moon,
  Menu,
  X,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Folder,
  FolderOpen,
  File,
  GitBranch,
  Database,
  Zap,
  Cloud,
  ChevronRight,
  ChevronDown,
  Plus,
  Terminal,
  Trash2,
  Send,
  Users,
} from "lucide-react"
import { useTheme } from "next-themes"

interface BugResult {
  type: "error" | "warning" | "suggestion"
  line: number
  message: string
  fix?: string
}

interface FileNode {
  name: string
  type: "file" | "folder"
  children?: FileNode[]
  isOpen?: boolean
}

interface OpenFile {
  name: string
  content: string
  language: string
  isDirty: boolean
}

interface ChatMessage {
  id: string
  user: string
  message: string
  timestamp: Date
  type: "user" | "system" | "ai"
}

const defaultCode = `# Python Example - Find bugs in this code
def calculate_average(numbers):
    total = 0
    for num in numbers:
        total += num
    return total / len(numbers)

# This will cause a division by zero error
result = calculate_average([])
print(f"Average: {result}")

# JavaScript Example
function findMax(arr) {
    let max = arr[0];
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            max = arr[i];
        }
    }
    return max;
}

// This will cause an error with empty array
console.log(findMax([]));`

const sampleFileContents: Record<string, { content: string; language: string }> = {
  "main.py": {
    content: defaultCode,
    language: "python",
  },
  "app.js": {
    content: `// JavaScript Application
function initApp() {
    console.log("App initialized");
    setupEventListeners();
}

function setupEventListeners() {
    document.addEventListener('DOMContentLoaded', initApp);
}

initApp();`,
    language: "javascript",
  },
  "Header.tsx": {
    content: `import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
          )}
        </div>
      </div>
    </header>
  );
};`,
    language: "typescript",
  },
  "helpers.ts": {
    content: `// Utility helper functions
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};`,
    language: "typescript",
  },
  "README.md": {
    content: `# AI Code Debugger

A powerful AI-powered code debugging tool that helps you identify and fix issues in your code.

## Features

- Multi-language support (Python, JavaScript, TypeScript)
- Real-time AI analysis
- File explorer with project structure
- Dark/Light theme support
- Git integration

## Getting Started

1. Open a file from the explorer
2. Write or paste your code
3. Click "Ask AI" to analyze for bugs
4. Apply suggested fixes with one click

## Supported Languages

- Python (.py)
- JavaScript (.js)
- TypeScript (.ts, .tsx)
- Markdown (.md)`,
    language: "markdown",
  },
}

const mockFileTree: FileNode[] = [
  {
    name: "src",
    type: "folder",
    isOpen: true,
    children: [
      {
        name: "components",
        type: "folder",
        isOpen: true,
        children: [
          { name: "Header.tsx", type: "file" },
          { name: "Sidebar.tsx", type: "file" },
          { name: "Button.tsx", type: "file" },
        ],
      },
      {
        name: "utils",
        type: "folder",
        isOpen: false,
        children: [
          { name: "helpers.ts", type: "file" },
          { name: "constants.ts", type: "file" },
        ],
      },
      { name: "main.py", type: "file" },
      { name: "app.js", type: "file" },
    ],
  },
  {
    name: "tests",
    type: "folder",
    isOpen: false,
    children: [
      { name: "test_main.py", type: "file" },
      { name: "test_utils.js", type: "file" },
    ],
  },
  { name: "README.md", type: "file" },
  { name: "package.json", type: "file" },
]

export function CodeDebugger() {
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([
    {
      name: "main.py",
      content: defaultCode,
      language: "python",
      isDirty: false,
    },
  ])
  const [activeFileIndex, setActiveFileIndex] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [bugResults, setBugResults] = useState<BugResult[]>([])
  const [aiExplanation, setAiExplanation] = useState("")
  const [isPanelOpen, setIsPanelOpen] = useState(true)
  const [isFileExplorerOpen, setIsFileExplorerOpen] = useState(true)
  const [fileTree, setFileTree] = useState<FileNode[]>(mockFileTree)
  const [currentBranch] = useState("feature/ai-debugger")
  const { theme, setTheme } = useTheme()
  const editorRef = useRef<any>(null)
  const [isIssuesCollapsed, setIsIssuesCollapsed] = useState(false)
  const [isAnalysisCollapsed, setIsAnalysisCollapsed] = useState(false)
  const [isTerminalOpen, setIsTerminalOpen] = useState(false)
  const [terminalOutput, setTerminalOutput] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      user: "System",
      message: "Welcome to the AI Code Debugger chat room! Collaborate with your team and get AI assistance.",
      timestamp: new Date(Date.now() - 300000),
      type: "system",
    },
    {
      id: "2",
      user: "Alice",
      message: "Hey team! I found a bug in the authentication module. Anyone available to help?",
      timestamp: new Date(Date.now() - 240000),
      type: "user",
    },
    {
      id: "3",
      user: "Bob",
      message: "Can you share the error details?",
      timestamp: new Date(Date.now() - 180000),
      type: "user",
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [onlineUsers] = useState(["Alice", "Bob", "Charlie", "You"])

  const getCurrentFile = () => openFiles[activeFileIndex]

  const getLanguageFromFileName = (fileName: string): string => {
    const ext = fileName.split(".").pop()?.toLowerCase()
    switch (ext) {
      case "py":
        return "python"
      case "js":
        return "javascript"
      case "ts":
      case "tsx":
        return "typescript"
      case "md":
        return "markdown"
      case "json":
        return "json"
      case "css":
        return "css"
      case "html":
        return "html"
      default:
        return "plaintext"
    }
  }

  const openFile = (fileName: string) => {
    const existingIndex = openFiles.findIndex((file) => file.name === fileName)
    if (existingIndex !== -1) {
      setActiveFileIndex(existingIndex)
      return
    }

    const fileData = sampleFileContents[fileName] || {
      content: `// ${fileName}\n// File content will be loaded here...`,
      language: getLanguageFromFileName(fileName),
    }

    const newFile: OpenFile = {
      name: fileName,
      content: fileData.content,
      language: fileData.language,
      isDirty: false,
    }

    setOpenFiles([...openFiles, newFile])
    setActiveFileIndex(openFiles.length)
  }

  const closeFile = (index: number) => {
    if (openFiles.length === 1) return

    const newOpenFiles = openFiles.filter((_, i) => i !== index)
    setOpenFiles(newOpenFiles)

    if (index === activeFileIndex) {
      setActiveFileIndex(Math.max(0, index - 1))
    } else if (index < activeFileIndex) {
      setActiveFileIndex(activeFileIndex - 1)
    }
  }

  const updateFileContent = (content: string) => {
    const updatedFiles = [...openFiles]
    updatedFiles[activeFileIndex] = {
      ...updatedFiles[activeFileIndex],
      content,
      isDirty: true,
    }
    setOpenFiles(updatedFiles)
  }

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor
  }

  const toggleFolder = (path: string[]) => {
    const updateTree = (nodes: FileNode[], currentPath: string[]): FileNode[] => {
      return nodes.map((node) => {
        if (currentPath.length === 1 && node.name === currentPath[0]) {
          return { ...node, isOpen: !node.isOpen }
        } else if (currentPath.length > 1 && node.name === currentPath[0] && node.children) {
          return {
            ...node,
            children: updateTree(node.children, currentPath.slice(1)),
          }
        }
        return node
      })
    }
    setFileTree(updateTree(fileTree, path))
  }

  const renderFileTree = (nodes: FileNode[], path: string[] = []) => {
    return nodes.map((node) => {
      const currentPath = [...path, node.name]
      const isSelected =
        node.type === "file" && openFiles.some((file, index) => file.name === node.name && index === activeFileIndex)

      return (
        <div key={node.name}>
          <div
            className={`flex items-center gap-1 px-2 py-1 text-sm cursor-pointer hover:bg-accent rounded ${
              isSelected ? "bg-accent text-accent-foreground" : ""
            }`}
            style={{ paddingLeft: `${path.length * 12 + 8}px` }}
            onClick={() => {
              if (node.type === "folder") {
                toggleFolder(currentPath)
              } else {
                openFile(node.name)
              }
            }}
          >
            {node.type === "folder" ? (
              <>
                {node.isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                {node.isOpen ? (
                  <FolderOpen className="h-4 w-4 text-blue-500" />
                ) : (
                  <Folder className="h-4 w-4 text-blue-500" />
                )}
              </>
            ) : (
              <>
                <div className="w-3" />
                <File className="h-4 w-4 text-gray-500" />
              </>
            )}
            <span className="truncate">{node.name}</span>
          </div>
          {node.type === "folder" && node.isOpen && node.children && (
            <div>{renderFileTree(node.children, currentPath)}</div>
          )}
        </div>
      )
    })
  }

  const handleRunCode = async () => {
    const currentFile = getCurrentFile()
    if (!currentFile) return

    setIsRunning(true)
    setIsTerminalOpen(true)

    const timestamp = new Date().toLocaleTimeString()
    setTerminalOutput((prev) => [...prev, `[${timestamp}] Running ${currentFile.name}...`, ""])

    // Simulate code execution based on file type
    setTimeout(() => {
      const newOutput = [...terminalOutput]

      if (currentFile.language === "python") {
        if (currentFile.content.includes("calculate_average([])")) {
          newOutput.push(
            "Traceback (most recent call last):",
            '  File "main.py", line 8, in <module>',
            "    result = calculate_average([])",
            '  File "main.py", line 5, in calculate_average',
            "    return total / len(numbers)",
            "ZeroDivisionError: division by zero",
            "",
          )
        } else {
          newOutput.push("Code executed successfully!", "Average: 15.5", "")
        }
      } else if (currentFile.language === "javascript") {
        if (currentFile.content.includes("findMax([])")) {
          newOutput.push(
            "TypeError: Cannot read property '0' of undefined",
            "    at findMax (app.js:2:15)",
            "    at app.js:10:13",
            "",
          )
        } else {
          newOutput.push("App initialized", "Maximum value: 42", "")
        }
      } else {
        newOutput.push(`Executed ${currentFile.name} successfully!`, "Output: Hello, World!", "")
      }

      newOutput.push(`[${new Date().toLocaleTimeString()}] Process finished.`)
      setTerminalOutput(newOutput)
      setIsRunning(false)
    }, 1500)
  }

  const handleAskAI = async () => {
    setIsAnalyzing(true)

    setTimeout(() => {
      const mockResults: BugResult[] = [
        {
          type: "error",
          line: 8,
          message: "Division by zero error: Empty list passed to calculate_average function",
          fix: "Add a check for empty list before division",
        },
        {
          type: "error",
          line: 22,
          message: "Cannot read property of undefined: Empty array passed to findMax function",
          fix: "Add validation for empty array",
        },
        {
          type: "warning",
          line: 3,
          message: "Consider using built-in sum() function for better performance",
          fix: "Replace manual loop with sum(numbers)",
        },
      ]

      setBugResults(mockResults)
      setAiExplanation(`I found ${mockResults.length} issues in your code:

1. **Division by Zero Error (Line 8)**: The calculate_average function doesn't handle empty lists, which causes a division by zero error.

2. **Undefined Access Error (Line 22)**: The findMax function tries to access arr[0] on an empty array, returning undefined.

3. **Performance Optimization (Line 3)**: Using Python's built-in sum() function would be more efficient than a manual loop.

These are common edge cases that should be handled with proper input validation.`)

      setIsAnalyzing(false)
    }, 2000)
  }

  const handleApplyFix = (result: BugResult) => {
    if (!result.fix || !editorRef.current) return

    const currentFile = getCurrentFile()
    if (!currentFile) return

    let newCode = currentFile.content
    if (result.line === 8) {
      newCode = newCode.replace(
        "def calculate_average(numbers):",
        `def calculate_average(numbers):
    if not numbers:
        return 0`,
      )
    }

    updateFileContent(newCode)
  }

  const handleFileOpen = () => {
    console.log("Opening file...")
  }

  const handleFileSave = () => {
    console.log("Saving file...")
    const updatedFiles = [...openFiles]
    updatedFiles[activeFileIndex] = {
      ...updatedFiles[activeFileIndex],
      isDirty: false,
    }
    setOpenFiles(updatedFiles)
  }

  const getResultIcon = (type: BugResult["type"]) => {
    switch (type) {
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "suggestion":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
    }
  }

  const clearTerminal = () => {
    setTerminalOutput([])
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const sendMessage = () => {
    if (!newMessage.trim()) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      user: "You",
      message: newMessage,
      timestamp: new Date(),
      type: "user",
    }

    setChatMessages((prev) => [...prev, message])
    setNewMessage("")

    // Simulate AI or team responses
    setTimeout(
      () => {
        const responses = [
          "That's a great question! Let me analyze the code...",
          "I see the issue. Try checking the validation logic on line 45.",
          "Have you considered using a try-catch block there?",
          "The error might be related to the async function handling.",
          "Let me run a quick analysis on that code section.",
        ]

        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          user: "AI Assistant",
          message: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date(),
          type: "ai",
        }

        setChatMessages((prev) => [...prev, aiResponse])
      },
      1000 + Math.random() * 2000,
    )
  }

  const currentFile = getCurrentFile()

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="border-b bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-lg">AI Code Debugger</h1>
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline" className="text-xs">
                {currentBranch}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Integrations:</span>
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              <Database className="h-3 w-3" />
              Supabase
            </Badge>
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              <Zap className="h-3 w-3" />
              OpenAI
            </Badge>
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              <Cloud className="h-3 w-3" />
              Vercel
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`${isFileExplorerOpen ? "w-64" : "w-12"} border-r bg-card flex flex-col transition-all duration-200`}
        >
          {isFileExplorerOpen ? (
            <>
              <div className="p-3 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm">Explorer</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFileExplorerOpen(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2">{renderFileTree(fileTree)}</div>
            </>
          ) : (
            <>
              <div className="p-2 border-b">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFileExplorerOpen(true)}
                  className="h-8 w-8 p-0"
                  title="Open Explorer"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-col gap-2 p-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="GitHub Integration">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-6.627-5.373-12-12-12z" />
                  </svg>
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Extensions">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Search">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Source Control">
                  <GitBranch className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="flex-1 flex flex-col">
          <div className="border-b bg-card">
            <div className="flex items-center overflow-x-auto border-b">
              {openFiles.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className={`flex items-center gap-2 px-3 py-2 border-r cursor-pointer hover:bg-accent/50 min-w-0 ${
                    index === activeFileIndex ? "bg-background border-b-2 border-b-primary" : ""
                  }`}
                  onClick={() => setActiveFileIndex(index)}
                >
                  <File className="h-3 w-3 flex-shrink-0" />
                  <span className="text-sm truncate max-w-32">{file.name}</span>
                  {file.isDirty && <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />}
                  {openFiles.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        closeFile(index)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 flex-shrink-0"
                onClick={() => openFile("untitled.txt")}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {!isFileExplorerOpen && (
                    <Button variant="outline" size="sm" onClick={() => setIsFileExplorerOpen(true)}>
                      <Menu className="h-4 w-4 mr-2" />
                      Files
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={handleFileOpen}>
                    <FileOpen className="h-4 w-4 mr-2" />
                    Open
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleFileSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  <select
                    value={currentFile?.language || "plaintext"}
                    onChange={(e) => {
                      const updatedFiles = [...openFiles]
                      updatedFiles[activeFileIndex] = {
                        ...updatedFiles[activeFileIndex],
                        language: e.target.value,
                      }
                      setOpenFiles(updatedFiles)
                    }}
                    className="px-3 py-1 rounded border bg-background text-foreground text-sm"
                  >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="markdown">Markdown</option>
                    <option value="json">JSON</option>
                    <option value="css">CSS</option>
                    <option value="html">HTML</option>
                    <option value="plaintext">Plain Text</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleRunCode}>
                    <Play className="h-4 w-4 mr-2" />
                    Run Code
                  </Button>
                  <Button size="sm" onClick={handleAskAI} disabled={isAnalyzing}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {isAnalyzing ? "Analyzing..." : "Ask AI"}
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  <Button variant="outline" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                    {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPanelOpen(!isPanelOpen)}
                    className="md:hidden"
                    title={isPanelOpen ? "Hide AI Debugger" : "Show AI Debugger"}
                  >
                    {isPanelOpen ? <X className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className={`flex-1 flex flex-col ${isTerminalOpen ? "h-1/2" : ""}`}>
            <Editor
              height="100%"
              language={currentFile?.language || "plaintext"}
              value={currentFile?.content || ""}
              onChange={(value) => updateFileContent(value || "")}
              onMount={handleEditorDidMount}
              theme={theme === "dark" ? "vs-dark" : "vs-light"}
              options={{
                fontSize: 14,
                fontFamily: "var(--font-mono)",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                insertSpaces: true,
                wordWrap: "on",
                lineNumbers: "on",
                renderLineHighlight: "line",
                selectOnLineNumbers: true,
                roundedSelection: false,
                readOnly: false,
                cursorStyle: "line",
                automaticLayout: true,
              }}
            />
          </div>

          {isTerminalOpen && (
            <div className="border-t bg-card flex flex-col h-1/2">
              <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  <span className="text-sm font-medium">Terminal</span>
                  {isRunning && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-muted-foreground">Running...</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearTerminal}
                    className="h-6 w-6 p-0"
                    title="Clear Terminal"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsTerminalOpen(false)}
                    className="h-6 w-6 p-0"
                    title="Close Terminal"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 font-mono text-sm bg-background/50">
                {terminalOutput.length === 0 ? (
                  <div className="text-muted-foreground">Terminal ready. Click "Run Code" to execute your code.</div>
                ) : (
                  <div className="space-y-1">
                    {terminalOutput.map((line, index) => (
                      <div
                        key={index}
                        className={`${
                          line.includes("Error") || line.includes("Traceback")
                            ? "text-red-500"
                            : line.includes("successfully") || line.includes("finished")
                              ? "text-green-500"
                              : line.startsWith("[")
                                ? "text-blue-500"
                                : "text-foreground"
                        }`}
                      >
                        {line || "\u00A0"}
                      </div>
                    ))}
                    {isRunning && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
                        <span>Executing...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div
          className={`${isPanelOpen ? "block" : "hidden"} md:block w-full md:w-96 border-l bg-card flex flex-col transition-all duration-200`}
        >
          {isPanelOpen ? (
            <>
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg">AI Debugger</h2>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsPanelOpen(false)}
                      className="hidden md:block h-6 w-6 p-0"
                      title="Collapse AI Debugger"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsPanelOpen(false)}
                      className="md:hidden h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {bugResults.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">Issues Found</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsIssuesCollapsed(!isIssuesCollapsed)}
                        className="h-6 w-6 p-0"
                      >
                        {isIssuesCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                    {!isIssuesCollapsed && (
                      <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                        {bugResults.map((result, index) => (
                          <Card key={index} className="p-3">
                            <div className="flex items-start gap-2">
                              {getResultIcon(result.type)}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium capitalize">{result.type}</p>
                                <p className="text-xs text-muted-foreground mb-1">Line {result.line}</p>
                                <p className="text-sm text-foreground mb-2">{result.message}</p>
                                {result.fix && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleApplyFix(result)}
                                    className="text-xs"
                                  >
                                    Apply Fix
                                  </Button>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {aiExplanation && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">AI Analysis</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAnalysisCollapsed(!isAnalysisCollapsed)}
                        className="h-6 w-6 p-0"
                      >
                        {isAnalysisCollapsed ? (
                          <ChevronRight className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {!isAnalysisCollapsed && (
                      <Card className="p-3 animate-in slide-in-from-top-2 duration-200">
                        <div className="text-sm whitespace-pre-wrap text-foreground">{aiExplanation}</div>
                      </Card>
                    )}
                  </div>
                )}

                {bugResults.length === 0 && !aiExplanation && (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-sm">
                      Click "Ask AI" to analyze your code for bugs and get suggestions.
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="p-2 border-b leading-4 border-t-0 px-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPanelOpen(true)}
                  className="h-8 w-8 p-0"
                  title="Open AI Debugger"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-col gap-2 p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="Bug Analysis"
                  onClick={handleAskAI}
                  disabled={isAnalyzing}
                >
                  {bugResults.length > 0 ? (
                    <div className="relative">
                      <AlertTriangle className="h-4 w-4" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                        {bugResults.length}
                      </div>
                    </div>
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="AI Assistant"
                  onClick={() => setIsChatOpen(true)}
                >
                  
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Code Suggestions">
                  
                </Button>
              </div>
            </>
          )}
        </div>

        <div className={`${isChatOpen ? "w-80" : "w-12"} border-l bg-card flex flex-col transition-all duration-200`}>
          {isChatOpen ? (
            <>
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-lg">Chat Room</h2>
                    <Badge variant="secondary" className="text-xs">
                      {onlineUsers.length} online
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsChatOpen(false)}
                    className="h-6 w-6 p-0"
                    title="Close Chat"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{onlineUsers.join(", ")}</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((message) => (
                  <div key={message.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-medium ${
                          message.type === "ai"
                            ? "text-blue-500"
                            : message.type === "system"
                              ? "text-green-500"
                              : message.user === "You"
                                ? "text-purple-500"
                                : "text-foreground"
                        }`}
                      >
                        {message.user}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
                    </div>
                    <Card
                      className={`p-3 ${
                        message.user === "You"
                          ? "bg-primary/10 ml-4"
                          : message.type === "ai"
                            ? "bg-blue-50 dark:bg-blue-950/20"
                            : message.type === "system"
                              ? "bg-green-50 dark:bg-green-950/20"
                              : ""
                      }`}
                    >
                      <p className="text-sm text-foreground">{message.message}</p>
                    </Card>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button size="sm" onClick={sendMessage} disabled={!newMessage.trim()} className="px-3">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-transparent"
                    onClick={() => {
                      setNewMessage("Can someone help me debug this function?")
                    }}
                  >
                    Ask for help
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-transparent"
                    onClick={() => {
                      setNewMessage("I found the solution! Check line " + Math.floor(Math.random() * 50 + 1))
                    }}
                  >
                    Share solution
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 border-b flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsChatOpen(true)}
                  className="h-8 w-8 p-0"
                  title="Open Chat Room"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-col items-center justify-center flex-1 p-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="AI Chat"
                  onClick={() => setIsChatOpen(true)}
                >
                  
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
