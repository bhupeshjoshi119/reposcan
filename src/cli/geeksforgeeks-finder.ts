#!/usr/bin/env node

import 'dotenv/config';
import * as readline from 'readline';
import * as fs from 'fs';

/**
 * GeeksforGeeks Finder CLI
 * Standalone tool for searching GeeksforGeeks tutorials and examples
 * Can be used independently or as part of the multi-platform search
 */

interface GFGSearchResult {
  title: string;
  url: string;
  query: string;
  category: string;
  keywords: string[];
}

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║              💚 GeeksforGeeks Finder                                        ║
║                                                                              ║
║         Find Tutorials, Examples & Learning Resources                       ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);

  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    showHelp();
    process.exit(0);
  }

  const input = args.join(' ');
  
  // Check if input is a GitHub URL
  const isGitHubUrl = input.includes('github.com') && input.includes('/issues/');
  
  if (isGitHubUrl) {
    await searchFromGitHubIssue(input);
  } else {
    await searchFromText(input);
  }
}

function showHelp() {
  console.log(`
Usage:
  npm run geeksforgeeks-finder <search-text>
  npm run geeksforgeeks-finder <github-issue-url>

Examples:
  # Search by text
  npm run geeksforgeeks-finder "how to improve cache performance in python"
  npm run geeksforgeeks-finder "implement custom metadata"
  npm run geeksforgeeks-finder "python string split examples"

  # Search from GitHub issue
  npm run geeksforgeeks-finder https://github.com/langchain-ai/langchain/issues/33883

What you get:
  ✅ Multiple search strategies
  ✅ Direct GeeksforGeeks URLs
  ✅ Tutorial links
  ✅ Code examples
  ✅ Export to PDF, JSON, TXT
  ✅ Standalone tool (no GitHub token needed for text search)

Perfect for:
  • Learning new technologies
  • Finding tutorials
  • Code examples
  • Implementation guides
  • Requirement gathering
  • Quick reference
  `);
}

async function searchFromGitHubIssue(issueUrl: string) {
  const githubToken = process.env.GITHUB_TOKEN;
  
  if (!githubToken) {
    console.error('\n❌ GitHub token required for issue analysis');
    console.error('Set it with: export GITHUB_TOKEN=your_token');
    console.error('Get token at: https://github.com/settings/tokens');
    console.error('\nOr use text search instead:');
    console.error('  npm run geeksforgeeks-finder "your search text"\n');
    process.exit(1);
  }

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

  // Extract keywords and generate searches
  const keywords = extractKeywords(issue);
  const searches = generateSearches(keywords, issue.title);

  // Display results
  displaySearches(searches);

  // Interactive menu
  await interactiveMenu(searches, { type: 'github', data: issue });
}

async function searchFromText(searchText: string) {
  console.log(`🔍 Searching GeeksforGeeks for: "${searchText}"\n`);

  // Generate searches from text
  const searches = generateSearchesFromText(searchText);

  // Display results
  displaySearches(searches);

  // Interactive menu
  await interactiveMenu(searches, { type: 'text', data: { query: searchText } });
}

function extractKeywords(issue: any): any {
  const text = `${issue.title} ${issue.body || ''}`.toLowerCase();
  
  // Extract technologies
  const techKeywords = [
    'python', 'javascript', 'java', 'react', 'node', 'typescript',
    'flutter', 'dart', 'swift', 'kotlin', 'go', 'rust',
    'api', 'rest', 'graphql', 'websocket',
    'cache', 'performance', 'optimize', 'database'
  ];

  const technologies: string[] = [];
  techKeywords.forEach(tech => {
    if (text.includes(tech)) {
      technologies.push(tech);
    }
  });

  // Extract action words
  const actionWords = ['implement', 'add', 'create', 'build', 'improve', 'optimize', 'fix'];
  const actions: string[] = [];
  actionWords.forEach(action => {
    if (text.includes(action)) {
      actions.push(action);
    }
  });

  return {
    technologies: [...new Set(technologies)],
    actions: [...new Set(actions)],
    title: issue.title
  };
}

function generateSearches(keywords: any, title: string): GFGSearchResult[] {
  const searches: GFGSearchResult[] = [];
  const tech = keywords.technologies[0] || 'programming';
  const action = keywords.actions[0] || 'implement';

  // Strategy 1: How to Guide
  const titleWords = title.split(' ').filter((w: string) => w.length > 3).slice(0, 4);
  searches.push({
    title: 'How to Guide',
    url: `https://www.geeksforgeeks.org/search/?gq=${titleWords.join('+')}+in+${tech}`,
    query: `How to ${titleWords.join(' ')} in ${tech}`,
    category: 'Tutorial',
    keywords: [tech, ...titleWords]
  });

  // Strategy 2: Implementation Tutorial
  searches.push({
    title: 'Implementation Tutorial',
    url: `https://www.geeksforgeeks.org/search/?gq=${action}+${titleWords.slice(0, 3).join('+')}+${tech}+tutorial`,
    query: `How to ${action} ${titleWords.slice(0, 3).join(' ')} in ${tech}`,
    category: 'Tutorial',
    keywords: [action, tech, 'tutorial']
  });

  // Strategy 3: Code Examples
  searches.push({
    title: 'Code Examples',
    url: `https://www.geeksforgeeks.org/search/?gq=${tech}+${titleWords.slice(0, 2).join('+')}+example`,
    query: `${tech} ${titleWords.slice(0, 2).join(' ')} example`,
    category: 'Examples',
    keywords: [tech, 'example']
  });

  // Strategy 4: Best Practices
  searches.push({
    title: 'Best Practices',
    url: `https://www.geeksforgeeks.org/search/?gq=${tech}+best+practices+${titleWords[0]}`,
    query: `${tech} best practices ${titleWords[0]}`,
    category: 'Best Practices',
    keywords: [tech, 'best practices']
  });

  // Strategy 5: Performance/Optimization (if applicable)
  if (title.toLowerCase().includes('performance') || 
      title.toLowerCase().includes('cache') ||
      title.toLowerCase().includes('optimize')) {
    searches.push({
      title: 'Performance Optimization',
      url: `https://www.geeksforgeeks.org/search/?gq=improve+${titleWords.slice(0, 3).join('+')}+${tech}`,
      query: `How to improve ${titleWords.slice(0, 3).join(' ')} in ${tech}`,
      category: 'Optimization',
      keywords: ['improve', 'performance', tech]
    });
  }

  return searches;
}

function generateSearchesFromText(searchText: string): GFGSearchResult[] {
  const searches: GFGSearchResult[] = [];
  const words = searchText.split(' ').filter(w => w.length > 2);
  const cleanQuery = words.join('+');

  // Strategy 1: Direct Search
  searches.push({
    title: 'Direct Search',
    url: `https://www.geeksforgeeks.org/search/?gq=${cleanQuery}`,
    query: searchText,
    category: 'General',
    keywords: words
  });

  // Strategy 2: Tutorial Search
  searches.push({
    title: 'Tutorial Search',
    url: `https://www.geeksforgeeks.org/search/?gq=${cleanQuery}+tutorial`,
    query: `${searchText} tutorial`,
    category: 'Tutorial',
    keywords: [...words, 'tutorial']
  });

  // Strategy 3: Example Search
  searches.push({
    title: 'Example Search',
    url: `https://www.geeksforgeeks.org/search/?gq=${cleanQuery}+example`,
    query: `${searchText} example`,
    category: 'Examples',
    keywords: [...words, 'example']
  });

  // Strategy 4: How to Search
  searches.push({
    title: 'How to Guide',
    url: `https://www.geeksforgeeks.org/search/?gq=how+to+${cleanQuery}`,
    query: `How to ${searchText}`,
    category: 'Tutorial',
    keywords: ['how to', ...words]
  });

  // Strategy 5: Implementation Search
  searches.push({
    title: 'Implementation Guide',
    url: `https://www.geeksforgeeks.org/search/?gq=implement+${cleanQuery}`,
    query: `Implement ${searchText}`,
    category: 'Implementation',
    keywords: ['implement', ...words]
  });

  return searches;
}

function displayIssueInfo(issue: any) {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log(`📋 Issue #${issue.number}: ${issue.title}`);
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');
  
  console.log(`🔗 ${issue.html_url}`);
  console.log(`📊 State: ${issue.state.toUpperCase()}`);
  console.log(`💬 Comments: ${issue.comments}\n`);
}

function displaySearches(searches: GFGSearchResult[]) {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('                    💚 GeeksforGeeks Search Results');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  searches.forEach((search, index) => {
    console.log(`┌─────────────────────────────────────────────────────────────────────────────┐`);
    console.log(`│ ${index + 1}. ${search.title} (${search.category})`);
    console.log(`├─────────────────────────────────────────────────────────────────────────────┤`);
    console.log(`│`);
    console.log(`│ 🔍 Query: ${truncate(search.query, 70)}`);
    console.log(`│`);
    console.log(`│ 🔗 URL:`);
    console.log(`│    ${truncate(search.url, 70)}`);
    console.log(`│`);
    console.log(`│ 🏷️  Keywords: ${search.keywords.slice(0, 5).join(', ')}`);
    console.log(`│`);
    console.log(`└─────────────────────────────────────────────────────────────────────────────┘\n`);
  });
}

async function interactiveMenu(searches: GFGSearchResult[], context: any) {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('                            🎯 What would you like to do?');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  console.log('Search Results:');
  searches.forEach((search, index) => {
    console.log(`  ${index + 1}️⃣  Open: ${search.title}`);
  });
  
  console.log('\nActions:');
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
    rl.question(`Enter your choice (1-${searches.length} for results, 90-95 for actions, 0 to exit): `, (answer: string) => {
      rl.close();
      resolve(answer.trim());
    });
  });

  await handleChoice(choice, searches, context);
}

async function handleChoice(choice: string, searches: GFGSearchResult[], context: any) {
  const num = parseInt(choice);
  
  // Open specific search
  if (!isNaN(num) && num >= 1 && num <= searches.length) {
    const search = searches[num - 1];
    console.log(`\n💚 Opening: ${search.title}`);
    console.log(`🔗 ${search.url}\n`);
    console.log(`💡 Copy this command to open in browser:`);
    console.log(`   open "${search.url}"\n`);
  }
  // Option 90: Open all
  else if (num === 90) {
    console.log('\n🌐 All GeeksforGeeks URLs:\n');
    searches.forEach((search, index) => {
      console.log(`${index + 1}. ${search.title}`);
      console.log(`   open "${search.url}"\n`);
    });
  }
  // Option 91: Copy URLs
  else if (num === 91) {
    console.log('\n📋 Copy these URLs:\n');
    searches.forEach((search, index) => {
      console.log(`${index + 1}. ${search.title}`);
      console.log(`${search.url}\n`);
    });
  }
  // Option 92: Save to TXT
  else if (num === 92) {
    await saveToTXT(searches, context);
  }
  // Option 93: Save to PDF
  else if (num === 93) {
    await saveToPDF(searches, context);
  }
  // Option 94: Save to JSON
  else if (num === 94) {
    await saveToJSON(searches, context);
  }
  // Option 95: Save All
  else if (num === 95) {
    await saveToTXT(searches, context);
    await saveToPDF(searches, context);
    await saveToJSON(searches, context);
    console.log('\n✅ All files saved successfully!\n');
  }
  // Option 0: Exit
  else if (num === 0) {
    console.log('\n═══════════════════════════════════════════════════════════════════════════════');
    console.log('                          👋 Thank You!');
    console.log('═══════════════════════════════════════════════════════════════════════════════\n');
    console.log('GeeksforGeeks Finder session ended.\n');
    console.log('📁 Generated files are saved in the current directory.');
    console.log('💚 Use GeeksforGeeks for tutorials, examples, and learning.\n');
    console.log('💡 Tip: Run again anytime with:');
    console.log('   npm run geeksforgeeks-finder "your search text"\n');
    console.log('Built with ❤️  for developers.\n');
    process.exit(0);
  }
  else {
    console.log(`\n❌ Invalid choice. Please enter a number between 1-${searches.length} or 90-95 or 0.\n`);
  }
}

async function saveToTXT(searches: GFGSearchResult[], context: any): Promise<void> {
  const timestamp = Date.now();
  const filename = context.type === 'github' 
    ? `geeksforgeeks-${context.data.number}-${timestamp}.txt`
    : `geeksforgeeks-search-${timestamp}.txt`;
  
  let content = `╔══════════════════════════════════════════════════════════════════════════════╗\n`;
  content += `║                                                                              ║\n`;
  content += `║              💚 GeeksforGeeks Search Results                                ║\n`;
  content += `║                                                                              ║\n`;
  content += `╚══════════════════════════════════════════════════════════════════════════════╝\n\n`;
  
  if (context.type === 'github') {
    content += `GitHub Issue: #${context.data.number}\n`;
    content += `Title: ${context.data.title}\n`;
    content += `URL: ${context.data.html_url}\n\n`;
  } else {
    content += `Search Query: ${context.data.query}\n\n`;
  }
  
  content += `Generated: ${new Date().toLocaleString()}\n\n`;
  content += `═══════════════════════════════════════════════════════════════════════════════\n\n`;
  
  searches.forEach((search, index) => {
    content += `${index + 1}. ${search.title} (${search.category})\n`;
    content += `${'─'.repeat(79)}\n`;
    content += `Query: ${search.query}\n`;
    content += `URL: ${search.url}\n`;
    content += `Keywords: ${search.keywords.join(', ')}\n\n`;
  });
  
  content += `═══════════════════════════════════════════════════════════════════════════════\n\n`;
  content += `How to use:\n`;
  content += `1. Copy any URL above\n`;
  content += `2. Open in your browser\n`;
  content += `3. Learn from tutorials and examples\n`;
  content += `4. Try different searches for more resources\n\n`;
  content += `Built with ❤️  for developers.\n`;

  fs.writeFileSync(filename, content);
  console.log(`\n💾 TXT file saved: ${filename}`);
}

async function saveToPDF(searches: GFGSearchResult[], context: any): Promise<void> {
  const { BeautifulPDFGenerator } = await import('../services/pdfGenerator.js');
  
  const timestamp = Date.now();
  const title = context.type === 'github'
    ? `GeeksforGeeks Results - Issue #${context.data.number}`
    : `GeeksforGeeks Search Results`;
  
  const pdfContent = {
    title,
    sections: [
      {
        heading: context.type === 'github' ? '📋 GitHub Issue' : '🔍 Search Query',
        content: context.type === 'github' ? [
          { type: 'bold', content: `Issue #${context.data.number}` },
          { type: 'text', content: context.data.title },
          { type: 'link', content: context.data.html_url },
        ] : [
          { type: 'bold', content: 'Search Query:' },
          { type: 'text', content: context.data.query },
        ],
        level: 1
      },
      {
        heading: '💚 GeeksforGeeks Results',
        content: searches.flatMap((search, index) => [
          { type: 'bold', content: `${index + 1}. ${search.title} (${search.category})` },
          { type: 'text', content: ' ' },
          { type: 'text', content: `Query: ${search.query}` },
          { type: 'link', content: search.url },
          { type: 'text', content: `Keywords: ${search.keywords.join(', ')}` },
          { type: 'text', content: ' ' },
        ]),
        level: 1
      }
    ],
    metadata: {
      author: 'GeeksforGeeks Finder',
      subject: 'GeeksforGeeks Search Results',
      keywords: ['GeeksforGeeks', 'Tutorial', 'Examples', 'Learning'],
      createdAt: new Date(),
    }
  };

  const pdfGenerator = new BeautifulPDFGenerator();
  const pdf = pdfGenerator.generatePDF(pdfContent);
  
  const filename = context.type === 'github'
    ? `geeksforgeeks-${context.data.number}-${timestamp}.pdf`
    : `geeksforgeeks-search-${timestamp}.pdf`;
  
  pdf.save(filename);
  console.log(`\n📄 PDF file saved: ${filename}`);
}

async function saveToJSON(searches: GFGSearchResult[], context: any): Promise<void> {
  const timestamp = Date.now();
  
  const jsonData = {
    source: context.type === 'github' ? {
      type: 'github',
      issue: {
        number: context.data.number,
        title: context.data.title,
        url: context.data.html_url
      }
    } : {
      type: 'text',
      query: context.data.query
    },
    results: searches.map((search, index) => ({
      number: index + 1,
      title: search.title,
      category: search.category,
      query: search.query,
      url: search.url,
      keywords: search.keywords
    })),
    metadata: {
      generatedAt: new Date().toISOString(),
      tool: 'GeeksforGeeks Finder',
      version: '1.0.0',
      platform: 'geeksforgeeks'
    }
  };

  const filename = context.type === 'github'
    ? `geeksforgeeks-${context.data.number}-${timestamp}.json`
    : `geeksforgeeks-search-${timestamp}.json`;
  
  fs.writeFileSync(filename, JSON.stringify(jsonData, null, 2));
  console.log(`\n📊 JSON file saved: ${filename}`);
}

function truncate(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

main().catch(error => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
