import Link from "next/link"
import { Code, Github, Twitter, Mail } from "lucide-react"

export function Footer() {
  return (
            <footer className="bg-background/80 backdrop-blur-sm border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Code className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 font-['Space_Grotesk']">DBug</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-['DM_Sans'] text-sm">
              AI-powered collaborative debugging platform for modern developers.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700 dark:text-gray-200 font-['Space_Grotesk']">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/dashboard"
                  className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-['DM_Sans']"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/rooms"
                  className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-['DM_Sans']"
                >
                  Collaboration Rooms
                </Link>
              </li>
              <li>
                <Link
                  href="/debugger"
                  className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-['DM_Sans']"
                >
                  Code Debugger
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700 dark:text-gray-200 font-['Space_Grotesk']">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/docs"
                  className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-['DM_Sans']"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-['DM_Sans']"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-['DM_Sans']"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-700 dark:text-gray-200 font-['Space_Grotesk']">Connect</h4>
            <div className="flex gap-3">
              <Link
                href="#"
                className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
              >
                <Github className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </Link>
              <Link
                href="#"
                className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
              >
                <Twitter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </Link>
              <Link
                href="#"
                className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
              >
                <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-['DM_Sans']">
            © 2024 DBug. All rights reserved. Built with ❤️ for developers.
          </p>
        </div>
      </div>
    </footer>
  )
}
