import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  Bug,
  CheckCircle,
  Clock,
  Code,
  GitBranch,
  Shield,
  Star,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';

interface AnalyticsData {
  repositoryHealth: number;
  issueVelocity: number;
  codeQuality: number;
  securityScore: number;
  predictedIssues: number;
  activeContributors: number;
  totalIssues: number;
  resolvedIssues: number;
  criticalIssues: number;
  trends: {
    issues: number[];
    commits: number[];
    contributors: number[];
  };
  technologies: Array<{
    name: string;
    percentage: number;
    color: string;
  }>;
  predictions: Array<{
    type: string;
    probability: number;
    impact: 'low' | 'medium' | 'high';
    timeframe: string;
  }>;
}

export const RealtimeAnalyticsDashboard: React.FC<{ repository: string }> = ({ repository }) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate real-time data updates
  useEffect(() => {
    const generateMockData = (): AnalyticsData => ({
      repositoryHealth: Math.floor(Math.random() * 20) + 80, // 80-100
      issueVelocity: Math.floor(Math.random() * 30) + 70,    // 70-100
      codeQuality: Math.floor(Math.random() * 25) + 75,      // 75-100
      securityScore: Math.floor(Math.random() * 15) + 85,    // 85-100
      predictedIssues: Math.floor(Math.random() * 5) + 2,    // 2-7
      activeContributors: Math.floor(Math.random() * 20) + 15, // 15-35
      totalIssues: Math.floor(Math.random() * 100) + 150,    // 150-250
      resolvedIssues: Math.floor(Math.random() * 80) + 120,  // 120-200
      criticalIssues: Math.floor(Math.random() * 5) + 1,     // 1-6
      trends: {
        issues: Array.from({ length: 7 }, () => Math.floor(Math.random() * 20) + 10),
        commits: Array.from({ length: 7 }, () => Math.floor(Math.random() * 30) + 20),
        contributors: Array.from({ length: 7 }, () => Math.floor(Math.random() * 10) + 5),
      },
      technologies: [
        { name: 'TypeScript', percentage: 45, color: '#3178c6' },
        { name: 'JavaScript', percentage: 25, color: '#f7df1e' },
        { name: 'CSS', percentage: 15, color: '#1572b6' },
        { name: 'HTML', percentage: 10, color: '#e34f26' },
        { name: 'Other', percentage: 5, color: '#6b7280' },
      ],
      predictions: [
        {
          type: 'Performance Issue',
          probability: 78,
          impact: 'medium',
          timeframe: '2-3 days'
        },
        {
          type: 'Security Vulnerability',
          probability: 23,
          impact: 'high',
          timeframe: '1 week'
        },
        {
          type: 'Breaking Change',
          probability: 45,
          impact: 'low',
          timeframe: '5 days'
        }
      ]
    });

    // Initial load
    setTimeout(() => {
      setData(generateMockData());
      setIsLoading(false);
    }, 1500);

    // Real-time updates every 5 seconds
    const interval = setInterval(() => {
      setData(generateMockData());
    }, 5000);

    return () => clearInterval(interval);
  }, [repository]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 animate-pulse" />
          <h2 className="text-2xl font-bold">Loading Real-time Analytics...</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary animate-pulse" />
          <h2 className="text-2xl font-bold">Real-time Analytics</h2>
          <Badge variant="outline" className="animate-pulse">
            <Zap className="h-3 w-3 mr-1" />
            Live
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          Repository: <span className="font-mono">{repository}</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Repository Health</p>
                <p className={`text-2xl font-bold ${getHealthColor(data.repositoryHealth)}`}>
                  {data.repositoryHealth}%
                </p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={data.repositoryHealth} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Issue Velocity</p>
                <p className={`text-2xl font-bold ${getHealthColor(data.issueVelocity)}`}>
                  {data.issueVelocity}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={data.issueVelocity} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Code Quality</p>
                <p className={`text-2xl font-bold ${getHealthColor(data.codeQuality)}`}>
                  {data.codeQuality}%
                </p>
              </div>
              <Code className="h-8 w-8 text-purple-500" />
            </div>
            <Progress value={data.codeQuality} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Security Score</p>
                <p className={`text-2xl font-bold ${getHealthColor(data.securityScore)}`}>
                  {data.securityScore}%
                </p>
              </div>
              <Shield className="h-8 w-8 text-orange-500" />
            </div>
            <Progress value={data.securityScore} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Issue Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Issues</p>
                <p className="text-3xl font-bold">{data.totalIssues}</p>
              </div>
              <Bug className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-3xl font-bold text-green-600">{data.resolvedIssues}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical</p>
                <p className="text-3xl font-bold text-red-600">{data.criticalIssues}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technology Stack */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Technology Stack Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.technologies.map((tech) => (
              <div key={tech.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: tech.color }}
                  />
                  <span className="font-medium">{tech.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={tech.percentage} className="w-24" />
                  <span className="text-sm font-medium w-12">{tech.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Predictions */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Issue Predictions
            <Badge variant="secondary">
              <Star className="h-3 w-3 mr-1" />
              ML Powered
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.predictions.map((prediction, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{prediction.type}</span>
                    <Badge variant={getImpactColor(prediction.impact)}>
                      {prediction.impact} impact
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {prediction.timeframe}
                    </span>
                    <span>{prediction.probability}% probability</span>
                  </div>
                </div>
                <div className="text-right">
                  <Progress value={prediction.probability} className="w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contributors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Active Contributors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{data.activeContributors}</p>
              <p className="text-sm text-muted-foreground">Contributors this week</p>
            </div>
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">
                {data.trends.commits.reduce((a, b) => a + b, 0)} commits this week
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealtimeAnalyticsDashboard;