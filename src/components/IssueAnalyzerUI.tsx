import React, { useState } from 'react';
import { Search, Download, Loader2, CheckCircle, AlertCircle, FileText, Github } from 'lucide-react';
import { TokenManager } from './TokenManager';

/**
 * Main Issue Analyzer UI Component
 * Provides both single issue and batch analysis
 */

type AnalysisMode = 'single' | 'batch';

export const IssueAnalyzerUI: React.FC = () => {
  const [mode, setMode] = useState<AnalysisMode>('single');
  const [issueUrl, setIssueUrl] = useState('');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [maxIssues, setMaxIssues] = useState<number | undefined>(undefined);
  const [state, setState] = useState<'all' | 'open' | 'closed'>('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [showTokenManager, setShowTokenManager] = useState(false);
  const [tokens, setTokens] = useState<{ github: string; stackExchange?: string } | null>(null);

  // Check for saved tokens on mount
  React.useEffect(() => {
    const savedGithub = localStorage.getItem('github_token');
    if (savedGithub) {
      setTokens({
        github: atob(savedGithub),
        stackExchange: localStorage.getItem('stack_exchange_key') 
          ? atob(localStorage.getItem('stack_exchange_key')!) 
          : undefined
      });
    } else {
      setShowTokenManager(true);
    }
  }, []);

  const analyzeSingleIssue = async () => {
    if (!tokens?.github) {
      setError('Please set up your GitHub token first');
      setShowTokenManager(true);
      return;
    }

    if (!issueUrl.trim()) {
      setError('Please enter a GitHub issue URL');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setProgress(0);

    try {
      // Call your API endpoint
      const response = await fetch('/api/analyze-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          issueUrl,
          githubToken: tokens.github,
          stackExchangeKey: tokens.stackExchange
        })
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setResult(data);
      setProgress(100);
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeBatch = async () => {
    if (!tokens?.github) {
      setError('Please set up your GitHub token first');
      setShowTokenManager(true);
      return;
    }

    if (!owner.trim() || !repo.trim()) {
      setError('Please enter repository owner and name');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setProgress(0);

    try {
      // Call your API endpoint
      const response = await fetch('/api/batch-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner,
          repo,
          maxIssues,
          state,
          githubToken: tokens.github,
          stackExchangeKey: tokens.stackExchange
        })
      });

      if (!response.ok) {
        throw new Error('Batch analysis failed');
      }

      const data = await response.json();
      setResult(data);
      setProgress(100);
    } catch (err: any) {
      setError(err.message || 'Batch analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadPDF = () => {
    if (result?.pdfUrl) {
      window.open(result.pdfUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🔍 GitHub Issue Analyzer
          </h1>
          <p className="text-lg text-gray-600">
            Analyze issues with Stack Overflow solutions - Perfect for educators!
          </p>
        </div>

        {/* Token Manager Toggle */}
        <div className="mb-6 text-center">
          <button
            onClick={() => setShowTokenManager(!showTokenManager)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <Github className="w-5 h-5" />
            {tokens ? 'Manage Tokens' : 'Setup Tokens'}
          </button>
        </div>

        {/* Token Manager */}
        {showTokenManager && (
          <div className="mb-8">
            <TokenManager onTokensSet={(t) => {
              setTokens(t);
              setShowTokenManager(false);
            }} />
          </div>
        )}

        {/* Mode Selector */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setMode('single')}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                mode === 'single'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Single Issue Analysis
            </button>
            <button
              onClick={() => setMode('batch')}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                mode === 'batch'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Batch Analysis (ALL Issues)
            </button>
          </div>

          {/* Single Issue Mode */}
          {mode === 'single' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GitHub Issue URL
              </label>
              <input
                type="text"
                value={issueUrl}
                onChange={(e) => setIssueUrl(e.target.value)}
                placeholder="https://github.com/flutter/flutter/issues/12345"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              />
              <button
                onClick={analyzeSingleIssue}
                disabled={isAnalyzing || !tokens}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Analyze Issue
                  </>
                )}
              </button>
            </div>
          )}

          {/* Batch Mode */}
          {mode === 'batch' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repository Owner
                  </label>
                  <input
                    type="text"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder="flutter"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repository Name
                  </label>
                  <input
                    type="text"
                    value={repo}
                    onChange={(e) => setRepo(e.target.value)}
                    placeholder="flutter"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Issues (Optional)
                  </label>
                  <input
                    type="number"
                    value={maxIssues || ''}
                    onChange={(e) => setMaxIssues(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Leave empty for all"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issue State
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value as any)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Issues</option>
                    <option value="open">Open Only</option>
                    <option value="closed">Closed Only</option>
                  </select>
                </div>
              </div>

              <button
                onClick={analyzeBatch}
                disabled={isAnalyzing || !tokens}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing {progress}%...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Analyze ALL Issues
                  </>
                )}
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">Analysis Complete!</h2>
              </div>
              <button
                onClick={downloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{result.totalIssues || 1}</div>
                <div className="text-sm text-gray-600">Issues Analyzed</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{result.totalSolutions || 0}</div>
                <div className="text-sm text-gray-600">SO Solutions</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{result.totalRelated || 0}</div>
                <div className="text-sm text-gray-600">Related Issues</div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{result.confidence || 0}%</div>
                <div className="text-sm text-gray-600">Confidence</div>
              </div>
            </div>

            <div className="prose max-w-none">
              <h3>Summary</h3>
              <p>{result.summary}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueAnalyzerUI;
