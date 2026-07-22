import { useState, useRef, useEffect } from "react";
import { useParams } from "wouter";
import { 
  useGetProject, 
  useGetProjectAnalysis, 
  getGetProjectAnalysisQueryKey,
  useAnalyzeProject,
  useListProjectDocs,
  useCreateProjectDoc,
  useDeleteProjectDoc,
  getListProjectDocsQueryKey,
  useCreateOpenaiConversation,
  useListOpenaiConversations,
  useGetOpenaiConversation,
  getGetOpenaiConversationQueryKey,
  getListOpenaiConversationsQueryKey
} from "@/lib/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal, BrainCircuit, Activity, FileText, MessageSquare, Play, Loader2, GitBranch, Blocks, FileCode2, Copy, Download, Trash2, Send, Bot, User, Zap, AlertCircle, Shield, CheckCircle } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id || "0", 10);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: project, isLoading: isProjectLoading } = useGetProject(projectId);
  const { data: analysis, isLoading: isAnalysisLoading } = useGetProjectAnalysis(projectId, {
    query: {
      queryKey: getGetProjectAnalysisQueryKey(projectId),
      enabled: !!project && project.status === 'analyzed',
    }
  });

  const [aiDisabledError, setAiDisabledError] = useState(false);

  const analyzeProject = useAnalyzeProject();

  const handleAnalyze = async () => {
    try {
      setAiDisabledError(false);
      await analyzeProject.mutateAsync({ id: projectId });
      toast({
        title: "Analysis Started",
        description: "The AI is now mapping your codebase.",
      });
      // In a real app we'd poll or use websockets to check status
    } catch (e: any) {
      const status = e?.status ?? e?.response?.status ?? 0;
      const body = JSON.stringify(e ?? '');
      if (status === 503 || status === 429 || body.includes('disabled') || body.includes('AI') || body.includes('OpenAI') || body.includes('quota') || body.includes('key')) {
        setAiDisabledError(true);
      } else {
        toast({
          title: "Analysis Failed",
          description: "Failed to trigger analysis.",
          variant: "destructive"
        });
      }
    }
  };

  if (isProjectLoading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-8 w-full flex-1">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden">
      {aiDisabledError && (
        <div className="mx-8 mt-6 p-4 rounded-lg border border-amber-500/50 bg-amber-500/10 text-amber-500 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold font-mono">AI Features Unavailable</h4>
            <p className="text-sm font-mono mt-1 opacity-90">
              AI features are currently unavailable because no AI provider has been configured.
            </p>
            <p className="text-sm font-mono mt-1 opacity-75">
              Configure a valid OpenAI API key in the application's environment variables to enable AI-powered analysis.
            </p>
          </div>
        </div>
      )}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-md px-8 py-6 shrink-0 z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Terminal className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">{project.name}</h1>
              <Badge variant="outline" className={`ml-2 font-mono text-[10px] uppercase tracking-wider
                ${project.status === 'analyzed' ? 'border-green-500/50 text-green-400 bg-green-500/10' : ''}
                ${project.status === 'analyzing' ? 'border-amber-500/50 text-amber-400 bg-amber-500/10 animate-pulse' : ''}
                ${project.status === 'error' ? 'border-red-500/50 text-red-400 bg-red-500/10' : ''}
                ${project.status === 'pending' ? 'border-gray-500/50 text-gray-400 bg-gray-500/10' : ''}
              `}>
                {project.status}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm font-mono max-w-2xl">{project.description}</p>
          </div>
          
          <div className="flex items-center gap-3">
            {project.status === 'pending' || project.status === 'error' ? (
              <Button 
                onClick={handleAnalyze} 
                disabled={analyzeProject.isPending}
                className="bg-primary text-black hover:bg-primary/90 font-mono shadow-[0_0_15px_-3px_rgba(11,217,235,0.4)] border-0"
              >
                {analyzeProject.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                Run Analysis
              </Button>
            ) : project.status === 'analyzing' ? (
              <Button disabled className="font-mono bg-amber-500/20 text-amber-400 border-amber-500/50 border">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Codebase...
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col px-8 py-6 max-w-7xl mx-auto w-full">
        <Tabs defaultValue="overview" className="flex-1 flex flex-col h-full overflow-hidden">
          <TabsList className="bg-secondary/20 border border-border/50 p-1 w-full justify-start h-auto rounded-lg mb-6 shrink-0 overflow-x-auto hide-scrollbar">
            <TabsTrigger value="overview" className="font-mono data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm py-2 px-4 whitespace-nowrap">
              <Activity className="w-4 h-4 mr-2" /> Overview
            </TabsTrigger>
            <TabsTrigger value="analysis" disabled={project.status !== 'analyzed'} className="font-mono data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm py-2 px-4 whitespace-nowrap">
              <BrainCircuit className="w-4 h-4 mr-2" /> Deep Analysis
            </TabsTrigger>
            <TabsTrigger value="chat" disabled={project.status !== 'analyzed'} className="font-mono data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm py-2 px-4 whitespace-nowrap">
              <MessageSquare className="w-4 h-4 mr-2" /> AI Chat
            </TabsTrigger>
            <TabsTrigger value="docs" disabled={project.status !== 'analyzed'} className="font-mono data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm py-2 px-4 whitespace-nowrap">
              <FileText className="w-4 h-4 mr-2" /> Documentation
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto rounded-lg relative hide-scrollbar">
            <TabsContent value="overview" className="h-full mt-0 border-0">
              <OverviewTab project={project} analysis={analysis} isAnalysisLoading={isAnalysisLoading} />
            </TabsContent>
            
            <TabsContent value="analysis" className="h-full mt-0 border-0">
              {analysis && <AnalysisTab analysis={analysis} />}
            </TabsContent>
            
            <TabsContent value="chat" className="h-full mt-0 border-0">
              <ChatTab projectId={projectId} />
            </TabsContent>
            
            <TabsContent value="docs" className="h-full mt-0 border-0">
              <DocsTab projectId={projectId} setAiDisabledError={setAiDisabledError} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function OverviewTab({ project, analysis, isAnalysisLoading }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full pb-8">
      <div className="md:col-span-2 space-y-6">
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="font-mono text-lg flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" /> Repository Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm font-mono">
              <div>
                <p className="text-muted-foreground mb-1">Source Type</p>
                <p className="capitalize">{project.type}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Status</p>
                <p className="capitalize">{project.status}</p>
              </div>
              {project.type === 'github' && (
                <div className="col-span-2">
                  <p className="text-muted-foreground mb-1">Repository URL</p>
                  <a href={project.githubUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate block">
                    {project.githubUrl}
                  </a>
                </div>
              )}
              <div>
                <p className="text-muted-foreground mb-1">Created At</p>
                <p>{new Date(project.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50 h-full max-h-[300px] flex flex-col">
          <CardHeader className="shrink-0">
            <CardTitle className="font-mono text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {project.status !== 'analyzed' ? (
              <div className="text-center py-8 text-muted-foreground font-mono">
                <BrainCircuit className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Analysis has not been completed yet.</p>
                {project.status === 'pending' && <p className="text-xs mt-2">Run analysis to unlock insights.</p>}
              </div>
            ) : isAnalysisLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[80%]" />
              </div>
            ) : analysis ? (
              <p className="text-sm leading-relaxed text-gray-300">
                {analysis.summary}
              </p>
            ) : (
              <p className="text-sm text-red-400">Failed to load analysis summary.</p>
            )}
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
          <CardContent>
            {project.status !== 'analyzed' ? (
              <p className="text-sm text-muted-foreground font-mono text-center py-4">Not available</p>
            ) : analysis ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 font-mono">Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.languages.map((lang: string) => (
                      <Badge key={lang} variant="secondary" className="font-mono bg-secondary/50 hover:bg-secondary text-xs">{lang}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 font-mono">Frameworks</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.frameworks.map((fw: string) => (
                      <Badge key={fw} variant="outline" className="font-mono text-xs border-primary/30 text-primary/80">{fw}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AnalysisTab({ analysis }: { analysis: any }) {
  return (
    <div className="grid grid-cols-1 gap-6 pb-8">
      {analysis.codeQualityScore !== null && analysis.codeQualityScore !== undefined && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="font-mono text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> Code Quality Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className={`text-4xl font-bold font-mono ${
                analysis.codeQualityScore >= 8 ? 'text-green-500' :
                analysis.codeQualityScore >= 5 ? 'text-amber-500' : 'text-red-500'
              }`}>
                {analysis.codeQualityScore}/10
              </div>
              <div className="flex-1 max-w-md h-4 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    analysis.codeQualityScore >= 8 ? 'bg-green-500' :
                    analysis.codeQualityScore >= 5 ? 'bg-amber-500' : 'bg-red-500'
                  }`} 
                  style={{ width: `${(analysis.codeQualityScore / 10) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {analysis.bugDetection && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="font-mono text-lg flex items-center gap-2 text-red-400">
              <AlertCircle className="h-5 w-5" /> Bug Detection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none font-mono text-sm prose-p:leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysis.bugDetection}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {analysis.securityAnalysis && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="font-mono text-lg flex items-center gap-2 text-purple-400">
              <Shield className="h-5 w-5" /> Security Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none font-mono text-sm prose-p:leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysis.securityAnalysis}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="font-mono text-lg flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary" /> Architecture Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-invert max-w-none font-mono text-sm prose-p:leading-relaxed prose-pre:bg-[#14151a] prose-pre:border prose-pre:border-border/50 prose-headings:text-foreground">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {analysis.architectureOverview || "*No architecture overview provided.*"}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="font-mono text-lg flex items-center gap-2">
              <FileCode2 className="h-5 w-5 text-primary" /> Important Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.importantFiles.map((file: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-sm font-mono bg-secondary/20 p-2 rounded border border-border/30">
                  <Terminal className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span className="break-all">{file}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="font-mono text-lg flex items-center gap-2">
              <Blocks className="h-5 w-5 text-primary" /> Coding Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysis.codingPatterns.map((pattern: string, idx: number) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                  <span>{pattern}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="font-mono text-lg text-amber-400 flex items-center gap-2">
            <Zap className="h-5 w-5" /> Suggested Improvements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {analysis.suggestedImprovements.map((improvement: string, idx: number) => (
              <li key={idx} className="text-sm flex items-start gap-2 bg-amber-500/5 p-3 rounded border border-amber-500/10">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                <span className="text-amber-100/80">{improvement}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {analysis.performanceSuggestions && analysis.performanceSuggestions.length > 0 && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="font-mono text-lg flex items-center gap-2 text-blue-400">
              <Zap className="h-5 w-5" /> Performance Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysis.performanceSuggestions.map((suggestion: string, idx: number) => (
                <li key={idx} className="text-sm flex items-start gap-2 bg-blue-500/5 p-3 rounded border border-blue-500/10">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5" />
                  <span className="text-blue-100/80">{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {analysis.bestPractices && analysis.bestPractices.length > 0 && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="font-mono text-lg flex items-center gap-2 text-green-400">
              <CheckCircle className="h-5 w-5" /> Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysis.bestPractices.map((practice: string, idx: number) => (
                <li key={idx} className="text-sm flex items-start gap-2 bg-green-500/5 p-3 rounded border border-green-500/10">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-400 shrink-0 mt-1.5" />
                  <span className="text-green-100/80">{practice}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Custom hook to handle SSE Chat streaming
function useChatStream(conversationId: number | null) {
  const [messages, setMessages] = useState<any[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");
  const queryClient = useQueryClient();

  const sendMessage = async (content: string) => {
    if (!conversationId) return;

    // Optimistically add user message
    const tempUserMsg = { id: Date.now(), role: 'user', content, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, tempUserMsg]);
    
    setIsStreaming(true);
    setStreamedContent("");

    try {
      const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "") + "/";
      const response = await fetch(`${BASE_URL}api/openai/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
        credentials: 'include',
      });
      
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = decoder.decode(value);
        const lines = text.split('\n').filter(l => l.startsWith('data: '));
        
        for (const line of lines) {
          try {
            const event = JSON.parse(line.slice(6));
            if (event.content) {
              fullContent += event.content;
              setStreamedContent(fullContent);
            }
            if (event.done) {
              // Finish stream
            }
          } catch {}
        }
      }

      // Add final assistant message
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: fullContent,
        createdAt: new Date().toISOString()
      }]);

    } catch (e) {
      console.error(e);
      // Optional: Handle error UI
    } finally {
      setIsStreaming(false);
      setStreamedContent("");
      // Invalidate queries to sync with backend
      queryClient.invalidateQueries({ queryKey: getGetOpenaiConversationQueryKey(conversationId) });
    }
  };

  return { messages, setMessages, isStreaming, streamedContent, sendMessage };
}

function ChatTab({ projectId }: { projectId: number }) {
  const { data: conversations, isLoading: isConvsLoading } = useListOpenaiConversations();
  const createConversation = useCreateOpenaiConversation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const projectConversation = conversations?.find(c => c.projectId === projectId);
  
  const { data: convData, isLoading: isConvDataLoading } = useGetOpenaiConversation(
    projectConversation?.id || 0,
    { query: { queryKey: getGetOpenaiConversationQueryKey(projectConversation?.id || 0), enabled: !!projectConversation } }
  );

  const { messages, setMessages, isStreaming, streamedContent, sendMessage } = useChatStream(projectConversation?.id || null);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync server messages on load
  useEffect(() => {
    if (convData?.messages && !isStreaming) {
      setMessages(convData.messages);
    }
  }, [convData, isStreaming, setMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamedContent]);

  const handleStartChat = async () => {
    try {
      await createConversation.mutateAsync({
        data: { title: `Chat for Project ${projectId}`, projectId }
      });
      queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
    } catch (e) {
      toast({ title: "Error", description: "Failed to initialize chat.", variant: "destructive" });
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming || !projectConversation) return;
    sendMessage(input);
    setInput("");
  };

  if (isConvsLoading || (projectConversation && isConvDataLoading)) {
    return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;
  }

  if (!projectConversation) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-card/30 rounded-xl border border-dashed border-border/50 text-center">
        <MessageSquare className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-xl font-bold font-mono text-foreground mb-2">No active conversation</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-6 font-mono text-sm">
          Start an AI chat session to ask specific questions about this codebase's architecture, patterns, or get code examples.
        </p>
        <Button 
          onClick={handleStartChat} 
          disabled={createConversation.isPending}
          className="bg-primary text-black hover:bg-primary/90 font-mono shadow-[0_0_15px_-3px_rgba(11,217,235,0.4)] border-0"
        >
          {createConversation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-2 h-4 w-4" />}
          Initialize Chat Interface
        </Button>
      </div>
    );
  }

  return (
    <Card className="h-full flex flex-col bg-card/50 border-border/50 overflow-hidden">
      <CardHeader className="py-3 px-4 border-b border-border/50 shrink-0 bg-secondary/10">
        <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
          <Terminal className="h-4 w-4 text-primary" /> XbarzForge AI Assistant
        </div>
      </CardHeader>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 font-mono text-sm">
            <Bot className="h-12 w-12 mb-4 opacity-20" />
            <p>I have fully mapped this repository.</p>
            <p>Ask me anything about its architecture, functions, or patterns.</p>
          </div>
        ) : (
          messages.map((msg: any, idx: number) => (
            <div key={msg.id || idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="h-8 w-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              
              <div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${
                msg.role === 'user' 
                  ? 'bg-primary text-black font-mono shadow-[0_0_15px_-3px_rgba(11,217,235,0.2)]' 
                  : 'bg-secondary/30 border border-border/50 font-sans prose prose-invert prose-p:leading-relaxed prose-pre:bg-[#14151a] prose-pre:border prose-pre:border-border/50 max-w-none'
              }`}>
                {msg.role === 'user' ? (
                  msg.content
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
              
              {msg.role === 'user' && (
                <div className="h-8 w-8 rounded bg-secondary flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))
        )}

        {isStreaming && (
          <div className="flex gap-4">
            <div className="h-8 w-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="max-w-[85%] rounded-xl px-4 py-3 text-sm bg-secondary/30 border border-border/50 font-sans prose prose-invert prose-p:leading-relaxed prose-pre:bg-[#14151a] prose-pre:border prose-pre:border-border/50 max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {streamedContent || "▋"}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border/50 shrink-0 bg-secondary/5">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Query the codebase..."
            disabled={isStreaming}
            className="flex-1 bg-card/50 border-border/50 font-mono text-sm focus-visible:ring-primary/50"
          />
          <Button 
            type="submit" 
            disabled={isStreaming || !input.trim()}
            className="bg-primary text-black hover:bg-primary/90 shrink-0"
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}

function DocsTab({ projectId, setAiDisabledError }: { projectId: number, setAiDisabledError: (b: boolean) => void }) {
  const { data: docs, isLoading } = useListProjectDocs(projectId);
  const createDoc = useCreateProjectDoc();
  const deleteDoc = useDeleteProjectDoc();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [docType, setDocType] = useState<"readme" | "api" | "architecture" | "setup" | "onboarding">("readme");

  const selectedDoc = docs?.find(d => d.id === selectedDocId);

  const handleGenerate = async () => {
    try {
      setAiDisabledError(false);
      const result = await createDoc.mutateAsync({
        id: projectId,
        data: { type: docType }
      });
      toast({ title: "Document Generated", description: "Successfully created documentation." });
      queryClient.invalidateQueries({ queryKey: getListProjectDocsQueryKey(projectId) });
      setSelectedDocId(result.id);
    } catch (e: any) {
      const status = e?.status ?? e?.response?.status ?? 0;
      const body = JSON.stringify(e ?? '');
      if (status === 503 || status === 429 || body.includes('disabled') || body.includes('AI') || body.includes('OpenAI') || body.includes('quota') || body.includes('key')) {
        setAiDisabledError(true);
      } else {
        toast({ title: "Error", description: "Failed to generate documentation.", variant: "destructive" });
      }
    }
  };

  const handleDelete = async (docId: number) => {
    try {
      await deleteDoc.mutateAsync({ id: projectId, docId });
      toast({ title: "Document Deleted", description: "The file was removed." });
      queryClient.invalidateQueries({ queryKey: getListProjectDocsQueryKey(projectId) });
      if (selectedDocId === docId) setSelectedDocId(null);
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete document.", variant: "destructive" });
    }
  };

  const copyToClipboard = () => {
    if (selectedDoc) {
      navigator.clipboard.writeText(selectedDoc.content);
      toast({ title: "Copied", description: "Markdown copied to clipboard." });
    }
  };

  const downloadMarkdown = () => {
    if (selectedDoc) {
      const blob = new Blob([selectedDoc.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedDoc.title.replace(/\s+/g, '_').toLowerCase()}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="h-full flex gap-6 pb-8">
      {/* Sidebar for Docs List */}
      <Card className="w-1/3 flex flex-col bg-card/50 border-border/50 shrink-0">
        <CardHeader className="py-4 px-4 border-b border-border/50 shrink-0">
          <CardTitle className="font-mono text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> Generated Files
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoading ? (
            <div className="space-y-2 p-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : docs && docs.length > 0 ? (
            docs.map(doc => (
              <button
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={`w-full text-left px-3 py-2 rounded text-sm font-mono flex items-center justify-between group transition-colors
                  ${selectedDocId === doc.id ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-secondary/50 text-muted-foreground'}
                `}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="h-3 w-3 shrink-0" />
                  <span className="truncate">{doc.title}</span>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Trash2 className="h-3 w-3 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity shrink-0 ml-2" onClick={(e) => e.stopPropagation()} />
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-mono">Delete Document?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete "{doc.title}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="font-mono">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(doc.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-mono">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground font-mono text-sm opacity-50">
              No documents generated yet.
            </div>
          )}
        </CardContent>
        <div className="p-4 border-t border-border/50 shrink-0 space-y-3 bg-secondary/10">
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Generate New</div>
          <Select value={docType} onValueChange={(val: any) => setDocType(val)}>
            <SelectTrigger className="font-mono text-sm bg-card">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border font-mono">
              <SelectItem value="readme">README.md</SelectItem>
              <SelectItem value="api">API Specification</SelectItem>
              <SelectItem value="architecture">Architecture Guide</SelectItem>
              <SelectItem value="setup">Setup Instructions</SelectItem>
              <SelectItem value="onboarding">Onboarding Guide</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            className="w-full bg-primary text-black hover:bg-primary/90 font-mono shadow-[0_0_15px_-3px_rgba(11,217,235,0.3)] border-0" 
            onClick={handleGenerate}
            disabled={createDoc.isPending}
          >
            {createDoc.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
            Generate
          </Button>
        </div>
      </Card>

      {/* Main Document Viewer */}
      <Card className="flex-1 flex flex-col bg-card/50 border-border/50 overflow-hidden">
        {selectedDoc ? (
          <>
            <CardHeader className="py-3 px-4 border-b border-border/50 shrink-0 flex flex-row items-center justify-between bg-secondary/5">
              <CardTitle className="font-mono text-sm flex items-center gap-2">
                {selectedDoc.title}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-8 font-mono text-xs hover:text-primary">
                  <Copy className="h-3 w-3 mr-2" /> Copy
                </Button>
                <Button variant="ghost" size="sm" onClick={downloadMarkdown} className="h-8 font-mono text-xs hover:text-primary">
                  <Download className="h-3 w-3 mr-2" /> Download
                </Button>
              </div>
            </CardHeader>
            <ScrollArea className="flex-1 bg-[#0a0a0c] p-6">
              <div className="prose prose-invert max-w-4xl mx-auto font-sans prose-p:leading-relaxed prose-pre:bg-[#14151a] prose-pre:border prose-pre:border-border/50">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selectedDoc.content}
                </ReactMarkdown>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 font-mono text-sm p-8 text-center">
            <FileText className="h-16 w-16 mb-4 opacity-20" />
            <p>Select a document from the sidebar to view it.</p>
            <p>Or generate a new one to document this codebase.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
