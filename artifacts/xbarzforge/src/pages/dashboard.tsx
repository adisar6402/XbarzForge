import { Link } from "wouter";
import { FolderCode, Activity, FileText, MessageSquare, ArrowRight, Clock, Plus } from "lucide-react";
import { useGetDashboard } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

function StatCard({ title, value, icon: Icon, description, isLoading }: any) {
  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm relative overflow-hidden group">
      <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
        <Icon className="h-24 w-24" />
      </div>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium font-mono text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-3xl font-bold font-mono">{value}</div>
        )}
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data, isLoading } = useGetDashboard();

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono">Dashboard_</h1>
            <p className="text-muted-foreground mt-2 font-mono text-sm">Overview of your codebase intelligence.</p>
          </div>
          <Link href="/projects/new">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono shadow-[0_0_15px_-3px_rgba(11,217,235,0.4)] border-0">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Projects" 
            value={data?.projectCount || 0} 
            icon={FolderCode} 
            description="Repositories tracked"
            isLoading={isLoading} 
          />
          <StatCard 
            title="Analyses Run" 
            value={data?.analysisCount || 0} 
            icon={Activity} 
            description="AI scans completed"
            isLoading={isLoading} 
          />
          <StatCard 
            title="Generated Docs" 
            value={data?.docCount || 0} 
            icon={FileText} 
            description="Markdown files created"
            isLoading={isLoading} 
          />
          <StatCard 
            title="Conversations" 
            value={data?.conversationCount || 0} 
            icon={MessageSquare} 
            description="Chat threads active"
            isLoading={isLoading} 
          />
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="bg-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-mono">Recent Projects</CardTitle>
                <CardDescription>Latest codebases added</CardDescription>
              </div>
              <Link href="/projects">
                <Button variant="ghost" size="sm" className="font-mono text-xs text-primary hover:text-primary/80 hover:bg-primary/10">
                  View All <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : data?.recentProjects && data.recentProjects.length > 0 ? (
                <div className="space-y-4">
                  {data.recentProjects.map(project => (
                    <Link key={project.id} href={`/projects/${project.id}`}>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/60 border border-transparent hover:border-border transition-all cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <FolderCode className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          <div>
                            <p className="font-medium font-mono group-hover:text-primary transition-colors">{project.name}</p>
                            <p className="text-xs text-muted-foreground mt-1 capitalize font-mono">{project.type}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={`font-mono text-xs
                          ${project.status === 'analyzed' ? 'border-green-500/50 text-green-400 bg-green-500/10' : ''}
                          ${project.status === 'analyzing' ? 'border-amber-500/50 text-amber-400 bg-amber-500/10 animate-pulse' : ''}
                          ${project.status === 'error' ? 'border-red-500/50 text-red-400 bg-red-500/10' : ''}
                          ${project.status === 'pending' ? 'border-gray-500/50 text-gray-400 bg-gray-500/10' : ''}
                        `}>
                          {project.status}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-secondary/10 rounded-lg border border-dashed border-border/50">
                  <FolderCode className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm font-mono mb-4">No projects initialized yet.</p>
                  <Link href="/projects/new">
                    <Button variant="outline" size="sm" className="font-mono">Initialize Project</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-mono">Recent Activity</CardTitle>
                <CardDescription>Latest AI insights</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : data?.recentAnalyses && data.recentAnalyses.length > 0 ? (
                <div className="space-y-4">
                  {data.recentAnalyses.map(analysis => (
                    <Link key={analysis.id} href={`/projects/${analysis.projectId}`}>
                      <div className="flex flex-col p-4 rounded-lg bg-secondary/30 hover:bg-secondary/60 border border-transparent hover:border-border transition-all cursor-pointer group gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm font-mono group-hover:text-primary transition-colors">{analysis.projectName}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                            <Clock className="h-3 w-3" />
                            {new Date(analysis.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {analysis.summary}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-secondary/10 rounded-lg border border-dashed border-border/50">
                  <Activity className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm font-mono">No recent analysis activity.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}