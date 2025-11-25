import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Brain, 
  Code, 
  Download, 
  Rocket,
  Sparkles,
  Zap,
  Star,
  Globe,
  Package,
  FileCode,
  Palette,
  Database,
  Settings,
  Play,
  Eye,
  GitBranch,
  Copy,
  ArrowLeft
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import ZipGenerator from '@/services/zipGenerator';

interface GeneratedProject {
  id: string;
  name: string;
  description: string;
  framework: string;
  files: Array<{
    name: string;
    content: string;
    type: 'component' | 'style' | 'config' | 'page';
  }>;
  preview: string;
  downloadUrl: string;
}

export const AgenticAIPage: React.FC = () => {
  const [projectPrompt, setProjectPrompt] = useState('');
  const [projectName, setProjectName] = useState('');
  const [selectedFramework, setSelectedFramework] = useState('react');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedProject, setGeneratedProject] = useState<GeneratedProject | null>(null);
  const [activeTab, setActiveTab] = useState('app');

  // 🚀 GENERATE COMPLETE FRONTEND PROJECT
  const generateProject = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate AI generation with progress
    const steps = [
      'Analyzing requirements...',
      'Generating project structure...',
      'Creating components...',
      'Styling with modern CSS...',
      'Adding interactions...',
      'Optimizing performance...',
      'Finalizing project...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setGenerationProgress(((i + 1) / steps.length) * 100);
    }

    // Generate mock project
    const project: GeneratedProject = {
      id: Date.now().toString(),
      name: projectName || 'AI Generated App',
      description: projectPrompt || 'AI-powered application',
      framework: selectedFramework,
      files: generateProjectFiles(projectPrompt, selectedFramework),
      preview: generatePreviewHTML(projectPrompt, selectedFramework),
      downloadUrl: '#'
    };

    setGeneratedProject(project);
    setIsGenerating(false);
  };

  // 🎯 GENERATE PROJECT FILES
  const generateProjectFiles = (prompt: string, framework: string) => {
    const files = [
      {
        name: 'App.tsx',
        type: 'component' as const,
        content: `// 🚀 AI-Generated ${framework} Application
import React, { useState, useEffect } from 'react';
import './App.css';

const App: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // AI-generated functionality based on: "${prompt}"
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setData([
        { id: 1, title: 'AI Generated Feature 1', status: 'active', description: 'Smart functionality' },
        { id: 2, title: 'AI Generated Feature 2', status: 'pending', description: 'Automated process' },
        { id: 3, title: 'AI Generated Feature 3', status: 'completed', description: 'Intelligent system' }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredData = data.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app">
      <header className="app-header">
        <h1>🤖 ${projectName || 'AI Generated App'}</h1>
        <p>Generated from: "${prompt}"</p>
        <input
          type="text"
          placeholder="🔍 Search features..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </header>
      
      <main className="app-main">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading AI-generated content...</p>
          </div>
        ) : (
          <div className="content-grid">
            {filteredData.map(item => (
              <div key={item.id} className="content-card">
                <div className="card-header">
                  <h3>{item.title}</h3>
                  <span className={\`status \${item.status}\`}>
                    {item.status}
                  </span>
                </div>
                <p>{item.description}</p>
                <div className="card-actions">
                  <button className="btn btn-primary">View</button>
                  <button className="btn btn-secondary">Edit</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <footer className="app-footer">
        <p>🚀 Generated by Agentic AI Platform</p>
      </footer>
    </div>
  );
};

export default App;`
      },
      {
        name: 'App.css',
        type: 'style' as const,
        content: `/* 🎨 AI-Generated Modern Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 2rem;
  text-align: center;
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.app-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.search-input {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  width: 300px;
  max-width: 100%;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.app-main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: white;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.content-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.content-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-header h3 {
  color: #333;
  margin: 0;
  font-size: 1.2rem;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status.active {
  background: #10b981;
  color: white;
}

.status.pending {
  background: #f59e0b;
  color: white;
}

.status.completed {
  background: #6366f1;
  color: white;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a67d8;
}

.btn-secondary {
  background: transparent;
  color: #667eea;
  border: 1px solid #667eea;
}

.btn-secondary:hover {
  background: #667eea;
  color: white;
}

.app-footer {
  background: rgba(0, 0, 0, 0.2);
  color: white;
  text-align: center;
  padding: 1rem;
  backdrop-filter: blur(10px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .app-header h1 {
    font-size: 2rem;
  }
  
  .app-main {
    padding: 1rem;
  }
  
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .search-input {
    width: 100%;
  }
}`
      },
      {
        name: 'package.json',
        type: 'config' as const,
        content: JSON.stringify({
          "name": (projectName || 'ai-generated-app').toLowerCase().replace(/\s+/g, '-'),
          "version": "1.0.0",
          "description": prompt || 'AI-generated application',
          "main": "src/App.tsx",
          "scripts": {
            "dev": "vite",
            "build": "vite build",
            "preview": "vite preview"
          },
          "dependencies": {
            "react": "^18.2.0",
            "react-dom": "^18.2.0"
          },
          "devDependencies": {
            "@types/react": "^18.2.0",
            "@types/react-dom": "^18.2.0",
            "@vitejs/plugin-react": "^4.0.0",
            "typescript": "^5.0.2",
            "vite": "^4.4.5"
          },
          "keywords": ["ai-generated", "react", "typescript"],
          "author": "Agentic AI Platform",
          "license": "MIT"
        }, null, 2)
      },
      {
        name: 'README.md',
        type: 'config' as const,
        content: `# 🤖 ${projectName || 'AI Generated App'}

> Generated by **Agentic AI Platform** - The future of code generation!

## 📝 Description
${prompt || 'AI-powered application with modern features'}

## 🚀 Features
- ✅ **AI-Generated Code** - Complete frontend application
- ✅ **Modern React** - Built with React 18 + TypeScript
- ✅ **Responsive Design** - Works on all devices
- ✅ **Performance Optimized** - Fast loading and smooth interactions
- ✅ **Production Ready** - Clean, maintainable code

## 🛠️ Tech Stack
- **Framework:** ${selectedFramework}
- **Language:** TypeScript
- **Styling:** Modern CSS with animations
- **Build Tool:** Vite

## 🏃‍♂️ Quick Start

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
\`\`\`

## 🤖 Generated by Agentic AI
**Prompt used:** "${prompt}"

---
**Made with ❤️ by Agentic AI Platform**`
      }
    ];

    return files;
  };

  // 🎨 GENERATE PREVIEW HTML
  const generatePreviewHTML = (prompt: string, framework: string) => {
    return `Preview of ${projectName || 'AI Generated App'} - ${prompt}`;
  };

  // 📦 DOWNLOAD PROJECT AS COMPLETE ZIP
  const downloadProject = async () => {
    if (!generatedProject) return;

    try {
      // Create complete project structure for ZIP generation
      const projectStructure = {
        name: generatedProject.name,
        description: generatedProject.description,
        framework: generatedProject.framework,
        author: 'Agentic AI Platform',
        files: generatedProject.files,
        dependencies: {
          // Add any additional dependencies based on the generated code
        },
        devDependencies: {
          // Add any additional dev dependencies
        },
        scripts: {
          // Add any custom scripts
        }
      };

      // Generate and download complete ZIP file
      await ZipGenerator.generateProjectZip(projectStructure);
      
      // Show success message (you could add a toast notification here)
      console.log('🎉 Complete project ZIP downloaded successfully!');
      
    } catch (error) {
      console.error('❌ Failed to generate ZIP:', error);
      // Fallback to JSON download
      const projectData = {
        name: generatedProject.name,
        description: generatedProject.description,
        framework: generatedProject.framework,
        files: generatedProject.files.reduce((acc, file) => {
          acc[file.name] = file.content;
          return acc;
        }, {} as Record<string, string>),
        instructions: 'See README.md for installation instructions'
      };

      const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${generatedProject.name.replace(/\s+/g, '-').toLowerCase()}-project.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 🔥 HERO HEADER */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => window.close()}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Main App
            </Button>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            🤖 Agentic AI Platform
          </h1>
          <p className="text-xl text-purple-200 mb-6">
            Generate Complete Frontend Applications with AI
          </p>
          <div className="flex justify-center gap-2">
            <Badge variant="secondary" className="animate-pulse">
              <Sparkles className="h-3 w-3 mr-1" />
              HACKATHON SPECIAL
            </Badge>
            <Badge variant="outline" className="text-white border-white">
              <Zap className="h-3 w-3 mr-1" />
              SPONSOR DEMO
            </Badge>
          </div>
        </div>

        {!generatedProject ? (
          /* 🎯 PROJECT GENERATOR */
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="h-6 w-6" />
                Generate Your AI-Powered Application
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white font-medium mb-2 block">
                    Project Name
                  </label>
                  <Input
                    placeholder="My Awesome AI App"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>
                <div>
                  <label className="text-white font-medium mb-2 block">
                    Framework
                  </label>
                  <select
                    value={selectedFramework}
                    onChange={(e) => setSelectedFramework(e.target.value)}
                    className="w-full p-2 rounded-md bg-white/10 border border-white/20 text-white"
                  >
                    <option value="react">React + TypeScript</option>
                    <option value="vue">Vue.js</option>
                    <option value="angular">Angular</option>
                    <option value="svelte">Svelte</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-white font-medium mb-2 block">
                  Describe Your Application
                </label>
                <Textarea
                  placeholder="Create a modern dashboard with user management, real-time charts, and responsive design..."
                  value={projectPrompt}
                  onChange={(e) => setProjectPrompt(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 min-h-[120px]"
                />
              </div>

              {isGenerating && (
                <div className="space-y-4">
                  <div className="text-white text-center">
                    <Brain className="h-8 w-8 mx-auto mb-2 animate-spin" />
                    <p>AI is generating your application...</p>
                  </div>
                  <Progress value={generationProgress} className="w-full" />
                  <p className="text-center text-white/80 text-sm">
                    {generationProgress.toFixed(0)}% Complete
                  </p>
                </div>
              )}

              <Button
                onClick={generateProject}
                disabled={isGenerating || !projectPrompt.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Brain className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 mr-2" />
                    🚀 Generate AI Application
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* 🎊 GENERATED PROJECT */
          <div className="space-y-6">
            {/* Project Header */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Star className="h-6 w-6 text-yellow-400" />
                      {generatedProject.name}
                    </CardTitle>
                    <p className="text-purple-200 mt-1">{generatedProject.description}</p>
                  </div>
                  <Badge variant="secondary">
                    {generatedProject.framework}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={downloadProject} className="bg-green-600 hover:bg-green-700 animate-pulse" size="lg">
                    <Download className="h-4 w-4 mr-2" />
                    📦 Download Complete ZIP Project
                  </Button>
                  <Button 
                    onClick={() => setGeneratedProject(null)}
                    variant="outline"
                    className="text-white border-white/20"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Generate New Project
                  </Button>
                  <Button 
                    variant="outline"
                    className="text-white border-white/20"
                    onClick={() => window.open('https://github.com', '_blank')}
                  >
                    <GitBranch className="h-4 w-4 mr-2" />
                    Deploy to GitHub
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Generated Files */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileCode className="h-5 w-5" />
                  Generated Files ({generatedProject.files.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-white/10">
                    {generatedProject.files.map((file) => (
                      <TabsTrigger 
                        key={file.name} 
                        value={file.name.toLowerCase().replace('.', '')}
                        className="text-white data-[state=active]:bg-white/20"
                      >
                        {file.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {generatedProject.files.map((file) => (
                    <TabsContent key={file.name} value={file.name.toLowerCase().replace('.', '')} className="mt-4">
                      <div className="relative">
                        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm max-h-96">
                          <code>{file.content}</code>
                        </pre>
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(file.content)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgenticAIPage;