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
  Save,
  Sun,
  Moon,
  Plus,
  File,
  X,
  GitBranch,
  Zap,
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
print(f"Average: {result}")`

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
}

const mockFileTree: FileNode[] = [
  {
    name: "src",
    type: "folder",
    isOpen: true,
    children: [
      { name: "Header.tsx", type: "file" },
      { name: "main.py", type: "file" },
      { name: "app.js", type: "file" },
    ],
  },
  { name: "README.md", type: "file" },
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
      timestamp: new Date("2024-01-01T10:00:00Z"),
      type: "system",
    },
    {
      id: "2",
      user: "Alice",
      message: "Hey team! I found a bug in the authentication module. Anyone available to help?",
      timestamp: new Date("2024-01-01T10:01:00Z"),
      type: "user",
    },
    {
      id: "3",
      user: "Bob",
      message: "Can you share the error details?",
      timestamp: new Date("2024-01-01T10:02:00Z"),
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

    // Simulate code execution
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
    // Close chat when AI panel opens
    setIsChatOpen(false)

    setTimeout(() => {
      const mockResults: BugResult[] = [
        {
          type: "error",
          line: 8,
          message: "Division by zero error: Empty list passed to calculate_average function",
          fix: "Add a check for empty list before division",
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

2. **Performance Optimization (Line 3)**: Using Python's built-in sum() function would be more efficient than a manual loop.

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

  const handleFileSave = () => {
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
      id: `msg-${Date.now()}`,
      user: "You",
      message: message,
      timestamp: new Date(),
      type: "user",
    }

    setChatMessages((prev) => [...prev, newMessage])

    // Simulate AI or team responses with deterministic timing
    const responses = [
      "That's a great question! Let me analyze the code...",
      "I see the issue. Try checking the validation logic on line 45.",
      "Have you considered using a try-catch block there?",
      "The error might be related to the async function handling.",
      "Let me run a quick analysis on that code section.",
    ]

    // Use a simple counter instead of Math.random() for deterministic behavior
    const responseIndex = (chatMessages.length + 1) % responses.length
    const responseDelay = 1000 + ((chatMessages.length + 1) * 500) % 2000

    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: `ai-${Date.now()}`,
        user: "AI Assistant",
        message: responses[responseIndex],
        timestamp: new Date(),
        type: "ai",
      }

      setChatMessages((prev) => [...prev, aiResponse])
    }, responseDelay)
  }

  const toggleAIPanel = () => {
    setIsPanelOpen(!isPanelOpen)
    // Close chat when AI panel opens
    if (!isPanelOpen) {
      setIsChatOpen(false)
    }
  }

  const toggleChatRoom = () => {
    setIsChatOpen(!isChatOpen)
    // Close AI panel when chat opens
    if (!isChatOpen) {
      setIsPanelOpen(false)
    }
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
                main
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Integrations:</span>
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              <Zap className="h-3 w-3" />
              OpenAI
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

        <div className="flex-1 flex flex-col min-w-0">
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

        {/* Right side panels - AI Panel and Chat Room */}
        <div className="flex-shrink-0">
          {isPanelOpen && (
            <AIDebuggerPanel
              isOpen={isPanelOpen}
              onToggle={toggleAIPanel}
              bugResults={bugResults}
              aiExplanation={aiExplanation}
              isAnalyzing={isAnalyzing}
              onAskAI={handleAskAI}
              onApplyFix={handleApplyFix}
            />
          )}
          
          {isChatOpen && (
            <ChatRoom
              isOpen={isChatOpen}
              onToggle={toggleChatRoom}
              chatMessages={chatMessages}
              onlineUsers={onlineUsers}
              onSendMessage={sendMessage}
            />
          )}

          {/* Toggle buttons column - always visible */}
          {!isPanelOpen && !isChatOpen && (
            <div className="w-12 border-l bg-card flex flex-col">
              <div className="p-3 border-b flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleAIPanel}
                  className="h-8 w-8 p-0"
                  title="Open AI Debugger"
                >
                  <Zap className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-col items-center justify-center flex-1 p-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleChatRoom}
                  className="h-8 w-8 p-0"
                  title="Open Chat Room"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
