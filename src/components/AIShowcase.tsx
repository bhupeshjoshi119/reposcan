import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Code2, 
  Zap, 
  Shield, 
  BarChart3, 
  GitBranch,
  Sparkles,
  CheckCircle,
  TrendingUp,
  Users,
  Clock,
  Star,
  FileText,
  Rocket,
  Download
} from 'lucide-react';
import { AnalysisReportDialog } from './AnalysisReportDialog';
import openAgenticPlatform from '@/utils/agenticPlatform';
import { Repository } from '@/pages/Index';

interface AIShowcaseProps {
  className?: string;
  demoRepository?: Repository;
}

export const AIShowcase = ({ className, demoRepository }: AIShowcaseProps) => {
  const [activeDemo, setActiveDemo] = useState(0);
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [metrics, setMetrics] = useState({
    repositoriesForked: 1247,
    aiAssistanceHours: 8934,
    codeGenerated: 2.3,
    bugsFixed: 456,
    performanceGains: 34,
  });

  // Demo repository for analysis
  const defaultDemoRepo: Repository = demoRepository || {
    id: 1,
    name: 'ai-powered-app',
    full_name: 'techhub/ai-powered-app',
    description: 'A cutting-edge AI-powered application showcasing modern development practices',
    html_url: 'https://github.com/techhub/ai-powered-app',
    stargazers_count: 2847,
    forks_count: 456,
    language: 'TypeScript',
    topics: ['ai', 'machine-learning', 'react', 'typescript', 'modern-web'],
    updated_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    owner: {
      login: 'techhub',
      avatar_url: 'https://github.com/techhub.png'
    },
    open_issues_count: 12
  };

  // Simulate real-time metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        repositoriesForked: prev.repositoriesForked + Math.floor(Math.random() * 3),
        aiAssistanceHours: prev.aiAssistanceHours + Math.floor(Math.random() * 5),
        codeGenerated: prev.codeGenerated + (Math.random() * 0.1),
        bugsFixed: prev.bugsFixed + Math.floor(Math.random() * 2),
        performanceGains: prev.performanceGains + (Math.random() * 0.5),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const aiFeatures = [
    {
      icon: Brain,
      title: 'Intelligent Code Generation',
      description: 'AI-powered code completion and generation with 95% accuracy',
      metrics: `${metrics.codeGenerated.toFixed(1)}M lines generated`,
      color: 'from-blue-500 to-purple-600',
    },
    {
      icon: Shield,
      title: 'Security Analysis',
      description: 'Automated vulnerability detection and security recommendations',
      metrics: `${metrics.bugsFixed} vulnerabilities fixed`,
      color: 'from-green-500 to-emerald-600',
    },
    {
      icon: Zap,
      title: 'Performance Optimization',
      description: 'AI-driven performance improvements and code optimization',
      metrics: `${metrics.performanceGains.toFixed(1)}% average improvement`,
      color: 'from-yellow-500 to-orange-600',
    },
    {
      icon: BarChart3,
      title: 'Development Analytics',
      description: 'Real-time insights and development metrics tracking',
      metrics: `${metrics.aiAssistanceHours.toLocaleString()} hours saved`,
      color: 'from-pink-500 to-red-600',
    },
  ];

  const platformStats = [
    { label: 'Repositories Forked', value: metrics.repositoriesForked.toLocaleString(), icon: GitBranch },
    { label: 'AI Assistance Hours', value: metrics.aiAssistanceHours.toLocaleString(), icon: Clock },
    { label: 'Code Generated (Lines)', value: `${metrics.codeGenerated.toFixed(1)}M`, icon: Code2 },
    { label: 'Active Developers', value: '12.4K', icon: Users },
  ];

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Hero Section */}
      <Card className="bg-gradient-to-br from-primary/10 via-accent/5 to-background border-primary/20">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI-Powered Development Platform
            </CardTitle>
            <Sparkles className="w-8 h-8 text-accent animate-pulse" />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform any GitHub repository into an AI-enhanced development environment with one click. 
            Experience the future of coding with intelligent assistance, automated optimization, and real-time insights.
          </p>
        </CardHeader>
        <CardContent>
          {/* Real-time Platform Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {platformStats.map((stat, index) => (
              <Card key={index} className="bg-background/50 border-border/50">
                <CardContent className="p-4 text-center">
                  <stat.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Features Showcase */}
          <div className="grid md:grid-cols-2 gap-6">
            {aiFeatures.map((feature, index) => (
              <Card 
                key={index} 
                className={`relative overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer ${
                  activeDemo === index ? 'ring-2 ring-primary/50' : ''
                }`}
                onClick={() => setActiveDemo(index)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5`} />
                <CardHeader className="relative">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${feature.color}`}>
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {feature.metrics}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-muted-foreground">{feature.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">Active & Optimized</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-8 p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
            <h3 className="text-xl font-semibold mb-2">Ready to Experience AI-Powered Development?</h3>
            <p className="text-muted-foreground mb-4">
              Generate complete React applications with AI and download production-ready ZIP files with full project structure, README, and installation scripts!
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button 
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 animate-pulse"
                onClick={openAgenticPlatform}
                size="lg"
              >
                <Rocket className="w-4 h-4 mr-2" />
                🚀 Start Coding with AI
              </Button>
              <Button 
                variant="outline"
                onClick={() => setAnalysisDialogOpen(true)}
              >
                <FileText className="w-4 h-4 mr-2" />
                View Analysis Report
              </Button>
              <Button 
                variant="outline"
                onClick={openAgenticPlatform}
                className="border-green-500 text-green-600 hover:bg-green-50"
              >
                <Download className="w-4 h-4 mr-2" />
                📦 Generate & Download Code
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Report Dialog */}
      <AnalysisReportDialog
        repository={defaultDemoRepo}
        open={analysisDialogOpen}
        onOpenChange={setAnalysisDialogOpen}
      />
    </div>
  );
};