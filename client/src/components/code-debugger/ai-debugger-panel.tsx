"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BugResult } from "@/types/code-debugger"
import { MessageSquare, X, Zap, AlertTriangle, Info, Lightbulb, Brain, Sparkles, CheckCircle } from "lucide-react"

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
      <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-gradient-to-b from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-xl flex flex-col h-full shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  AI Debugger
                </h2>
                <Badge variant="secondary" className="text-xs bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-0 mt-1 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Gemini
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-all duration-200"
              title="Close AI Panel"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* AI Analysis Button */}
          <div className="mt-4">
            <Button
              onClick={onAskAI}
              disabled={isAnalyzing}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Analyzing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Analyze Code
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto ai-panel-scroll p-4 space-y-4 bg-gradient-to-b from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-900/50">
          {bugResults.length === 0 && !isAnalyzing ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">No issues found yet</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs">Click "Analyze Code" to get started</p>
            </div>
          ) : (
            <>
              {/* Bug Results */}
              {bugResults.map((result, index) => (
                <Card 
                  key={index} 
                  className="border-0 shadow-sm overflow-hidden animate-in fade-in-50 slide-in-from-bottom-2 duration-200"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`p-4 ${
                    result.type === "error" 
                      ? "bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-l-4 border-red-500"
                      : result.type === "warning"
                        ? "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-l-4 border-yellow-500"
                        : "bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-l-4 border-blue-500"
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getIcon(result.type)}
                        <Badge 
                          variant={getBadgeVariant(result.type) as any}
                          className={`text-xs font-medium ${
                            result.type === "error" 
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-700"
                              : result.type === "warning"
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                          }`}
                        >
                          {result.type}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Line {result.line}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {result.message}
                    </h3>
                    
                    {result.codeSnippet && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">Code Snippet:</p>
                        <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded-lg overflow-x-auto font-mono text-gray-800 dark:text-gray-200">
                          {result.codeSnippet}
                        </pre>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => onApplyFix(result)}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Apply Fix
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {/* AI Explanation */}
              {aiExplanation && (
                <Card className="border-0 shadow-sm bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-l-4 border-indigo-500">
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                        <Brain className="h-3 w-3 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">AI Explanation</h3>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {aiExplanation}
                    </p>
                  </div>
                </Card>
              )}

              {/* Full Fixed Code */}
              {bugResults.length > 0 && bugResults[0].aiFixedCode && (
                <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-l-4 border-green-500">
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">Fixed Code</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto font-mono text-gray-800 dark:text-gray-200">
                        {bugResults[0].aiFixedCode}
                      </pre>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
