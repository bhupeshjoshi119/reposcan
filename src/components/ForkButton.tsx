import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GitFork, Loader2, Code } from 'lucide-react';
import { forkManager } from '@/services/forkManager';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ForkButtonProps {
  owner: string;
  repo: string;
  fullName: string;
  className?: string;
}

export const ForkButton = ({ owner, repo, fullName, className }: ForkButtonProps) => {
  const [isForking, setIsForking] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if repository is already forked
  const existingFork = forkManager.getForkByOriginalRepo(fullName);
  const isForked = !!existingFork;

  const handleFork = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isForked && existingFork) {
      // Navigate to IDE for existing fork
      navigate(`/ide/${encodeURIComponent(existingFork.id)}`);
      return;
    }

    setIsForking(true);
    
    try {
      const result = await forkManager.forkRepository(owner, repo);
      
      if (result.success) {
        toast({
          title: "Repository Forked!",
          description: `Successfully forked ${fullName}. Opening AI coding environment...`,
        });
        
        // Navigate to IDE with the new fork
        setTimeout(() => {
          navigate(`/ide/${encodeURIComponent(result.forkId)}`);
        }, 1000);
      } else {
        toast({
          title: "Fork Failed",
          description: result.error || "Failed to fork repository",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Fork Error",
        description: "An unexpected error occurred while forking",
        variant: "destructive",
      });
    } finally {
      setIsForking(false);
    }
  };

  return (
    <Button
      variant={isForked ? "default" : "outline"}
      size="sm"
      onClick={handleFork}
      disabled={isForking}
      className={className}
    >
      {isForking ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Forking...
        </>
      ) : isForked ? (
        <>
          <Code className="h-4 w-4 mr-2" />
          Code with AI
        </>
      ) : (
        <>
          <GitFork className="h-4 w-4 mr-2" />
          Fork & Code
        </>
      )}
    </Button>
  );
};