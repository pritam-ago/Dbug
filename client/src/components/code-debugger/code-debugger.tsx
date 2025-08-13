"use client"

import { useState, useRef, useEffect } from "react"
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
  Terminal,
} from "lucide-react"
import { useTheme } from "next-themes"

const sampleFileContents: Record<string, { content: string; language: string }> = {
  "main.py": {
    content: `# Python Sandbox Example - Test your code safely
def calculate_average(numbers):
    if not numbers:
        return "Error: Cannot calculate average of empty list"
    total = 0
    for num in numbers:
        total += num
    return total / len(numbers)

# Test with different inputs
test_cases = [[1, 2, 3, 4, 5], [10, 20, 30], []]
for numbers in test_cases:
    result = calculate_average(numbers)
    print(f"Average of {numbers}: {result}")

# You can also test other Python features
print("\\nTesting list comprehensions:")
squares = [x**2 for x in range(5)]
print(f"Squares: {squares}")

print("\\nTesting f-strings:")
name = "Sandbox"
print(f"Hello from {name}!")`,
    language: "python",
  },
  "app.js": {
    content: `// JavaScript Sandbox Example - Test your code safely
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// Test Fibonacci sequence
console.log("Fibonacci sequence:");
for (let i = 0; i < 10; i++) {
    console.log(\`fib(\${i}) = \${fibonacci(i)}\`);
}

// Test modern JavaScript features
console.log("\\nTesting array methods:");
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const evenNumbers = numbers.filter(n => n % 2 === 0);
const sum = numbers.reduce((acc, n) => acc + n, 0);

console.log("Original:", numbers);
console.log("Doubled:", doubled);
console.log("Even numbers:", evenNumbers);
console.log("Sum:", sum);

// Test template literals and arrow functions
const greet = (name) => \`Hello, \${name}! Welcome to the sandbox!\`;
console.log("\\n" + greet("Developer"));`,
    language: "javascript",
  },
}

const mockFileTree: FileNode[] = [
  {
    name: "src",
    type: "folder",
    isOpen: true,
    children: [
      { name: "main.py", type: "file" },
      { name: "app.js", type: "file" },
    ],
  },
]

interface CodeDebuggerProps {
  repoFullName?: string
  branch?: string
}

export function CodeDebugger({ repoFullName, branch }: CodeDebuggerProps) {
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([])
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
  const [isImporting, setIsImporting] = useState(false)

  // Import repository when component mounts with repo info
  useEffect(() => {
    if (repoFullName && branch) {
      importRepository(repoFullName, branch)
    }
  }, [repoFullName, branch])



  const importRepository = async (repoName: string, repoBranch: string) => {
    setIsImporting(true)
    try {
      // Fetch repository files from GitHub
      const response = await fetch(`/api/github/files?repo=${repoName}&branch=${repoBranch}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          // Update file tree and open files
          setFileTree(data.data.fileTree || [])
          if (data.data.files && data.data.files.length > 0) {
            setOpenFiles(data.data.files)
            setActiveFileIndex(0)
          }
        }
      }
    } catch (error) {
      console.error('Error importing repository:', error)
    } finally {
      setIsImporting(false)
    }
  }

  const getCurrentFile = () => openFiles[activeFileIndex] || null

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

    const newOpenFiles = [...openFiles, newFile]
    setOpenFiles(newOpenFiles)
    setActiveFileIndex(newOpenFiles.length - 1)
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

    // Check if language is supported by sandbox
    if (!['python', 'javascript'].includes(currentFile.language)) {
      const timestamp = new Date().toLocaleTimeString()
      setTerminalOutput((prev) => [
        ...prev, 
        `[${timestamp}] ❌ Language ${currentFile.language} is not supported in sandbox mode.`,
        `Supported languages: Python, JavaScript`,
        `To use sandbox mode, change the file language to Python or JavaScript.`,
        ""
      ])
      return
    }

    setIsRunning(true)
    setIsTerminalOpen(true)

    const timestamp = new Date().toLocaleTimeString()
    setTerminalOutput((prev) => [...prev, `[${timestamp}] 🚀 Executing ${currentFile.name} in sandbox...`, ""])

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'}/api/sandbox/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: currentFile.content,
          language: currentFile.language === 'javascript' ? 'javascript' : 'python',
          timeout: 30000 // 30 seconds
        }),
      })

      const result = await response.json()
      const newOutput = [...terminalOutput]

      if (result.success) {
        newOutput.push(
          `✅ Code executed successfully in ${result.executionTime}ms`,
          ""
        )
        
        if (result.output) {
          newOutput.push("📤 Output:", result.output, "")
        }
      } else {
        newOutput.push(
          `❌ Execution failed: ${result.error}`,
          ""
        )
      }

      newOutput.push(`[${new Date().toLocaleTimeString()}] Process finished.`)
      setTerminalOutput(newOutput)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      const newOutput = [...terminalOutput]
      newOutput.push(
        `❌ Execution error: ${errorMessage}`,
        `[${new Date().toLocaleTimeString()}] Process finished with error.`,
        ""
      )
      setTerminalOutput(newOutput)
    } finally {
      setIsRunning(false)
    }
  }

  const handleAskAI = async () => {
    setIsAnalyzing(true)
    setIsChatOpen(false)

    try {
      const currentFile = getCurrentFile()
      if (!currentFile) {
        setIsAnalyzing(false)
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${apiUrl}/api/ai/debug`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: currentFile.content,
          language: currentFile.language,
          context: `Analyzing ${currentFile.name} file`,
          preferences: {
            style: 'concise',
            focus: 'all'
          }
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success && data.data) {
        const aiResponse = data.data
        
        // Convert AI response to BugResult format
        const bugResults: BugResult[] = []
        
        // Add issues as errors
        if (aiResponse.analysis.issues && aiResponse.analysis.issues.length > 0) {
          aiResponse.analysis.issues.forEach((issue: string, index: number) => {
            bugResults.push({
              type: "error",
              line: index + 1, // Default line number
              message: issue,
              fix: aiResponse.analysis.suggestions[index] || "Review and fix the issue",
              aiFixedCode: aiResponse.fixedCode,
              codeSnippet: aiResponse.codeSnippet,
            })
          })
        }
        
        // Add suggestions as warnings if no issues found
        if (bugResults.length === 0 && aiResponse.analysis.suggestions && aiResponse.analysis.suggestions.length > 0) {
          aiResponse.analysis.suggestions.forEach((suggestion: string, index: number) => {
            bugResults.push({
              type: "warning",
              line: index + 1,
              message: suggestion,
              fix: "Consider implementing this suggestion",
              aiFixedCode: aiResponse.fixedCode,
              codeSnippet: aiResponse.codeSnippet,
            })
          })
        }

        setBugResults(bugResults)
        setAiExplanation(aiResponse.explanation || 'Code analyzed using Gemini AI')
        
        // If there's fixed code, offer to apply it
        if (aiResponse.fixedCode && aiResponse.fixedCode !== currentFile.content) {
          // Store the fixed code for the apply fix button
          console.log('AI suggested fixed code:', aiResponse.fixedCode)
          console.log('Code snippet:', aiResponse.codeSnippet)
        }
      } else {
        throw new Error(data.message || 'Failed to analyze code')
      }
    } catch (error) {
      console.error('AI analysis failed:', error)
      setBugResults([{
        type: "error",
        line: 1,
        message: `AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        fix: "Please check your API configuration and try again",
      }])
      setAiExplanation("Sorry, I couldn't analyze your code. Please check the console for more details.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleApplyFix = (result: BugResult) => {
    if (!result.fix || !editorRef.current) return

    const currentFile = getCurrentFile()
    if (!currentFile) return

    // Check if we have AI-suggested fixed code
    if (result.aiFixedCode) {
      // Apply the full AI-suggested code
      updateFileContent(result.aiFixedCode)
      return
    }

    // Fallback to manual fix logic
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

  const handleCreateFile = (path: string[], name: string) => {
    const newFile: OpenFile = {
      name,
      content: `// ${name}\n// New file created`,
      language: getLanguageFromFileName(name),
      isDirty: false,
    }
    
    const newOpenFiles = [...openFiles, newFile]
    setOpenFiles(newOpenFiles)
    setActiveFileIndex(newOpenFiles.length - 1)
    
    // Update file tree
    const newFileNode: FileNode = { name, type: "file" }
    updateFileTree(path, newFileNode)
  }

  const handleCreateFolder = (path: string[], name: string) => {
    const newFolderNode: FileNode = { 
      name, 
      type: "folder", 
      isOpen: true,
      children: []
    }
    
    updateFileTree(path, newFolderNode)
  }

  const handleRename = (path: string[], newName: string) => {
    const oldName = path[path.length - 1]
    
    // Update open files if the renamed file is open
    const updatedOpenFiles = openFiles.map(file => 
      file.name === oldName ? { ...file, name: newName } : file
    )
    setOpenFiles(updatedOpenFiles)
    
    // Update file tree
    updateFileTreeName(path, newName)
  }

  const handleDelete = (path: string[]) => {
    const fileName = path[path.length - 1]
    
    // Remove from open files
    const updatedOpenFiles = openFiles.filter(file => file.name !== fileName)
    setOpenFiles(updatedOpenFiles)
    
    // Update active file index if needed
    if (openFiles.length > 1 && activeFileIndex >= updatedOpenFiles.length) {
      setActiveFileIndex(updatedOpenFiles.length - 1)
    }
    
    // Update file tree
    removeFromFileTree(path)
  }

  const updateFileTree = (path: string[], newNode: FileNode) => {
    if (path.length === 0) {
      setFileTree([...fileTree, newNode])
      return
    }
    
    const updateTree = (nodes: FileNode[], currentPath: string[]): FileNode[] => {
      return nodes.map(node => {
        if (currentPath.length === 1 && node.name === currentPath[0]) {
          return { ...node, children: [...(node.children || []), newNode] }
        } else if (currentPath.length > 1 && node.name === currentPath[0] && node.children) {
          return { ...node, children: updateTree(node.children, currentPath.slice(1)) }
        }
        return node
      })
    }
    
    setFileTree(updateTree(fileTree, path))
  }

  const updateFileTreeName = (path: string[], newName: string) => {
    const updateTree = (nodes: FileNode[], currentPath: string[]): FileNode[] => {
      return nodes.map(node => {
        if (currentPath.length === 1 && node.name === currentPath[0]) {
          return { ...node, name: newName }
        } else if (currentPath.length > 1 && node.name === currentPath[0] && node.children) {
          return { ...node, children: updateTree(node.children, currentPath.slice(1)) }
        }
        return node
      })
    }
    
    setFileTree(updateTree(fileTree, path))
  }

  const removeFromFileTree = (path: string[]) => {
    const updateTree = (nodes: FileNode[], currentPath: string[]): FileNode[] => {
      return nodes.filter(node => {
        if (currentPath.length === 1 && node.name === currentPath[0]) {
          return false
        } else if (currentPath.length > 1 && node.name === currentPath[0] && node.children) {
          return { ...node, children: updateTree(node.children, currentPath.slice(1)) }
        }
        return true
      })
    }
    
    setFileTree(updateTree(fileTree, path))
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

    const responses = [
      "That's a great question! Let me analyze the code...",
      "I see the issue. Try checking the validation logic on line 45.",
      "Have you considered using a try-catch block there?",
      "The error might be related to the async function handling.",
      "Let me run a quick analysis on that code section.",
    ]

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
    if (!isPanelOpen) {
      setIsChatOpen(false)
    }
  }

  const toggleChatRoom = () => {
    setIsChatOpen(!isChatOpen)
    if (!isChatOpen) {
      setIsPanelOpen(false)
    }
  }

  const currentFile = getCurrentFile()

           // Keyboard shortcuts
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        // Ctrl+Enter or Cmd+Enter to run code
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
          event.preventDefault()
          if (['python', 'javascript'].includes(currentFile?.language || '')) {
            handleRunCode()
          }
        }
        
        // Ctrl+Shift+T or Cmd+Shift+T to toggle terminal
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'T') {
          event.preventDefault()
          setIsTerminalOpen(!isTerminalOpen)
        }

                 // Ctrl+N or Cmd+N to create new file
         if ((event.ctrlKey || event.metaKey) && event.key === 'N') {
           event.preventDefault()
           handleCreateFile([], `script-${Date.now()}.py`)
         }

        // F2 to rename selected file (if any)
        if (event.key === 'F2') {
          event.preventDefault()
          const currentFile = getCurrentFile()
          if (currentFile) {
            // Find the file in the file tree
            const findFileInTree = (nodes: FileNode[], fileName: string): string[] | null => {
              for (const node of nodes) {
                if (node.name === fileName) {
                  return [node.name]
                }
                if (node.children) {
                  const found = findFileInTree(node.children, fileName)
                  if (found) {
                    return [node.name, ...found]
                  }
                }
              }
              return null
            }
            
            const filePath = findFileInTree(fileTree, currentFile.name)
            if (filePath) {
              handleRename(filePath, currentFile.name)
            }
          }
        }
      }

      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }, [currentFile?.language, isTerminalOpen, fileTree])

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Import Loading Indicator */}
      {isImporting && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-3">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Importing repository...</span>
          </div>
        </div>
      )}
      
             <div className="border-b bg-card px-4 py-3">
         <div className="flex items-center gap-4">
           <Button
             variant="ghost"
             size="sm"
             onClick={() => window.history.back()}
             className="h-8 w-8 p-0"
             title="Go Back"
           >
             <svg
               className="h-4 w-4"
               fill="none"
               stroke="currentColor"
               viewBox="0 0 24 24"
               xmlns="http://www.w3.org/2000/svg"
             >
               <path
                 strokeLinecap="round"
                 strokeLinejoin="round"
                 strokeWidth={2}
                 d="M15 19l-7-7 7-7"
               />
             </svg>
           </Button>
           <div className="flex items-center gap-2">
             <h1 className="font-semibold text-lg">AI Code Debugger</h1>
             {repoFullName && (
               <>
                 <span className="text-muted-foreground">•</span>
                 <span className="text-sm text-muted-foreground">{repoFullName}</span>
                 <GitBranch className="h-4 w-4 text-muted-foreground" />
                 <Badge variant="outline" className="text-xs">
                   {branch || 'main'}
                 </Badge>
               </>
             )}
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
          onCreateFile={handleCreateFile}
          onCreateFolder={handleCreateFolder}
          onRename={handleRename}
          onDelete={handleDelete}
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
                    {['python', 'javascript'].includes(file.language) && (
                      <div className="relative group">
                        <Zap className="h-3 w-3 text-green-500 flex-shrink-0" />
                                                 <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          Sandbox Ready
                        </div>
                      </div>
                    )}
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
                 onClick={() => handleCreateFile([], `script-${Date.now()}.py`)}
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
                      value={currentFile?.language || "python"}
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
                    </select>
                   {['python', 'javascript'].includes(currentFile?.language || '') && (
                     <>
                       <Separator orientation="vertical" className="h-6" />
                       <div className="flex items-center gap-2 text-xs text-muted-foreground">
                         <Zap className="h-3 w-3" />
                         <span>Sandbox Ready</span>
                       </div>
                     </>
                   )}
                   <Separator orientation="vertical" className="h-6" />
                   <Button 
                     variant={isTerminalOpen ? "default" : "outline"}
                     size="sm" 
                     onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                     className="flex items-center gap-2"
                     title={isTerminalOpen ? "Hide Terminal (Ctrl+Shift+T)" : "Show Terminal (Ctrl+Shift+T)"}
                   >
                     <Terminal className="h-4 w-4" />
                     {isTerminalOpen ? "Hide" : "Show"} Terminal
                   </Button>
                 </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRunCode}
                    disabled={!['python', 'javascript'].includes(currentFile?.language || '')}
                    title={!['python', 'javascript'].includes(currentFile?.language || '') ? 'Only Python and JavaScript are supported in sandbox mode' : 'Run code in sandbox environment (Ctrl+Enter)'}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Run Code
                  </Button>
                  {['python', 'javascript'].includes(currentFile?.language || '') && (
                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Sandbox
                    </Badge>
                  )}
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

                                           <div className={`flex-1 flex flex-col ${isTerminalOpen ? "min-h-0" : ""}`}>
                        {currentFile ? (
                          <Editor
                            height="100%"
                            language={currentFile.language}
                            value={currentFile.content}
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
                        ) : (
                          <div className="flex-1 flex items-center justify-center bg-muted/20">
                            <div className="text-center text-muted-foreground">
                              <File className="h-16 w-16 mx-auto mb-4 opacity-50" />
                              <h3 className="text-lg font-medium mb-2">No files open</h3>
                              <p className="text-sm mb-4">Create a new file or open an existing one to start coding</p>
                              <div className="flex gap-2 justify-center">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleCreateFile([], "main.py")}
                                >
                                  <File className="h-4 w-4 mr-2" />
                                  New Python File
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleCreateFile([], "app.js")}
                                >
                                  <File className="h-4 w-4 mr-2" />
                                  New JavaScript File
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
            
                         {/* Status Bar */}
                           {currentFile && (
                <div className="border-t bg-muted/50 px-4 py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {['python', 'javascript'].includes(currentFile.language) && (
                      <>
                        <Zap className="h-3 w-3 text-green-500" />
                        <span>Sandbox Ready</span>
                        <span>•</span>
                      </>
                    )}
                    <span>File: {currentFile.name}</span>
                    <span>•</span>
                    <span>Language: {currentFile.language}</span>
                    {currentFile.isDirty && (
                      <>
                        <span>•</span>
                        <span className="text-orange-500">Modified</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>Ctrl+Enter: Run</span>
                    <span>•</span>
                    <span>Ctrl+N: New File</span>
                    <span>•</span>
                    <span>F2: Rename</span>
                    <span>•</span>
                    <span>Ctrl+Shift+T: Terminal</span>
                  </div>
                </div>
              )}
          </div>

          <TerminalComponent
            isOpen={isTerminalOpen}
            onToggle={() => setIsTerminalOpen(!isTerminalOpen)}
            terminalOutput={terminalOutput}
            isRunning={isRunning}
            onClear={clearTerminal}
          />
        </div>

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
