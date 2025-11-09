import { Octokit } from '@octokit/rest';
import { DeepIssueAnalyzer } from './deepIssueAnalyzer';

/**
 * Memory-Optimized Analyzer
 * Processes issues in small batches to prevent memory issues
 * Perfect for large repositories with 10k+ issues
 */
export class MemoryOptimizedAnalyzer {
  private octokit: Octokit;
  private deepAnalyzer: DeepIssueAnalyzer;
  private memoryUsage: { used: number; total: number } = { used: 0, total: 0 };

  constructor(githubToken?: string, stackExchangeKey?: string) {
    this.octokit = new Octokit({ auth: githubToken });
    this.deepAnalyzer = new DeepIssueAnalyzer(githubToken, stackExchangeKey);
  }

  /**
   * Analyze repository with memory optimization
   */
  async analyzeWithMemoryOptimization(
    owner: string,
    repo: string,
    options: MemoryOptimizedOptions = {}
  ): Promise<void> {
    const batchSize = options.batchSize || 5; // Smaller batches for memory
    const maxIssues = options.maxIssues || 1000; // Default limit
    const outputFile = options.outputFile || `${owner}-${repo}-analysis.json`;

    console.log(`🚀 Starting memory-optimized analysis of ${owner}/${repo}`);
    console.log(`📊 Batch size: ${batchSize} | Max issues: ${maxIssues}`);
    console.log(`💾 Memory monitoring enabled\n`);

    // Initialize output file
    const results: any[] = [];
    let processedCount = 0;

    try {
      // Fetch issues in pages
      let page = 1;
      const perPage = 100;

      while (processedCount < maxIssues) {
        // Monitor memory before each batch
        this.checkMemoryUsage();

        console.log(`📥 Fetching page ${page}...`);
        const response = await this.octokit.rest.issues.listForRepo({
          owner,
          repo,
          state: 'all',
          sort: 'created',
          direction: 'desc',
          per_page: perPage,
          page,
        });

        if (response.data.length === 0) break;

        const issues = response.data
          .filter(issue => !issue.pull_request)
          .slice(0, maxIssues - processedCount);

        // Process in small batches
        for (let i = 0; i < issues.length; i += batchSize) {
          const batch = issues.slice(i, i + batchSize);
          
          console.log(`🔍 Processing batch: issues ${processedCount + 1}-${processedCount + batch.length}`);
          
          // Process batch
          const batchResults = await this.processBatch(owner, repo, batch);
          results.push(...batchResults);
          
          processedCount += batch.length;
          
          // Save intermediate results
          this.saveIntermediateResults(outputFile, results);
          
          // Memory cleanup
          if (global.gc) {
            global.gc();
          }
          
          // Progress update
          const progress = (processedCount / maxIssues * 100).toFixed(1);
          console.log(`   Progress: ${processedCount}/${maxIssues} (${progress}%)`);
          this.checkMemoryUsage();
          
          // Rate limiting
          await this.delay(2000);
        }

        page++;
        
        if (response.data.length < perPage) break;
      }

      console.log(`\n✅ Analysis complete!`);
      console.log(`📊 Total processed: ${processedCount} issues`);
      console.log(`💾 Results saved to: ${outputFile}`);

      // Generate final PDF
      await this.generateOptimizedPDF(results, owner, repo);

    } catch (error) {
      console.error('❌ Error during analysis:', error);
      // Save what we have so far
      this.saveIntermediateResults(outputFile, results);
      throw error;
    }
  }

  private async processBatch(owner: string, repo: string, issues: any[]): Promise<any[]> {
    const results: any[] = [];

    for (const issue of issues) {
      try {
        const analysis = await this.deepAnalyzer.analyzeSpecificIssue(owner, repo, issue.number);
        
        // Store only essential data to save memory
        results.push({
          issueNumber: issue.number,
          title: issue.title,
          state: issue.state,
          url: issue.html_url,
          solutionsCount: analysis.stackOverflowSolutions.length,
          relatedCount: analysis.relatedIssues.length,
          complexity: analysis.analysis.complexity,
          estimatedTime: analysis.analysis.estimatedTime,
          confidence: analysis.analysis.confidence,
          topSolution: analysis.stackOverflowSolutions[0] ? {
            title: analysis.stackOverflowSolutions[0].question.title,
            link: analysis.stackOverflowSolutions[0].question.link,
            score: analysis.stackOverflowSolutions[0].question.score,
            views: analysis.stackOverflowSolutions[0].question.view_count
          } : null
        });

        await this.delay(500); // Rate limiting
      } catch (error) {
        console.error(`   Error processing issue #${issue.number}:`, error);
      }
    }

    return results;
  }

  private checkMemoryUsage(): void {
    const usage = process.memoryUsage();
    const usedMB = Math.round(usage.heapUsed / 1024 / 1024);
    const totalMB = Math.round(usage.heapTotal / 1024 / 1024);
    
    this.memoryUsage = { used: usedMB, total: totalMB };
    
    console.log(`   💾 Memory: ${usedMB}MB used / ${totalMB}MB total`);
    
    // Warning if memory usage is high
    if (usedMB > 500) {
      console.log(`   ⚠️  High memory usage detected. Consider reducing batch size.`);
    }
  }

  private saveIntermediateResults(filename: string, results: any[]): void {
    try {
      fs.writeFileSync(filename, JSON.stringify(results, null, 2));
    } catch (error) {
      console.error('Error saving intermediate results:', error);
    }
  }

  private async generateOptimizedPDF(results: any[], owner: string, repo: string): Promise<void> {
    console.log('\n📄 Generating optimized PDF...');
    
    // Create lightweight PDF content
    const pdfContent = {
      title: `Analysis: ${owner}/${repo}`,
      sections: [
        {
          heading: 'Summary',
          content: [
            { type: 'text', content: `Analyzed ${results.length} issues` },
            { type: 'text', content: `Found ${results.reduce((sum, r) => sum + r.solutionsCount, 0)} Stack Overflow solutions` }
          ],
          level: 1
        },
        {
          heading: 'Issues',
          content: results.map(r => ({
            type: 'text',
            content: `#${r.issueNumber}: ${r.title} (${r.complexity})`
          })),
          level: 1
        }
      ],
      metadata: {
        author: 'Memory-Optimized Analyzer',
        subject: `Analysis of ${owner}/${repo}`,
        createdAt: new Date()
      }
    };

    try {
      const { BeautifulPDFGenerator } = await import('./pdfGenerator.js');
      const pdfGenerator = new BeautifulPDFGenerator();
      const pdf = await pdfGenerator.generatePDF(pdfContent);

      const filename = `${owner}-${repo}-optimized.pdf`;
      
      if (typeof pdf === 'string') {
        fs.writeFileSync(filename, Buffer.from(pdf, 'base64'));
      } else {
        (pdf as any).save(filename);
      }

      const stats = fs.statSync(filename);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
      console.log(`✅ PDF saved: ${filename} (${sizeMB} MB)`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export interface MemoryOptimizedOptions {
  batchSize?: number;
  maxIssues?: number;
  outputFile?: string;
}