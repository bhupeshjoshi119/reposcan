import { Repository } from "@/pages/Index";
import { RepositoryListItem } from "@/components/RepositoryListItem";
import { Loader2 } from "lucide-react";

interface RepositoryListProps {
  repositories: Repository[];
  loading?: boolean;
  bookmarkedIds?: Set<number>;
  onBookmarkToggle?: (repo: Repository) => void;
  onCompareToggle?: (repo: Repository) => void;
  compareIds?: Set<number>;
  onForkAndCode?: (repo: Repository) => void;
}

export const RepositoryList = ({ 
  repositories, 
  loading, 
  bookmarkedIds, 
  onBookmarkToggle, 
  onCompareToggle,
  compareIds,
  onForkAndCode
}: RepositoryListProps) => {
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
    <div className="space-y-4">
      {repositories.map((repo) => (
        <RepositoryListItem 
          key={repo.id} 
          repository={repo}
          isBookmarked={bookmarkedIds?.has(repo.id)}
          onBookmarkToggle={() => onBookmarkToggle?.(repo)}
          onCompareToggle={onCompareToggle ? () => onCompareToggle(repo) : undefined}
          isInComparison={compareIds?.has(repo.id)}
          onForkAndCode={onForkAndCode ? () => onForkAndCode(repo) : undefined}
        />
      ))}
    </div>
  );
};