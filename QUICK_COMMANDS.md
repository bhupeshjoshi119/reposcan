# 🚀 Quick Commands Reference

## Find Solutions (NEW! 🎉)

```bash
# Interactive solution finder
npm run find-solutions <github-issue-url>
```

**Example:**
```bash
npm run find-solutions https://github.com/facebook/react/issues/12345
```

**What you get:**
- 🟢 Solutions ranked by relevance
- 📊 Quality metrics
- 🎯 Interactive menu
- 📄 One-click PDF generation

---

## Test with Mock Data

```bash
# Generate sample solution PDFs
npx tsx test-solution-pdfs.ts
```

**Output:**
- `solution-1.pdf` - 95% relevance
- `solution-2.pdf` - 88% relevance
- `solution-3.pdf` - 82% relevance

---

## Other Commands

### Deep Analysis
```bash
npm run analyze-issue <github-issue-url>
```
- Complete analysis
- Auto PDF generation
- Related issues
- Recommendations

### Batch Analysis
```bash
npm run comprehensive-analyze owner repo 100
```
- 100+ issues
- Statistics
- Trends
- Comprehensive PDF

---

## Setup

```bash
# Install
npm install

# Set token
export GITHUB_TOKEN=your_token_here
```

Get token: https://github.com/settings/tokens

---

## View PDFs

```bash
# List generated PDFs
ls -lh solution-*.pdf

# Open PDF
open solution-1.pdf

# Clean up
rm -f solution-*.pdf issue-*.pdf
```

---

## Documentation

- **Quick Start**: `DEVELOPER_QUICK_START.md`
- **Complete Guide**: `SOLUTION_FINDER_README.md`
- **PDF Guide**: `SOLUTION_PDF_GUIDE.md`
- **Summary**: `FINAL_SOLUTION_SUMMARY.md`

---

## Quick Workflow

```bash
# 1. Find solutions
npm run find-solutions <issue-url>

# 2. View solution #1 (highest relevance)
# Enter: 1

# 3. Generate PDFs
# Enter: pdf

# 4. Open PDF
open solution-1.pdf

# 5. Try the solution
# Done! ✅
```

---

**Built with ❤️ for developers who need solutions fast.**
