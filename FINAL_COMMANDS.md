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
