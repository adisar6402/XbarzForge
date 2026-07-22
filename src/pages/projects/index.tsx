import { Link } from "wouter";
import { ArrowRight, FolderCode, Plus, Search, Terminal, Trash2 } from "lucide-react";
import { useListProjects, useDeleteProject } from "@/lib/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getListProjectsQueryKey } from "@/lib/api-client-react";
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

export default function Projects() {
  const { data: projects, isLoading } = useListProjects();
  console.log("projects =", projects);
  const deleteProject = useDeleteProject();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const filteredProjects = projects?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = async (id: number) => {
    try {
      await deleteProject.mutateAsync({ id });
      toast({
        title: "Project deleted",
        description: "The project has been successfully removed.",
      });
      queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to delete project.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono">Projects_</h1>
            <p className="text-muted-foreground mt-2 font-mono text-sm">Manage your tracked codebases.</p>
          </div>
          <Link href="/projects/new">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono shadow-[0_0_15px_-3px_rgba(11,217,235,0.4)] border-0">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>

        <div className="flex items-center space-x-2 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search projects..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-secondary/30 border-border/50 font-mono"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48 w-full" />)}
          </div>
        ) : filteredProjects && filteredProjects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map(project => (
              <Card key={project.id} className="bg-card/50 border-border/50 hover:border-primary/30 transition-all group flex flex-col">
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-5 w-5 text-primary" />
                      <h3 className="font-bold font-mono text-lg truncate" title={project.name}>{project.name}</h3>
                    </div>
                    <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-wider
                      ${project.status === 'analyzed' ? 'border-green-500/50 text-green-400 bg-green-500/10' : ''}
                      ${project.status === 'analyzing' ? 'border-amber-500/50 text-amber-400 bg-amber-500/10 animate-pulse' : ''}
                      ${project.status === 'error' ? 'border-red-500/50 text-red-400 bg-red-500/10' : ''}
                      ${project.status === 'pending' ? 'border-gray-500/50 text-gray-400 bg-gray-500/10' : ''}
                    `}>
                      {project.status}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                    {project.description || "No description provided."}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                    <span className="text-xs text-muted-foreground font-mono bg-secondary/50 px-2 py-1 rounded">
                      {project.type === 'github' ? 'GitHub Repo' : 'Pasted Code'}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-card border-border">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-mono">Delete Project?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the project and all its generated analysis and documentation.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="font-mono">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(project.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-mono">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <Link href={`/projects/${project.id}`}>
                        <Button size="sm" variant="secondary" className="font-mono text-xs hover:bg-primary/20 hover:text-primary">
                          Open <ArrowRight className="ml-1 w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card/30 rounded-xl border border-dashed border-border/50">
            <FolderCode className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold font-mono text-foreground mb-2">No projects found</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              {search ? "No projects match your search query." : "You haven't added any projects yet. Initialize your first codebase to get started."}
            </p>
            {!search && (
              <Link href="/projects/new">
                <Button className="bg-primary text-black hover:bg-primary/90 font-mono">
                  <Plus className="mr-2 h-4 w-4" />
                  Initialize Project
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
