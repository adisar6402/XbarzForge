import { Terminal, Code2, Cpu, FileText, Search, Activity } from "lucide-react";

export default function About() {
  return (
    <div className="flex flex-col flex-1 p-8 overflow-auto">
      <div className="max-w-4xl mx-auto w-full space-y-12 pb-20 mt-8">
        <div className="text-center space-y-4">
          <Terminal className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground font-mono">
            XbarzForge
          </h1>
          <p className="text-xl text-primary font-mono max-w-2xl mx-auto">
            "Forge Better Code. Build Smarter."
          </p>
        </div>

        <section className="bg-card/50 border border-border/50 rounded-xl p-8 backdrop-blur-sm shadow-sm">
          <h2 className="text-2xl font-mono text-foreground mb-4 border-b border-border/50 pb-2">
            What is it?
          </h2>
          <p className="text-muted-foreground font-mono leading-relaxed">
            An AI-powered developer platform that helps developers understand codebases, debug errors, generate documentation, and interact with software projects using natural language.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-mono text-foreground border-b border-border/50 pb-2">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Activity, title: "AI Code Analysis" },
              { icon: Code2, title: "AI Chat" },
              { icon: FileText, title: "Documentation Generator" },
              { icon: Cpu, title: "Project Management" },
              { icon: Search, title: "Global Search" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-4 bg-secondary/20 border border-border/30 p-4 rounded-lg">
                <f.icon className="h-6 w-6 text-primary shrink-0" />
                <span className="font-mono text-sm text-foreground">{f.title}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card/50 border border-border/50 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-mono text-foreground mb-2">Built For</h3>
            <p className="text-muted-foreground font-mono text-sm">OpenAI Build Week 2026</p>
          </div>
          <div className="bg-card/50 border border-border/50 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-mono text-foreground mb-2">Built By</h3>
            <p className="text-muted-foreground font-mono text-sm">Abdulrahman Adisa Amuda (RahmanXBarz)</p>
          </div>
          <div className="bg-card/50 border border-border/50 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-mono text-foreground mb-2">Tech Stack</h3>
            <p className="text-muted-foreground font-mono text-sm">React + Vite, Express, PostgreSQL + Drizzle ORM, Clerk Auth, OpenAI GPT-4o</p>
          </div>
        </section>
      </div>
    </div>
  );
}
