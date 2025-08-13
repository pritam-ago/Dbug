import { Request, Response } from 'express'
import { spawn } from 'child_process'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { v4 as uuidv4 } from 'uuid'
import dotenv from 'dotenv'

dotenv.config()

interface ExecuteRequest {
  code: string
  language: 'javascript' | 'python'
  timeout?: number
}

interface ExecuteResponse {
  success: boolean
  output: string
  error?: string
  executionTime: number
}

// Security: Allowed modules for Node.js
const ALLOWED_NODE_MODULES = [
  'fs', 'path', 'os', 'crypto', 'util', 'events', 'stream', 'buffer', 'querystring', 'url'
]

// Security: Blocked functions and globals
const BLOCKED_FUNCTIONS = [
  'eval', 'Function', 'setTimeout', 'setInterval', 'setImmediate',
  'process.exit', 'process.kill', 'require', 'import'
]

// Security: Blocked Python modules
const BLOCKED_PYTHON_MODULES = [
  'os', 'subprocess', 'sys', 'ctypes', 'mmap', 'signal', 'fcntl', 'termios'
]

export async function executeCode(req: Request, res: Response) {
  try {
    const { code, language, timeout = 10000 }: ExecuteRequest = req.body

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        error: 'Code and language are required'
      })
    }

    if (language !== 'javascript' && language !== 'python') {
      return res.status(400).json({
        success: false,
        error: 'Unsupported language. Only JavaScript and Python are supported.'
      })
    }

    // Security: Basic code validation
    if (language === 'javascript') {
      if (BLOCKED_FUNCTIONS.some(func => code.includes(func))) {
        return res.status(400).json({
          success: false,
          error: 'Code contains blocked functions for security reasons'
        })
      }
    }

    if (language === 'python') {
      if (BLOCKED_PYTHON_MODULES.some(module => code.includes(`import ${module}`) || code.includes(`from ${module}`))) {
        return res.status(400).json({
          success: false,
          error: 'Code contains blocked Python modules for security reasons'
        })
      }
    }

    const startTime = Date.now()
    const tempDir = tmpdir()
    const fileName = `${uuidv4()}.${language === 'javascript' ? 'js' : 'py'}`
    const filePath = join(tempDir, fileName)

    try {
      // Write code to temporary file
      await writeFile(filePath, code, 'utf8')

      // Execute code based on language
      let output = ''
      let error = ''

      if (language === 'javascript') {
        const result = await executeJavaScript(filePath, timeout)
        output = result.output
        error = result.error
      } else if (language === 'python') {
        const result = await executePython(filePath, timeout)
        output = result.output
        error = result.error
      }

      const executionTime = Date.now() - startTime

      const response: ExecuteResponse = {
        success: !error,
        output: output.trim(),
        error: error.trim() || undefined,
        executionTime
      }

      res.json(response)
    } finally {
      // Clean up temporary file
      try {
        await unlink(filePath)
      } catch (cleanupError) {
        console.error('Failed to cleanup temp file:', cleanupError)
      }
    }
  } catch (error) {
    console.error('Sandbox execution error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error during code execution'
    })
  }
}

async function executeJavaScript(filePath: string, timeout: number): Promise<{ output: string; error: string }> {
  return new Promise((resolve) => {
    let output = ''
    let error = ''

    const child = spawn('node', [filePath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, NODE_ENV: 'production' }
    })

    const timeoutId = setTimeout(() => {
      child.kill('SIGKILL')
      resolve({
        output: output,
        error: 'Execution timeout exceeded'
      })
    }, timeout)

    child.stdout.on('data', (data) => {
      output += data.toString()
    })

    child.stderr.on('data', (data) => {
      error += data.toString()
    })

    child.on('close', (code) => {
      clearTimeout(timeoutId)
      if (code !== 0 && !error) {
        error = `Process exited with code ${code}`
      }
      resolve({ output, error })
    })

    child.on('error', (err) => {
      clearTimeout(timeoutId)
      resolve({
        output: output,
        error: `Execution error: ${err.message}`
      })
    })
  })
}

async function executePython(filePath: string, timeout: number): Promise<{ output: string; error: string }> {
  return new Promise((resolve) => {
    let output = ''
    let error = ''

    const child = spawn('python', [filePath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, PYTHONPATH: '' }
    })

    const timeoutId = setTimeout(() => {
      child.kill('SIGKILL')
      resolve({
        output: output,
        error: 'Execution timeout exceeded'
      })
    }, timeout)

    child.stdout.on('data', (data) => {
      output += data.toString()
    })

    child.stderr.on('data', (data) => {
      error += data.toString()
    })

    child.on('close', (code) => {
      clearTimeout(timeoutId)
      if (code !== 0 && !error) {
        error = `Process exited with code ${code}`
      }
      resolve({ output, error })
    })

    child.on('error', (err) => {
      clearTimeout(timeoutId)
      resolve({
        output: output,
        error: `Execution error: ${err.message}`
      })
    })
  })
}
