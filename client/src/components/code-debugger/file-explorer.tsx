"use client"

import { Button } from "@/components/ui/button"
import { FileNode } from "@/types/code-debugger"
import { ChevronRight, ChevronDown, Folder, FolderOpen, File, Menu, X } from "lucide-react"

interface FileExplorerProps {
  fileTree: FileNode[]
  openFiles: any[]
  activeFileIndex: number
  onToggleFolder: (path: string[]) => void
  onOpenFile: (fileName: string) => void
  isOpen: boolean
  onToggle: () => void
}

export function FileExplorer({
  fileTree,
  openFiles,
  activeFileIndex,
  onToggleFolder,
  onOpenFile,
  isOpen,
  onToggle,
}: FileExplorerProps) {
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
                onToggleFolder(currentPath)
              } else {
                onOpenFile(node.name)
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

  if (!isOpen) {
    return (
      <div className="w-12 border-r bg-card flex flex-col">
        <div className="p-2 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 w-8 p-0"
            title="Open Explorer"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-64 border-r bg-card flex flex-col">
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">Explorer</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">{renderFileTree(fileTree)}</div>
    </div>
  )
}
