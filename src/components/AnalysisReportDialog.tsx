import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  Share2, 
  TrendingUp, 
  Shield, 
  BarChart3, 
  Brain,
  Loader2,
  CheckCircle,
  Target,
  Lightbulb,
  Code2
} from 'lucide-react';
import { Repository } from '@/pages/Index';
import { analysisReportGenerator, AnalysisReport } from '@/services/analysisReportGenerator';
import { useToast } from '@/hooks/use-toast';

interface AnalysisReportDialogProps {
  repository: Repository | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AnalysisReportDialog = ({
  repository,
  open,
  onOpenChange,
}: AnalysisReportDialogProps) => {
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (open && repository && !report) {
      generateReport();
    }
  }, [open, repository]);

  const generateReport = async () => {
    if (!repository) return;

    setLoading(true);
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      const generatedReport = await analysisReportGenerator.generateReport(repository);
      
      clearInterval(progressInterval);
      setProgress(100);
      setReport(generatedReport);

      toast({
        title: "Analysis Complete!",
        description: "Comprehensive report generated with AI insights",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to generate analysis report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;

    const reportData = {
      ...report,
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-report-${repository?.name}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report Downloaded",
      description: "Analysis report saved as JSON file",
    });
  };

  const shareReport = async () => {
    if (!report) return;

    try {
      await navigator.share({
        title: report.title,
        text: report.executiveSummary.purpose,
        url: repository?.html_url,
      });
    } catch (error) {
      // Fallback to clipboard
      const shareText = `${report.title}\n\n${report.executiveSummary.purpose}\n\n${repository?.html_url}`;
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Report Shared",
        description: "Report details copied to clipboard",
      });
    }
  };

  const handleClose = () => {
    setReport(null);
    setProgress(0);
    onOpenChange(false);
  };

  if (!repository) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-[95vw] w-full max-h-[95vh] h-[95vh] flex flex-col p-0 focus:outline-none" 
        aria-describedby="analysis-report-description"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            handleClose();
          }
        }}
      >
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-4 sm:p-6 pb-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <span className="truncate">AI Analysis Report - {repository.name}</span>
            </DialogTitle>
          </DialogHeader>
          <div id="analysis-report-description" className="sr-only">
            Comprehensive AI-powered analysis report with insights and recommendations
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Button
              onClick={downloadReport}
              disabled={!report}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download JSON</span>
              <span className="sm:hidden">Download</span>
            </Button>
            <Button
              onClick={shareReport}
              disabled={!report}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            {!report && (
              <Button
                onClick={generateReport}
                disabled={loading}
                size="sm"
                className="gap-2"
              >
                <Brain className="w-4 h-4" />
                <span className="hidden sm:inline">Regenerate Analysis</span>
                <span className="sm:hidden">Regenerate</span>
              </Button>
            )}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full space-y-6 p-6">
              <div className="text-center space-y-4">
                <Brain className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-primary animate-pulse" />
                <h3 className="text-lg sm:text-xl font-semibold">Generating AI Analysis Report</h3>
                <p className="text-muted-foreground max-w-md text-sm sm:text-base">
                  Our advanced AI engine is analyzing the repository using NLP and deep learning models...
                </p>
              </div>
              
              <div className="w-full max-w-md space-y-2">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Processing...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  NLP Analysis
                </div>
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deep Learning Predictions
                </div>
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Market Intelligence
                </div>
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Risk Assessment
                </div>
              </div>
            </div>
          )}

          {report && (
            <ScrollArea className="h-full">
              <div className="p-4 sm:p-6 space-y-6">
                {/* Executive Summary */}
                <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                      Executive Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm sm:text-base leading-relaxed">{report.executiveSummary.purpose}</p>
                    
                    <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm sm:text-base mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Key Findings
                        </h4>
                        <ul className="text-sm space-y-2">
                          {report.executiveSummary.keyFindings.map((finding, index) => (
                            <li key={index} className="flex items-start gap-2 p-2 rounded-md bg-background/50">
                              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                              <span className="leading-relaxed">{finding}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm sm:text-base mb-2 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-yellow-500" />
                          Recommendations
                        </h4>
                        <ul className="text-sm space-y-2">
                          {report.executiveSummary.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2 p-2 rounded-md bg-background/50">
                              <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0" />
                              <span className="leading-relaxed">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {report.visualData.metrics.map((metric, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-3 sm:p-4 text-center">
                        <div className="text-xl sm:text-2xl font-bold text-primary mb-1">
                          {metric.value}
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground mb-2 font-medium">
                          {metric.name}
                        </div>
                        <Badge 
                          variant={metric.trend === 'up' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'} {metric.significance}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Detailed Analysis Tabs */}
                <Tabs defaultValue="findings" className="w-full">
                  <div className="overflow-x-auto">
                    <TabsList className="grid w-full grid-cols-4 min-w-[400px]">
                      <TabsTrigger value="findings" className="text-xs sm:text-sm">
                        <span className="hidden sm:inline">Findings</span>
                        <span className="sm:hidden">Find</span>
                      </TabsTrigger>
                      <TabsTrigger value="technical" className="text-xs sm:text-sm">
                        <span className="hidden sm:inline">Technical</span>
                        <span className="sm:hidden">Tech</span>
                      </TabsTrigger>
                      <TabsTrigger value="market" className="text-xs sm:text-sm">Market</TabsTrigger>
                      <TabsTrigger value="recommendations" className="text-xs sm:text-sm">
                        <span className="hidden sm:inline">Actions</span>
                        <span className="sm:hidden">Act</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="findings" className="space-y-4 mt-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                          {report.sections.findings.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm sm:text-base leading-relaxed">
                          {report.sections.findings.content}
                        </p>
                        <div className="space-y-3">
                          {report.sections.findings.insights.map((insight, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg text-sm sm:text-base">
                              <Brain className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                              <span className="leading-relaxed text-foreground font-medium">{insight}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="technical" className="space-y-4 mt-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                          <Code2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          {report.sections.technicalAnalysis.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm sm:text-base leading-relaxed">
                          {report.sections.technicalAnalysis.content}
                        </p>
                        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm sm:text-base">Technical Insights</h4>
                            <div className="space-y-3">
                              {report.sections.technicalAnalysis.insights.map((insight, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg text-sm">
                                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span className="leading-relaxed text-foreground font-medium">{insight}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm sm:text-base">Risk Assessment</h4>
                            <div className="space-y-3">
                              {report.sections.riskAssessment.insights.map((risk, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg text-sm">
                                  <Shield className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                  <span className="leading-relaxed text-foreground font-medium">{risk}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="market" className="space-y-4 mt-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                          {report.sections.marketAnalysis.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm sm:text-base leading-relaxed">
                          {report.sections.marketAnalysis.content}
                        </p>
                        <div className="space-y-4">
                          <h4 className="font-medium text-sm sm:text-base">Market Trends</h4>
                          <div className="space-y-3">
                            {report.visualData.trends.map((trend, index) => (
                              <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/50 rounded-lg gap-3">
                                <div className="flex-1">
                                  <div className="font-medium text-sm sm:text-base">{trend.category}</div>
                                  <div className="text-xs sm:text-sm text-muted-foreground mt-1">{trend.prediction}</div>
                                </div>
                                <div className="flex items-center gap-4 sm:text-right">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">
                                      {trend.direction === 'increasing' ? '↗' : trend.direction === 'decreasing' ? '↘' : '→'}
                                    </span>
                                    <span className="text-sm font-medium">
                                      {trend.direction}
                                    </span>
                                  </div>
                                  <div className="text-xs sm:text-sm text-muted-foreground">
                                    {Math.round(trend.confidence * 100)}% confidence
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="recommendations" className="space-y-4 mt-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                          <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                          {report.sections.recommendations.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm sm:text-base leading-relaxed">
                          {report.sections.recommendations.content}
                        </p>
                        <div className="space-y-4">
                          {report.sections.recommendations.insights.map((recommendation, index) => (
                            <div key={index} className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border border-muted">
                              <Lightbulb className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="font-medium text-sm sm:text-base mb-2">
                                  Action Item {index + 1}
                                </div>
                                <div className="text-sm sm:text-base text-foreground leading-relaxed font-medium">
                                  {recommendation}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Report Metadata */}
                <Card className="bg-muted/30 mt-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm sm:text-base">Report Information</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs sm:text-sm text-muted-foreground space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>Generated: {new Date(report.metadata.generatedAt).toLocaleString()}</div>
                      <div>Engine: {report.metadata.author} v{report.metadata.version}</div>
                      <div>Analysis Type: {report.metadata.analysisType}</div>
                      <div className="sm:col-span-2">Report ID: <code className="text-xs bg-muted px-1 py-0.5 rounded">{report.id}</code></div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Bottom Padding for better scrolling */}
                <div className="h-4"></div>
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};