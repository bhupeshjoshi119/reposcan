import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Download, Loader2 } from 'lucide-react';
import { BeautifulPDFGenerator } from '@/services/pdfGenerator';
import { IssueAnalyzer } from '@/services/issueAnalyzer';
import { PDFContentGenerator } from '@/services/pdfContentGenerator';
import { useToast } from '@/hooks/use-toast';

interface PDFReportButtonProps {
  repositoryUrl: string;
  repositoryName: string;
  githubToken?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export const PDFReportButton: React.FC<PDFReportButtonProps> = ({
  repositoryUrl,
  repositoryName,
  githubToken,
  variant = 'outline',
  size = 'sm',
  className = ''
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
    const repoInfo = parseRepositoryUrl(repositoryUrl);
    if (!repoInfo) {
      toast({
        title: "Error",
        description: "Invalid repository URL format",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Initialize analyzer
      const analyzer = new IssueAnalyzer(githubToken);
      
      // Perform analysis
      const analysis = await analyzer.analyzeRepository(repoInfo.owner, repoInfo.repo);
      
      // Generate PDF content
      const pdfContent = PDFContentGenerator.generateIssueAnalysisReport(
        analysis,
        repositoryName,
        repositoryUrl
      );

      // Generate and download PDF
      const pdfGenerator = new BeautifulPDFGenerator();
      const filename = `${repoInfo.owner}-${repoInfo.repo}-issue-analysis-${new Date().toISOString().split('T')[0]}.pdf`;
      
      await pdfGenerator.downloadPDF(pdfContent, filename);

      toast({
        title: "Success!",
        description: `Beautiful PDF report generated for ${repositoryName}`,
      });

      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate PDF report",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <FileText className="h-4 w-4 mr-2" />
          PDF Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" aria-describedby="pdf-report-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Beautiful PDF Report
          </DialogTitle>
          <DialogDescription id="pdf-report-description">
            Create a comprehensive, professionally formatted PDF report analyzing issues for <strong>{repositoryName}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Report includes:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• <strong>Executive summary</strong> with key metrics</li>
              <li>• <strong>Critical issues</strong> analysis</li>
              <li>• <strong>Stack Overflow</strong> community discussions</li>
              <li>• <strong>Trends and analytics</strong></li>
              <li>• <strong>Strategic recommendations</strong></li>
            </ul>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Beautiful formatting:</strong> Bold headings, bullet points, highlighted text, 
              and underlined sections for professional presentation.
            </p>
          </div>

          <Button 
            onClick={generatePDF} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Generate & Download PDF
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};