import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useSearch, getSearchQueryKey } from "@workspace/api-client-react";
import { Search as SearchIcon, FolderCode, FileText, MessageSquare, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const enabled = debouncedTerm.length >= 2;
  const { data, isLoading } = useSearch({ q: debouncedTerm }, { query: { queryKey: getSearchQueryKey({ q: debouncedTerm }), enabled } });

  return (
    <div className="flex flex-col flex-1 p-8 overflow-auto">
      <div className="max-w-4xl mx-auto w-full space-y-8 pb-20">
        <div className="flex items-center gap-3 mb-6">
          <SearchIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono">
            Global Search_
          </h1>
        </div>

        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects, docs, and conversations..." 
            className="pl-12 h-14 font-mono text-lg bg-card/50 border-border/50 focus-visible:ring-primary/50 rounded-xl"
          />
        </div>

        {!enabled ? (
          <div className="text-center py-20 text-muted-foreground font-mono">
            <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Type at least 2 characters to search</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : data ? (
          <div className="space-y-8">
            {(!data.projects?.length && !data.docs?.length && !data.conversations?.length) ? (
              <div className="text-center py-20 text-muted-foreground font-mono">
                <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No results found for "{debouncedTerm}"</p>
              </div>
            ) : (
              <>
                {data.projects && data.projects.length > 0 && (
                  <section className="space-y-4">
                    <h2 className="text-xl font-mono text-foreground flex items-center gap-2 border-b border-border/50 pb-2">
                      <FolderCode className="h-5 w-5 text-primary" /> Projects
                    </h2>
                    <div className="grid gap-3">
                      {data.projects.map((p) => (
                        <Link key={p.id} href={`/projects/${p.id}`} className="block outline-none">
                          <Card className="bg-card/50 border-border/50 hover:border-primary/50 transition-colors cursor-pointer group">
                            <CardContent className="p-4 flex justify-between items-center">
                              <div>
                                <div className="font-mono font-bold text-foreground group-hover:text-primary transition-colors">{p.name}</div>
                                {p.description && <div className="text-sm text-muted-foreground font-mono line-clamp-1 mt-1">{p.description}</div>}
                              </div>
                              <Badge variant="outline" className="font-mono uppercase">{p.type}</Badge>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {data.docs && data.docs.length > 0 && (
                  <section className="space-y-4">
                    <h2 className="text-xl font-mono text-foreground flex items-center gap-2 border-b border-border/50 pb-2">
                      <FileText className="h-5 w-5 text-primary" /> Documentation
                    </h2>
                    <div className="grid gap-3">
                      {data.docs.map((d) => (
                        <Link key={d.id} href={`/projects/${d.projectId}?tab=docs`} className="block outline-none">
                          <Card className="bg-card/50 border-border/50 hover:border-primary/50 transition-colors cursor-pointer group">
                            <CardContent className="p-4">
                              <div className="font-mono font-bold text-foreground group-hover:text-primary transition-colors">{d.title}</div>
                              <div className="text-sm text-muted-foreground font-mono mt-1">Project ID: {d.projectId}</div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {data.conversations && data.conversations.length > 0 && (
                  <section className="space-y-4">
                    <h2 className="text-xl font-mono text-foreground flex items-center gap-2 border-b border-border/50 pb-2">
                      <MessageSquare className="h-5 w-5 text-primary" /> Conversations
                    </h2>
                    <div className="grid gap-3">
                      {data.conversations.map((c) => (
                        <Link key={c.id} href={`/projects/${c.projectId}?tab=chat`} className="block outline-none">
                          <Card className="bg-card/50 border-border/50 hover:border-primary/50 transition-colors cursor-pointer group">
                            <CardContent className="p-4 flex justify-between items-center">
                              <div className="font-mono font-bold text-foreground group-hover:text-primary transition-colors">{c.title}</div>
                              <div className="text-xs text-muted-foreground font-mono">{new Date(c.createdAt).toLocaleDateString()}</div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
