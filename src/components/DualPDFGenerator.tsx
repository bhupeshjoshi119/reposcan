import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  FileText,
  Download,
  Sparkles,
  Zap,
  Image,
  FileImage,
  Palette,
  Settings,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DualPDFGeneratorProps {
  repository: any;
  analysis: string;
  prediction?: any;
  className?: string;
}

export const DualPDFGenerator = ({
  repository,
  analysis,
  prediction,
  className,
}: DualPDFGeneratorProps) => {
  const [generating, setGenerating] = useState<"standard" | "enhanced" | null>(
    null
  );
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const generateStandardPDF = async () => {
    if (!repository) {
      toast({
        title: "Missing Data",
        description: "Repository data is required to generate PDF",
        variant: "destructive",
      });
      return;
    }

    setGenerating("standard");
    setProgress(0);

    try {
      setProgress(20);

      // Use the limited PDF generator (protects business model)
      const { generateLimitedPDFReport } = await import(
        "@/utils/limitedPdfGenerator"
      );

      setProgress(50);

      // Use fallback analysis if not provided
      const analysisText =
        analysis ||
        "Repository analysis data not available. This is a basic overview based on repository metadata.";

      await generateLimitedPDFReport(repository, analysisText, {
        method: "direct",
        includeInfographics: false,
        prediction: prediction,
      });

      setProgress(100);

      toast({
        title: "Basic PDF Generated",
        description: "Overview report generated successfully",
      });
    } catch (error) {
      console.error("Basic PDF generation error:", error);
      toast({
        title: "PDF Generation Failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while generating the PDF",
        variant: "destructive",
      });
    } finally {
      setGenerating(null);
      setProgress(0);
    }
  };

  const generateEnhancedPDF = async () => {
    if (!repository) {
      toast({
        title: "Missing Data",
        description: "Repository data is required to generate PDF",
        variant: "destructive",
      });
      return;
    }

    setGenerating("enhanced");
    setProgress(0);

    try {
      setProgress(15);

      // Use the ACTUAL enhanced PDF generator with MORE content than basic
      const { generateEnhancedPDFReport } = await import(
        "@/utils/enhancedPdfGenerator"
      );

      setProgress(40);

      // Use fallback analysis if not provided
      const analysisText =
        analysis ||
        "Repository analysis data not available. This is an enhanced overview based on repository metadata.";

      await generateEnhancedPDFReport(repository, analysisText, {
        method: "hybrid",
        includeInfographics: true,
        prediction: prediction,
      });

      setProgress(100);

      toast({
        title: "Enhanced Overview Generated",
        description:
          "Enhanced overview with detailed metrics generated successfully",
      });
    } catch (enhancedError) {
      console.error("Enhanced PDF generation failed:", enhancedError);

      toast({
        title: "PDF Generation Failed",
        description:
          enhancedError instanceof Error
            ? enhancedError.message
            : "Unable to generate enhanced PDF. Please try Basic Overview.",
        variant: "destructive",
      });
    } finally {
      setGenerating(null);
      setProgress(0);
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">PDF Report Generation</h3>
        </div>
        <Badge variant="outline" className="gap-1">
          <Settings className="w-3 h-3" />
          Dual Mode
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        Choose your preferred analysis level based on your needs
      </p>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>💡 Pricing:</strong> Basic (Free) • Enhanced ($10/month) •
          Premium ($20/month)
        </p>
        <p className="text-xs text-blue-700 mt-1">
          Payment integration coming soon. Currently all tiers available for
          testing.
        </p>
      </div>

      {generating && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>
              Generating {generating === "standard" ? "Standard" : "Enhanced"}{" "}
              PDF...
            </span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic PDF Generation */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-blue-500" />
            <h4 className="font-medium">Basic Overview</h4>
            <Badge variant="secondary" className="text-xs">
              Free
            </Badge>
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>Repository statistics</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>Simple health score</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>Quick insights cards</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>3 generic recommendations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>Professional design</span>
            </div>
          </div>

          <Button
            onClick={generateStandardPDF}
            disabled={generating !== null || !repository}
            className="w-full"
            variant="outline"
          >
            {generating === "standard" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Generate Basic Overview
              </>
            )}
          </Button>
        </div>

        <Separator orientation="vertical" className="hidden md:block" />
        <Separator className="md:hidden" />

        {/* Enhanced Overview Generation */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <h4 className="font-medium">Enhanced Overview</h4>
            <Badge
              variant="default"
              className="text-xs bg-gradient-to-r from-blue-500 to-purple-500"
            >
              Visual
            </Badge>
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
              <span>Health score breakdown (4 dimensions)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
              <span>Smart recommendations (5-7 actions)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
              <span>Issue analysis & categorization</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
              <span>Community engagement metrics</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
              <span>Activity timeline + insights</span>
            </div>
          </div>

          <Button
            onClick={generateEnhancedPDF}
            disabled={generating !== null || !repository}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            {generating === "enhanced" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Enhanced Overview
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="mt-6 pt-4 border-t">
        <h5 className="font-medium text-sm mb-3">Feature Comparison</h5>
        <div className="grid grid-cols-4 gap-3 text-xs">
          <div className="font-medium">Feature</div>
          <div className="text-center font-medium">
            Basic
            <br />
            <span className="text-green-600">Free</span>
          </div>
          <div className="text-center font-medium">
            Enhanced
            <br />
            <span className="text-blue-600">$10/mo</span>
          </div>
          <div className="text-center font-medium">
            Premium
            <br />
            <span className="text-purple-600">$20/mo</span>
          </div>

          <div className="text-muted-foreground">Repository Stats</div>
          <div className="text-center text-green-600">✅</div>
          <div className="text-center text-green-600">✅</div>
          <div className="text-center text-green-600">✅</div>

          <div className="text-muted-foreground">Health Score</div>
          <div className="text-center text-blue-600">Simple</div>
          <div className="text-center text-purple-600">4D Breakdown</div>
          <div className="text-center text-purple-600">AI-Powered</div>

          <div className="text-muted-foreground">Recommendations</div>
          <div className="text-center text-blue-600">3 Generic</div>
          <div className="text-center text-purple-600">5-7 Smart</div>
          <div className="text-center text-purple-600">AI Custom</div>

          <div className="text-muted-foreground">Issue Analysis</div>
          <div className="text-center text-gray-400">❌</div>
          <div className="text-center text-purple-600">✅</div>
          <div className="text-center text-purple-600">✅ Advanced</div>

          <div className="text-muted-foreground">Community Metrics</div>
          <div className="text-center text-gray-400">❌</div>
          <div className="text-center text-purple-600">✅</div>
          <div className="text-center text-purple-600">✅ Advanced</div>

          <div className="text-muted-foreground">Security Scan</div>
          <div className="text-center text-gray-400">❌</div>
          <div className="text-center text-gray-400">❌</div>
          <div className="text-center text-purple-600">✅ CVE</div>

          <div className="text-muted-foreground">AI Analysis</div>
          <div className="text-center text-gray-400">❌</div>
          <div className="text-center text-gray-400">❌</div>
          <div className="text-center text-purple-600">✅</div>
        </div>

        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            💡 <strong>Note:</strong> Payment integration coming soon. All tiers
            currently available for testing.
          </p>
        </div>
      </div>
    </Card>
  );
};
