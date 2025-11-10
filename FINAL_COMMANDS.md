# 🚀 All Commands - Quick Reference

## 🔍 Stack Overflow Finder (NEW!)
```bash
# Intelligent keyword detection and search strategies
npm run stackoverflow-finder <github-issue-url>
```
**Best for:** Finding solutions when API returns no results

---

## 🤖 Auto Solutions
```bash
# Auto-generate PDFs (no interaction)
npm run auto-solutions <github-issue-url>
```
**Best for:** Quick PDF generation

---

## 💡 Find Solutions (Interactive)
```bash
# Interactive solution browser
npm run find-solutions <github-issue-url>
```
**Best for:** Exploring solutions interactively

---

## 📊 Analyze Issue
```bash
# Deep analysis with auto PDF
npm run analyze-issue <github-issue-url>
```
**Best for:** Complete analysis

---

## 📈 Comprehensive Analyze
```bash
# Batch analysis (100+ issues)
npm run comprehensive-analyze owner repo 100

npm run comprehensive-analyze flutter flutter 100

```
**Best for:** Repository-wide analysis

---

## ✅ Verify PDFs
```bash
# Check all generated PDFs
npm run verify-pdfs
```
**Best for:** Verification

---

## 🧪 Test
```bash
# Generate mock PDFs
npx tsx test-solution-pdfs.ts
```
**Best for:** Testing

---

## 🎯 Recommended Workflow

```bash
# 1. Try auto-solutions first
npm run auto-solutions <issue-url>

# 2. If no solutions, use finder
npm run stackoverflow-finder <issue-url>

# 3. Verify what was generated
npm run verify-pdfs

# 4. View PDFs
open issue-XXXXX-analysis.pdf
```

---

## 📋 Issue #33898 Example

```bash
# Generate PDFs
npm run auto-solutions https://github.com/langchain-ai/langchain/issues/33898
# Result: ✅ issue-33898-analysis.pdf
#         ❌ No solution PDFs (no Stack Overflow solutions)

# Find search strategies
npm run stackoverflow-finder https://github.com/langchain-ai/langchain/issues/33898
# Result: ✅ 8 search strategies
#         ✅ Direct Stack Overflow links
#         ✅ Save to file option

# Verify
npm run verify-pdfs
# Result: ✅ Shows all PDFs
#         ✅ Distinguishes real vs mock
```

---

**Built with ❤️ for developers.**

Now let's test the enhanced version:


npm run stackoverflow-finder https://github.com/langchain-ai/langchain/issues/33898 2>&1 | head -80


Good! Let me test saving all files to see the GeeksforGeeks strategies:

echo "95" | npm run stackoverflow-finder https://github.com/langchain-ai/langchain/issues/33898 2>&1 | grep -A 50 "GeeksforGeeks"

cat stackoverflow-searches-33898.json | jq '.searchStrategies[] | select(.platform == "geeksforgeeks")'


run the command:
npm run stackoverflow-finder https://github.com/langchain-ai/langchain/issues/33883 2>&1 | grep -A 30 "GeeksforGeeks"


Perfect! The URLs are now in the correct format. Let me save the results to verify:

echo "95" | npm run stackoverflow-finder https://github.com/langchain-ai/langchain/issues/33883 2>&1 | tail -10


test stackover flow with geeks url:

cat stackoverflow-searches-33883.json | jq '.searchStrategies[] | select(.platform == "geeksforgeeks")'


npm run geeksforgeeks-finder "how to improve cache performance in python" 2>&1 | head -60

> github-repo-analyzer-hackathon@0.0.0 geeksforgeeks-finder
> tsx src/cli/geeksforgeeks-finder.ts how to improve cache performance in python


╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║              💚 GeeksforGeeks Finder                                        ║
║                                                                              ║
║         Find Tutorials, Examples & Learning Resources                       ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

🔍 Searching GeeksforGeeks for: "how to improve cache performance in python"

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
│    https://www.geeksforgeeks.org/search/?gq=how+improve+cache+performa...
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
│    https://www.geeksforgeeks.org/search/?gq=how+improve+cache+performa...
│
│ 🏷️  Keywords: how, improve, cache, performance, python
│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. Example Search (Examples)
├─────────────────────────────────────────────────────────────────────────────┤
│
│ 🔍 Query: how to improve cache performance in python example
│
│ 🔗 URL:
│    https://www.geeksforgeeks.org/search/?gq=how+improve+cache+performa...
│
│ 🏷️  Keywords: how, improve, cache, performance, python
│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. How to Guide (Tutorial)
