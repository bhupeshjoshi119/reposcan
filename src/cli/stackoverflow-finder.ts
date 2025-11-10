#!/usr/bin/env node

import 'dotenv/config';
import * as readline from 'readline';
import * as fs from 'fs';

/**
 * Stack Overflow Search Founder CLI
 * Intelligently detects keywords and searches Stack Overflow
 */

interface SearchResult {
  query: string;
  url: string;
  strategy: string;
  keywords: string[];
  platform?: 'stackoverflow' | 'geeksforgeeks' | 'google';
}

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║              🔍 Multi-Platform Search Founder                               ║
║                                                                              ║
║         Stack Overflow + GeeksforGeeks + Google Search                      ║
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
    keywords: [keywords.title],
    platform: 'google'
  });

  // GeeksforGeeks Strategies (9-12)
  // Using correct GFG URL format: https://www.geeksforgeeks.org/search/?gq=query
  
  // Strategy 9: GeeksforGeeks - How to + Problem (User-friendly query)
  if (keywords.technologies.length > 0) {
    const tech = keywords.technologies[0];
    const titleWords = keywords.title.split(' ').filter((w: string) => w.length > 3).slice(0, 4);
    const userQuery = `How to ${titleWords.join(' ')} in ${tech}`;
    const gfgQuery = `${titleWords.join('+')}+in+${tech}`;
    searches.push({
      query: userQuery,
      url: `https://www.geeksforgeeks.org/search/?gq=${gfgQuery}`,
      strategy: 'GeeksforGeeks - How to Guide',
      keywords: [tech, ...titleWords],
      platform: 'geeksforgeeks'
    });
  }

  // Strategy 10: GeeksforGeeks - Implementation Tutorial
  if (keywords.technologies.length > 0 && keywords.actions.length > 0) {
    const tech = keywords.technologies[0];
    const action = keywords.actions[0];
    const problem = keywords.title.split(' ').slice(0, 3).join(' ');
    const userQuery = `How to ${action} ${problem} in ${tech}`;
    const gfgQuery = `${action}+${problem.replace(/\s+/g, '+')}+${tech}+tutorial`;
    searches.push({
      query: userQuery,
      url: `https://www.geeksforgeeks.org/search/?gq=${gfgQuery}`,
      strategy: 'GeeksforGeeks - Implementation Tutorial',
      keywords: [action, tech, 'tutorial'],
      platform: 'geeksforgeeks'
    });
  }

  // Strategy 11: GeeksforGeeks - Code Examples with specific terms
  if (keywords.codeTerms.length > 0 && keywords.technologies.length > 0) {
    const tech = keywords.technologies[0];
    const codeTerm = keywords.codeTerms[0];
    const userQuery = `${codeTerm} example in ${tech}`;
    const gfgQuery = `${codeTerm}+example+in+${tech}`;
    searches.push({
      query: userQuery,
      url: `https://www.geeksforgeeks.org/search/?gq=${gfgQuery}`,
      strategy: 'GeeksforGeeks - Code Examples',
      keywords: [tech, codeTerm, 'example'],
      platform: 'geeksforgeeks'
    });
  }

  // Strategy 12: GeeksforGeeks - Performance/Optimization (for cache, performance issues)
  if (keywords.title.toLowerCase().includes('performance') || 
      keywords.title.toLowerCase().includes('cache') ||
      keywords.title.toLowerCase().includes('optimize')) {
    const tech = keywords.technologies[0] || 'programming';
    const problem = keywords.title.split(' ').slice(0, 4).join(' ');
    const userQuery = `How to improve ${problem}`;
    const gfgQuery = `improve+${problem.replace(/\s+/g, '+')}+${tech}`;
    searches.push({
      query: userQuery,
      url: `https://www.geeksforgeeks.org/search/?gq=${gfgQuery}`,
      strategy: 'GeeksforGeeks - Performance Optimization',
      keywords: ['improve', 'performance', tech],
      platform: 'geeksforgeeks'
    });
  }

  // Strategy 13: GeeksforGeeks - Google Site Search
  const gfgGoogleQuery = `site:geeksforgeeks.org ${keywords.title}`;
  searches.push({
    query: gfgGoogleQuery,
    url: `https://www.google.com/search?q=${encodeURIComponent(gfgGoogleQuery)}`,
    strategy: 'Google (GeeksforGeeks only)',
    keywords: [keywords.title],
    platform: 'google'
  });

  return searches;
}

function displaySearchStrategies(searches: SearchResult[]) {
  // Group by platform
  const stackOverflow = searches.filter(s => !s.platform || s.platform === 'stackoverflow');
  const geeksforgeeks = searches.filter(s => s.platform === 'geeksforgeeks');
  const google = searches.filter(s => s.platform === 'google');

  // Display Stack Overflow strategies
  if (stackOverflow.length > 0) {
    console.log('📚 Stack Overflow Strategies:\n');
    stackOverflow.forEach((search, index) => {
      const strategyNum = searches.indexOf(search) + 1;
      console.log(`┌─────────────────────────────────────────────────────────────────────────────┐`);
      console.log(`│ Strategy ${strategyNum}: ${search.strategy}`);
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

  // Display GeeksforGeeks strategies
  if (geeksforgeeks.length > 0) {
    console.log('💚 GeeksforGeeks Strategies (Tutorials & Examples):\n');
    geeksforgeeks.forEach((search, index) => {
      const strategyNum = searches.indexOf(search) + 1;
      console.log(`┌─────────────────────────────────────────────────────────────────────────────┐`);
      console.log(`│ Strategy ${strategyNum}: ${search.strategy}`);
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

  // Display Google strategies
  if (google.length > 0) {
    console.log('🌐 Google Site Search Strategies:\n');
    google.forEach((search, index) => {
      const strategyNum = searches.indexOf(search) + 1;
      console.log(`┌─────────────────────────────────────────────────────────────────────────────┐`);
      console.log(`│ Strategy ${strategyNum}: ${search.strategy}`);
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
}

async function interactiveMenu(searches: SearchResult[], issue: any) {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('                            🎯 What would you like to do?');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  console.log('📚 Stack Overflow Strategies:');
  searches.filter(s => !s.platform || s.platform === 'stackoverflow').forEach((search) => {
    const num = searches.indexOf(search) + 1;
    console.log(`  ${num}️⃣  ${search.strategy}`);
  });
  
  console.log('\n💚 GeeksforGeeks Strategies:');
  searches.filter(s => s.platform === 'geeksforgeeks').forEach((search) => {
    const num = searches.indexOf(search) + 1;
    console.log(`  ${num}️⃣  ${search.strategy}`);
  });
  
  console.log('\n🌐 Google Strategies:');
  searches.filter(s => s.platform === 'google').forEach((search) => {
    const num = searches.indexOf(search) + 1;
    console.log(`  ${num}️⃣  ${search.strategy}`);
  });
  
  console.log('\n⚡ Quick Actions:');
  console.log(`  9️⃣0️⃣ 🌐 Open all searches`);
  console.log(`  9️⃣1️⃣ 📋 Copy all URLs`);
  console.log(`  9️⃣2️⃣ 💾 Save to TXT`);
  console.log(`  9️⃣3️⃣ 📄 Save to PDF`);
  console.log(`  9️⃣4️⃣ 📊 Save to JSON`);
  console.log(`  9️⃣5️⃣ 💼 Save All (TXT + PDF + JSON)`);
  console.log(`  0️⃣  ❌ Exit\n`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const choice = await new Promise<string>((resolve) => {
    rl.question(`Enter your choice (1-${searches.length} for strategies, 90-95 for actions, 0 to exit): `, (answer: string) => {
      rl.close();
      resolve(answer.trim());
    });
  });

  await handleChoice(choice, searches, issue);
}

async function handleChoice(choice: string, searches: SearchResult[], issue: any) {
  const num = parseInt(choice);
  
  // Strategies 1-12 (or however many we have)
  if (!isNaN(num) && num >= 1 && num <= searches.length) {
    const search = searches[num - 1];
    const platformEmoji = search.platform === 'geeksforgeeks' ? '💚' : search.platform === 'google' ? '🌐' : '📚';
    console.log(`\n${platformEmoji} Opening: ${search.strategy}`);
    console.log(`🔗 ${search.url}\n`);
    console.log(`💡 Copy this command to open in browser:`);
    console.log(`   open "${search.url}"\n`);
  }
  // Option 90: Open all
  else if (num === 90) {
    console.log('\n🌐 All Search URLs:\n');
    
    console.log('📚 Stack Overflow:');
    searches.filter(s => !s.platform || s.platform === 'stackoverflow').forEach((search) => {
      const strategyNum = searches.indexOf(search) + 1;
      console.log(`${strategyNum}. ${search.strategy}`);
      console.log(`   open "${search.url}"\n`);
    });
    
    console.log('💚 GeeksforGeeks:');
    searches.filter(s => s.platform === 'geeksforgeeks').forEach((search) => {
      const strategyNum = searches.indexOf(search) + 1;
      console.log(`${strategyNum}. ${search.strategy}`);
      console.log(`   open "${search.url}"\n`);
    });
    
    console.log('🌐 Google:');
    searches.filter(s => s.platform === 'google').forEach((search) => {
      const strategyNum = searches.indexOf(search) + 1;
      console.log(`${strategyNum}. ${search.strategy}`);
      console.log(`   open "${search.url}"\n`);
    });
  }
  // Option 91: Copy URLs
  else if (num === 91) {
    console.log('\n📋 Copy these URLs:\n');
    searches.forEach((search, index) => {
      const platformEmoji = search.platform === 'geeksforgeeks' ? '💚' : search.platform === 'google' ? '🌐' : '📚';
      console.log(`${platformEmoji} Strategy ${index + 1}: ${search.strategy}`);
      console.log(`${search.url}\n`);
    });
  }
  // Option 92: Save to TXT
  else if (num === 92) {
    await saveToTXT(searches, issue);
  }
  // Option 93: Save to PDF
  else if (num === 93) {
    await saveToPDF(searches, issue);
  }
  // Option 94: Save to JSON
  else if (num === 94) {
    await saveToJSON(searches, issue);
  }
  // Option 95: Save All
  else if (num === 95) {
    await saveToTXT(searches, issue);
    await saveToPDF(searches, issue);
    await saveToJSON(searches, issue);
    console.log('\n✅ All files saved successfully!\n');
  }
  // Option 0: Exit
  else if (num === 0) {
    console.log('\n═══════════════════════════════════════════════════════════════════════════════');
    console.log('                          👋 Thank You!');
    console.log('═══════════════════════════════════════════════════════════════════════════════\n');
    console.log('Multi-Platform Search Founder session ended.\n');
    console.log('📁 Generated files are saved in the current directory.');
    console.log('🔍 Use the search URLs to find solutions on:');
    console.log('   📚 Stack Overflow - Community Q&A');
    console.log('   💚 GeeksforGeeks - Tutorials & Examples');
    console.log('   🌐 Google - Comprehensive Search\n');
    console.log('💡 Tip: Run again anytime with:');
    console.log('   npm run stackoverflow-finder <github-issue-url>\n');
    console.log('Built with ❤️  for developers.\n');
    process.exit(0);
  }
  else {
    console.log(`\n❌ Invalid choice. Please enter a number between 1-${searches.length} or 90-95 or 0.\n`);
  }
}

async function saveToTXT(searches: SearchResult[], issue: any): Promise<void> {
  const filename = `stackoverflow-searches-${issue.number}.txt`;
  
  let content = `╔══════════════════════════════════════════════════════════════════════════════╗\n`;
  content += `║                                                                              ║\n`;
  content += `║              Multi-Platform Search Strategies                               ║\n`;
  content += `║         Stack Overflow + GeeksforGeeks + Google                             ║\n`;
  content += `║                                                                              ║\n`;
  content += `╚══════════════════════════════════════════════════════════════════════════════╝\n\n`;
  
  content += `Issue #${issue.number}: ${issue.title}\n`;
  content += `URL: ${issue.html_url}\n`;
  content += `State: ${issue.state.toUpperCase()}\n`;
  content += `Generated: ${new Date().toLocaleString()}\n\n`;
  content += `═══════════════════════════════════════════════════════════════════════════════\n\n`;
  
  searches.forEach((search, index) => {
    const platformName = search.platform === 'geeksforgeeks' ? 'GeeksforGeeks' : 
                        search.platform === 'google' ? 'Google' : 'Stack Overflow';
    content += `Strategy ${index + 1}: ${search.strategy}\n`;
    content += `Platform: ${platformName}\n`;
    content += `${'─'.repeat(79)}\n`;
    content += `Query: ${search.query}\n`;
    content += `URL: ${search.url}\n`;
    content += `Keywords: ${search.keywords.join(', ')}\n\n`;
  });
  
  content += `═══════════════════════════════════════════════════════════════════════════════\n\n`;
  content += `How to use:\n`;
  content += `1. Copy any URL above\n`;
  content += `2. Open in your browser\n`;
  content += `3. Search for solutions on multiple platforms:\n`;
  content += `   📚 Stack Overflow - Community Q&A and solutions\n`;
  content += `   💚 GeeksforGeeks - Tutorials, examples, and implementations\n`;
  content += `   🌐 Google - Comprehensive site-specific search\n`;
  content += `4. Try different strategies if first one doesn't work\n`;
  content += `5. GeeksforGeeks is great for learning and requirement gathering\n\n`;
  content += `Built with ❤️  for developers.\n`;

  fs.writeFileSync(filename, content);
  console.log(`\n💾 TXT file saved: ${filename}`);
}

async function saveToPDF(searches: SearchResult[], issue: any): Promise<void> {
  const { BeautifulPDFGenerator } = await import('../services/pdfGenerator.js');
  
  const pdfContent = {
    title: `Multi-Platform Search Strategies - Issue #${issue.number}`,
    sections: [
      {
        heading: '📋 GitHub Issue',
        content: [
          { type: 'bold', content: `Issue #${issue.number}` },
          { type: 'text', content: issue.title },
          { type: 'text', content: ' ' },
          { type: 'text', content: `State: ${issue.state.toUpperCase()}` },
          { type: 'text', content: `URL: ${issue.html_url}` },
          { type: 'text', content: ' ' },
          { type: 'text', content: `Generated: ${new Date().toLocaleString()}` },
        ],
        level: 1
      },
      {
        heading: '🔍 Search Strategies',
        content: searches.flatMap((search, index) => [
          { type: 'bold', content: `Strategy ${index + 1}: ${search.strategy}` },
          { type: 'text', content: ' ' },
          { type: 'text', content: `Search Query:` },
          { type: 'highlight', content: search.query },
          { type: 'text', content: ' ' },
          { type: 'text', content: `Keywords: ${search.keywords.join(', ')}` },
          { type: 'text', content: ' ' },
          { type: 'text', content: `Stack Overflow URL:` },
          { type: 'link', content: search.url },
          { type: 'text', content: ' ' },
          { type: 'text', content: '─'.repeat(70) },
          { type: 'text', content: ' ' },
        ]),
        level: 1
      },
      {
        heading: '💡 How to Use',
        content: [
          { type: 'bullet', content: 'Stack Overflow: Best for Q&A and community solutions' },
          { type: 'bullet', content: 'GeeksforGeeks: Best for tutorials, examples, and learning' },
          { type: 'bullet', content: 'Google: Best for comprehensive site-specific search' },
          { type: 'bullet', content: 'Try Stack Overflow first for quick solutions' },
          { type: 'bullet', content: 'Use GeeksforGeeks for requirement gathering and implementation' },
          { type: 'bullet', content: 'Combine keywords from different strategies' },
        ],
        level: 1
      }
    ],
    metadata: {
      author: 'Multi-Platform Search Founder',
      subject: `Search Strategies for Issue #${issue.number}`,
      keywords: ['GitHub', 'Stack Overflow', 'GeeksforGeeks', 'Search', 'Solutions', 'Tutorials'],
      createdAt: new Date(),
    }
  };

  const pdfGenerator = new BeautifulPDFGenerator();
  const pdf = pdfGenerator.generatePDF(pdfContent);
  
  const filename = `stackoverflow-searches-${issue.number}.pdf`;
  pdf.save(filename);
  
  console.log(`\n📄 PDF file saved: ${filename}`);
}

async function saveToJSON(searches: SearchResult[], issue: any): Promise<void> {
  const jsonData = {
    issue: {
      number: issue.number,
      title: issue.title,
      url: issue.html_url,
      state: issue.state,
      comments: issue.comments,
      labels: issue.labels.map((l: any) => l.name)
    },
    searchStrategies: searches.map((search, index) => ({
      strategyNumber: index + 1,
      strategyName: search.strategy,
      platform: search.platform || 'stackoverflow',
      query: search.query,
      url: search.url,
      keywords: search.keywords
    })),
    metadata: {
      generatedAt: new Date().toISOString(),
      tool: 'Multi-Platform Search Founder',
      version: '2.0.0',
      platforms: ['stackoverflow', 'geeksforgeeks', 'google']
    }
  };

  const filename = `stackoverflow-searches-${issue.number}.json`;
  fs.writeFileSync(filename, JSON.stringify(jsonData, null, 2));
  
  console.log(`\n📊 JSON file saved: ${filename}`);
}

function truncate(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

main();
