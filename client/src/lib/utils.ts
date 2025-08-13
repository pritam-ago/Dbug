import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getLanguageFromFileName(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase()
  switch (ext) {
    case "py":
      return "python"
    case "js":
      return "javascript"
    case "ts":
    case "tsx":
      return "typescript"
    case "md":
      return "markdown"
    case "json":
      return "json"
    case "css":
      return "css"
    case "html":
      return "html"
    default:
      return "plaintext"
  }
}

export function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}
