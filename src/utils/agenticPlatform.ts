/**
 * 🚀 AGENTIC AI PLATFORM LAUNCHER
 * Opens the AI code generation platform in a new window
 */

export const openAgenticPlatform = () => {
  // Create the HTML content for the new window
  const platformHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🤖 Agentic AI Platform - Code Generator</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <style>
        body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .glass-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .code-block {
            background: #1a1a1a;
            color: #00ff00;
            font-family: 'Courier New', monospace;
            border-radius: 8px;
            padding: 1rem;
            overflow-x: auto;
            max-height: 400px;
            overflow-y: auto;
        }
        
        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .pulse {
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .bounce {
            animation: bounce 1s infinite;
        }
        
        @keyframes bounce {
            0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
            40%, 43% { transform: translateY(-10px); }
            70% { transform: translateY(-5px); }
            90% { transform: translateY(-2px); }
        }
    </style>
</head>
<body>
    <div id="root"></div>
    
    <script type="text/babel">
        const { useState, useEffect } = React;
        
        const AgenticPlatform = () => {
            const [projectName, setProjectName] = useState('');
            const [projectPrompt, setProjectPrompt] = useState('');
            const [framework, setFramework] = useState('react');
            const [isGenerating, setIsGenerating] = useState(false);
            const [progress, setProgress] = useState(0);
            const [generatedCode, setGeneratedCode] = useState(null);
            const [activeTab, setActiveTab] = useState('app');
            
            const generateProject = async () => {
                setIsGenerating(true);
                setProgress(0);
                
                const steps = [
                    'Analyzing requirements...',
                    'Generating project structure...',
                    'Creating React components...',
                    'Adding TypeScript types...',
                    'Styling with modern CSS...',
                    'Adding interactions...',
                    'Optimizing performance...',
                    'Finalizing project...'
                ];
                
                for (let i = 0; i < steps.length; i++) {
                    await new Promise(resolve => setTimeout(resolve, 800));
                    setProgress(((i + 1) / steps.length) * 100);
                }
                
                // Generate the actual code
                const code = {
                    app: generateAppCode(projectPrompt, projectName),
                    styles: generateStylesCode(projectPrompt),
                    package: generatePackageJson(projectName, projectPrompt),
                    readme: generateReadme(projectName, projectPrompt)
                };
                
                setGeneratedCode(code);
                setIsGenerating(false);
            };
            
            const generateAppCode = (prompt, name) => {
                return \`// 🚀 AI-Generated React Application
import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // AI-generated functionality based on: "\${prompt}"
  useEffect(() => {
    setLoading(true);
    // Simulated API call
    setTimeout(() => {
      setData([
        { id: 1, title: 'AI Feature 1', description: 'Generated based on your prompt', status: 'active' },
        { id: 2, title: 'AI Feature 2', description: 'Smart functionality', status: 'pending' },
        { id: 3, title: 'AI Feature 3', description: 'Automated process', status: 'completed' },
        { id: 4, title: 'AI Feature 4', description: 'Intelligent system', status: 'active' }
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  const filteredData = data.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">🤖 \${name || 'AI Generated App'}</h1>
          <p className="app-subtitle">Generated from: "\${prompt}"</p>
          <div className="search-container">
            <input
              type="text"
              placeholder="🔍 Search features..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </header>
      
      <main className="app-main">
        {loading ? (
          <div className="loading-container">
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
                <p className="card-description">{item.description}</p>
                <div className="card-actions">
                  <button className="btn btn-primary">View Details</button>
                  <button className="btn btn-secondary">Edit</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <footer className="app-footer">
        <p>🚀 Generated by Agentic AI Platform | Ready for Production</p>
      </footer>
    </div>
  );
};

export default App;\`;
            };
            
            const generateStylesCode = (prompt) => {
                return \`/* 🎨 AI-Generated Modern Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: #333;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  padding: 2rem;
  text-align: center;
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
}

.app-title {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
}

.app-subtitle {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.search-container {
  max-width: 400px;
  margin: 0 auto;
}

.search-input {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 1rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.app-main {
  flex: 1;
  padding: 3rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.loading-container {
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
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.content-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.content-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
}

.content-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.card-header h3 {
  color: #333;
  font-size: 1.3rem;
  font-weight: 600;
}

.status {
  padding: 0.4rem 1rem;
  border-radius: 25px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status.active {
  background: linear-gradient(45deg, #10b981, #059669);
  color: white;
}

.status.pending {
  background: linear-gradient(45deg, #f59e0b, #d97706);
  color: white;
}

.status.completed {
  background: linear-gradient(45deg, #6366f1, #4f46e5);
  color: white;
}

.card-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.btn-primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover {
  background: #667eea;
  color: white;
}

.app-footer {
  background: rgba(0, 0, 0, 0.2);
  color: white;
  text-align: center;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .app-title {
    font-size: 2rem;
  }
  
  .app-main {
    padding: 2rem 1rem;
  }
  
  .content-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .content-card {
    padding: 1.5rem;
  }
}\`;
            };
            
            const generatePackageJson = (name, prompt) => {
                return JSON.stringify({
                    "name": (name || 'ai-generated-app').toLowerCase().replace(/\\s+/g, '-'),
                    "version": "1.0.0",
                    "description": prompt || 'AI-generated application',
                    "main": "src/App.tsx",
                    "scripts": {
                        "dev": "vite",
                        "build": "vite build",
                        "preview": "vite preview",
                        "lint": "eslint src --ext ts,tsx"
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
                }, null, 2);
            };
            
            const generateReadme = (name, prompt) => {
                return \`# 🤖 \${name || 'AI Generated App'}

> Generated by **Agentic AI Platform** - The future of code generation!

## 📝 Description
\${prompt || 'AI-powered application with modern features'}

## 🚀 Features
- ✅ **AI-Generated Code** - Complete frontend application
- ✅ **Modern React** - Built with React 18 + TypeScript
- ✅ **Responsive Design** - Works on all devices
- ✅ **Performance Optimized** - Fast loading and smooth interactions
- ✅ **Production Ready** - Clean, maintainable code

## 🛠️ Tech Stack
- **Framework:** React + TypeScript
- **Styling:** Modern CSS with animations
- **Build Tool:** Vite

## 🏃‍♂️ Quick Start

\\\`\\\`\\\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
\\\`\\\`\\\`

## 🤖 Generated by Agentic AI
**Prompt used:** "\${prompt}"

---
**Made with ❤️ by Agentic AI Platform**\`;
            };
            
            const downloadProject = () => {
                if (!generatedCode) return;
                
                const projectData = {
                    name: projectName || 'ai-generated-app',
                    files: {
                        'App.tsx': generatedCode.app,
                        'App.css': generatedCode.styles,
                        'package.json': generatedCode.package,
                        'README.md': generatedCode.readme
                    }
                };
                
                const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = \`\${(projectName || 'ai-generated-app').replace(/\\s+/g, '-').toLowerCase()}-project.json\`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            };
            
            return (
                <div className="min-h-screen gradient-bg p-4">
                    <div className="max-w-6xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-5xl font-bold text-white mb-4">
                                🤖 Agentic AI Platform
                            </h1>
                            <p className="text-xl text-purple-200 mb-6">
                                Generate Complete Frontend Applications with AI
                            </p>
                            <div className="flex justify-center gap-2">
                                <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm pulse">
                                    ✨ HACKATHON SPECIAL
                                </span>
                                <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm bounce">
                                    🚀 SPONSOR DEMO
                                </span>
                            </div>
                        </div>
                        
                        {!generatedCode ? (
                            /* Generator Form */
                            <div className="glass-card rounded-2xl p-8 mb-8">
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                    🧠 Generate Your AI-Powered Application
                                </h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-white font-medium mb-2">
                                            Project Name
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="My Awesome AI App"
                                            value={projectName}
                                            onChange={(e) => setProjectName(e.target.value)}
                                            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-white font-medium mb-2">
                                            Framework
                                        </label>
                                        <select
                                            value={framework}
                                            onChange={(e) => setFramework(e.target.value)}
                                            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
                                        >
                                            <option value="react">React + TypeScript</option>
                                            <option value="vue">Vue.js</option>
                                            <option value="angular">Angular</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="mb-6">
                                    <label className="block text-white font-medium mb-2">
                                        Describe Your Application
                                    </label>
                                    <textarea
                                        placeholder="Create a modern dashboard with user management, real-time charts, and responsive design..."
                                        value={projectPrompt}
                                        onChange={(e) => setProjectPrompt(e.target.value)}
                                        className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 h-32 resize-none"
                                    />
                                </div>
                                
                                {isGenerating && (
                                    <div className="mb-6 text-center">
                                        <div className="spinner mx-auto mb-4"></div>
                                        <p className="text-white mb-2">AI is generating your application...</p>
                                        <div className="w-full bg-white/20 rounded-full h-2">
                                            <div 
                                                className="bg-gradient-to-r from-purple-400 to-blue-400 h-2 rounded-full transition-all duration-300"
                                                style={{width: \`\${progress}%\`}}
                                            ></div>
                                        </div>
                                        <p className="text-white/80 text-sm mt-2">\${Math.round(progress)}% Complete</p>
                                    </div>
                                )}
                                
                                <button
                                    onClick={generateProject}
                                    disabled={isGenerating || !projectPrompt.trim()}
                                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    {isGenerating ? '🧠 Generating...' : '🚀 Generate AI Application'}
                                </button>
                            </div>
                        ) : (
                            /* Generated Project */
                            <div>
                                {/* Project Header */}
                                <div className="glass-card rounded-2xl p-6 mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                                ⭐ {projectName || 'AI Generated App'}
                                            </h2>
                                            <p className="text-purple-200">{projectPrompt}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
                                            {framework}
                                        </span>
                                    </div>
                                    
                                    <div className="flex gap-3">
                                        <button
                                            onClick={downloadProject}
                                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
                                        >
                                            📦 Download Project
                                        </button>
                                        <button
                                            onClick={() => setGeneratedCode(null)}
                                            className="bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded-lg border border-white/20"
                                        >
                                            🧠 Generate New
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Code Tabs */}
                                <div className="glass-card rounded-2xl p-6">
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        📁 Generated Files
                                    </h3>
                                    
                                    <div className="flex gap-2 mb-4">
                                        {[
                                            {key: 'app', label: 'App.tsx'},
                                            {key: 'styles', label: 'App.css'},
                                            {key: 'package', label: 'package.json'},
                                            {key: 'readme', label: 'README.md'}
                                        ].map(tab => (
                                            <button
                                                key={tab.key}
                                                onClick={() => setActiveTab(tab.key)}
                                                className={\`px-4 py-2 rounded-lg font-medium transition-all \${
                                                    activeTab === tab.key 
                                                        ? 'bg-white/20 text-white' 
                                                        : 'bg-white/10 text-white/70 hover:bg-white/15'
                                                }\`}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                    
                                    <div className="relative">
                                        <pre className="code-block">
                                            <code>{generatedCode[activeTab]}</code>
                                        </pre>
                                        <button
                                            onClick={() => navigator.clipboard.writeText(generatedCode[activeTab])}
                                            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded text-sm"
                                        >
                                            📋 Copy
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        };
        
        ReactDOM.render(<AgenticPlatform />, document.getElementById('root'));
    </script>
</body>
</html>`;

  // Open new window with the platform
  const newWindow = window.open('', '_blank', 'width=1400,height=900,scrollbars=yes,resizable=yes');
  
  if (newWindow) {
    newWindow.document.write(platformHTML);
    newWindow.document.close();
    newWindow.focus();
    
    // Set window title
    newWindow.document.title = '🤖 Agentic AI Platform - Code Generator';
    
    return newWindow;
  } else {
    alert('Please allow popups to open the Agentic AI Platform!');
    return null;
  }
};

export default openAgenticPlatform;