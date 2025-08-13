"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BugResult } from "@/types/code-debugger"
import { MessageSquare, X, Zap, AlertTriangle, Info, Lightbulb } from "lucide-react"

interface AIDebuggerPanelProps {
  isOpen: boolean
  onToggle: () => void
  bugResults: BugResult[]
  aiExplanation: string
  isAnalyzing: boolean
  onAskAI: () => void
  onApplyFix: (result: BugResult) => void
}

export function AIDebuggerPanel({
  isOpen,
  onToggle,
  bugResults,
  aiExplanation,
  isAnalyzing,
  onAskAI,
  onApplyFix,
}: AIDebuggerPanelProps) {
  if (!isOpen) {
    return null
  }

     // Add custom styles for better scrolling
   const scrollbarStyles = `
     .ai-panel-scroll::-webkit-scrollbar {
       width: 6px;
     }
     .ai-panel-scroll::-webkit-scrollbar-track {
       background: transparent;
     }
     .ai-panel-scroll::-webkit-scrollbar-thumb {
       background: #d1d5db;
       border-radius: 3px;
     }
     .ai-panel-scroll::-webkit-scrollbar-thumb:hover {
       background: #9ca3af;
     }
     .dark .ai-panel-scroll::-webkit-scrollbar-thumb {
       background: #4b5563;
     }
     .dark .ai-panel-scroll::-webkit-scrollbar-thumb:hover {
       background: #6b7280;
     }
     .ai-panel-scroll {
       scrollbar-width: thin;
       scrollbar-color: #d1d5db transparent;
     }
   `

  const getIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "warning":
        return <Info className="h-4 w-4 text-yellow-500" />
      case "suggestion":
        return <Lightbulb className="h-4 w-4 text-blue-500" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "error":
        return "destructive"
      case "warning":
        return "secondary"
      case "suggestion":
        return "default"
      default:
        return "outline"
    }
  }

  return (
    <>
      <style>{scrollbarStyles}</style>
             <div className="w-80 border-l bg-card flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-lg">AI Debugger</h2>
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Gemini
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-6 w-6 p-0"
            title="Close AI Debugger"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

             <div className="flex-1 overflow-y-auto p-4 space-y-4 ai-panel-scroll min-h-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">Code Analysis</h3>
            <Button size="sm" onClick={onAskAI} disabled={isAnalyzing}>
              {isAnalyzing ? "Analyzing..." : "Analyze Code"}
            </Button>
          </div>

          {isAnalyzing && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">AI is analyzing your code...</p>
            </div>
          )}

          {!isAnalyzing && bugResults.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">Found Issues</h4>
              {bugResults.map((result, index) => (
                <Card key={index} className="p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    {getIcon(result.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getBadgeVariant(result.type)} className="text-xs">
                          {result.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">Line {result.line}</span>
                      </div>
                      <p className="text-sm text-foreground mb-2">{result.message}</p>
                                             {result.fix && (
                         <div className="space-y-2">
                           <p className="text-xs font-medium text-muted-foreground">Suggested Fix:</p>
                           <p className="text-xs text-foreground bg-muted p-2 rounded">{result.fix}</p>
                           
                           {/* Show code snippet if available */}
                           {result.codeSnippet && (
                             <div className="space-y-1">
                               <p className="text-xs font-medium text-muted-foreground">Code Preview:</p>
                               <pre className="text-xs text-foreground bg-muted/50 p-2 rounded font-mono overflow-x-auto">
                                 {result.codeSnippet}
                               </pre>
                             </div>
                           )}
                           
                           <Button
                             size="sm"
                             variant="outline"
                             onClick={() => onApplyFix(result)}
                             className="w-full text-xs"
                             title={result.aiFixedCode ? "Apply AI-suggested code" : "Apply manual fix"}
                           >
                             Apply Fix
                           </Button>
                         </div>
                       )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {!isAnalyzing && aiExplanation && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">AI Explanation</h4>
              <Card className="p-3">
                <div className="prose prose-sm max-w-none">
                  <div
                    className="text-sm text-foreground whitespace-pre-line"
                    dangerouslySetInnerHTML={{
                      __html: aiExplanation.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
                    }}
                  />
                </div>
              </Card>
            </div>
          )}

          {/* Show full fixed code if available */}
          {!isAnalyzing && bugResults.length > 0 && bugResults[0].aiFixedCode && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">Full Fixed Code</h4>
              <Card className="p-3">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Click "Apply Fix" on any issue above to apply this complete solution
                  </p>
                  <pre className="text-xs text-foreground bg-muted/50 p-3 rounded font-mono overflow-x-auto max-h-40 overflow-y-auto">
                    {bugResults[0].aiFixedCode}
                  </pre>
                </div>
              </Card>
            </div>
          )}

          {!isAnalyzing && bugResults.length === 0 && !aiExplanation && (
            <div className="text-center py-8 text-muted-foreground">
              <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Click "Analyze Code" to get AI-powered debugging insights</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  )
}
