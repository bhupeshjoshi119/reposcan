#!/usr/bin/env node

import 'dotenv/config';
import * as readline from 'readline';

/**
 * Stack Overflow Search Founder CLI
 * Intelligently detects keywords and searches Stack Overflow
 */

interface SearchResult {
  query: string;
  url: string;
  strategy: string;
  keywords: string[];
}

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║              🔍 Stack Overflow Search Founder                               ║
║                                                                              ║
║              Intelligently detect keywords and find solutions               ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);

  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    showHelp();
    process.exit(0);
  }

  const issueUrl = args[0];
  let githubToken = process.env.GITHUB_TOKEN;

  if (!githubToken) {
    console.error('\n❌ GitHub token required');
    console.error('Set it with: export GITHUB_TOKEN=your_token');
    console.error('Get token at: https://github.com/settings/tokens\n');
    process.exit(1);
  }

  try {
    await analyzeAndSearch(issueUrl, githubToken);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
Usage:
  npm run stackoverflow-finder <github-issue-url>

Examples:
  npm run stackoverflow-finder https://github.com/facebook/react/issues/12345
  npm run stackoverflow-finder https://github.com/langchain-ai/langchain/issues/33898

What you get:
  ✅ Intelligent keyword detection
  ✅ Multiple search strategies
  ✅ Direct Stack Overflow links
  ✅ Search query suggestions
  ✅ Related tags and technologies

Perfect for:
  • Finding solutions when API returns no results
  • Discovering related discussions
  • Learning search strategies
  • Manual Stack Overflow searching
  `);
}

async function analyzeAndSearch(issueUrl: string, githubToken: string) {
  console.log('🔍 Analyzing GitHub issue...\n');

  // Parse issue URL
  const match = issueUrl.match(/github\.com\/([^\/]+)\/([^\/]+)\/issues\/(\d+)/);
  if (!match) {
    throw new Error('Invalid GitHub issue URL');
  }

  const [, owner, repo, issueNumber] = match;

  // Fetch issue data
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`, {
    headers: {
      'Authorization': `token ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch issue: ${response.statusText}`);
  }

  const issue = await response.json();

  // Display issue info
  displayIssueInfo(issue);

  // Extract keywords
  console.log('\n🔍 Detecting keywords and technologies...\n');
  const keywords = extractKeywords(issue);
  displayKeywords(keywords);

  // Generate search strategies
  console.log('\n🎯 Generating search strategies...\n');
  const searches = generateSearchStrategies(issue, keywords);
  displaySearchStrategies(searches);

  // Interactive menu
  await interactiveMenu(searches, issue);
}

function displayIssueInfo(issue: any) {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log(`📋 Issue #${issue.number}: ${issue.title}`);
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');
  
  console.log(`🔗 ${issue.html_url}`);
  console.log(`📊 State: ${issue.state.toUpperCase()}`);
  console.log(`💬 Comments: ${issue.comments}`);
  console.log(`🏷️  Labels: ${issue.labels.map((l: any) => l.name).join(', ') || 'None'}`);
}

function extractKeywords(issue: any): any {
  const text = `${issue.title} ${issue.body || ''}`.toLowerCase();
  
  // Extract error messages
  const errorPatterns = [
    /error[:\s]+([^\n]+)/gi,
    /exception[:\s]+([^\n]+)/gi,
    /failed[:\s]+([^\n]+)/gi,
    /cannot[:\s]+([^\n]+)/gi,
    /unable to[:\s]+([^\n]+)/gi,
  ];
  
  const errors: string[] = [];
  errorPatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].length < 100) {
        errors.push(match[1].trim());
      }
    }
  });

  // Extract technologies
  const techKeywords = [
    'react', 'vue', 'angular', 'node', 'python', 'java', 'javascript', 'typescript',
    'flutter', 'dart', 'swift', 'kotlin', 'go', 'rust', 'c++', 'c#',
    'docker', 'kubernetes', 'aws', 'azure', 'gcp',
    'mongodb', 'postgresql', 'mysql', 'redis',
    'webpack', 'vite', 'babel', 'eslint',
    'jest', 'mocha', 'pytest', 'junit',
    'express', 'fastapi', 'django', 'flask',
    'nextjs', 'gatsby', 'nuxt', 'svelte',
    'graphql', 'rest', 'api', 'websocket',
    'hooks', 'state', 'props', 'component',
    'async', 'await', 'promise', 'callback',
    'build', 'compile', 'bundle', 'deploy',
    'test', 'debug', 'lint', 'format'
  ];

  const technologies: string[] = [];
  techKeywords.forEach(tech => {
    if (text.includes(tech)) {
      technologies.push(tech);
    }
  });

  // Extract code-related terms
  const codePatterns = [
    /`([^`]+)`/g,
    /\b([A-Z][a-zA-Z]+Error)\b/g,
    /\b([a-z]+Exception)\b/g,
    /\b(use[A-Z][a-zA-Z]+)\b/g, // React hooks
    /\b([a-z]+\(\))/g, // Function calls
  ];

  const codeTerms: string[] = [];
  codePatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].length < 50) {
        codeTerms.push(match[1].trim());
      }
    }
  });

  // Extract action words
  const actionWords = [
    'fix', 'solve', 'resolve', 'implement', 'add', 'remove', 'update',
    'create', 'delete', 'modify', 'change', 'improve', 'optimize',
    'debug', 'test', 'deploy', 'build', 'compile', 'install'
  ];

  const actions: string[] = [];
  actionWords.forEach(action => {
    if (text.includes(action)) {
      actions.push(action);
    }
  });

  // Extract labels as tags
  const labels = issue.labels.map((l: any) => l.name);

  return {
    errors: [...new Set(errors)].slice(0, 5),
    technologies: [...new Set(technologies)].slice(0, 10),
    codeTerms: [...new Set(codeTerms)].slice(0, 10),
    actions: [...new Set(actions)].slice(0, 5),
    labels: labels,
    title: issue.title,
    body: issue.body || ''
  };
}

function displayKeywords(keywords: any) {
  console.log('📊 Detected Keywords:\n');

  if (keywords.errors.length > 0) {
    console.log('   🔴 Error Messages:');
    keywords.errors.forEach((err: string) => {
      console.log(`      • ${truncate(err, 70)}`);
    });
    console.log();
  }

  if (keywords.technologies.length > 0) {
    console.log('   🔧 Technologies:');
    console.log(`      ${keywords.technologies.join(', ')}`);
    console.log();
  }

  if (keywords.codeTerms.length > 0) {
    console.log('   💻 Code Terms:');
    keywords.codeTerms.slice(0, 5).forEach((term: string) => {
      console.log(`      • ${term}`);
    });
    console.log();
  }

  if (keywords.actions.length > 0) {
    console.log('   ⚡ Action Words:');
    console.log(`      ${keywords.actions.join(', ')}`);
    console.log();
  }

  if (keywords.labels.length > 0) {
    console.log('   🏷️  Labels:');
    console.log(`      ${keywords.labels.join(', ')}`);
    console.log();
  }
}

function generateSearchStrategies(issue: any, keywords: any): SearchResult[] {
  const searches: SearchResult[] = [];

  // Strategy 1: Error message + technology
  if (keywords.errors.length > 0 && keywords.technologies.length > 0) {
    const error = keywords.errors[0];
    const tech = keywords.technologies[0];
    const query = `${tech} ${error}`;
    searches.push({
      query,
      url: `https://stackoverflow.com/search?q=${encodeURIComponent(query)}`,
      strategy: 'Error + Technology',
      keywords: [tech, error]
    });
  }

  // Strategy 2: Title keywords + main technology
  if (keywords.technologies.length > 0) {
    const tech = keywords.technologies[0];
    const titleWords = keywords.title.split(' ').filter((w: string) => w.length > 3).slice(0, 5);
    const query = `${tech} ${titleWords.join(' ')}`;
    searches.push({
      query,
      url: `https://stackoverflow.com/search?q=${encodeURIComponent(query)}`,
      strategy: 'Technology + Title Keywords',
      keywords: [tech, ...titleWords]
    });
  }

  // Strategy 3: Code terms + technology
  if (keywords.codeTerms.length > 0 && keywords.technologies.length > 0) {
    const tech = keywords.technologies[0];
    const codeTerm = keywords.codeTerms[0];
    const query = `${tech} ${codeTerm}`;
    searches.push({
      query,
      url: `https://stackoverflow.com/search?q=${encodeURIComponent(query)}`,
      strategy: 'Technology + Code Term',
      keywords: [tech, codeTerm]
    });
  }

  // Strategy 4: Action + technology + problem
  if (keywords.actions.length > 0 && keywords.technologies.length > 0) {
    const action = keywords.actions[0];
    const tech = keywords.technologies[0];
    const titleWords = keywords.title.split(' ').slice(0, 3).join(' ');
    const query = `${action} ${tech} ${titleWords}`;
    searches.push({
      query,
      url: `https://stackoverflow.com/search?q=${encodeURIComponent(query)}`,
      strategy: 'Action + Technology + Problem',
      keywords: [action, tech, titleWords]
    });
  }

  // Strategy 5: Labels + technology
  if (keywords.labels.length > 0 && keywords.technologies.length > 0) {
    const label = keywords.labels[0];
    const tech = keywords.technologies[0];
    const query = `${tech} ${label}`;
    searches.push({
      query,
      url: `https://stackoverflow.com/search?q=${encodeURIComponent(query)}`,
      strategy: 'Technology + Label',
      keywords: [tech, label]
    });
  }

  // Strategy 6: Full title search
  searches.push({
    query: keywords.title,
    url: `https://stackoverflow.com/search?q=${encodeURIComponent(keywords.title)}`,
    strategy: 'Full Title Search',
    keywords: [keywords.title]
  });

  // Strategy 7: Technology tags search
  if (keywords.technologies.length > 0) {
    const tags = keywords.technologies.slice(0, 3).join('+');
    const query = keywords.technologies.slice(0, 3).join(' ');
    searches.push({
      query,
      url: `https://stackoverflow.com/questions/tagged/${tags}`,
      strategy: 'Technology Tags',
      keywords: keywords.technologies.slice(0, 3)
    });
  }

  // Strategy 8: Google search (Stack Overflow specific)
  const googleQuery = `site:stackoverflow.com ${keywords.title}`;
  searches.push({
    query: googleQuery,
    url: `https://www.google.com/search?q=${encodeURIComponent(googleQuery)}`,
    strategy: 'Google (Stack Overflow only)',
    keywords: [keywords.title]
  });

  return searches;
}

function displaySearchStrategies(searches: SearchResult[]) {
  searches.forEach((search, index) => {
    console.log(`┌─────────────────────────────────────────────────────────────────────────────┐`);
    console.log(`│ Strategy ${index + 1}: ${search.strategy}`);
    console.log(`├─────────────────────────────────────────────────────────────────────────────┤`);
    console.log(`│`);
    console.log(`│ 🔍 Search Query:`);
    console.log(`│    ${truncate(search.query, 70)}`);
    console.log(`│`);
    console.log(`│ 🔗 URL:`);
    console.log(`│    ${truncate(search.url, 70)}`);
    console.log(`│`);
    console.log(`└─────────────────────────────────────────────────────────────────────────────┘\n`);
  });
}

async function interactiveMenu(searches: SearchResult[], issue: any) {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('                            🎯 What would you like to do?');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  console.log('Options:');
  searches.forEach((search, index) => {
    console.log(`  ${index + 1}️⃣  Open Strategy ${index + 1}: ${search.strategy}`);
  });
  console.log(`  🌐 Open all searches in browser`);
  console.log(`  📋 Copy all search URLs`);
  console.log(`  💾 Save searches to file`);
  console.log(`  ❌ Exit\n`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const choice = await new Promise<string>((resolve) => {
    rl.question('Enter your choice (1-8, all, copy, save, exit): ', (answer: string) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });

  await handleChoice(choice, searches, issue);
}

async function handleChoice(choice: string, searches: SearchResult[], issue: any) {
  const num = parseInt(choice);
  
  if (!isNaN(num) && num >= 1 && num <= searches.length) {
    const search = searches[num - 1];
    console.log(`\n🌐 Opening: ${search.strategy}`);
    console.log(`🔗 ${search.url}\n`);
    console.log(`💡 Copy this command to open in browser:`);
    console.log(`   open "${search.url}"\n`);
  } else if (choice === 'all') {
    console.log('\n🌐 All Search URLs:\n');
    searches.forEach((search, index) => {
      console.log(`${index + 1}. ${search.strategy}`);
      console.log(`   open "${search.url}"\n`);
    });
  } else if (choice === 'copy') {
    console.log('\n📋 Copy these URLs:\n');
    searches.forEach((search, index) => {
      console.log(`Strategy ${index + 1}: ${search.strategy}`);
      console.log(`${search.url}\n`);
    });
  } else if (choice === 'save') {
    const filename = `stackoverflow-searches-${issue.number}.txt`;
    let content = `Stack Overflow Search Strategies for Issue #${issue.number}\n`;
    content += `Issue: ${issue.title}\n`;
    content += `URL: ${issue.html_url}\n\n`;
    content += `Generated: ${new Date().toLocaleString()}\n\n`;
    content += `═══════════════════════════════════════════════════════════════════════════════\n\n`;
    
    searches.forEach((search, index) => {
      content += `Strategy ${index + 1}: ${search.strategy}\n`;
      content += `Query: ${search.query}\n`;
      content += `URL: ${search.url}\n\n`;
    });

    const fs = require('fs');
    fs.writeFileSync(filename, content);
    console.log(`\n💾 Saved to: ${filename}\n`);
  } else if (choice === 'exit') {
    console.log('\n👋 Thanks for using Stack Overflow Search Founder!\n');
    process.exit(0);
  } else {
    console.log('\n❌ Invalid choice\n');
  }
}

function truncate(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

main();
