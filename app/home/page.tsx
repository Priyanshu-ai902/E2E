'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Navigation */}
      <nav className="border-b border-cyan-500/20 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              CodeReview AI
            </div>
          </div>
          <div className="flex gap-4">
            {user ? (
              <>
                <Link href="/dashboard" className="px-4 py-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors">
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth" className="px-4 py-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl sm:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI-Powered Code Review
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Intelligent analysis of pull requests with comprehensive code reviews, test suggestions, and risk assessment.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href={user ? '/dashboard' : '/auth'}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
            >
              {user ? 'Go to Dashboard' : 'Get Started'}
            </Link>
            <Link
              href="#how-it-works"
              className="px-8 py-3 border border-purple-500/50 rounded-lg font-semibold text-purple-400 hover:bg-purple-500/10 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold mb-12 text-center text-white">Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Code Review Issues',
              description: 'Identifies potential bugs, code smells, and best practice violations',
            },
            {
              title: 'Test Coverage',
              description: 'Generates Jest test cases with detailed descriptions for your code changes',
            },
            {
              title: 'Risk Assessment',
              description: 'Evaluates pull request impact with Low, Medium, or High risk levels',
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="glass glass-hover p-6 rounded-lg animate-fade-in"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <h3 className="text-xl font-semibold text-cyan-400 mb-3">{feature.title}</h3>
              <p className="text-slate-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold mb-12 text-center text-white">How It Works</h2>
        <div className="space-y-8">
          {[
            { step: 1, title: 'Submit PR', description: 'Submit a pull request from your repository' },
            { step: 2, title: 'AI Analysis', description: 'Our AI analyzes your code changes in real-time' },
            { step: 3, title: 'Get Insights', description: 'Receive detailed insights and test suggestions' },
            { step: 4, title: 'Improve Code', description: 'Use the feedback to improve code quality' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex gap-6 animate-fade-in"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center font-bold text-white">
                {item.step}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-slate-300">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mb-12">
        <div className="glass p-12 rounded-lg text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Improve Your Code Quality?</h2>
          <p className="text-slate-300 mb-8">Join developers worldwide using AI-powered code review.</p>
          <Link
            href={user ? '/dashboard' : '/auth'}
            className="inline-block px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
          >
            {user ? 'Go to Dashboard' : 'Sign Up Now'}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cyan-500/20 bg-slate-950/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400">
          <p>&copy; 2024 CodeReview AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
