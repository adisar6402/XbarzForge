import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Terminal, Github, FileCode, ArrowLeft, UploadCloud, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateProject, getListProjectsQueryKey } from "@/lib/api-client-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const formSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  type: z.enum(["github", "paste", "upload"]),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  codeContent: z.string().optional(),
}).refine((data) => {
  if (data.type === "github" && !data.githubUrl) {
    return false;
  }
  if (data.type === "paste" && !data.codeContent) {
    return false;
  }
  return true;
}, {
  message: "Required field missing for selected input type",
  path: ["type"],
});

export default function NewProject() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createProject = useCreateProject();
  const queryClient = useQueryClient();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "github",
      githubUrl: "",
      codeContent: "",
    },
  });

  const projectType = form.watch("type");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (values.type === "upload" && selectedFiles.length === 0) {
        toast({ title: "No Files Selected", description: "Please select files to upload.", variant: "destructive" });
        return;
      }

      setIsUploading(true);
      const payload: any = {
        name: values.name,
        description: values.description,
        type: values.type,
      };
      
      if (values.type === 'github') payload.githubUrl = values.githubUrl;
      if (values.type === 'paste') payload.codeContent = values.codeContent;

      const result = await createProject.mutateAsync({ data: payload });

      if (values.type === 'upload') {
  const formData = new FormData();

  for (const file of selectedFiles) {
    formData.append('files', file);
  }

  const uploadResponse = await fetch(`/api/projects/${result.id}/upload`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!uploadResponse.ok) {
    throw new Error("Upload failed");
  }
}      
      queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
      
      toast({
        title: "Project Initialized",
        description: "Your project has been created successfully.",
      });
      
      setLocation(`/projects/${result.id}`);
    } catch (e) {
      toast({
        title: "Initialization Failed",
        description: "Could not create the project. Please check your inputs.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex gap-3">

  <Button 
    variant="ghost" 
    onClick={() => setLocation('/dashboard')}
    className="text-muted-foreground hover:text-foreground font-mono pl-0"
  >
    <ArrowLeft className="mr-2 h-4 w-4" />
    Dashboard
  </Button>

  <Button 
    variant="ghost" 
    onClick={() => setLocation('/projects')}
    className="text-muted-foreground hover:text-foreground font-mono"
  >
    Projects
  </Button>

</div>

<div>
  <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono flex items-center gap-3">
    <Terminal className="h-8 w-8 text-primary" />
    Initialize Project_
  </h1>

  <p className="text-muted-foreground mt-2 font-mono text-sm">
    Provide codebase access to begin analysis.
  </p>
</div>
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="font-mono">Project Configuration</CardTitle>
            <CardDescription>Setup metadata and input source</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono">Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. core-api-service" {...field} className="font-mono bg-secondary/30" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono">Description (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="What does this codebase do?" {...field} className="font-mono bg-secondary/30" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-mono">Input Method</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 md:grid-cols-3 gap-4"
                        >
                          <FormItem>
                            <FormControl>
                              <div className={`
                                border rounded-lg p-4 cursor-pointer transition-all flex flex-col items-center justify-center gap-3 h-32
                                ${field.value === 'github' ? 'border-primary bg-primary/5 shadow-[0_0_15px_-3px_rgba(11,217,235,0.2)]' : 'border-border bg-secondary/20 hover:bg-secondary/40'}
                              `} onClick={() => form.setValue('type', 'github')}>
                                <Github className={`h-8 w-8 ${field.value === 'github' ? 'text-primary' : 'text-muted-foreground'}`} />
                                <span className={`font-mono text-sm font-medium ${field.value === 'github' ? 'text-primary' : 'text-muted-foreground'}`}>
                                  GitHub Repository
                                </span>
                                <RadioGroupItem value="github" className="sr-only" />
                              </div>
                            </FormControl>
                          </FormItem>
                          <FormItem>
                            <FormControl>
                              <div className={`
                                border rounded-lg p-4 cursor-pointer transition-all flex flex-col items-center justify-center gap-3 h-32
                                ${field.value === 'paste' ? 'border-primary bg-primary/5 shadow-[0_0_15px_-3px_rgba(11,217,235,0.2)]' : 'border-border bg-secondary/20 hover:bg-secondary/40'}
                              `} onClick={() => form.setValue('type', 'paste')}>
                                <FileCode className={`h-8 w-8 ${field.value === 'paste' ? 'text-primary' : 'text-muted-foreground'}`} />
                                <span className={`font-mono text-sm font-medium ${field.value === 'paste' ? 'text-primary' : 'text-muted-foreground'}`}>
                                  Raw Code Paste
                                </span>
                                <RadioGroupItem value="paste" className="sr-only" />
                              </div>
                            </FormControl>
                          </FormItem>
                          <FormItem>
                            <FormControl>
                              <div className={`
                                border rounded-lg p-4 cursor-pointer transition-all flex flex-col items-center justify-center gap-3 h-32
                                ${field.value === 'upload' ? 'border-primary bg-primary/5 shadow-[0_0_15px_-3px_rgba(11,217,235,0.2)]' : 'border-border bg-secondary/20 hover:bg-secondary/40'}
                              `} onClick={() => form.setValue('type', 'upload')}>
                                <UploadCloud className={`h-8 w-8 ${field.value === 'upload' ? 'text-primary' : 'text-muted-foreground'}`} />
                                <span className={`font-mono text-sm font-medium ${field.value === 'upload' ? 'text-primary' : 'text-muted-foreground'}`}>
                                  Upload Files
                                </span>
                                <RadioGroupItem value="upload" className="sr-only" />
                              </div>
                            </FormControl>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {projectType === "github" && (
                  <FormField
                    control={form.control}
                    name="githubUrl"
                    render={({ field }) => (
                      <FormItem className="animate-in fade-in slide-in-from-top-2">
                        <FormLabel className="font-mono">Repository URL</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <div className="bg-secondary/50 border border-r-0 border-border/50 px-3 h-10 flex items-center rounded-l-md">
                              <Github className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <Input placeholder="https://github.com/username/repo" {...field} className="font-mono rounded-l-none bg-secondary/30" />
                          </div>
                        </FormControl>
                        <FormDescription className="font-mono text-xs">Public repositories only for this demo.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {projectType === "paste" && (
                  <FormField
                    control={form.control}
                    name="codeContent"
                    render={({ field }) => (
                      <FormItem className="animate-in fade-in slide-in-from-top-2">
                        <FormLabel className="font-mono">Raw Code</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Paste your source code here..." 
                            className="font-mono min-h-[200px] bg-secondary/30 font-sm" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {projectType === "upload" && (
                  <div className="animate-in fade-in slide-in-from-top-2 space-y-2">
                    <label className="font-mono text-sm font-medium leading-none">
                      Upload source files or a ZIP archive (max 30MB per file)
                    </label>
                    <div className="border-2 border-dashed border-border/50 rounded-lg p-6 bg-secondary/20 flex flex-col items-center justify-center gap-2">
                      <Input 
                        type="file" 
                        multiple 
                        accept=".zip,.ts,.tsx,.js,.jsx,.py,.rb,.go,.rs,.java,.cs,.cpp,.c,.h,.md,.json,.yaml,.yml,.toml,.html,.css,.scss"
                        onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                        className="max-w-xs cursor-pointer font-mono file:bg-primary file:text-black file:border-0 file:rounded file:px-2 file:py-1 file:mr-4 file:font-mono file:text-xs file:font-bold" 
                      />
                      {selectedFiles.length > 0 && (
                        <p className="text-sm font-mono text-primary mt-2">
                          {selectedFiles.length} file(s) selected
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  <Button 
                    type="submit" 
                    className="bg-primary text-black hover:bg-primary/90 font-mono shadow-[0_0_15px_-3px_rgba(11,217,235,0.4)] border-0"
                    disabled={createProject.isPending || isUploading}
                  >
                    {(createProject.isPending || isUploading) ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                        {isUploading ? "Uploading and processing files..." : "Initializing..."}
                      </>
                    ) : "Create Project"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
