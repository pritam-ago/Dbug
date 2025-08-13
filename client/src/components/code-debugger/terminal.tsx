"use client"

import { Button } from "@/components/ui/button"
import { Terminal, Trash2, X } from "lucide-react"
import { useEffect, useRef } from "react"

interface TerminalProps {
  isOpen: boolean
  onToggle: () => void
  terminalOutput: string[]
  isRunning: boolean
  onClear: () => void
}

export function TerminalComponent({
  isOpen,
  onToggle,
  terminalOutput,
  isRunning,
  onClear,
}: TerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new content is added or terminal is opened
  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [terminalOutput, isOpen])

  if (!isOpen) {
    return null
  }

  return (
         <div className="border-t bg-card flex flex-col min-h-[150px] max-h-[250px] mb-2">
       <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4" />
          <span className="text-sm font-medium">Sandbox Terminal</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs text-green-600 dark:text-green-400">Sandbox Active</span>
          </div>
          {isRunning && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-xs text-muted-foreground">Executing...</span>
            </div>
          )}
        </div>
                 <div className="flex items-center gap-1">
           <Button
             variant="ghost"
             size="sm"
             onClick={onClear}
             className="h-6 w-6 p-0"
             title="Clear Terminal"
           >
             <Trash2 className="h-3 w-3" />
           </Button>
           <Button
             variant="ghost"
             size="sm"
             onClick={onToggle}
             className="h-6 w-6 p-0"
             title="Toggle Terminal"
           >
             <X className="h-3 w-3" />
           </Button>
         </div>
      </div>
             <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 font-mono text-sm bg-background/50 pb-4 relative">
         {terminalOutput.length === 0 ? (
           <div className="space-y-2 text-muted-foreground">
             <div>🚀 <strong>Sandbox Terminal Ready</strong></div>
             <div className="text-xs space-y-1">
               <div>• Click "Run Code" to execute Python/JavaScript in sandbox mode</div>
               <div>• Code runs in isolated environment with 30s timeout</div>
               <div>• Supported: Python, JavaScript (ES6+)</div>
               <div>• Security: Restricted functions and modules blocked</div>
             </div>
           </div>
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
         
         {/* Scroll indicator */}
         {terminalOutput.length > 5 && (
           <div className="absolute bottom-1 right-4 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
             Scroll for more
           </div>
         )}
       </div>
    </div>
  )
}
