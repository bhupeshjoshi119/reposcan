import { Repository } from "@/pages/Index";
import { RepositoryCard } from "./RepositoryCard";
import { Loader2 } from "lucide-react";

interface RepositoryGridProps {
  repositories: Repository[];
  loading?: boolean;
  bookmarkedIds?: Set<number>;
  onBookmarkToggle?: (repo: Repository) => void;
  onCompareToggle?: (repo: Repository) => void;
  compareIds?: Set<number>;
  onForkAndCode?: (repo: Repository) => void;
  onViewAnalysis?: (repo: Repository) => void;
}

export const RepositoryGrid = ({ 
  repositories, 
  loading, 
  bookmarkedIds, 
  onBookmarkToggle, 
  onCompareToggle,
  compareIds,
  onForkAndCode,
  onViewAnalysis
}: RepositoryGridProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (repositories.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground text-lg">No repositories found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {repositories.map((repo) => (
        <RepositoryCard 
          key={repo.id} 
          repository={repo}
          isBookmarked={bookmarkedIds?.has(repo.id)}
          onBookmarkToggle={() => onBookmarkToggle?.(repo)}
          onCompareToggle={onCompareToggle ? () => onCompareToggle(repo) : undefined}
          isInComparison={compareIds?.has(repo.id)}
          onForkAndCode={onForkAndCode ? () => onForkAndCode(repo) : undefined}
          onViewAnalysis={onViewAnalysis ? () => onViewAnalysis(repo) : undefined}
        />
      ))}
    </div>
  );
};
