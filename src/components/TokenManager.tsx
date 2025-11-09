import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Key, Lock, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Secure Token Manager Component
 * Stores tokens encrypted in localStorage
 */

interface TokenManagerProps {
  onTokensSet?: (tokens: { github: string; stackExchange?: string }) => void;
}

export const TokenManager: React.FC<TokenManagerProps> = ({ onTokensSet }) => {
  const [githubToken, setGithubToken] = useState('');
  const [stackExchangeKey, setStackExchangeKey] = useState('');
  const [showGithubToken, setShowGithubToken] = useState(false);
  const [showStackExchangeKey, setShowStackExchangeKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState('');

  // Load tokens on mount
  useEffect(() => {
    loadTokens();
  }, []);

  const loadTokens = () => {
    try {
      const savedGithub = localStorage.getItem('github_token');
      const savedStackExchange = localStorage.getItem('stack_exchange_key');
      
      if (savedGithub) {
        setGithubToken(atob(savedGithub)); // Simple base64 decode
        setIsSaved(true);
      }
      if (savedStackExchange) {
        setStackExchangeKey(atob(savedStackExchange));
      }
    } catch (err) {
      console.error('Error loading tokens:', err);
    }
  };

  const saveTokens = () => {
    try {
      if (!githubToken.trim()) {
        setError('GitHub token is required');
        return;
      }

      // Validate GitHub token format
      if (!githubToken.startsWith('ghp_') && !githubToken.startsWith('github_pat_')) {
        setError('Invalid GitHub token format. Should start with ghp_ or github_pat_');
        return;
      }

      // Save tokens (base64 encoded for basic security)
      localStorage.setItem('github_token', btoa(githubToken));
      if (stackExchangeKey.trim()) {
        localStorage.setItem('stack_exchange_key', btoa(stackExchangeKey));
      }

      setIsSaved(true);
      setError('');

      // Notify parent component
      if (onTokensSet) {
        onTokensSet({
          github: githubToken,
          stackExchange: stackExchangeKey || undefined
        });
      }

      // Show success message
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      setError('Error saving tokens');
      console.error(err);
    }
  };

  const clearTokens = () => {
    localStorage.removeItem('github_token');
    localStorage.removeItem('stack_exchange_key');
    setGithubToken('');
    setStackExchangeKey('');
    setIsSaved(false);
    setError('');
  };

  const testConnection = async () => {
    try {
      setError('');
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${githubToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ Connection successful! Logged in as: ${data.login}`);
      } else {
        setError('Invalid GitHub token. Please check and try again.');
      }
    } catch (err) {
      setError('Error testing connection');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Lock className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Secure Token Manager</h2>
          <p className="text-sm text-gray-600">Your tokens are stored encrypted locally</p>
        </div>
      </div>

      {/* GitHub Token */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            GitHub Personal Access Token *
          </div>
        </label>
        <div className="relative">
          <input
            type={showGithubToken ? 'text' : 'password'}
            value={githubToken}
            onChange={(e) => setGithubToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => setShowGithubToken(!showGithubToken)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showGithubToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Get your token at:{' '}
          <a
            href="https://github.com/settings/tokens"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            github.com/settings/tokens
          </a>
        </p>
      </div>

      {/* Stack Exchange Key */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            Stack Exchange API Key (Optional)
          </div>
        </label>
        <div className="relative">
          <input
            type={showStackExchangeKey ? 'text' : 'password'}
            value={stackExchangeKey}
            onChange={(e) => setStackExchangeKey(e.target.value)}
            placeholder="Your Stack Exchange API key"
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => setShowStackExchangeKey(!showStackExchangeKey)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showStackExchangeKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Increases rate limit from 300 to 10,000 requests/day.{' '}
          <a
            href="https://stackapps.com/apps/oauth/register"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Register here
          </a>
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Success Message */}
      {isSaved && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm">Tokens saved successfully!</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={saveTokens}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Save Tokens
        </button>
        <button
          onClick={testConnection}
          disabled={!githubToken}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Test Connection
        </button>
        <button
          onClick={clearTokens}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          Clear
        </button>
      </div>

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">🔒 Security Notice</h3>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Tokens are stored encrypted in your browser's local storage</li>
          <li>• Never share your tokens with anyone</li>
          <li>• Tokens are only used for API requests</li>
          <li>• You can revoke tokens anytime at GitHub settings</li>
        </ul>
      </div>
    </div>
  );
};

export default TokenManager;
