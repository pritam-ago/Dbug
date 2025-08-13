"use client"

import { Button } from "@/components/ui/button"
import { Terminal, Trash2, X } from "lucide-react"

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
  if (!isOpen) {
    return null
  }

  return (
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
  )
}
