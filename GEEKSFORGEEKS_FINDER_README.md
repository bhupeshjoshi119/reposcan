# 💚 GeeksforGeeks Finder - Standalone CLI Tool

## 🎯 Overview

A standalone CLI tool for searching GeeksforGeeks tutorials, examples, and learning resources. Can work independently or as part of the multi-platform search system.

---

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Usage

#### Search by Text
```bash
npm run geeksforgeeks-finder "how to improve cache performance in python"
```

#### Search from GitHub Issue
```bash
npm run geeksforgeeks-finder https://github.com/langchain-ai/langchain/issues/33883
```

---

## 📋 Features

### ✅ Standalone Tool
- Works independently
- No GitHub token needed for text search
- Can be published as npm package
- Reusable by other developers

### ✅ Multiple Search Strategies
- Direct Search
- Tutorial Search
- Example Search
- How to Guide
- Implementation Guide

### ✅ Export Formats
- TXT - Plain text with formatting
- PDF - Professional PDF with clickable links
- JSON - Structured data for APIs

### ✅ Dual Input Support
- Text search: Any search query
- GitHub issue: Analyzes issue and generates searches

---

## 💡 Use Cases

### Use Case 1: Learning New Technology
```bash
npm run geeksforgeeks-finder "python string manipulation"
```

**Result:**
- Direct search for string manipulation
- Tutorial links
- Code examples
- Implementation guides

### Use Case 2: Finding Tutorials
```bash
npm run geeksforgeeks-finder "implement custom cache in python"
```

**Result:**
- How to implement cache
- Tutorial with examples
- Best practices
- Code snippets

### Use Case 3: Requirement Gathering
```bash
npm run geeksforgeeks-finder https://github.com/langchain-ai/langchain/issues/33883
```

**Result:**
- Analyzes GitHub issue
- Generates relevant searches
- Finds tutorials and examples
- Exports to multiple formats

### Use Case 4: Quick Reference
```bash
npm run geeksforgeeks-finder "python list comprehension examples"
```

**Result:**
- Direct examples
- Tutorial links
- Code snippets
- Save for offline access

---

## 📊 Output Examples

### Console Output
```
═══════════════════════════════════════════════════════════════════════════════
                    💚 GeeksforGeeks Search Results
═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. Direct Search (General)
├─────────────────────────────────────────────────────────────────────────────┤
│
│ 🔍 Query: how to improve cache performance in python
│
│ 🔗 URL:
│    https://www.geeksforgeeks.org/search/?gq=how+improve+cache+performance...
│
│ 🏷️  Keywords: how, improve, cache, performance, python
│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. Tutorial Search (Tutorial)
├─────────────────────────────────────────────────────────────────────────────┤
│
│ 🔍 Query: how to improve cache performance in python tutorial
│
│ 🔗 URL:
│    https://www.geeksforgeeks.org/search/?gq=how+improve+cache+performance...
│
│ 🏷️  Keywords: how, improve, cache, performance, python, tutorial
│
└─────────────────────────────────────────────────────────────────────────────┘

... (3 more results)
```

### TXT File Output
```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║              💚 GeeksforGeeks Search Results                                ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

Search Query: how to improve cache performance in python

Generated: 11/9/2025, 10:00:00 AM

═══════════════════════════════════════════════════════════════════════════════

1. Direct Search (General)
───────────────────────────────────────────────────────────────────────────────
Query: how to improve cache performance in python
URL: https://www.geeksforgeeks.org/search/?gq=how+improve+cache+performance+in+python
Keywords: how, improve, cache, performance, python

2. Tutorial Search (Tutorial)
───────────────────────────────────────────────────────────────────────────────
Query: how to improve cache performance in python tutorial
URL: https://www.geeksforgeeks.org/search/?gq=how+improve+cache+performance+in+python+tutorial
Keywords: how, improve, cache, performance, python, tutorial

... (3 more results)
```

### JSON File Output
```json
{
  "source": {
    "type": "text",
    "query": "how to improve cache performance in python"
  },
  "results": [
    {
      "number": 1,
      "title": "Direct Search",
      "category": "General",
      "query": "how to improve cache performance in python",
      "url": "https://www.geeksforgeeks.org/search/?gq=how+improve+cache+performance+in+python",
      "keywords": ["how", "improve", "cache", "performance", "python"]
    },
    {
      "number": 2,
      "title": "Tutorial Search",
      "category": "Tutorial",
      "query": "how to improve cache performance in python tutorial",
      "url": "https://www.geeksforgeeks.org/search/?gq=how+improve+cache+performance+in+python+tutorial",
      "keywords": ["how", "improve", "cache", "performance", "python", "tutorial"]
    }
  ],
  "metadata": {
    "generatedAt": "2025-11-09T10:00:00.000Z",
    "tool": "GeeksforGeeks Finder",
    "version": "1.0.0",
    "platform": "geeksforgeeks"
  }
}
```

---

## 🎨 Interactive Menu

```
═══════════════════════════════════════════════════════════════════════════════
                            🎯 What would you like to do?
═══════════════════════════════════════════════════════════════════════════════

Search Results:
  1️⃣  Open: Direct Search
  2️⃣  Open: Tutorial Search
  3️⃣  Open: Example Search
  4️⃣  Open: How to Guide
  5️⃣  Open: Implementation Guide

Actions:
  9️⃣0️⃣ 🌐 Open all searches
  9️⃣1️⃣ 📋 Copy all URLs
  9️⃣2️⃣ 💾 Save to TXT
  9️⃣3️⃣ 📄 Save to PDF
  9️⃣4️⃣ 📊 Save to JSON
  9️⃣5️⃣ 💼 Save All (TXT + PDF + JSON)
  0️⃣  ❌ Exit

Enter your choice:
```

---

## 📦 NPM Package Preparation

### package.json Configuration
```json
{
  "name": "geeksforgeeks-finder",
  "version": "1.0.0",
  "description": "CLI tool for searching GeeksforGeeks tutorials and examples",
  "main": "dist/cli/geeksforgeeks-finder.js",
  "bin": {
    "gfg-finder": "./dist/cli/geeksforgeeks-finder.js",
    "geeksforgeeks-finder": "./dist/cli/geeksforgeeks-finder.js"
  },
  "scripts": {
    "build": "tsc",
    "prepublish": "npm run build"
  },
  "keywords": [
    "geeksforgeeks",
    "tutorial",
    "learning",
    "examples",
    "cli",
    "search",
    "education"
  ],
  "author": "Your Name",
  "license": "MIT"
}
```

### After Publishing
```bash
# Install globally
npm install -g geeksforgeeks-finder

# Use anywhere
gfg-finder "python list comprehension"
geeksforgeeks-finder "how to implement cache"
```

---

## 🔧 Integration with Other Tools

### Standalone Usage
```bash
# Works independently
npm run geeksforgeeks-finder "search query"
```

### With Multi-Platform Search
```bash
# Part of comprehensive search
npm run stackoverflow-finder <issue-url>
# Includes GeeksforGeeks results
```

### Programmatic Usage
```typescript
import { GeeksforGeeksFinder } from 'geeksforgeeks-finder';

const finder = new GeeksforGeeksFinder();
const results = await finder.search('python cache');
console.log(results);
```

---

## 🎯 Benefits

### For Individual Developers
- ✅ Quick access to tutorials
- ✅ Find code examples fast
- ✅ Learn new technologies
- ✅ Save for offline reference

### For Teams
- ✅ Share learning resources
- ✅ Consistent documentation
- ✅ Onboarding materials
- ✅ Knowledge base building

### For Educators
- ✅ Curate learning materials
- ✅ Create study guides
- ✅ Share with students
- ✅ Track resources

### For Open Source
- ✅ Requirement gathering
- ✅ Implementation examples
- ✅ Best practices
- ✅ Community learning

---

## 📊 Comparison with Multi-Platform Tool

| Feature | GeeksforGeeks Finder | Multi-Platform Finder |
|---------|---------------------|----------------------|
| **Platforms** | GeeksforGeeks only | SO + GFG + Google |
| **GitHub Token** | Optional | Required for issues |
| **Text Search** | ✅ Yes | ✅ Yes |
| **Issue Search** | ✅ Yes | ✅ Yes |
| **Standalone** | ✅ Yes | ❌ No |
| **NPM Package** | ✅ Ready | ⚠️ Complex |
| **Export Formats** | TXT, PDF, JSON | TXT, PDF, JSON |
| **Focus** | Learning & Tutorials | Problem Solving |

---

## 🚀 Publishing to NPM

### Step 1: Prepare Package
```bash
# Update package.json
# Add bin field
# Add keywords
# Set version
```

### Step 2: Build
```bash
npm run build
```

### Step 3: Test Locally
```bash
npm link
gfg-finder "test query"
```

### Step 4: Publish
```bash
npm login
npm publish
```

### Step 5: Verify
```bash
npm install -g geeksforgeeks-finder
gfg-finder "python examples"
```

---

## 📝 Usage Examples

### Example 1: Learning Python
```bash
npm run geeksforgeeks-finder "python list comprehension"

# Save for reference
Enter: 95

# Files generated:
# - geeksforgeeks-search-1699520000000.txt
# - geeksforgeeks-search-1699520000000.pdf
# - geeksforgeeks-search-1699520000000.json
```

### Example 2: Implementation Guide
```bash
npm run geeksforgeeks-finder "implement custom cache in python"

# View tutorial
Enter: 2

# Opens: https://www.geeksforgeeks.org/search/?gq=implement+custom+cache+in+python+tutorial
```

### Example 3: GitHub Issue Analysis
```bash
npm run geeksforgeeks-finder https://github.com/langchain-ai/langchain/issues/33883

# Analyzes issue
# Generates 5 search strategies
# Save all formats
Enter: 95
```

---

## 🎓 Best Practices

### 1. Use Specific Queries
```bash
# Good
npm run geeksforgeeks-finder "python dictionary comprehension examples"

# Less specific
npm run geeksforgeeks-finder "python examples"
```

### 2. Save Important Searches
```bash
# Always save useful searches
Enter: 95  # Save all formats
```

### 3. Organize Files
```bash
# Create folders for different topics
mkdir -p learning/python
cd learning/python
npm run geeksforgeeks-finder "python advanced topics"
```

### 4. Share with Team
```bash
# Generate PDFs for sharing
npm run geeksforgeeks-finder "team topic"
Enter: 93  # Save PDF
# Share the PDF file
```

---

## ✅ Summary

The GeeksforGeeks Finder is:

1. **Standalone** - Works independently
2. **Flexible** - Text or GitHub issue input
3. **Exportable** - TXT, PDF, JSON formats
4. **Reusable** - Can be npm package
5. **Educational** - Focus on learning
6. **Comprehensive** - Multiple search strategies

**Perfect for:**
- Learning new technologies
- Finding tutorials
- Code examples
- Requirement gathering
- Team knowledge sharing
- Educational purposes

---

## 🔗 Quick Commands

```bash
# Text search
npm run geeksforgeeks-finder "your search query"

# GitHub issue
npm run geeksforgeeks-finder <github-issue-url>

# Save all formats
# Enter: 95 when prompted

# View help
npm run geeksforgeeks-finder
```

---

**Built with ❤️ for developers who love learning from GeeksforGeeks.**
