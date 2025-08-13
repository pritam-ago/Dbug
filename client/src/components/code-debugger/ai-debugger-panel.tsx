"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BugResult } from "@/types/code-debugger"
import { CheckCircle, AlertTriangle, XCircle, ChevronRight, ChevronDown, MessageSquare } from "lucide-react"
import { useState } from "react"

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
  const [isIssuesCollapsed, setIsIssuesCollapsed] = useState(false)
  const [isAnalysisCollapsed, setIsAnalysisCollapsed] = useState(false)

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

  if (!isOpen) {
    return (
      <div className="w-12 border-l bg-card flex flex-col">
        <div className="p-2 border-b leading-4 border-t-0 px-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
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
            onClick={onAskAI}
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
        </div>
      </div>
    )
  }

  return (
    <div className="w-96 border-l bg-card flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">AI Debugger</h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-6 w-6 p-0"
              title="Collapse AI Debugger"
            >
              <ChevronRight className="h-4 w-4" />
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
                            onClick={() => onApplyFix(result)}
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
    </div>
  )
}
