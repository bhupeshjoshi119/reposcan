# 🚀 CLI Commands Reference

Complete reference for all CLI tools in the GitHub Issue Analyzer toolkit.

---

## 📋 Table of Contents

1. [Issue Analysis Tools](#issue-analysis-tools)
2. [Solution Finder Tools](#solution-finder-tools)
3. [Multi-Platform Search Tools](#multi-platform-search-tools)
4. [Legal & Compliance Tools](#legal--compliance-tools)
5. [PDF Generation & Verification](#pdf-generation--verification)
6. [Server & Development](#server--development)

---

## 🔍 Issue Analysis Tools

### Basic Issue Analysis
```bash
npm run analyze-issue
```
**Purpose**: Analyze a single GitHub issue with basic information  
**Input**: GitHub issue URL  
**Output**: Console display of issue details, comments, and basic analysis

### Simple Analysis
```bash
npm run simple-analyze
```
**Purpose**: Quick analysis with minimal output  
**Input**: GitHub issue URL  
**Output**: Simplified issue summary

### Comprehensive Analysis
```bash
npm run comprehensive-analyze
```
**Purpose**: Deep analysis with full PDF report generation  
**Input**: GitHub issue URL  
**Output**: 
- Detailed console analysis
- Comprehensive PDF report with all issue data
- Formatted text export
- JSON data export

### Batch Analysis
```bash
npm run batch-analyze
```
**Purpose**: Analyze multiple GitHub issues at once  
**Input**: Multiple GitHub issue URLs (one per line)  
**Output**: Batch analysis results for all issues

---

## 🎯 Solution Finder Tools

### Find Solutions
```bash
npm run find-solutions
```
**Purpose**: Search for solutions to a GitHub issue  
**Input**: GitHub issue URL  
**Output**: 
- Stack Overflow solutions with relevance scores
- Code snippets and explanations
- Links to full solutions

### Auto-Generate Solutions
```bash
npm run auto-solutions
```
**Purpose**: Automatically generate solution PDFs from Stack Overflow  
**Input**: GitHub issue URL  
**Output**: 
- Individual PDF for each solution found
- Formatted with title, score, answer, and code
- Saved to `outputs/solutions/` directory

---

## 🌐 Multi-Platform Search Tools

### Stack Overflow Finder
```bash
npm run stackoverflow-finder
```
**Purpose**: Interactive multi-platform search with 12 strategies  
**Input**: GitHub issue URL or text query  
**Features**:
- **12 Search Strategies**:
  1. Stack Overflow - Error message search
  2. Stack Overflow - Technology + problem search
  3. Stack Overflow - "How to" natural language
  4. Stack Overflow - Code-focused search
  5. GeeksforGeeks - Tutorial search
  6. GeeksforGeeks - Implementation guide
  7. GeeksforGeeks - Example code search
  8. Google - Stack Overflow site search
  9. Google - GeeksforGeeks site search
  10. Google - GitHub issues search
  11. Google - Documentation search
  12. Google - General web search

- **Interactive Actions**:
  - 90: Save as TXT
  - 91: Save as PDF
  - 92: Save as JSON
  - 93: Open in browser
  - 94: Copy to clipboard
  - 95: Save all formats

**Output**: 
- Interactive menu with search results
- Multiple export formats
- Clickable links in PDFs

### GeeksforGeeks Finder
```bash
npm run geeksforgeeks-finder
```
**Purpose**: Standalone educational resource finder  
**Input**: GitHub issue URL or text query  
**Output**: 
- GeeksforGeeks tutorials and articles
- Implementation guides
- Example code and explanations
- Direct links to resources

---

## 🛡️ Legal & Compliance Tools

### License Checker
```bash
npm run license-checker
```
**Purpose**: Check license compliance for projects and repositories  
**Input**: 
- Local project path (checks LICENSE file)
- GitHub repository URL (fetches via API)

**Output**:
- License type identification
- OSI approval status
- Usage permissions (commercial, modification, distribution)
- Legal requirements (attribution, disclosure)
- Risk assessment for unlicensed repos
- Copyleft implications

**Supported Licenses**:
- MIT, Apache-2.0, GPL-3.0, BSD-3-Clause
- ISC, MPL-2.0, LGPL-3.0, AGPL-3.0
- BSD-2-Clause, Unlicense, CC0-1.0, WTFPL
- And more OSI-approved licenses

---

## 📄 PDF Generation & Verification

### Verify PDFs
```bash
npm run verify-pdfs
```
**Purpose**: Verify generated PDF files exist and check status  
**Input**: None (scans outputs directory)  
**Output**: 
- List of all PDF files found
- File sizes and creation dates
- Missing file warnings
- Directory structure validation

### Test Solution PDFs
```bash
tsx test-solution-pdfs.ts
```
**Purpose**: Test PDF generation functionality  
**Input**: Test data  
**Output**: Sample PDFs for verification

---

## 🖥️ Server & Development

### Start Development Server
```bash
npm run dev
or 
bun dev
```
**Purpose**: Start Vite development server  
**Port**: Default Vite port (usually 5173)  
**Use**: Frontend development and testing

### Start Backend Server
```bash
npm run server
or 
bun dev
```
**Purpose**: Start Express backend server  
**Port**: Configured in environment  
**Use**: API endpoints and OAuth handling

### Start Full Stack
```bash
npm run start:full
```
**Purpose**: Start both frontend and backend concurrently  
**Use**: Full application development

### Build for Production
```bash
npm run build
```
**Purpose**: Build optimized production bundle  
**Output**: `dist/` directory

### Build for Development
```bash
npm run build:dev
```
**Purpose**: Build with development mode settings  
**Output**: `dist/` directory with source maps

### Preview Production Build
```bash
npm run preview
```
**Purpose**: Preview production build locally  
**Use**: Test production bundle before deployment

---

## 🔧 Utility Commands

### Fix OAuth Configuration
```bash
npm run fix-oauth
```
**Purpose**: Fix OAuth configuration issues  
**Use**: Troubleshoot authentication problems

### Setup OAuth
```bash
npm run setup-oauth
```
**Purpose**: Initial OAuth setup and configuration  
**Use**: First-time setup or reconfiguration

### Verify Deployment
```bash
npm run verify-deployment
```
**Purpose**: Verify deployment configuration and status  
**Use**: Post-deployment validation

### Lint Code
```bash
npm run lint
```
**Purpose**: Run ESLint on codebase  
**Use**: Code quality checks

---

## 💡 Quick Start Examples

### Analyze an Issue and Generate Solutions
```bash
# Step 1: Comprehensive analysis with PDF
npm run comprehensive-analyze
# Enter: https://github.com/owner/repo/issues/123

# Step 2: Find and generate solution PDFs
npm run auto-solutions
# Enter: https://github.com/owner/repo/issues/123
```

### Multi-Platform Solution Search
```bash
# Interactive search with all platforms
npm run stackoverflow-finder
# Enter: https://github.com/owner/repo/issues/123
# Choose strategy: 1-12
# Choose action: 95 (save all formats)
```

### Check License Before Using Code
```bash
# Check a GitHub repository
npm run license-checker
# Enter: https://github.com/owner/repo

# Check local project
npm run license-checker
# Enter: ./path/to/project
```

### Educational Resource Discovery
```bash
# Find tutorials and guides
npm run geeksforgeeks-finder
# Enter: "binary search tree implementation"
```

---

## 📁 Output Directories

All generated files are saved to organized directories:

```
outputs/
├── solutions/          # Solution PDFs from auto-solutions
├── comprehensive/      # Comprehensive analysis reports
├── stackoverflow/      # Stack Overflow search results
├── geeksforgeeks/      # GeeksforGeeks search results
└── licenses/           # License check reports
```

---

## 🎯 Common Workflows

### Workflow 1: Issue Investigation
1. `npm run comprehensive-analyze` - Get full issue context
2. `npm run stackoverflow-finder` - Search for solutions
3. `npm run license-checker` - Verify solution licenses
4. Implement solution with confidence

### Workflow 2: Learning & Research
1. `npm run geeksforgeeks-finder` - Find tutorials
2. `npm run stackoverflow-finder` - Get practical examples
3. Review generated PDFs for offline study

### Workflow 3: Batch Processing
1. `npm run batch-analyze` - Analyze multiple issues
2. `npm run auto-solutions` - Generate solutions for each
3. `npm run verify-pdfs` - Confirm all files generated

---

## 🔑 Environment Variables

Some commands require environment configuration:

```bash
# GitHub API (optional, increases rate limits)
GITHUB_TOKEN=your_github_personal_access_token

# For OAuth features
VITE_GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

---

## 🆘 Troubleshooting

### Command Not Found
```bash
# Install dependencies first
npm install
```

### TypeScript Errors
```bash
# Rebuild TypeScript
npm run build
```

### PDF Generation Issues
```bash
# Verify output directory exists
mkdir -p outputs/solutions outputs/comprehensive

# Test PDF generation
tsx test-solution-pdfs.ts
```

### API Rate Limits
- Add `GITHUB_TOKEN` to environment variables
- Wait for rate limit reset (shown in error message)
- Use authenticated requests for higher limits

---

## 📚 Additional Resources

- **Comprehensive Guide**: `COMPREHENSIVE_ANALYSIS_GUIDE.md`
- **Stack Overflow Finder**: `STACKOVERFLOW_FINDER_GUIDE.md`
- **GeeksforGeeks Integration**: `GEEKSFORGEEKS_INTEGRATION_GUIDE.md`
- **License Checker**: `ENHANCED_LICENSE_CHECKER_GUIDE.md`
- **PDF Generation**: `SOLUTION_PDF_GUIDE.md`
- **Quick Start**: `DEVELOPER_QUICK_START.md`

---

## 🎉 Pro Tips

1. **Use Interactive Menus**: Most tools offer numbered options for easy navigation
2. **Save All Formats**: Option 95 in stackoverflow-finder saves TXT, PDF, and JSON
3. **Check Licenses First**: Always verify licenses before using code in production
4. **Batch Operations**: Use batch-analyze for multiple issues at once
5. **Offline Access**: Generated PDFs work great for offline reference

---

**Last Updated**: November 11, 2025  
**Version**: 1.0.0  
**Maintained By**: GitHub Issue Analyzer Team
