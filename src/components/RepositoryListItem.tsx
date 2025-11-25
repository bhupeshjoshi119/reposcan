import { useState } from "react";
import { Repository } from "@/pages/Index";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, GitFork, Calendar, Bookmark, Copy, Check, GitCompare, AlertCircle, Code2, Loader2, Sparkles, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";


interface RepositoryListItemProps {
  repository: Repository;
  isBookmarked?: boolean;
  onBookmarkToggle?: (repo: Repository) => void;
  onCompareToggle?: () => void;
  isInComparison?: boolean;
  onForkAndCode?: (repo: Repository) => void;
  onViewAnalysis?: (repo: Repository) => void;
}

const languageColors: Record<string, string> = {
  JavaScript: "bg-yellow-500",
  TypeScript: "bg-blue-500",
  Python: "bg-blue-600",
  Java: "bg-orange-600",
  Go: "bg-cyan-500",
  Rust: "bg-orange-500",
  Ruby: "bg-red-500",
  PHP: "bg-purple-500",
  C: "bg-gray-500",
  "C++": "bg-pink-500",
  "C#": "bg-green-600",
  Swift: "bg-orange-400",
  Kotlin: "bg-purple-600",
};

// Calculate repository quality score based on multiple factors
function calculateQualityScore(repo: Repository): number {
  let score = 0;
  
  // Stars (max 3 points)
  if (repo.stargazers_count > 10000) score += 3;
  else if (repo.stargazers_count > 1000) score += 2;
  else if (repo.stargazers_count > 100) score += 1;
  
  // Recent activity (max 2 points)
  const daysSinceUpdate = (Date.now() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceUpdate < 7) score += 2;
  else if (daysSinceUpdate < 30) score += 1;
  
  // Has description (1 point)
  if (repo.description) score += 1;
  
  // Has topics/tags (1 point)
  if (repo.topics && repo.topics.length > 0) score += 1;
  
  // Forks indicate usefulness (max 2 points)
  if (repo.forks_count > 1000) score += 2;
  else if (repo.forks_count > 100) score += 1;
  
  // Low open issues relative to size (1 point)
  if (repo.stargazers_count > 100 && repo.open_issues_count < 20) score += 1;
  
  return score; // Max score: 10
}

export const RepositoryListItem = ({ 
  repository, 
  isBookmarked, 
  onBookmarkToggle, 
  onCompareToggle,
  isInComparison,
  onForkAndCode,
  onViewAnalysis
}: RepositoryListItemProps) => {
  const [copied, setCopied] = useState(false);
  const [isForking, setIsForking] = useState(false);
  const { toast } = useToast();

  const qualityScore = calculateQualityScore(repository);

  const copyCloneCommand = () => {
    navigator.clipboard.writeText(`git clone ${repository.html_url}.git`);
    setCopied(true);
    toast({ description: "Clone command copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const languageColor = repository.language 
    ? languageColors[repository.language] || "bg-gray-500"
    : "bg-gray-500";

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border hover:border-primary/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <img 
            src={repository.owner.avatar_url} 
            alt={repository.owner.login}
            className="w-12 h-12 rounded-full border-2 border-border flex-shrink-0"
          />
          
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold group-hover:text-primary transition-colors truncate">
                    <a 
                      href={repository.html_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {repository.name}
                    </a>
                  </h3>
                  {qualityScore >= 7 && (
                    <Badge variant="default" className="bg-gradient-to-r from-primary to-accent text-xs">
                      ⭐ High Quality
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  by {repository.owner.login}
                </p>
                {repository.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {repository.description}
                  </p>
                )}
              </div>
            </div>

            {/* Topics */}
            {repository.topics && repository.topics.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {repository.topics.slice(0, 6).map((topic) => (
                  <Badge 
                    key={topic} 
                    variant="secondary" 
                    className="text-xs"
                  >
                    {topic}
                  </Badge>
                ))}
                {repository.topics.length > 6 && (
                  <Badge variant="secondary" className="text-xs">
                    +{repository.topics.length - 6}
                  </Badge>
                )}
              </div>
            )}

            {/* Stats and Language */}
            <div className="flex items-center gap-6 text-sm mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">{repository.stargazers_count.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <GitFork className="w-4 h-4 text-blue-500" />
                <span>{repository.forks_count.toLocaleString()}</span>
              </div>
              {repository.open_issues_count > 0 && (
                <div className="flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  <span>{repository.open_issues_count}</span>
                </div>
              )}
              {repository.language && (
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${languageColor}`} />
                  <span className="font-medium">{repository.language}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Updated {formatDistanceToNow(new Date(repository.updated_at), { addSuffix: true })}</span>
              </div>
            </div>

            {/* Primary Action */}
            {onForkAndCode && (
              <div className="mb-3">
                <Button
                  onClick={async () => {
                    setIsForking(true);
                    try {
                      await onForkAndCode(repository);
                    } finally {
                      setIsForking(false);
                    }
                  }}
                  disabled={isForking}
                  className="bg-gradient-to-r from-primary via-accent to-primary hover:opacity-90 transition-all duration-300 gap-2 relative overflow-hidden group"
                  size="sm"
                >
                  {isForking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Setting up AI Environment...
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4" />
                        <span>Fork & Code with AI</span>
                        <Sparkles className="w-4 h-4 animate-pulse" />
                      </div>
                      {/* Animated background effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {onViewAnalysis && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewAnalysis(repository)}
                  className="gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary"
                >
                  <FileText className="w-4 h-4" />
                  Analysis
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={copyCloneCommand}
                className="gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Clone"}
              </Button>
              {onBookmarkToggle && (
                <Button
                  variant={isBookmarked ? "default" : "outline"}
                  size="sm"
                  onClick={() => onBookmarkToggle(repository)}
                  className="gap-2"
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
                  {isBookmarked ? "Saved" : "Save"}
                </Button>
              )}
              {onCompareToggle && (
                <Button
                  variant={isInComparison ? "default" : "outline"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCompareToggle();
                  }}
                  className="gap-2"
                  title={isInComparison ? "Remove from comparison" : "Add to comparison"}
                >
                  <GitCompare className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};