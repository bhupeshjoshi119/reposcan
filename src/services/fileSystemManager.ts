import { githubApi } from './githubApi';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  size?: number;
  lastModified?: Date;
  content?: string;
  sha?: string;
}

export interface FileContent {
  path: string;
  content: string;
  language: string;
  encoding: string;
  sha?: string;
}

export class FileSystemManager {
  private files: Map<string, FileContent> = new Map();
  private fileTree: FileNode[] = [];
  private owner: string = '';
  private repo: string = '';

  async loadRepository(forkId: string): Promise<void> {
    const [owner, repo] = forkId.split('/');
    this.owner = owner;
    this.repo = repo;
    
    await this.loadFileTree();
  }

  private async loadFileTree(path: string = ''): Promise<FileNode[]> {
    try {
      const contents = await githubApi.getRepositoryContents(this.owner, this.repo, path);
      
      const nodes: FileNode[] = [];
      
      for (const item of contents) {
        const node: FileNode = {
          name: item.name,
          path: item.path,
          type: item.type === 'dir' ? 'directory' : 'file',
          size: item.size,
          sha: item.sha
        };

        if (item.type === 'dir') {
          // Load children for directories (limit depth to avoid too many API calls)
          if (path.split('/').length < 3) {
            node.children = await this.loadFileTree(item.path);
          }
        }

        nodes.push(node);
      }

      if (path === '') {
        this.fileTree = nodes;
      }

      return nodes;
    } catch (error) {
      console.error('Error loading file tree:', error);
      return [];
    }
  }

  getFileTree(): FileNode[] {
    return this.fileTree;
  }

  async openFile(path: string): Promise<FileContent> {
    // Check if file is already loaded
    if (this.files.has(path)) {
      return this.files.get(path)!;
    }

    try {
      const fileData = await githubApi.getFileContent(this.owner, this.repo, path);
      
      let content = '';
      if (fileData.content) {
        // Decode base64 content
        content = atob(fileData.content.replace(/\n/g, ''));
      }

      const fileContent: FileContent = {
        path,
        content,
        language: this.getLanguageFromPath(path),
        encoding: fileData.encoding || 'utf-8',
        sha: fileData.sha
      };

      this.files.set(path, fileContent);
      return fileContent;
    } catch (error) {
      console.error('Error opening file:', error);
      throw new Error(`Failed to open file: ${path}`);
    }
  }

  saveFile(path: string, content: string): void {
    const existingFile = this.files.get(path);
    
    const fileContent: FileContent = {
      path,
      content,
      language: this.getLanguageFromPath(path),
      encoding: 'utf-8',
      sha: existingFile?.sha
    };

    this.files.set(path, fileContent);
  }

  createFile(path: string, content: string = ''): void {
    const fileContent: FileContent = {
      path,
      content,
      language: this.getLanguageFromPath(path),
      encoding: 'utf-8'
    };

    this.files.set(path, fileContent);
    
    // Add to file tree
    this.addToFileTree(path, 'file');
  }

  deleteFile(path: string): void {
    this.files.delete(path);
    this.removeFromFileTree(path);
  }

  searchFiles(query: string): FileNode[] {
    const results: FileNode[] = [];
    
    const searchInTree = (nodes: FileNode[]) => {
      for (const node of nodes) {
        if (node.name.toLowerCase().includes(query.toLowerCase())) {
          results.push(node);
        }
        if (node.children) {
          searchInTree(node.children);
        }
      }
    };

    searchInTree(this.fileTree);
    return results;
  }

  getModifiedFiles(): Map<string, FileContent> {
    return new Map(this.files);
  }

  private getLanguageFromPath(path: string): string {
    const extension = path.split('.').pop()?.toLowerCase();
    
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'sql': 'sql',
      'sh': 'shell',
      'bash': 'shell',
      'dockerfile': 'dockerfile',
      'vue': 'vue',
      'svelte': 'svelte'
    };

    return languageMap[extension || ''] || 'plaintext';
  }

  private addToFileTree(path: string, type: 'file' | 'directory'): void {
    const parts = path.split('/');
    let currentLevel = this.fileTree;
    let currentPath = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      
      let existingNode = currentLevel.find(node => node.name === part);
      
      if (!existingNode) {
        const isLast = i === parts.length - 1;
        existingNode = {
          name: part,
          path: currentPath,
          type: isLast ? type : 'directory',
          children: isLast && type === 'file' ? undefined : []
        };
        currentLevel.push(existingNode);
      }

      if (existingNode.children) {
        currentLevel = existingNode.children;
      }
    }
  }

  private removeFromFileTree(path: string): void {
    const parts = path.split('/');
    
    const removeRecursive = (nodes: FileNode[], pathParts: string[], depth: number): boolean => {
      const currentPart = pathParts[depth];
      const nodeIndex = nodes.findIndex(node => node.name === currentPart);
      
      if (nodeIndex === -1) return false;
      
      if (depth === pathParts.length - 1) {
        // Remove the target node
        nodes.splice(nodeIndex, 1);
        return true;
      }
      
      const node = nodes[nodeIndex];
      if (node.children) {
        const removed = removeRecursive(node.children, pathParts, depth + 1);
        
        // Remove empty directories
        if (removed && node.children.length === 0 && node.type === 'directory') {
          nodes.splice(nodeIndex, 1);
        }
        
        return removed;
      }
      
      return false;
    };

    removeRecursive(this.fileTree, parts, 0);
  }
}

export const fileSystemManager = new FileSystemManager();