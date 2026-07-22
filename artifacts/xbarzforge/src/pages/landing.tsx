import { Link } from "wouter";
import { Terminal, Code2, Zap, BrainCircuit, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 flex flex-col overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      
      <header className="relative z-10 flex h-20 items-center justify-between px-6 md:px-12 border-b border-white/5 bg-background/50 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-primary">
          <Terminal className="h-6 w-6" />
          <span className="font-mono font-bold text-xl tracking-tight text-white">XbarzForge</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-gray-300 hover:text-white font-mono hidden md:flex" asChild>
            <Link href="/sign-in">
              /login
            </Link>
          </Button>
          <Button className="bg-primary text-black hover:bg-primary/90 font-mono shadow-[0_0_20px_-5px_rgba(11,217,235,0.5)]" asChild>
            <Link href="/sign-up">
              Initialize_
            </Link>
          </Button>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center pt-24 pb-32">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono text-sm mb-8 animate-in fade-in slide-in-from-bottom-4">
          <Zap className="h-4 w-4" />
          <span>v0.1.0 is online</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 max-w-4xl text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500 animate-in fade-in slide-in-from-bottom-6 delay-150 fill-mode-both">
          The <span className="text-primary glow-effect bg-clip-text text-transparent bg-primary">IDE extension</span> you never had.
        </h1>
        
        <p className="text-xl text-gray-400 mb-12 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-6 delay-300 fill-mode-both">
          A command center where developers get instant AI understanding of any codebase. Like pairing with a senior engineer who's read every file in the repo.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 animate-in fade-in slide-in-from-bottom-6 delay-500 fill-mode-both">
          <Link href="/sign-up">
            <Button size="lg" className="h-14 px-8 text-lg bg-primary text-black hover:bg-primary/90 font-mono shadow-[0_0_30px_-5px_rgba(11,217,235,0.6)] group border-0">
              Start analysis
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/demo">
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-white/10 hover:bg-white/5 font-mono">
              <Play className="mr-2 h-5 w-5" />
              View Demo
            </Button>
          </Link>
        </div>

        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full text-left px-4 animate-in fade-in slide-in-from-bottom-12 delay-700 fill-mode-both">
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <BrainCircuit className="h-10 w-10 text-primary mb-6" />
            <h3 className="text-xl font-semibold text-white mb-3 font-mono">Deep Comprehension</h3>
            <p className="text-gray-400">Instantly maps architectures, frameworks, and patterns across massive repositories without breaking a sweat.</p>
          </div>
          
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Code2 className="h-10 w-10 text-primary mb-6" />
            <h3 className="text-xl font-semibold text-white mb-3 font-mono">Code-First Chat</h3>
            <p className="text-gray-400">Ask highly specific questions about files, functions, and state management. Get back working, formatted code.</p>
          </div>
          
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Terminal className="h-10 w-10 text-primary mb-6" />
            <h3 className="text-xl font-semibold text-white mb-3 font-mono">Auto-Documentation</h3>
            <p className="text-gray-400">Generate READMEs, API specs, and onboarding guides in seconds. Keep your docs as fresh as your main branch.</p>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/5 py-6 text-center text-xs text-gray-500 font-mono bg-background/50 backdrop-blur-md">
        © 2026 XbarzForge | Built by Abdulrahman Adisa Amuda (RahmanXBarz) | Created for OpenAI Build Week 2026
      </footer>
    </div>
  );
}