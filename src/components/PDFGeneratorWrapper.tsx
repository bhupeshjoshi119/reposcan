import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings, Zap, Sparkles } from "lucide-react";
import { PDFReportGenerator } from "./PDFReportGenerator";
import { DualPDFGenerator } from "./DualPDFGenerator";

interface PDFGeneratorWrapperProps {
  repository: any;
  analysis: string;
  prediction?: any;
  className?: string;
}

export const PDFGeneratorWrapper = ({ 
  repository, 
  analysis, 
  prediction,
  className 
}: PDFGeneratorWrapperProps) => {
  const [useDualMode, setUseDualMode] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // Load preference from localStorage
  useEffect(() => {
    const savedPreference = localStorage.getItem('pdf-generator-mode');
    if (savedPreference) {
      setUseDualMode(savedPreference === 'dual');
    }
  }, []);

  // Save preference to localStorage
  const handleModeChange = (isDual: boolean) => {
    setUseDualMode(isDual);
    localStorage.setItem('pdf-generator-mode', isDual ? 'dual' : 'single');
  };

  if (!useDualMode) {
    return (
      <div className={className}>
        {/* Settings Toggle */}
        <Card className="p-4 mb-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="pdf-mode" className="text-sm font-medium">
                PDF Generation Mode
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="w-3 h-3" />
                Single
              </div>
              <Switch
                id="pdf-mode"
                checked={useDualMode}
                onCheckedChange={handleModeChange}
              />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="w-3 h-3" />
                Dual
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Switch between single PDF generator or dual mode with multiple options
          </p>
        </Card>

        {/* Original Single PDF Generator */}
        <PDFReportGenerator
          repository={repository}
          analysis={analysis}
          prediction={prediction}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Settings Toggle */}
      <Card className="p-4 mb-4 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-muted-foreground" />
            <Label htmlFor="pdf-mode" className="text-sm font-medium">
              PDF Generation Mode
            </Label>
            <Badge variant="secondary" className="text-xs">
              Dual Active
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="w-3 h-3" />
              Single
            </div>
            <Switch
              id="pdf-mode"
              checked={useDualMode}
              onCheckedChange={handleModeChange}
            />
            <div className="flex items-center gap-2 text-sm text-primary">
              <Sparkles className="w-3 h-3" />
              Dual
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Choose between Standard (fast) or Enhanced (premium visuals) PDF generation
        </p>
      </Card>

      {/* Dual PDF Generator */}
      <DualPDFGenerator
        repository={repository}
        analysis={analysis}
        prediction={prediction}
      />
    </div>
  );
};