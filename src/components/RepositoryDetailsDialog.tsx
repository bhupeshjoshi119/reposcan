import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Brain, BarChart3 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AICodeGenerator from "./AICodeGenerator";
import RealtimeAnalyticsDashboard from "./RealtimeAnalyticsDashboard";
import { ForkButton } from "./ForkButton";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  topics?: string[];
  license?: { name: string } | null;
}

interface RepositoryDetailsDialogProps {
  repository: Repository | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}


export const RepositoryDetailsDialog = ({
  repository,
  open,
  onOpenChange,
}: RepositoryDetailsDialogProps) => {
  const handleClose = () => {
    onOpenChange(false);
  };

  if (!repository) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0" aria-describedby="repository-details-description">
        <div className="p-6 pb-4 border-b border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <span className="truncate">{repository.full_name}</span>
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="shrink-0"
              >
                <a href={repository.html_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </DialogTitle>
            <DialogDescription id="repository-details-description">
              Repository details and development actions
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="overview" className="flex flex-col h-full">
            <div className="px-6 pt-4 border-b">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="ai-generator">
                  <Brain className="h-4 w-4 mr-2" />
                  AI Generator
                </TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6 pr-3 pb-6">
                  {/* Repository Info */}
                  <div className="space-y-3">
                    {repository.description && (
                      <p className="text-muted-foreground">{repository.description}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      {repository.language && (
                        <Badge variant="secondary">{repository.language}</Badge>
                      )}
                      <Badge variant="outline">⭐ {repository.stargazers_count}</Badge>
                      <Badge variant="outline">🔀 {repository.forks_count}</Badge>
                      {repository.license && (
                        <Badge variant="outline">{repository.license.name}</Badge>
                      )}
                    </div>

                    {repository.topics && repository.topics.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {repository.topics.map((topic) => (
                          <Badge key={topic} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border">
                      <div className="text-2xl font-bold">{repository.stargazers_count}</div>
                      <div className="text-sm text-muted-foreground">Stars</div>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <div className="text-2xl font-bold">{repository.forks_count}</div>
                      <div className="text-sm text-muted-foreground">Forks</div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="analytics" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className="flex-1 p-6">
                <div className="pr-3 pb-6">
                  <RealtimeAnalyticsDashboard repository={repository.full_name} />
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="ai-generator" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className="flex-1 p-6">
                <div className="pr-3 pb-6">
                  <AICodeGenerator
                    issueTitle="Performance optimization needed"
                    issueDescription="The application is experiencing slow rendering times"
                    repository={repository.full_name}
                    language={repository.language || 'JavaScript'}
                  />
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="actions" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6 pr-3 pb-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Development Actions</h4>
                    
                    <ForkButton 
                      owner={repository.full_name.split('/')[0]}
                      repo={repository.full_name.split('/')[1]}
                      fullName={repository.full_name}
                      className="w-full"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="w-full">
                        Clone Repository
                      </Button>
                      <Button variant="outline" className="w-full">
                        Download ZIP
                      </Button>
                      <Button variant="outline" className="w-full">
                        Create Issue
                      </Button>
                      <Button variant="outline" className="w-full">
                        View Insights
                      </Button>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
