import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Download, FileText, Github, MessageSquare } from 'lucide-react';
import { BeautifulPDFGenerator } from '@/services/pdfGenerator';
import { IssueAnalyzer } from '@/services/issueAnalyzer';
import { PDFContentGenerator } from '@/services/pdfContentGenerator';
import { useToast } from '@/hooks/use-toast';

interface PDFGeneratorProps {
  githubToken?: string;
}

export const PDFGenerator: React.FC<PDFGeneratorProps> = ({ githubToken }) => {
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string>('');
  const { toast } = useToast();

  const parseRepositoryUrl = (url: string): { owner: string; repo: string } | null => {
    const patterns = [
      /github\.com\/([^\/]+)\/([^\/]+)/,
      /^([^\/]+)\/([^\/]+)$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return {
          owner: match[1],
          repo: match[2].replace(/\.git$/, '')
        };
      }
    }

    return null;
  };

  const generatePDF = async () => {
    if (!repositoryUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a repository URL",
        variant: "destructive"
      });
      return;
    }

    const repoInfo = parseRepositoryUrl(repositoryUrl.trim());
    if (!repoInfo) {
      toast({
        title: "Error",
        description: "Invalid repository URL format. Use: github.com/owner/repo or owner/repo",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setAnalysisStatus('🚀 Initializing comprehensive analysis...');

    try {
      // Initialize analyzer
      const analyzer = new IssueAnalyzer(githubToken);
      
      setAnalysisStatus('📊 Fetching ALL GitHub issues with detailed comments & timeline...');
      
      // Perform analysis
      const analysis = await analyzer.analyzeRepository(repoInfo.owner, repoInfo.repo);
      
      setAnalysisStatus('🌟 Analyzing Stack Overflow community discussions & answers...');
      
      // Generate PDF content
      const pdfContent = PDFContentGenerator.generateIssueAnalysisReport(
        analysis,
        `${repoInfo.owner}/${repoInfo.repo}`,
        `https://github.com/${repoInfo.owner}/${repoInfo.repo}`
      );

      setAnalysisStatus('🎨 Generating beautiful PDF with surprising insights...');
      
      // Generate and download PDF
      const pdfGenerator = new BeautifulPDFGenerator();
      const filename = `${repoInfo.owner}-${repoInfo.repo}-issue-analysis-${new Date().toISOString().split('T')[0]}.pdf`;
      
      await pdfGenerator.downloadPDF(pdfContent, filename);

      toast({
        title: "Success!",
        description: `PDF report generated successfully for ${repoInfo.owner}/${repoInfo.repo}`,
      });

      setAnalysisStatus('');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate PDF report",
        variant: "destructive"
      });
      setAnalysisStatus('');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Beautiful PDF Issue Report Generator
        </CardTitle>
        <CardDescription>
          Generate comprehensive, beautifully formatted PDF reports with ALL repository issues, 
          detailed comments, Stack Overflow integration, and surprising AI-powered insights
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="repo-url" className="text-sm font-medium">
            Repository URL or Path
          </label>
          <Input
            id="repo-url"
            placeholder="e.g., github.com/owner/repo or owner/repo"
            value={repositoryUrl}
            onChange={(e) => setRepositoryUrl(e.target.value)}
            disabled={isGenerating}
          />
          <p className="text-xs text-muted-foreground">
            Enter a GitHub repository URL or just owner/repo format
          </p>
        </div>

        {analysisStatus && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>{analysisStatus}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Github className="h-4 w-4 text-blue-600" />
            <span>GitHub Issues Analysis</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <MessageSquare className="h-4 w-4 text-orange-600" />
            <span>Stack Overflow Integration</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <FileText className="h-4 w-4 text-green-600" />
            <span>Beautiful PDF Output</span>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">🎯 Comprehensive Report Features:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• <strong>ALL repository issues</strong> with complete details & comments</li>
            <li>• <strong>Surprising AI insights</strong> about community patterns</li>
            <li>• <strong>Bold headings</strong> and professional formatting</li>
            <li>• <strong>Highlighted</strong> key metrics with yellow background</li>
            <li>• <strong>Underlined</strong> important sections and findings</li>
            <li>• <strong>Stack Overflow integration</strong> with answers & attribution</li>
            <li>• Critical issues with detailed community discussions</li>
            <li>• Bug patterns, feature trends, and engagement analysis</li>
            <li>• Beautiful Adobe Reader compatible PDF output</li>
          </ul>
        </div>

        <Button 
          onClick={generatePDF} 
          disabled={isGenerating || !repositoryUrl.trim()}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Generate Beautiful PDF Report
            </>
          )}
        </Button>

        {!githubToken && (
          <Alert>
            <AlertDescription>
              <strong>Note:</strong> For better results and higher API limits, consider adding a GitHub token 
              in your environment configuration.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};