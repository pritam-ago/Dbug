import Link from "next/link"

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold">Welcome to Dbug</h1>
        <p className="text-xl text-muted-foreground">Your collaborative debugging platform</p>
        
        <div className="space-y-4">
          <Link 
            href="/debugger" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try AI Code Debugger
          </Link>
          
          <p className="text-sm text-muted-foreground">
            Experience the power of AI-assisted code debugging with our integrated editor
          </p>
        </div>
      </div>
    </div>
  )
}
