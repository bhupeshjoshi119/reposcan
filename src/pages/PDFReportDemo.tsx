import React from 'react';
import { PDFGenerator } from '@/components/PDFGenerator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Github, MessageSquare, Sparkles, CheckCircle } from 'lucide-react';

export const PDFReportDemo: React.FC = () => {
  // Get GitHub token from environment or context
  const githubToken = import.meta.env.VITE_GITHUB_TOKEN;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Beautiful PDF Issue Reports
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Generate comprehensive, professionally formatted PDF reports with ALL repository issues, 
            detailed comments, Stack Overflow integration, and surprising AI-powered community insights
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Github className="h-3 w-3 mr-1" />
              GitHub Integration
            </Badge>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              <MessageSquare className="h-3 w-3 mr-1" />
              Stack Overflow
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Sparkles className="h-3 w-3 mr-1" />
              Beautiful Design
            </Badge>
          </div>
        </div>

        {/* Main PDF Generator */}
        <PDFGenerator githubToken={githubToken} />

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Professional Formatting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <strong>Bold headings</strong> for clear structure</li>
                <li>• <strong>Bullet points</strong> for easy scanning</li>
                <li>• <strong>Highlighted text</strong> with yellow background</li>
                <li>• <strong>Underlined</strong> important sections</li>
                <li>• <strong>Surprising AI insights</strong> about patterns</li>
                <li>• Adobe Reader compatible output</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="h-5 w-5 text-blue-600" />
                GitHub Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <strong>ALL issues</strong> with complete details</li>
                <li>• <strong>Comments & timeline</strong> data</li>
                <li>• Critical issues identification</li>
                <li>• Contributor analysis & patterns</li>
                <li>• Resolution time & engagement tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-orange-600" />
                Stack Overflow Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <strong>Detailed answers</strong> & solutions</li>
                <li>• Community engagement metrics</li>
                <li>• <strong>Proper attribution</strong> & credits</li>
                <li>• Documentation gap identification</li>
                <li>• Cross-platform correlation analysis</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Sample Report Sections */}
        <Card>
          <CardHeader>
            <CardTitle>Sample Report Sections</CardTitle>
            <CardDescription>
              Each generated PDF includes these comprehensive sections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="font-medium">Executive Summary</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="font-medium">Repository Overview</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  <span className="font-medium">Issue Statistics</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span className="font-medium">Critical Issues Analysis</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                  <span className="font-medium">Stack Overflow Integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                  <span className="font-medium">Trends and Analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  <span className="font-medium">Top Contributors</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-600 rounded-full"></div>
                  <span className="font-medium">Strategic Recommendations</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Implementation</CardTitle>
            <CardDescription>
              Advanced PDF generation with dynamic content and beautiful formatting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">PDF Features</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Dynamic page breaks and layout</li>
                  <li>• Professional color scheme</li>
                  <li>• Clickable links and navigation</li>
                  <li>• Metadata and document properties</li>
                  <li>• Multi-page support with headers/footers</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3">Data Integration</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• GitHub REST API v3 integration</li>
                  <li>• Stack Exchange API v2.3 queries</li>
                  <li>• Real-time data analysis</li>
                  <li>• Intelligent content correlation</li>
                  <li>• Automated trend detection</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>
            Generate beautiful, comprehensive PDF reports that combine GitHub issue analysis 
            with Stack Overflow community insights for better project understanding.
          </p>
        </div>
      </div>
    </div>
  );
};