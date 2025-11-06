import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { FileNode } from '@/services/fileSystemManager';

interface FileTreeProps {
  files: FileNode[];
  onFileSelect: (path: string) => void;
  onFileCreate: (path: string) => void;
  selectedFile?: string;
  className?: string;
}

export const FileTree = ({ files, onFileSelect, onFileCreate, selectedFile, className }: FileTreeProps) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['']));
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFiles, setFilteredFiles] = useState<FileNode[]>(files);

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredFiles(files);
      return;
    }

    const filterNodes = (nodes: FileNode[]): FileNode[] => {
      const filtered: FileNode[] = [];
      
      for (const node of nodes) {
        if (node.name.toLowerCase().includes(query.toLowerCase())) {
          filtered.push(node);
        } else if (node.children) {
          const filteredChildren = filterNodes(node.children);
          if (filteredChildren.length > 0) {
            filtered.push({
              ...node,
              children: filteredChildren
            });
          }
        }
      }
      
      return filtered;
    };

    setFilteredFiles(filterNodes(files));
  };

  const getFileIcon = (node: FileNode) => {
    if (node.type === 'directory') {
      return expandedFolders.has(node.path) ? (
        <FolderOpen className="h-4 w-4 text-blue-500" />
      ) : (
        <Folder className="h-4 w-4 text-blue-500" />
      );
    }

    // File type icons based on extension
    const extension = node.name.split('.').pop()?.toLowerCase();
    const iconMap: Record<string, string> = {
      'js': '🟨',
      'jsx': '⚛️',
      'ts': '🔷',
      'tsx': '⚛️',
      'py': '🐍',
      'java': '☕',
      'cpp': '⚙️',
      'c': '⚙️',
      'html': '🌐',
      'css': '🎨',
      'scss': '🎨',
      'json': '📋',
      'md': '📝',
      'yml': '⚙️',
      'yaml': '⚙️',
      'dockerfile': '🐳',
      'gitignore': '📋',
      'env': '🔐'
    };

    return (
      <span className="text-sm mr-1">
        {iconMap[extension || ''] || '📄'}
      </span>
    );
  };

  const renderFileNode = (node: FileNode, depth: number = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = selectedFile === node.path;
    const paddingLeft = depth * 16 + 8;

    return (
      <div key={node.path}>
        <div
          className={`flex items-center py-1 px-2 hover:bg-muted/50 cursor-pointer text-sm ${
            isSelected ? 'bg-primary/20 text-primary' : ''
          }`}
          style={{ paddingLeft }}
          onClick={() => {
            if (node.type === 'directory') {
              toggleFolder(node.path);
            } else {
              onFileSelect(node.path);
            }
          }}
        >
          {node.type === 'directory' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 mr-1"
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(node.path);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          )}
          
          {node.type === 'file' && <div className="w-4 mr-1" />}
          
          {getFileIcon(node)}
          
          <span className="truncate flex-1">{node.name}</span>
          
          {node.type === 'directory' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                const fileName = prompt('Enter file name:');
                if (fileName) {
                  const filePath = node.path ? `${node.path}/${fileName}` : fileName;
                  onFileCreate(filePath);
                }
              }}
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        {node.type === 'directory' && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderFileNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">Files</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => {
              const fileName = prompt('Enter file name:');
              if (fileName) {
                onFileCreate(fileName);
              }
            }}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-7 h-7 text-xs"
          />
        </div>
      </div>

      {/* File Tree */}
      <ScrollArea className="flex-1">
        <div className="py-2">
          {filteredFiles.length === 0 ? (
            <div className="text-center text-muted-foreground text-xs py-8">
              {searchQuery ? 'No files found' : 'No files in repository'}
            </div>
          ) : (
            filteredFiles.map(node => renderFileNode(node))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};