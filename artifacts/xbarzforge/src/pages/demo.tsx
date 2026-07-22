import { useState } from "react";
import { Link } from "wouter";
import { Terminal, BrainCircuit, Activity, FileText, MessageSquare, Search, BarChart3, ArrowRight, GitBranch, Blocks, FileCode2, Shield, CheckCircle, Zap, AlertCircle, Bot, User, FolderCode, Clock, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ─── Sample data ─────────────────────────────────────────────────────────────

const SAMPLE_PROJECT = {
  id: 1,
  name: "quantum-ui",
  description: "A modern, accessible React component library built with TypeScript, Radix UI primitives, and Tailwind CSS.",
  type: "github",
  githubUrl: "https://github.com/rahmanxbarz/quantum-ui",
  status: "analyzed",
  createdAt: "2026-07-15T10:22:00Z",
};

const SAMPLE_ANALYSIS = {
  summary: "quantum-ui is a well-architected React component library (87 components) built on Radix UI primitives and Tailwind CSS. The codebase follows strict TypeScript conventions with 100% type coverage, comprehensive Storybook documentation, and a Changesets-based release workflow. Test coverage sits at 94% (Vitest + Testing Library). The library is tree-shakeable and ships separate ESM/CJS bundles via tsup. Minor issues: a few inline `any` casts in animation utilities and missing ARIA labels on three icon-only buttons.",
  languages: ["TypeScript", "CSS", "MDX"],
  frameworks: ["React 18", "Radix UI", "Tailwind CSS", "Storybook", "Vitest"],
  architectureOverview: `## Architecture Overview

The library follows a **compound component** pattern throughout, pairing a root context provider with named sub-components (e.g., \`Dialog\`, \`Dialog.Trigger\`, \`Dialog.Content\`).

### Directory Structure
\`\`\`
src/
├── components/     # 87 exported components
│   ├── primitives/ # Radix wrappers (Button, Input, Select …)
│   └── composed/   # Higher-level patterns (DataTable, Combobox …)
├── hooks/          # 14 shared custom hooks
├── utils/          # cn(), focusTrap, animations
└── tokens/         # Design-system CSS variables
\`\`\`

### Data Flow
State is managed at the component level using React context; no global store. Each component exports a typed context hook (\`useDialogContext\`, etc.) for advanced customisation.

### Build Pipeline
tsup produces dual ESM/CJS output with declaration maps. Tailwind is compiled at consumer build time via the library's preset config, keeping the published bundle CSS-free.`,
  importantFiles: [
    "src/components/primitives/Button/Button.tsx",
    "src/tokens/index.css",
    "src/utils/cn.ts",
    "tsup.config.ts",
    "tailwind.preset.ts",
  ],
  codingPatterns: [
    "Compound component pattern with React Context",
    "Polymorphic `as` prop via Radix Slot",
    "CVA (class-variance-authority) for variant styling",
    "Controlled/uncontrolled duality using `useControllableState`",
    "Barrel exports with named re-exports per category",
  ],
  codeQualityScore: 8,
  bugDetection: `### Findings

| Severity | Location | Description |
|---|---|---|
| 🟡 Medium | \`src/utils/animations.ts:47\` | \`as any\` cast masks potential type mismatch in spring config |
| 🟡 Medium | \`src/components/composed/DataTable/DataTable.tsx:201\` | Column sort state not reset when \`data\` prop changes |
| 🟢 Low | \`src/components/primitives/IconButton/IconButton.tsx:12\` | Missing \`aria-label\` fallback when \`title\` prop is absent |
| 🟢 Low | \`src/hooks/useResizeObserver.ts:31\` | ResizeObserver callback not cleaned up on rapid unmounts |

No critical bugs detected. All findings are isolated and have clear remediation paths.`,
  securityAnalysis: `### Security Assessment — Grade: A

**Strengths**
- No direct DOM manipulation; all rendering through React's reconciler
- No \`dangerouslySetInnerHTML\` usage anywhere in the codebase
- Dependencies audited with zero high/critical advisories (npm audit 2026-07-15)
- No hardcoded secrets, tokens, or credentials

**Recommendations**
- Add \`rel="noopener noreferrer"\` to external link props in \`Link\` component (currently optional)
- Consider CSP-compatible animation approach to replace the inline-style transitions in \`Collapse\``,
  performanceSuggestions: [
    "Lazy-load the Combobox virtualisation dependency (react-virtual) — it adds 14 KB gzip to consumers who don't use it",
    "Memoize the token-to-class mapping in useTokens() — it recomputes on every render",
    "Add `will-change: transform` hint to the Sheet slide animation to enable GPU compositing",
    "Consider splitting icon exports into a separate sub-package to prevent accidental full-icon-set imports",
  ],
  bestPractices: [
    "100% TypeScript strict mode — no implicit any",
    "All public APIs documented with TSDoc comments",
    "Semantic HTML used throughout; ARIA attributes follow WAI-ARIA 1.2",
    "Storybook stories cover all component variants and states",
    "Changesets for automated changelog and version management",
    "Husky pre-commit hooks enforce lint and type-check",
  ],
  suggestedImprovements: [
    "Extract animation utilities into a dedicated @quantum-ui/motion package",
    "Add visual regression tests with Chromatic to complement unit tests",
    "Generate automatic accessibility audit reports in CI",
    "Add peer-dependency version range warnings for React < 18",
  ],
};

const SAMPLE_CHAT = [
  {
    id: 1,
    role: "user",
    content: "How does the Button component handle the polymorphic `as` prop?",
  },
  {
    id: 2,
    role: "assistant",
    content: `The \`Button\` component uses **Radix UI's \`Slot\` primitive** to implement the polymorphic \`as\` pattern, which is the idiomatic approach in this codebase.

Here's how it works:

\`\`\`tsx
// src/components/primitives/Button/Button.tsx
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild, className, variant, size, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
\`\`\`

When \`asChild\` is \`true\`, \`Slot\` merges the \`Button\`'s props (including event handlers and className) onto its **single child element** instead of rendering a \`<button>\`. This lets consumers render a \`Link\` or custom element while retaining all button styling and behaviour:

\`\`\`tsx
<Button asChild variant="primary">
  <a href="/dashboard">Go to Dashboard</a>
</Button>
\`\`\`

This approach is preferred over a generic \`as\` prop because TypeScript automatically infers the correct prop types from the child element, and there's no runtime conditional rendering cost.`,
  },
  {
    id: 3,
    role: "user",
    content: "Where is the DataTable column sort state managed?",
  },
  {
    id: 4,
    role: "assistant",
    content: `Sort state lives in \`DataTable.tsx\` using **TanStack Table's \`useReactTable\`** hook, which manages it internally via \`getSortedRowModel\`.

\`\`\`tsx
// src/components/composed/DataTable/DataTable.tsx
const table = useReactTable({
  data,
  columns,
  state: { sorting },
  onSortingChange: setSorting,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),   // ← sort applied here
});
\`\`\`

> ⚠️ **Known issue (from analysis):** The \`sorting\` state is **not reset** when the \`data\` prop changes. If a consumer swaps datasets (e.g., switching between two user lists), the previous sort column may no longer exist in the new schema, causing a silent no-op. The fix is a \`useEffect\` that calls \`setSorting([])\` when \`data\` reference changes and the current sort key is absent from the new column definitions.`,
  },
];

const SAMPLE_README = `# quantum-ui

> A modern, accessible React component library — 87 components, zero configuration.

[![npm version](https://img.shields.io/npm/v/@rahmanxbarz/quantum-ui)](https://npmjs.com/package/@rahmanxbarz/quantum-ui)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![Coverage](https://img.shields.io/badge/coverage-94%25-brightgreen)]()

## Installation

\`\`\`bash
pnpm add @rahmanxbarz/quantum-ui
\`\`\`

## Quick Start

\`\`\`tsx
import { Button, Dialog, Input } from '@rahmanxbarz/quantum-ui';

export function MyForm() {
  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button variant="primary">Open Form</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Input placeholder="Enter your name" />
        <Button type="submit">Submit</Button>
      </Dialog.Content>
    </Dialog>
  );
}
\`\`\`

## Components

| Category | Count | Examples |
|---|---|---|
| Primitives | 42 | Button, Input, Select, Checkbox, Radio |
| Layout | 18 | Stack, Grid, Container, Divider |
| Overlay | 12 | Dialog, Drawer, Tooltip, Popover |
| Composed | 15 | DataTable, Combobox, DatePicker |

## Requirements

- React ≥ 18.0.0
- Node ≥ 20.0.0

## License

MIT © 2026 Abdulrahman Adisa Amuda
`;

const SAMPLE_PROJECTS = [
  { id: 1, name: "quantum-ui", type: "github", status: "analyzed", createdAt: "2026-07-15T10:22:00Z" },
  { id: 2, name: "api-gateway-v2", type: "upload", status: "analyzed", createdAt: "2026-07-14T08:10:00Z" },
  { id: 3, name: "ml-pipeline-core", type: "paste", status: "analyzing", createdAt: "2026-07-13T16:45:00Z" },
  { id: 4, name: "auth-service", type: "github", status: "analyzed", createdAt: "2026-07-12T12:30:00Z" },
  { id: 5, name: "design-tokens", type: "upload", status: "pending", createdAt: "2026-07-11T09:00:00Z" },
];

const SAMPLE_SEARCH_RESULTS = [
  { type: "project", name: "quantum-ui", description: "React component library with TypeScript", match: "quantum" },
  { type: "doc", name: "quantum-ui — README", description: "Auto-generated README for quantum-ui", match: "quantum" },
  { type: "doc", name: "quantum-ui — API Specification", description: "OpenAPI-style spec for all exported hooks", match: "quantum" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function DemoHeader() {
  return (
    <header className="border-b border-border/50 bg-card/30 backdrop-blur-md px-6 py-4 flex items-center justify-between gap-4 shrink-0">
      <div className="flex items-center gap-3">
        <Terminal className="h-5 w-5 text-primary" />
        <span className="font-mono font-bold text-white text-lg tracking-tight">XbarzForge</span>
        <Badge className="bg-primary/20 text-primary border-primary/40 font-mono text-[10px] px-2 py-0.5 uppercase tracking-widest">
          Demo Mode
        </Badge>
      </div>
      <div className="flex items-center gap-4">
        <p className="text-xs text-muted-foreground font-mono hidden sm:block">
          This demonstration uses sample data and does not require authentication.
        </p>
        <Link href="/sign-up">
          <Button size="sm" className="bg-primary text-black hover:bg-primary/90 font-mono shadow-[0_0_15px_-3px_rgba(11,217,235,0.4)] border-0 whitespace-nowrap">
            Start Analysis <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </header>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-wider
      ${status === 'analyzed' ? 'border-green-500/50 text-green-400 bg-green-500/10' : ''}
      ${status === 'analyzing' ? 'border-amber-500/50 text-amber-400 bg-amber-500/10 animate-pulse' : ''}
      ${status === 'error' ? 'border-red-500/50 text-red-400 bg-red-500/10' : ''}
      ${status === 'pending' ? 'border-gray-500/50 text-gray-400 bg-gray-500/10' : ''}
    `}>
      {status}
    </Badge>
  );
}

function DashboardTab() {
  return (
    <div className="space-y-6 pb-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Projects", value: "5", icon: FolderCode, description: "Repositories tracked" },
          { title: "Analyses Run", value: "8", icon: Activity, description: "AI scans completed" },
          { title: "Generated Docs", value: "12", icon: FileText, description: "Markdown files created" },
          { title: "Conversations", value: "3", icon: MessageSquare, description: "Chat threads active" },
        ].map(({ title, value, icon: Icon, description }) => (
          <Card key={title} className="bg-card/50 border-border/50 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Icon className="h-24 w-24" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium font-mono text-muted-foreground">{title}</CardTitle>
              <Icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">{value}</div>
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-mono">Recent Projects</CardTitle>
              <CardDescription>Latest codebases added</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {SAMPLE_PROJECTS.slice(0, 4).map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-transparent">
                  <div className="flex items-center gap-3">
                    <FolderCode className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium font-mono text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground capitalize font-mono">{p.type}</p>
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="font-mono">Recent Activity</CardTitle>
            <CardDescription>Latest AI insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "quantum-ui", summary: "Well-architected React component library with 94% test coverage. Minor animation type casts flagged.", date: "Jul 15" },
                { name: "api-gateway-v2", summary: "Express gateway with JWT auth middleware. Rate-limiting logic has potential race condition in Redis fallback.", date: "Jul 14" },
                { name: "auth-service", summary: "Solid RBAC implementation. Token refresh logic is clean. Recommend adding refresh-token rotation.", date: "Jul 12" },
              ].map((a, i) => (
                <div key={i} className="flex flex-col p-3 rounded-lg bg-secondary/30 border border-transparent gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm font-mono">{a.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                      <Clock className="h-3 w-3" />{a.date}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{a.summary}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RepositoryTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8">
      <div className="md:col-span-2 space-y-6">
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="font-mono text-lg flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" /> Repository Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm font-mono">
              <div><p className="text-muted-foreground mb-1">Source Type</p><p>GitHub</p></div>
              <div><p className="text-muted-foreground mb-1">Status</p><p className="text-green-400">Analyzed</p></div>
              <div className="col-span-2">
                <p className="text-muted-foreground mb-1">Repository URL</p>
                <span className="text-primary truncate block">{SAMPLE_PROJECT.githubUrl}</span>
              </div>
              <div><p className="text-muted-foreground mb-1">Created At</p><p>{new Date(SAMPLE_PROJECT.createdAt).toLocaleString()}</p></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="font-mono text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-gray-300">{SAMPLE_ANALYSIS.summary}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="font-mono text-lg flex items-center gap-2">
              <Blocks className="h-5 w-5 text-primary" /> Tech Stack
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 font-mono">Languages</h4>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_ANALYSIS.languages.map(l => <Badge key={l} variant="secondary" className="font-mono bg-secondary/50 text-xs">{l}</Badge>)}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 font-mono">Frameworks</h4>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_ANALYSIS.frameworks.map(f => <Badge key={f} variant="outline" className="font-mono text-xs border-primary/30 text-primary/80">{f}</Badge>)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="font-mono text-lg flex items-center gap-2">
              <FileCode2 className="h-5 w-5 text-primary" /> Key Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {SAMPLE_ANALYSIS.importantFiles.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-xs font-mono bg-secondary/20 p-2 rounded border border-border/30">
                  <Terminal className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                  <span className="break-all">{f}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AnalysisTab() {
  return (
    <div className="space-y-6 pb-8">
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="font-mono text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" /> Code Quality Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold font-mono text-green-500">{SAMPLE_ANALYSIS.codeQualityScore}/10</div>
            <div className="flex-1 max-w-md h-4 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-green-500 transition-all" style={{ width: `${(SAMPLE_ANALYSIS.codeQualityScore / 10) * 100}%` }} />
            </div>
            <Badge className="bg-green-500/10 text-green-400 border-green-500/30 font-mono">Excellent</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="font-mono text-lg flex items-center gap-2 text-red-400">
            <AlertCircle className="h-5 w-5" /> Bug Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-invert max-w-none font-mono text-sm prose-p:leading-relaxed prose-table:text-xs">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{SAMPLE_ANALYSIS.bugDetection}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="font-mono text-lg flex items-center gap-2 text-purple-400">
            <Shield className="h-5 w-5" /> Security Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-invert max-w-none font-mono text-sm prose-p:leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{SAMPLE_ANALYSIS.securityAnalysis}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="font-mono text-lg flex items-center gap-2 text-blue-400">
            <Zap className="h-5 w-5" /> Performance Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {SAMPLE_ANALYSIS.performanceSuggestions.map((s, i) => (
              <li key={i} className="text-sm flex items-start gap-2 bg-blue-500/5 p-3 rounded border border-blue-500/10">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5" />
                <span className="text-blue-100/80">{s}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="font-mono text-lg flex items-center gap-2 text-green-400">
            <CheckCircle className="h-5 w-5" /> Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {SAMPLE_ANALYSIS.bestPractices.map((p, i) => (
              <li key={i} className="text-sm flex items-start gap-2 bg-green-500/5 p-3 rounded border border-green-500/10">
                <div className="h-1.5 w-1.5 rounded-full bg-green-400 shrink-0 mt-1.5" />
                <span className="text-green-100/80">{p}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="font-mono text-lg text-amber-400 flex items-center gap-2">
            <Zap className="h-5 w-5" /> Suggested Improvements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {SAMPLE_ANALYSIS.suggestedImprovements.map((s, i) => (
              <li key={i} className="text-sm flex items-start gap-2 bg-amber-500/5 p-3 rounded border border-amber-500/10">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                <span className="text-amber-100/80">{s}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function ChatTab() {
  return (
    <Card className="h-full flex flex-col bg-card/50 border-border/50 overflow-hidden">
      <CardHeader className="py-3 px-4 border-b border-border/50 shrink-0 bg-secondary/10">
        <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
          <Terminal className="h-4 w-4 text-primary" /> XbarzForge AI Assistant
          <Badge className="ml-auto bg-amber-500/10 text-amber-400 border-amber-500/30 font-mono text-[10px]">Read-only preview</Badge>
        </div>
      </CardHeader>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {SAMPLE_CHAT.map(msg => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && (
              <div className="h-8 w-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${
              msg.role === "user"
                ? "bg-primary text-black font-mono shadow-[0_0_15px_-3px_rgba(11,217,235,0.2)]"
                : "bg-secondary/30 border border-border/50 font-sans prose prose-invert prose-p:leading-relaxed prose-pre:bg-[#14151a] prose-pre:border prose-pre:border-border/50 max-w-none"
            }`}>
              {msg.role === "user" ? msg.content : (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              )}
            </div>
            {msg.role === "user" && (
              <div className="h-8 w-8 rounded bg-secondary flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-border/50 shrink-0 bg-secondary/5">
        <div className="flex gap-2 opacity-50 pointer-events-none" title="Sign up to use AI chat">
          <Input placeholder="Sign up to start chatting…" className="flex-1 bg-card/50 border-border/50 font-mono text-sm" readOnly />
          <Button size="icon" className="bg-primary text-black shrink-0" disabled>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground font-mono mt-2 text-center">
          <Link href="/sign-up" className="text-primary hover:underline">Create a free account</Link> to chat with AI about your own codebases.
        </p>
      </div>
    </Card>
  );
}

function DocumentationTab() {
  return (
    <div className="h-full flex gap-6 pb-8">
      <Card className="w-1/3 flex flex-col bg-card/50 border-border/50 shrink-0 min-w-0">
        <CardHeader className="py-4 px-4 border-b border-border/50 shrink-0">
          <CardTitle className="font-mono text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> Generated Files
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-2 space-y-1">
          {["README.md", "API Specification", "Architecture Guide", "Onboarding Guide"].map((doc, i) => (
            <div key={i} className={`w-full px-3 py-2 rounded text-sm font-mono flex items-center gap-2 ${i === 0 ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground'}`}>
              <FileText className="h-3 w-3 shrink-0" />
              <span className="truncate">{doc}</span>
            </div>
          ))}
        </CardContent>
        <div className="p-4 border-t border-border/50 shrink-0 bg-secondary/10">
          <Button className="w-full opacity-50 cursor-not-allowed font-mono text-sm" disabled>
            <Plus className="mr-2 h-4 w-4" /> Generate New (Sign up)
          </Button>
        </div>
      </Card>

      <Card className="flex-1 flex flex-col bg-card/50 border-border/50 overflow-hidden min-w-0">
        <CardHeader className="py-3 px-4 border-b border-border/50 shrink-0 flex flex-row items-center justify-between bg-secondary/5">
          <CardTitle className="font-mono text-sm">README.md</CardTitle>
          <Badge className="bg-primary/10 text-primary border-primary/30 font-mono text-[10px]">AI Generated</Badge>
        </CardHeader>
        <div className="flex-1 overflow-auto bg-[#0a0a0c] p-6">
          <div className="prose prose-invert max-w-4xl mx-auto font-sans prose-p:leading-relaxed prose-pre:bg-[#14151a] prose-pre:border prose-pre:border-border/50 prose-table:text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{SAMPLE_README}</ReactMarkdown>
          </div>
        </div>
      </Card>
    </div>
  );
}

function SearchTab() {
  const [query, setQuery] = useState("quantum");

  return (
    <div className="space-y-6 pb-8">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search projects, docs, conversations…"
          className="pl-10 font-mono bg-card/50 border-border/50 focus-visible:ring-primary/50"
        />
      </div>

      {query.length > 1 && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground font-mono">{SAMPLE_SEARCH_RESULTS.length} results for "{query}"</p>
          {SAMPLE_SEARCH_RESULTS.map((r, i) => (
            <div key={i} className="p-4 rounded-lg bg-card/50 border border-border/50 flex items-start gap-3">
              {r.type === "project" ? <FolderCode className="h-5 w-5 text-primary shrink-0 mt-0.5" /> : <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-mono font-medium text-sm">{r.name}</p>
                  <Badge variant="outline" className="font-mono text-[10px] capitalize border-border/50">{r.type}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{r.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReportsTab() {
  return (
    <div className="space-y-6 pb-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Average Quality Score", value: "7.8 / 10", color: "text-green-400", desc: "Across 8 analyzed projects" },
          { label: "Total Bugs Detected", value: "23", color: "text-red-400", desc: "4 medium · 19 low severity" },
          { label: "Security Grade", value: "A–", color: "text-purple-400", desc: "No critical vulnerabilities" },
          { label: "Docs Generated", value: "12", color: "text-primary", desc: "README, API, Architecture, Onboarding" },
          { label: "Lines Analyzed", value: "148,000+", color: "text-amber-400", desc: "Across all projects" },
          { label: "AI Chat Messages", value: "47", color: "text-blue-400", desc: "In 3 active conversations" },
        ].map(({ label, value, color, desc }) => (
          <Card key={label} className="bg-card/50 border-border/50">
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground font-mono mb-1">{label}</p>
              <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="font-mono flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" /> Quality by Project
          </CardTitle>
          <CardDescription>Code quality scores across all analyzed repositories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: "quantum-ui", score: 8, lang: "TypeScript" },
            { name: "auth-service", score: 7.5, lang: "TypeScript" },
            { name: "api-gateway-v2", score: 7.2, lang: "Node.js" },
            { name: "design-tokens", score: 9.1, lang: "JSON/CSS" },
            { name: "ml-pipeline-core", score: 6.8, lang: "Python" },
          ].map(({ name, score, lang }) => (
            <div key={name} className="flex items-center gap-4 text-sm">
              <span className="font-mono w-36 shrink-0 truncate">{name}</span>
              <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${score >= 8 ? 'bg-green-500' : score >= 7 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${(score / 10) * 100}%` }}
                />
              </div>
              <span className={`font-mono text-xs w-12 text-right ${score >= 8 ? 'text-green-400' : score >= 7 ? 'text-amber-400' : 'text-red-400'}`}>{score}/10</span>
              <Badge variant="outline" className="font-mono text-[10px] border-border/50 hidden sm:inline-flex">{lang}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Demo Page ───────────────────────────────────────────────────────────

export default function DemoPage() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col overflow-hidden">
      <DemoHeader />

      <div className="flex-1 overflow-hidden flex flex-col px-4 sm:px-6 py-6 max-w-7xl mx-auto w-full">
        {/* Project header */}
        <div className="border border-border/50 bg-card/30 rounded-xl px-6 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <Terminal className="h-5 w-5 text-primary" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-mono">{SAMPLE_PROJECT.name}</h1>
                <StatusBadge status={SAMPLE_PROJECT.status} />
              </div>
              <p className="text-xs text-muted-foreground font-mono max-w-xl mt-0.5">{SAMPLE_PROJECT.description}</p>
            </div>
          </div>
          <Link href="/sign-up">
            <Button className="bg-primary text-black hover:bg-primary/90 font-mono text-sm shadow-[0_0_15px_-3px_rgba(11,217,235,0.4)] border-0 shrink-0">
              <ArrowRight className="mr-2 h-4 w-4" /> Start Analysis
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="dashboard" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="bg-secondary/20 border border-border/50 p-1 w-full justify-start h-auto rounded-lg mb-6 shrink-0 overflow-x-auto hide-scrollbar">
            {[
              { value: "dashboard", icon: Activity, label: "Dashboard" },
              { value: "repository", icon: GitBranch, label: "Repository" },
              { value: "analysis", icon: BrainCircuit, label: "Analysis" },
              { value: "chat", icon: MessageSquare, label: "AI Chat" },
              { value: "docs", icon: FileText, label: "Documentation" },
              { value: "search", icon: Search, label: "Search" },
              { value: "reports", icon: BarChart3, label: "Reports" },
            ].map(({ value, icon: Icon, label }) => (
              <TabsTrigger key={value} value={value} className="font-mono data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm py-2 px-3 sm:px-4 whitespace-nowrap text-xs sm:text-sm">
                <Icon className="w-3.5 h-3.5 mr-1.5" />{label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-auto rounded-lg relative hide-scrollbar">
            <TabsContent value="dashboard" className="mt-0 border-0"><DashboardTab /></TabsContent>
            <TabsContent value="repository" className="mt-0 border-0"><RepositoryTab /></TabsContent>
            <TabsContent value="analysis" className="mt-0 border-0"><AnalysisTab /></TabsContent>
            <TabsContent value="chat" className="h-[600px] mt-0 border-0"><ChatTab /></TabsContent>
            <TabsContent value="docs" className="h-[600px] mt-0 border-0"><DocumentationTab /></TabsContent>
            <TabsContent value="search" className="mt-0 border-0"><SearchTab /></TabsContent>
            <TabsContent value="reports" className="mt-0 border-0"><ReportsTab /></TabsContent>
          </div>
        </Tabs>
      </div>

      <footer className="shrink-0 border-t border-border/50 py-4 text-center text-xs text-muted-foreground font-mono">
        © 2026 XbarzForge | Built by Abdulrahman Adisa Amuda (RahmanXBarz) | Created for OpenAI Build Week 2026
        <span className="mx-3 opacity-30">·</span>
        <Link href="/sign-up" className="text-primary hover:underline">Create Account</Link>
        <span className="mx-2 opacity-30">·</span>
        <Link href="/" className="hover:text-foreground">Home</Link>
      </footer>
    </div>
  );
}
