"use client"

import { useState, useRef } from "react"
import { Editor } from "@monaco-editor/react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { FileExplorer } from "./file-explorer"
import { TerminalComponent } from "./terminal"
import { AIDebuggerPanel } from "./ai-debugger-panel"
import { ChatRoom } from "./chat-room"
import { BugResult, FileNode, OpenFile, ChatMessage } from "@/types/code-debugger"
import { getLanguageFromFileName } from "@/lib/utils"
import {
  Play,
  MessageSquare,
  FileIcon as FileOpen,
  Save,
  Sun,
  Moon,
  Plus,
  File,
  X,
  GitBranch,
  Database,
  Zap,
  Cloud,
  Menu,
} from "lucide-react"
import { useTheme } from "next-themes"

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
  const [onlineUsers] = useState(["Alice", "Bob", "Charlie", "You"])

  const getCurrentFile = () => openFiles[activeFileIndex]

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

  const clearTerminal = () => {
    setTerminalOutput([])
  }

  const sendMessage = (message: string) => {
    if (!message.trim()) return

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      user: "You",
      message: message,
      timestamp: new Date(),
      type: "user",
    }

    setChatMessages((prev) => [...prev, newMessage])

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
        <FileExplorer
          fileTree={fileTree}
          openFiles={openFiles}
          activeFileIndex={activeFileIndex}
          onToggleFolder={toggleFolder}
          onOpenFile={openFile}
          isOpen={isFileExplorerOpen}
          onToggle={() => setIsFileExplorerOpen(!isFileExplorerOpen)}
        />

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

          <TerminalComponent
            isOpen={isTerminalOpen}
            onToggle={() => setIsTerminalOpen(!isTerminalOpen)}
            terminalOutput={terminalOutput}
            isRunning={isRunning}
            onClear={clearTerminal}
          />
        </div>

        <AIDebuggerPanel
          isOpen={isPanelOpen}
          onToggle={() => setIsPanelOpen(!isPanelOpen)}
          bugResults={bugResults}
          aiExplanation={aiExplanation}
          isAnalyzing={isAnalyzing}
          onAskAI={handleAskAI}
          onApplyFix={handleApplyFix}
        />

        <ChatRoom
          isOpen={isChatOpen}
          onToggle={() => setIsChatOpen(!isChatOpen)}
          chatMessages={chatMessages}
          onlineUsers={onlineUsers}
          onSendMessage={sendMessage}
        />
      </div>
    </div>
  )
}
