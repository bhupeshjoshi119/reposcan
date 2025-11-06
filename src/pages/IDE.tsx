import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Download, Save, Terminal } from 'lucide-react';
import { forkManager } from '@/services/forkManager';
import { fileSystemManager, type FileContent } from '@/services/fileSystemManager';
import { useToast } from '@/hooks/use-toast';
import type { Fork } from '@/services/githubApi';
import { CodeEditor } from '@/components/IDE/CodeEditor';
import { FileTree } from '@/components/IDE/FileTree';
import { AIAssistant } from '@/components/IDE/AIAssistant';

const IDE = () => {
  const { forkId } = useParams<{ forkId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fork, setFork] = useState<Fork | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentFile, setCurrentFile] = useState<FileContent | null>(null);
  const [fileTree, setFileTree] = useState<any[]>([]);
  const [showTerminal, setShowTerminal] = useState(false);

  useEffect(() => {
    const loadFork = async () => {
      if (!forkId) {
        navigate('/');
        return;
      }

      const decodedForkId = decodeURIComponent(forkId);

      try {
        const forkData = await forkManager.getForkStatus(decodedForkId);
        if (!forkData) {
          toast({
            title: "Fork Not Found",
            description: "The requested fork could not be found.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }
        setFork(forkData);
        
        // Load repository files
        await fileSystemManager.loadRepository(decodedForkId);
        setFileTree(fileSystemManager.getFileTree());
        
        // Auto-open README or first file
        const tree = fileSystemManager.getFileTree();
        const readmeFile = tree.find(f => f.name.toLowerCase().includes('readme'));
        const firstFile = tree.find(f => f.type === 'file');
        
        if (readmeFile && readmeFile.type === 'file') {
          handleFileSelect(readmeFile.path);
        } else if (firstFile) {
          handleFileSelect(firstFile.path);
        }
        
      } catch (error) {
        toast({
          title: "Error Loading Fork",
          description: "Failed to load fork data.",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadFork();
  }, [forkId, navigate, toast]);

  const handleFileSelect = async (path: string) => {
    try {
      const fileContent = await fileSystemManager.openFile(path);
      setCurrentFile(fileContent);
    } catch (error) {
      toast({
        title: "Error Opening File",
        description: `Failed to open ${path}`,
        variant: "destructive",
      });
    }
  };

  const handleFileCreate = (path: string) => {
    fileSystemManager.createFile(path);
    setFileTree([...fileSystemManager.getFileTree()]);
    handleFileSelect(path);
  };

  const handleContentChange = (path: string, content: string) => {
    fileSystemManager.saveFile(path, content);
    if (currentFile && currentFile.path === path) {
      setCurrentFile({ ...currentFile, content });
    }
  };

  const handleCodeInsert = (code: string) => {
    // This would insert code at cursor position in Monaco Editor
    // Implementation depends on Monaco Editor API
    console.log('Inserting code:', code);
  };

  const handleSave = () => {
    if (currentFile) {
      toast({
        title: "File Saved",
        description: `${currentFile.path} has been saved`,
      });
    }
  };

  const handleRun = () => {
    setShowTerminal(true);
    toast({
      title: "Running Project",
      description: "Starting development server...",
    });
  };

  const handleDownload = () => {
    const modifiedFiles = fileSystemManager.getModifiedFiles();
    // Implementation for downloading files as ZIP
    toast({
      title: "Download Started",
      description: `Downloading ${modifiedFiles.size} files...`,
    });
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading IDE...</p>
        </div>
      </div>
    );
  }

  if (!fork) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* IDE Header */}
      <div className="border-b border-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{fork.id}</span>
            <span className="text-muted-foreground text-sm">
              (forked from {fork.originalRepo})
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={handleRun}>
            <Play className="h-4 w-4 mr-2" />
            Run
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowTerminal(!showTerminal)}
          >
            <Terminal className="h-4 w-4 mr-2" />
            Terminal
          </Button>
        </div>
      </div>

      {/* IDE Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Tree Sidebar */}
        <FileTree
          files={fileTree}
          onFileSelect={handleFileSelect}
          onFileCreate={handleFileCreate}
          selectedFile={currentFile?.path}
          className="w-64 border-r border-border"
        />

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Editor Tabs */}
          {currentFile && (
            <div className="border-b border-border px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-background border border-border rounded-t text-sm">
                  {currentFile.path.split('/').pop()}
                </div>
              </div>
            </div>
          )}

          {/* Editor Content */}
          <div className="flex-1 flex">
            {/* Code Editor */}
            <CodeEditor
              file={currentFile}
              onContentChange={handleContentChange}
              className="flex-1"
            />

            {/* AI Assistant Panel */}
            <AIAssistant
              currentFile={currentFile?.path}
              onCodeInsert={handleCodeInsert}
              className="w-80 border-l border-border"
            />
          </div>

          {/* Terminal/Console */}
          {showTerminal && (
            <div className="h-32 border-t border-border bg-black text-green-400 p-4 font-mono text-sm">
              <div>$ npm start</div>
              <div>Starting development server...</div>
              <div>Server running on http://localhost:3000</div>
              <div className="animate-pulse">█</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IDE;