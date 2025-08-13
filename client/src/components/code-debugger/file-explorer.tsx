"use client"

import { useState } from "react"
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
