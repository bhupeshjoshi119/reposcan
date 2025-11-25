import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Brain, 
  Code, 
  Copy, 
  Download, 
  GitBranch, 
  Lightbulb, 
  Rocket,
  Sparkles,
  Zap,
  Star,
  Shield,
  Cpu,
  Clock
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { agenticCodeGenerator, type CodeGenerationRequest, type GeneratedSolution } from '@/services/agenticCodeGenerator';

interface AICodeGeneratorProps {
  issueTitle: string;
  issueDescription: string;
  repository: string;
  language?: string;
}

export const AICodeGenerator: React.FC<AICodeGeneratorProps> = ({
  issueTitle,
  issueDescription,
  repository,
  language = 'JavaScript'
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSolutions, setGeneratedSolutions] = useState<GeneratedSolution[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');

  // 🤖 AGENTIC AI CODE GENERATION
  const generateAISolutions = async () => {
    setIsGenerating(true);
    
    try {
      const request: CodeGenerationRequest = {
        issueDescription: customPrompt || issueDescription,
        repository,
        language,
        context: issueTitle,
        complexity: 'medium'
      };

      const solutions = await agenticCodeGenerator.generateCode(request);
      setGeneratedSolutions(solutions);
    } catch (error) {
      console.error('Code generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    // Show toast notification in real app
  };

  const createPullRequest = (solution: GeneratedSolution) => {
    // In real app, this would create a PR via GitHub API
    console.log('Creating PR for solution:', solution.title);
  };

  const getPerformanceIcon = (performance: string) => {
    switch (performance) {
      case 'high': return <Zap className="h-4 w-4 text-green-500" />;
      case 'medium': return <Cpu className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSecurityIcon = (security: string) => {
    switch (security) {
      case 'secure': return <Shield className="h-4 w-4 text-green-500" />;
      case 'moderate': return <Shield className="h-4 w-4 text-yellow-500" />;
      default: return <Shield className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 🔥 HACKATHON HERO SECTION */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary animate-pulse" />
            🤖 Agentic AI Code Generator
            <Badge variant="secondary" className="ml-auto animate-bounce">
              <Sparkles className="h-3 w-3 mr-1" />
              HACKATHON MODE
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <span className="font-medium">Repository:</span> 
              <span className="font-mono text-primary">{repository}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span className="font-medium">Language:</span> 
              <Badge variant="outline">{language}</Badge>
            </div>
          </div>
          
          <div>
            <span className="font-medium flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4" />
              Issue Context:
            </span>
            <p className="text-muted-foreground bg-muted/50 p-3 rounded-lg">{issueTitle}</p>
          </div>

          {/* Custom Prompt Input */}
          <div className="space-y-2">
            <label className="font-medium flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Custom AI Prompt (Optional):
            </label>
            <Textarea
              placeholder="Describe what you want the AI to generate... (e.g., 'Create a high-performance React component with TypeScript')"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <Button 
            onClick={generateAISolutions}
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-spin" />
                🤖 AI is generating solutions...
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4 mr-2" />
                🚀 Generate AI Solutions
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 🎯 GENERATED SOLUTIONS */}
      {generatedSolutions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            🤖 AI-Generated Solutions ({generatedSolutions.length})
          </h3>

          {generatedSolutions.map((solution) => (
            <Card key={solution.id} className="overflow-hidden border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {solution.title}
                    </CardTitle>
                    <p className="text-muted-foreground mt-1">{solution.explanation}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge 
                      variant={solution.confidence > 90 ? "default" : "secondary"}
                      className="animate-pulse"
                    >
                      {solution.confidence}% confidence
                    </Badge>
                  </div>
                </div>
                
                {/* Performance & Security Indicators */}
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    {getPerformanceIcon(solution.performance)}
                    <span className="text-sm capitalize">{solution.performance} Performance</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getSecurityIcon(solution.security)}
                    <span className="text-sm capitalize">{solution.security}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{solution.estimatedTime}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="code" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="code">
                      <Code className="h-4 w-4 mr-2" />
                      Code
                    </TabsTrigger>
                    <TabsTrigger value="details">
                      <Brain className="h-4 w-4 mr-2" />
                      Details
                    </TabsTrigger>
                    <TabsTrigger value="actions">
                      <Rocket className="h-4 w-4 mr-2" />
                      Actions
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="code" className="mt-4">
                    <div className="relative">
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm max-h-96">
                        <code>{solution.code}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(solution.code)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="details" className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">🏷️ Tags</h4>
                        <div className="flex flex-wrap gap-1">
                          {solution.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">📊 Metrics</h4>
                        <div className="space-y-1 text-sm">
                          <div>Confidence: {solution.confidence}%</div>
                          <div>Performance: {solution.performance}</div>
                          <div>Security: {solution.security}</div>
                          <div>Est. Time: {solution.estimatedTime}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">🧠 AI Explanation</h4>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                        {solution.explanation}
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="actions" className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        onClick={() => copyToClipboard(solution.code)}
                        variant="outline"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Code
                      </Button>
                      <Button 
                        onClick={() => createPullRequest(solution)}
                        variant="outline"
                      >
                        <GitBranch className="h-4 w-4 mr-2" />
                        Create PR
                      </Button>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline">
                        <Star className="h-4 w-4 mr-2" />
                        Save Solution
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 🎊 HACKATHON WINNING FOOTER */}
      {generatedSolutions.length === 0 && !isGenerating && (
        <Card className="text-center p-8 bg-gradient-to-r from-primary/5 to-secondary/5">
          <Brain className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
          <h3 className="text-lg font-semibold mb-2">🤖 Ready to Generate AI Solutions</h3>
          <p className="text-muted-foreground">
            Click the button above to generate production-ready code solutions powered by advanced AI
          </p>
        </Card>
      )}
    </div>
  );
};

export default AICodeGenerator;