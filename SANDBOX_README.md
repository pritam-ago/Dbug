# Code Sandbox Environment

## Overview
The Code Sandbox is a secure, isolated environment that allows users to run JavaScript and Python code with real-time execution and terminal access. It's designed with security in mind, providing a safe playground for testing and learning code.

## Features

### 🚀 Code Execution
- **JavaScript Support**: Run modern JavaScript (ES6+) code
- **Python Support**: Execute Python scripts with standard library access
- **Real-time Output**: See execution results immediately in the terminal
- **Execution History**: Track your last 10 code executions with timestamps

### 🔒 Security Features
- **Sandboxed Environment**: Code runs in isolated processes
- **Timeout Protection**: 30-second execution limit per run
- **Restricted Functions**: Dangerous functions like `eval`, `process.exit` are blocked
- **Module Restrictions**: Limited access to system modules for security
- **Resource Constraints**: Memory and CPU usage are controlled

### 💻 Terminal Interface
- **Live Output**: Real-time display of code execution results
- **Error Handling**: Clear error messages and stack traces
- **Execution Status**: Visual indicators for running processes
- **Output Formatting**: Color-coded success/error messages

### 📁 File Management
- **Code Upload**: Load existing code files (.js, .py, .txt)
- **Code Download**: Save your code to local files
- **Reset Functionality**: Restore default example code
- **Tabbed Interface**: Switch between JavaScript and Python editors

## Usage

### 1. Access the Sandbox
Navigate to `/sandbox` in your application or click the "Sandbox" link in the navigation.

### 2. Write Your Code
- Use the Monaco code editor for syntax highlighting and autocomplete
- Switch between JavaScript and Python using the tabs
- Start with the provided example code or write your own

### 3. Execute Code
- Click the "Run Code" button to execute your code
- Watch real-time output in the terminal
- View execution results and timing information

### 4. Manage Your Code
- Upload existing code files
- Download your code for later use
- Reset to default examples
- Clear terminal output as needed

## Supported Languages

### JavaScript
- Modern ES6+ features
- Console output support
- Standard library functions
- **Restricted**: `eval`, `Function`, `setTimeout`, `process.exit`

### Python
- Python 3.x syntax
- Print statements and output
- Standard library modules
- **Restricted**: `os`, `subprocess`, `sys`, `ctypes`

## Security Considerations

### What's Blocked
- **JavaScript**: `eval()`, `Function()`, `setTimeout()`, `process.exit()`
- **Python**: `os`, `subprocess`, `sys`, `ctypes`, `mmap`, `signal`
- **General**: File system access, network calls, process management

### What's Allowed
- **JavaScript**: Standard library functions, math operations, string manipulation
- **Python**: Math, string operations, data structures, algorithms
- **General**: Computational tasks, data processing, algorithm testing

## Technical Implementation

### Backend
- **Express.js API**: `/api/sandbox/execute` endpoint
- **Child Process Execution**: Isolated process spawning
- **Temporary File Management**: Secure file handling with cleanup
- **Timeout Management**: Process termination for long-running code

### Frontend
- **React Components**: Modern UI with TypeScript
- **Monaco Editor**: Professional code editing experience
- **Real-time Updates**: Live terminal output and status
- **Responsive Design**: Works on desktop and mobile devices

## Example Code

### JavaScript Fibonacci
```javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci sequence:");
for (let i = 0; i < 10; i++) {
  console.log(`fib(${i}) = ${fibonacci(i)}`);
}
```

### Python List Comprehension
```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print("Fibonacci sequence:")
for i in range(10):
    print(f"fib({i}) = {fibonacci(i)}")

numbers = [1, 2, 3, 4, 5]
doubled = [n * 2 for n in numbers]
print(f"Doubled numbers: {doubled}")
```

## Troubleshooting

### Common Issues
1. **Code not executing**: Check for syntax errors or blocked functions
2. **Timeout errors**: Code may be too complex or have infinite loops
3. **Module import errors**: Some Python modules are restricted for security
4. **Output not showing**: Ensure your code has print/console.log statements

### Best Practices
1. **Start simple**: Begin with basic examples before complex code
2. **Test incrementally**: Add features one at a time
3. **Handle errors**: Include proper error handling in your code
4. **Use timeouts**: Avoid infinite loops or very long computations

## Development

### Prerequisites
- Node.js and Python installed on the server
- Express.js backend running
- Next.js frontend with required dependencies

### Installation
1. Install server dependencies: `npm install uuid @types/uuid`
2. Ensure Python is available in the system PATH
3. Start both backend and frontend servers

### Configuration
- Set `NEXT_PUBLIC_SERVER_URL` environment variable
- Configure timeout limits in the sandbox API
- Adjust security restrictions as needed

## Contributing
When contributing to the sandbox:
1. Maintain security restrictions
2. Add comprehensive error handling
3. Test with various code examples
4. Update documentation for new features
5. Follow the existing code style and patterns
