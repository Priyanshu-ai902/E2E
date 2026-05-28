'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Shield, Rocket } from 'lucide-react';

export default function Landing() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          CodeReview AI
        </div>
        <Button
          onClick={() => router.push('/auth')}
          variant="outline"
          className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
        >
          Sign In
        </Button>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-balance">
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Intelligent Code Review
          </span>
          {' '}Powered by AI
        </h1>
        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto text-balance">
          Get instant, intelligent feedback on your pull requests. Catch security issues, performance bottlenecks, and best practice violations before they reach production.
        </p>
        <div className="flex gap-4 justify-center mb-16">
          <Button
            onClick={() => router.push('/auth')}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-8 py-6 text-lg"
          >
            Get Started <ArrowRight className="ml-2" />
          </Button>
          <Button
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-6 text-lg"
          >
            Learn More
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="glass rounded-lg p-6 text-left">
            <Zap className="w-8 h-8 text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Instant Analysis</h3>
            <p className="text-slate-400">
              Get detailed code review analysis in seconds, not hours. Our AI reviews your code faster than any human reviewer.
            </p>
          </div>
          <div className="glass rounded-lg p-6 text-left">
            <Shield className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Security First</h3>
            <p className="text-slate-400">
              Identify vulnerabilities, injection attacks, and security best practices automatically before deployment.
            </p>
          </div>
          <div className="glass rounded-lg p-6 text-left">
            <Rocket className="w-8 h-8 text-pink-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Performance</h3>
            <p className="text-slate-400">
              Get suggestions to optimize performance, reduce technical debt, and improve code maintainability.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 mt-20">
        <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              1
            </div>
            <h3 className="text-xl font-bold mb-2">Connect Your Repo</h3>
            <p className="text-slate-400">
              Connect your GitHub repository and enable CodeReview AI for your team.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              2
            </div>
            <h3 className="text-xl font-bold mb-2">Submit Pull Requests</h3>
            <p className="text-slate-400">
              Submit your pull requests as usual. Our AI automatically analyzes the changes.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              3
            </div>
            <h3 className="text-xl font-bold mb-2">Get Feedback</h3>
            <p className="text-slate-400">
              Receive detailed feedback with test suggestions and improvement recommendations.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 mt-20 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center text-slate-400">
          <p>&copy; 2024 CodeReview AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
