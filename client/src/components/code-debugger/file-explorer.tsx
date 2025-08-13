"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileNode, OpenFile } from "@/types/code-debugger"
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus, MoreHorizontal, Check, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface FileExplorerProps {
  fileTree: FileNode[]
  openFiles: OpenFile[]
  activeFileIndex: number
  onToggleFolder: (path: string[]) => void
  onOpenFile: (fileName: string) => void
  isOpen: boolean
  onToggle: () => void
  onCreateFile?: (path: string[], name: string) => void
  onCreateFolder?: (path: string[], name: string) => void
  onRename?: (path: string[], newName: string) => void
  onDelete?: (path: string[]) => void
}

export function FileExplorer({
  fileTree,
  openFiles,
  activeFileIndex,
  onToggleFolder,
  onOpenFile,
  isOpen,
  onToggle,
  onCreateFile,
  onCreateFolder,
  onRename,
  onDelete,
}: FileExplorerProps) {
  const [editingNode, setEditingNode] = useState<{ path: string[]; type: 'file' | 'folder' | 'rename'; currentName?: string } | null>(null)
  const [editValue, setEditValue] = useState("")
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; path: string[]; node: FileNode } | null>(null)

  if (!isOpen) {
    return (
      <div className="w-12 border-r bg-card flex flex-col">
        <div className="p-3 border-b flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 w-8 p-0"
            title="Open File Explorer"
          >
            <Folder className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  const handleCreateFile = (path: string[]) => {
    setEditingNode({ path, type: 'file' })
    setEditValue("")
  }

  const handleCreateFolder = (path: string[]) => {
    setEditingNode({ path, type: 'folder' })
    setEditValue("")
  }

  const handleRename = (path: string[]) => {
    const node = getNodeByPath(fileTree, path)
    if (node) {
      setEditingNode({ path, type: 'rename', currentName: node.name })
      setEditValue(node.name)
    }
  }

  const handleDelete = (path: string[]) => {
    if (onDelete) {
      onDelete(path)
    }
  }

  const handleContextMenu = (event: React.MouseEvent, path: string[], node: FileNode) => {
    event.preventDefault()
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      path,
      node
    })
  }

  const closeContextMenu = () => {
    setContextMenu(null)
  }

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu) {
        closeContextMenu()
      }
    }

    if (contextMenu) {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeContextMenu()
        }
      })
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [contextMenu])

  const handleEditConfirm = () => {
    if (!editingNode || !editValue.trim()) return

    const { path, type, currentName } = editingNode
    const newName = editValue.trim()

    if (type === 'file' && onCreateFile) {
      onCreateFile(path, newName)
    } else if (type === 'folder' && onCreateFolder) {
      onCreateFolder(path, newName)
    } else if (type === 'rename' && onRename) {
      onRename(path, newName)
    }

    setEditingNode(null)
    setEditValue("")
  }

  const handleEditCancel = () => {
    setEditingNode(null)
    setEditValue("")
  }

  const getNodeByPath = (nodes: FileNode[], path: string[]): FileNode | null => {
    if (path.length === 0) return null
    if (path.length === 1) return nodes.find(n => n.name === path[0]) || null
    
    const node = nodes.find(n => n.name === path[0])
    if (node && node.children) {
      return getNodeByPath(node.children, path.slice(1))
    }
    return null
  }

  const renderFileNode = (node: FileNode, path: string[] = []) => {
    const isFolder = node.type === "folder"
    const isOpen = node.isOpen || false
    const currentPath = [...path, node.name]

    // Check if this node is being edited
    const isEditing = editingNode && 
      editingNode.path.length === currentPath.length && 
      editingNode.path.every((p, i) => p === currentPath[i])

    if (isEditing) {
      return (
        <div key={node.name} className="px-2 py-1">
          <div className="flex items-center gap-1">
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEditConfirm()
                if (e.key === 'Escape') handleEditCancel()
              }}
              placeholder={editingNode.type === 'file' ? 'file.txt' : 'folder-name'}
              className="h-6 text-xs"
              autoFocus
            />
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={handleEditConfirm}>
              <Check className="h-3 w-3 text-green-600" />
            </Button>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={handleEditCancel}>
              <X className="h-3 w-3 text-red-600" />
            </Button>
          </div>
        </div>
      )
    }

    if (isFolder) {
      return (
        <div key={node.name} className="space-y-1">
          <div 
            className="flex items-center gap-1 px-2 py-1 hover:bg-accent/50 rounded cursor-pointer group"
            onContextMenu={(e) => handleContextMenu(e, currentPath, node)}
          >
            <button
              onClick={() => onToggleFolder(currentPath)}
              className="flex items-center gap-1 flex-1 min-w-0"
            >
              {isOpen ? (
                <ChevronDown className="h-3 w-3 flex-shrink-0" />
              ) : (
                <ChevronRight className="h-3 w-3 flex-shrink-0" />
              )}
              {isOpen ? (
                <FolderOpen className="h-3 w-3 text-blue-500 flex-shrink-0" />
              ) : (
                <Folder className="h-3 w-3 text-blue-500 flex-shrink-0" />
              )}
              <span className="text-sm truncate">{node.name}</span>
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => handleCreateFile(currentPath)}>
                  <File className="h-3 w-3 mr-2" />
                  New File
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCreateFolder(currentPath)}>
                  <Folder className="h-3 w-3 mr-2" />
                  New Folder
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleRename(currentPath)}>
                  <span className="mr-2">✏️</span>
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(currentPath)} className="text-red-600">
                  <span className="mr-2">🗑️</span>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {isOpen && node.children && (
            <div className="ml-4 space-y-1">
              {node.children.map((child) => renderFileNode(child, currentPath))}
            </div>
          )}
        </div>
      )
    } else {
      const isOpen = openFiles.some((file) => file.name === node.name)
      const isActive = openFiles[activeFileIndex]?.name === node.name

      return (
        <div key={node.name} className="space-y-1">
          <div 
            className="flex items-center gap-1 px-2 py-1 hover:bg-accent/50 rounded cursor-pointer group"
            onContextMenu={(e) => handleContextMenu(e, currentPath, node)}
          >
            <button
              onClick={() => onOpenFile(node.name)}
              className="flex items-center gap-1 flex-1 min-w-0"
            >
              <File className="h-3 w-3 text-gray-500 flex-shrink-0" />
              <span className={`text-sm truncate ${isActive ? "font-medium text-primary" : ""}`}>
                {node.name}
              </span>
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => handleRename(currentPath)}>
                  <span className="mr-2">✏️</span>
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(currentPath)} className="text-red-600">
                  <span className="mr-2">🗑️</span>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="w-64 border-r bg-card flex flex-col">
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">Explorer</h3>
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Plus className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
                             <DropdownMenuContent align="start">
                 <DropdownMenuItem onClick={() => handleCreateFile([], `script-${Date.now()}.py`)}>
                   <File className="h-3 w-3 mr-2" />
                   New Python File
                 </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => handleCreateFile([], `script-${Date.now()}.js`)}>
                   <File className="h-3 w-3 mr-2" />
                   New JavaScript File
                 </DropdownMenuItem>
                 <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={() => handleCreateFolder([])}>
                   <Folder className="h-3 w-3 mr-2" />
                   New Folder
                 </DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-6 w-6 p-0"
              title="Close File Explorer"
            >
              <span className="text-lg">×</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {fileTree.map((node) => renderFileNode(node))}
        </div>
      </div>

      {/* Floating Right-Click Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 min-w-[200px] bg-popover border rounded-md shadow-lg p-1"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
        >
          {contextMenu.node.type === 'folder' && (
            <>
              <button
                onClick={() => {
                  handleCreateFile(contextMenu.path, 'untitled.txt')
                  closeContextMenu()
                }}
                className="w-full flex items-center px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
              >
                <File className="h-3 w-3 mr-2" />
                New File
              </button>
              <button
                onClick={() => {
                  handleCreateFolder(contextMenu.path, 'untitled')
                  closeContextMenu()
                }}
                className="w-full flex items-center px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
              >
                <Folder className="h-3 w-3 mr-2" />
                New Folder
              </button>
              <div className="h-px bg-muted my-1" />
            </>
          )}
          <button
            onClick={() => {
              handleRename(contextMenu.path)
              closeContextMenu()
            }}
            className="w-full flex items-center px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
          >
            <span className="mr-2">✏️</span>
            Rename
          </button>
          <button
            onClick={() => {
              handleDelete(contextMenu.path)
              closeContextMenu()
            }}
            className="w-full flex items-center px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer text-red-600 hover:text-red-700"
          >
            <span className="mr-2">🗑️</span>
            Delete
          </button>
        </div>
      )}
    </div>
  )
}
