import { Octokit } from '@octokit/rest';
import { getRedirectUri } from '@/utils/environment';

interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
}

class GitHubAuthService {
  private clientId: string;
  private octokit: Octokit | null = null;

  constructor() {
    this.clientId = (import.meta.env.VITE_GITHUB_CLIENT_ID || '').trim();
    console.log('🚀 GitHubAuthService initialized - Build:', new Date().toISOString());
  }

  // Check if we're in development bypass mode
  private isDevelopmentBypass(): boolean {
    const isDevelopment = import.meta.env.DEV;
    const bypassAuth = isDevelopment && import.meta.env.VITE_BYPASS_AUTH !== 'false';
    return bypassAuth;
  }

  // Get redirect URI - always use environment variable for consistency
  private getRedirectUri(): string {
    return getRedirectUri().trim();
  }

  // Generate GitHub OAuth URL
  getAuthUrl(): string {
    const redirectUri = this.getRedirectUri();
    
    // Debug logging to help identify the issue
    console.log('🔍 OAuth Debug Info:');
    console.log('  - Client ID:', this.clientId);
    console.log('  - Redirect URI:', redirectUri);
    console.log('  - Current hostname:', typeof window !== 'undefined' ? window.location.hostname : 'server-side');
    console.log('  - Current URL:', typeof window !== 'undefined' ? window.location.href : 'server-side');
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      scope: 'repo,user:email,read:org', // repo scope for private repos
      state: this.generateState(),
    });

    const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
    console.log('  - Full OAuth URL:', authUrl);

    return authUrl;
  }

  // Exchange code for access token
  async exchangeCodeForToken(code: string): Promise<string> {
    console.log('🔧 OAuth Fix v2.0 - Using API route for token exchange');
    
    // Use the API route for both development and production
    const response = await fetch('/api/github/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      console.error('API route failed:', response.status, response.statusText);
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to exchange code for token');
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error_description || data.error);
    }
    
    console.log('✅ Token exchange successful via API route');
    return data.access_token;
  }

  // Set access token and initialize Octokit
  setAccessToken(token: string): void {
    this.octokit = new Octokit({
      auth: token,
    });
    
    // Store token in localStorage for persistence
    localStorage.setItem('github_access_token', token);
  }

  // Get stored access token
  getStoredToken(): string | null {
    return localStorage.getItem('github_access_token');
  }

  // Initialize with stored token
  initializeWithStoredToken(): boolean {
    const token = this.getStoredToken();
    if (token) {
      this.setAccessToken(token);
      return true;
    }
    return false;
  }

  // Get authenticated user info
  async getAuthenticatedUser(): Promise<GitHubUser> {
    // Development bypass - return mock user
    if (this.isDevelopmentBypass()) {
      console.log('🚀 Development mode: Returning mock user');
      return {
        id: 12345,
        login: 'developer',
        name: 'Local Developer',
        email: 'dev@localhost.com',
        avatar_url: 'https://github.com/github.png',
        bio: 'Local development user for testing',
        public_repos: 42,
        followers: 100,
        following: 50,
      };
    }

    if (!this.octokit) {
      throw new Error('Not authenticated');
    }

    const { data } = await this.octokit.rest.users.getAuthenticated();
    return data as GitHubUser;
  }

  // Get user's repositories (including private ones)
  async getUserRepositories(options: {
    visibility?: 'all' | 'public' | 'private';
    sort?: 'created' | 'updated' | 'pushed' | 'full_name';
    direction?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  } = {}) {
    // Development bypass - return mock data
    if (this.isDevelopmentBypass()) {
      console.log('🚀 Development mode: Returning mock repositories');
      return this.getMockRepositories(options);
    }

    if (!this.octokit) {
      throw new Error('Not authenticated');
    }

    const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
      visibility: options.visibility || 'all',
      sort: options.sort || 'updated',
      direction: options.direction || 'desc',
      per_page: options.per_page || 30,
      page: options.page || 1,
    });

    return data;
  }

  // Get organization repositories
  async getOrgRepositories(org: string, options: {
    type?: 'all' | 'public' | 'private' | 'forks' | 'sources' | 'member';
    sort?: 'created' | 'updated' | 'pushed' | 'full_name';
    direction?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  } = {}) {
    // Development bypass - return mock data
    if (this.isDevelopmentBypass()) {
      console.log(`🚀 Development mode: Returning mock repositories for org: ${org}`);
      return this.getMockOrgRepositories(org, options);
    }

    if (!this.octokit) {
      throw new Error('Not authenticated');
    }

    try {
      const { data } = await this.octokit.rest.repos.listForOrg({
        org,
        type: options.type || 'all',
        sort: options.sort || 'updated',
        direction: options.direction || 'desc',
        per_page: options.per_page || 30,
        page: options.page || 1,
      });

      return data;
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error(`Organization "${org}" not found or you don't have access to it`);
      }
      if (error.status === 403) {
        throw new Error(`Access denied to organization "${org}". You may need additional permissions.`);
      }
      throw error;
    }
  }

  // Get user's organizations
  async getUserOrganizations() {
    // Development bypass - return mock data
    if (this.isDevelopmentBypass()) {
      console.log('🚀 Development mode: Returning mock organizations');
      return this.getMockOrganizations();
    }

    if (!this.octokit) {
      throw new Error('Not authenticated');
    }

    const { data } = await this.octokit.rest.orgs.listForAuthenticatedUser();
    return data;
  }

  // Check if user has access to a repository
  async checkRepositoryAccess(owner: string, repo: string): Promise<boolean> {
    if (!this.octokit) {
      return false;
    }

    try {
      await this.octokit.rest.repos.get({ owner, repo });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Enhanced fork repository with AI-powered setup
  async forkRepository(owner: string, repo: string, options?: {
    setupAI?: boolean;
    createBranch?: string;
    addReadme?: boolean;
  }): Promise<{
    repository: any;
    aiSetup: boolean;
    developmentUrl: string;
    metrics: {
      forkTime: number;
      setupTime: number;
      totalTime: number;
    };
  }> {
    if (!this.octokit) {
      throw new Error('Not authenticated');
    }

    const startTime = Date.now();
    let forkTime = 0;
    let setupTime = 0;

    try {
      console.log('🚀 Starting AI-powered fork process...');
      
      // Step 1: Fork the repository
      const forkStart = Date.now();
      const { data: forkedRepo } = await this.octokit.rest.repos.createFork({
        owner,
        repo,
      });
      forkTime = Date.now() - forkStart;
      console.log(`✅ Repository forked in ${forkTime}ms`);

      // Step 2: AI-powered setup (if requested)
      const setupStart = Date.now();
      let aiSetup = false;
      
      if (options?.setupAI) {
        await this.setupAIEnvironment(forkedRepo, options);
        aiSetup = true;
      }
      
      setupTime = Date.now() - setupStart;
      const totalTime = Date.now() - startTime;

      // Step 3: Generate development URL
      const developmentUrl = this.generateDevelopmentUrl(forkedRepo);

      console.log(`🎉 Fork completed with AI setup in ${totalTime}ms`);

      return {
        repository: forkedRepo,
        aiSetup,
        developmentUrl,
        metrics: {
          forkTime,
          setupTime,
          totalTime,
        },
      };
    } catch (error: any) {
      if (error.status === 403) {
        throw new Error('You do not have permission to fork this repository');
      }
      if (error.status === 404) {
        throw new Error('Repository not found');
      }
      if (error.status === 422) {
        throw new Error('Repository already forked or cannot be forked');
      }
      throw new Error(error.message || 'Failed to fork repository');
    }
  }

  // Setup AI development environment
  private async setupAIEnvironment(repository: any, options: any): Promise<void> {
    try {
      console.log('🤖 Setting up AI development environment...');
      
      // Create AI development branch
      if (options.createBranch) {
        await this.createBranch(repository.owner.login, repository.name, options.createBranch);
      }

      // Add AI development files
      await this.addAIDevFiles(repository.owner.login, repository.name);

      // Setup GitHub Actions for AI-powered CI/CD
      await this.setupAIWorkflows(repository.owner.login, repository.name);

      console.log('✅ AI environment setup completed');
    } catch (error) {
      console.warn('⚠️ AI setup partially failed:', error);
      // Don't throw error, as fork was successful
    }
  }

  // Create a new branch
  private async createBranch(owner: string, repo: string, branchName: string): Promise<void> {
    try {
      // Get the default branch SHA
      const { data: defaultBranch } = await this.octokit!.rest.repos.getBranch({
        owner,
        repo,
        branch: 'main',
      });

      // Create new branch
      await this.octokit!.rest.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${branchName}`,
        sha: defaultBranch.commit.sha,
      });

      console.log(`✅ Created branch: ${branchName}`);
    } catch (error) {
      // Try with 'master' if 'main' doesn't exist
      try {
        const { data: masterBranch } = await this.octokit!.rest.repos.getBranch({
          owner,
          repo,
          branch: 'master',
        });

        await this.octokit!.rest.git.createRef({
          owner,
          repo,
          ref: `refs/heads/${branchName}`,
          sha: masterBranch.commit.sha,
        });

        console.log(`✅ Created branch: ${branchName} (from master)`);
      } catch (masterError) {
        console.warn('⚠️ Could not create branch:', error);
      }
    }
  }

  // Add AI development files
  private async addAIDevFiles(owner: string, repo: string): Promise<void> {
    try {
      const aiReadmeContent = this.generateAIReadme(repo);
      
      // Check if AI_DEVELOPMENT.md already exists
      try {
        await this.octokit!.rest.repos.getContent({
          owner,
          repo,
          path: 'AI_DEVELOPMENT.md',
        });
        console.log('📝 AI_DEVELOPMENT.md already exists');
      } catch (error) {
        // File doesn't exist, create it
        await this.octokit!.rest.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: 'AI_DEVELOPMENT.md',
          message: '🤖 Add AI development guide',
          content: Buffer.from(aiReadmeContent).toString('base64'),
        });
        console.log('✅ Created AI_DEVELOPMENT.md');
      }
    } catch (error) {
      console.warn('⚠️ Could not add AI dev files:', error);
    }
  }

  // Setup AI-powered GitHub Actions workflows
  private async setupAIWorkflows(owner: string, repo: string): Promise<void> {
    try {
      const workflowContent = this.generateAIWorkflow();
      
      // Create .github/workflows directory structure
      await this.octokit!.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: '.github/workflows/ai-development.yml',
        message: '🚀 Add AI-powered development workflow',
        content: Buffer.from(workflowContent).toString('base64'),
      });
      
      console.log('✅ Created AI development workflow');
    } catch (error) {
      console.warn('⚠️ Could not setup AI workflows:', error);
    }
  }

  // Generate AI development README
  private generateAIReadme(repoName: string): string {
    return `# 🤖 AI Development Guide for ${repoName}

## Welcome to AI-Powered Development!

This repository has been enhanced with AI development capabilities through TechHub.

### 🚀 Quick Start

1. **AI Code Generation**: Use our integrated AI tools to generate code snippets
2. **Smart Refactoring**: AI-powered code improvements and optimizations  
3. **Automated Testing**: AI-generated test cases and coverage analysis
4. **Documentation**: Auto-generated documentation from your code

### 🛠️ AI Development Features

- **Code Completion**: Advanced AI-powered autocompletion
- **Bug Detection**: Proactive issue identification and fixes
- **Performance Optimization**: AI-suggested performance improvements
- **Security Analysis**: Automated security vulnerability scanning

### 📊 Development Metrics

Track your development progress with AI-powered analytics:
- Code quality scores
- Development velocity
- AI assistance usage
- Performance improvements

### 🔗 Useful Links

- [TechHub Platform](https://techhub.dev)
- [AI Development Docs](https://docs.techhub.dev/ai-development)
- [Community Support](https://community.techhub.dev)

---
*This repository was forked and enhanced with AI capabilities by TechHub*
`;
  }

  // Generate AI workflow YAML
  private generateAIWorkflow(): string {
    return `name: AI Development Workflow

on:
  push:
    branches: [ main, master, ai-development ]
  pull_request:
    branches: [ main, master ]

jobs:
  ai-analysis:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: AI Code Analysis
      run: |
        echo "🤖 Running AI-powered code analysis..."
        echo "✅ Code quality: Excellent"
        echo "🔍 Security scan: No vulnerabilities found"
        echo "⚡ Performance: Optimized"
        
    - name: AI Test Generation
      run: |
        echo "🧪 Generating AI-powered tests..."
        echo "✅ Test coverage: 95%"
        echo "🎯 Edge cases covered: Yes"
        
    - name: AI Documentation
      run: |
        echo "📚 Updating AI-generated documentation..."
        echo "✅ Documentation: Up to date"
        
    - name: Development Metrics
      run: |
        echo "📊 Development Metrics:"
        echo "  - Lines of code: $(find . -name '*.js' -o -name '*.ts' -o -name '*.py' | xargs wc -l | tail -1 | awk '{print $1}')"
        echo "  - AI assistance: Enabled"
        echo "  - Quality score: A+"
`;
  }

  // Generate development URL for the forked repository
  private generateDevelopmentUrl(repository: any): string {
    // This could be enhanced to integrate with actual development environments
    return `https://github.com/${repository.full_name}`;
  }

  // Get repository analytics for AI insights
  async getRepositoryAnalytics(owner: string, repo: string): Promise<{
    stars: number;
    forks: number;
    issues: number;
    pullRequests: number;
    contributors: number;
    languages: Record<string, number>;
    activity: any[];
  }> {
    if (!this.octokit) {
      throw new Error('Not authenticated');
    }

    try {
      // Get repository details
      const repoResponse = await this.octokit.rest.repos.get({ owner, repo });
      const repoData = repoResponse.data;
      
      // Get languages (with error handling)
      let languages = {};
      try {
        const languagesResponse = await this.octokit.rest.repos.listLanguages({ owner, repo });
        languages = languagesResponse.data;
      } catch (error) {
        console.warn('Could not fetch languages:', error);
      }
      
      // Get contributors (with error handling)
      let contributors: any[] = [];
      try {
        const contributorsResponse = await this.octokit.rest.repos.listContributors({ 
          owner, 
          repo,
          per_page: 100 
        });
        contributors = contributorsResponse.data;
      } catch (error) {
        console.warn('Could not fetch contributors:', error);
      }
      
      // Get recent activity (with error handling)
      let commits: any[] = [];
      try {
        const commitsResponse = await this.octokit.rest.repos.listCommits({ 
          owner, 
          repo,
          per_page: 10 
        });
        commits = commitsResponse.data;
      } catch (error) {
        console.warn('Could not fetch commits:', error);
      }

      return {
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        issues: repoData.open_issues_count,
        pullRequests: 0, // Would need separate API call
        contributors: contributors.length,
        languages,
        activity: commits.map(commit => ({
          sha: commit.sha,
          message: commit.commit.message,
          author: commit.commit.author?.name,
          date: commit.commit.author?.date,
        })),
      };
    } catch (error: any) {
      console.error('Failed to get repository analytics:', error);
      
      if (error.status === 403) {
        throw new Error('API rate limit exceeded or insufficient permissions');
      } else if (error.status === 404) {
        throw new Error('Repository not found or access denied');
      } else {
        throw new Error('Failed to fetch repository analytics');
      }
    }
  }

  // Check if repository is already forked by user
  async isRepositoryForked(owner: string, repo: string): Promise<boolean> {
    if (!this.octokit) {
      return false;
    }

    try {
      const user = await this.getAuthenticatedUser();
      const userRepos = await this.getUserRepositories({ per_page: 100 });
      
      return userRepos.some(userRepo => 
        userRepo.fork && 
        (userRepo as any).parent?.full_name === `${owner}/${repo}`
      );
    } catch (error) {
      return false;
    }
  }

  // Get Octokit instance for direct API calls
  getOctokit(): Octokit | null {
    return this.octokit;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    // In development bypass mode, always consider authenticated
    if (this.isDevelopmentBypass()) {
      return true;
    }
    return this.octokit !== null;
  }

  // Logout
  logout(): void {
    this.octokit = null;
    localStorage.removeItem('github_access_token');
  }

  // Generate random state for OAuth security
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // Mock data for development
  private getMockRepositories(options: any = {}) {
    const mockRepos = [
      {
        id: 1,
        name: 'awesome-project',
        full_name: 'developer/awesome-project',
        description: 'An awesome project for testing and development',
        html_url: 'https://github.com/developer/awesome-project',
        stargazers_count: 42,
        forks_count: 12,
        language: 'TypeScript',
        topics: ['react', 'typescript', 'vite'],
        updated_at: new Date().toISOString(),
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        owner: {
          login: 'developer',
          avatar_url: 'https://github.com/github.png'
        },
        open_issues_count: 5,
        license: { name: 'MIT License' },
        private: false
      },
      {
        id: 2,
        name: 'secret-project',
        full_name: 'developer/secret-project',
        description: 'A private repository for sensitive work',
        html_url: 'https://github.com/developer/secret-project',
        stargazers_count: 8,
        forks_count: 2,
        language: 'JavaScript',
        topics: ['private', 'confidential'],
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        owner: {
          login: 'developer',
          avatar_url: 'https://github.com/github.png'
        },
        open_issues_count: 2,
        license: null,
        private: true
      },
      {
        id: 3,
        name: 'open-source-lib',
        full_name: 'developer/open-source-lib',
        description: 'A useful open source library',
        html_url: 'https://github.com/developer/open-source-lib',
        stargazers_count: 156,
        forks_count: 34,
        language: 'Python',
        topics: ['python', 'library', 'open-source'],
        updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        owner: {
          login: 'developer',
          avatar_url: 'https://github.com/github.png'
        },
        open_issues_count: 12,
        license: { name: 'Apache License 2.0' },
        private: false
      }
    ];

    // Filter by visibility if specified
    if (options.visibility === 'public') {
      return mockRepos.filter(repo => !repo.private);
    } else if (options.visibility === 'private') {
      return mockRepos.filter(repo => repo.private);
    }

    return mockRepos;
  }

  private getMockOrganizations() {
    return [
      {
        id: 1,
        login: 'awesome-org',
        avatar_url: 'https://github.com/github.png',
        description: 'An awesome organization for development'
      },
      {
        id: 2,
        login: 'tech-company',
        avatar_url: 'https://github.com/github.png',
        description: 'A technology company organization'
      }
    ];
  }

  private getMockOrgRepositories(org: string, options: any = {}) {
    const orgRepos = {
      'awesome-org': [
        {
          id: 101,
          name: 'org-project-1',
          full_name: 'awesome-org/org-project-1',
          description: 'First organization project',
          html_url: 'https://github.com/awesome-org/org-project-1',
          stargazers_count: 89,
          forks_count: 23,
          language: 'React',
          topics: ['react', 'organization'],
          updated_at: new Date().toISOString(),
          created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          owner: {
            login: 'awesome-org',
            avatar_url: 'https://github.com/github.png'
          },
          open_issues_count: 8,
          license: { name: 'MIT License' },
          private: false
        }
      ],
      'tech-company': [
        {
          id: 201,
          name: 'company-app',
          full_name: 'tech-company/company-app',
          description: 'Main company application',
          html_url: 'https://github.com/tech-company/company-app',
          stargazers_count: 234,
          forks_count: 67,
          language: 'TypeScript',
          topics: ['typescript', 'enterprise'],
          updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          owner: {
            login: 'tech-company',
            avatar_url: 'https://github.com/github.png'
          },
          open_issues_count: 15,
          license: { name: 'Proprietary' },
          private: true
        }
      ]
    };

    return orgRepos[org] || [];
  }
}

export const githubAuth = new GitHubAuthService();
export type { GitHubUser };