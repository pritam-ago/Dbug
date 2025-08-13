import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Code, Users, Zap, Github, ArrowRight, CheckCircle } from "lucide-react"

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-700/25 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-700 font-['Space_Grotesk']">DBug</h1>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
              <h2 className="text-5xl sm:text-6xl font-bold text-gray-700 font-['Space_Grotesk'] leading-tight">
                Welcome to Your
                <span className="block text-indigo-600">Debugging Playground</span>
              </h2>

              <p className="text-xl text-gray-600 max-w-2xl mx-auto font-['DM_Sans'] leading-relaxed">
                Where Collaboration Meets Code Clarity. Debug together, code smarter, and ship faster with AI-powered
                insights.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group"
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>

                <Link href="/auth/login">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-gray-300 hover:border-indigo-600 text-gray-700 hover:text-indigo-600 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200 hover:scale-105 bg-transparent"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-gray-700 font-['Space_Grotesk'] mb-4">
            Everything You Need to Debug Better
          </h3>
          <p className="text-lg text-gray-600 font-['DM_Sans']">
            Powerful tools designed for modern development workflows
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-600 transition-colors duration-300">
                <Users className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h4 className="text-xl font-bold text-gray-700 font-['Space_Grotesk'] mb-3">Real-time Collaboration</h4>
              <p className="text-gray-600 font-['DM_Sans'] leading-relaxed">
                Work together seamlessly with live cursors, instant sync, and shared debugging sessions.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-600 transition-colors duration-300">
                <Zap className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h4 className="text-xl font-bold text-gray-700 font-['Space_Grotesk'] mb-3">AI-Powered Analysis</h4>
              <p className="text-gray-600 font-['DM_Sans'] leading-relaxed">
                Get intelligent suggestions, automated bug detection, and smart code improvements.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-600 transition-colors duration-300">
                <Github className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h4 className="text-xl font-bold text-gray-700 font-['Space_Grotesk'] mb-3">GitHub Integration</h4>
              <p className="text-gray-600 font-['DM_Sans'] leading-relaxed">
                Connect directly with your repositories for seamless workflow integration.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="bg-white/50 backdrop-blur-sm py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-700 font-['Space_Grotesk'] mb-4">
              Ready to tackle your next bug?
            </h3>
            <p className="text-lg text-gray-600 font-['DM_Sans']">
              Join thousands of developers who debug smarter, not harder
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              "Ship code 3x faster with AI assistance",
              "Reduce debugging time by 60%",
              "Collaborate seamlessly with your team",
              "Integrate with your existing workflow",
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                <span className="text-gray-700 font-['DM_Sans'] font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                Start Your Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
