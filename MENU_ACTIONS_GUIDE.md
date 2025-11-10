# 📋 Menu Actions Guide - Stack Overflow Finder

## 🎯 Complete Menu Options

After running `npm run stackoverflow-finder <issue-url>`, you'll see this menu:

```
═══════════════════════════════════════════════════════════════════════════════
                            🎯 What would you like to do?
═══════════════════════════════════════════════════════════════════════════════

Search Strategies:
  1️⃣  Open Strategy 1: Technology + Title Keywords
  2️⃣  Open Strategy 2: Technology + Code Term
  3️⃣  Open Strategy 3: Action + Technology + Problem
  4️⃣  Open Strategy 4: Technology + Label
  5️⃣  Open Strategy 5: Full Title Search
  6️⃣  Open Strategy 6: Technology Tags
  7️⃣  Open Strategy 7: Google (Stack Overflow only)

Actions:
  9️⃣  🌐 Open all searches in browser
  🔟 📋 Copy all search URLs
  1️⃣1️⃣ 💾 Save to TXT file
  1️⃣2️⃣ 📄 Save to PDF
  1️⃣3️⃣ 📊 Save to JSON
  1️⃣4️⃣ 💼 Save All (TXT + PDF + JSON)
  0️⃣  ❌ Exit

Enter your choice (1-8 for strategies, 9-14 for actions, 0 to exit):
```

---

## 📊 Menu Options Explained

### Search Strategies (1-7)

| Number | Action | Description |
|--------|--------|-------------|
| **1** | Strategy 1 | Technology + Title Keywords (Best for general issues) |
| **2** | Strategy 2 | Technology + Code Term (Best for specific code) |
| **3** | Strategy 3 | Action + Technology + Problem (Best for solutions) |
| **4** | Strategy 4 | Technology + Label (Best for categories) |
| **5** | Strategy 5 | Full Title Search (Best for exact matches) |
| **6** | Strategy 6 | Technology Tags (Best for browsing) |
| **7** | Strategy 7 | Google Search (Best for comprehensive) |

### Actions (9-14)

| Number | Action | Description | Output |
|--------|--------|-------------|--------|
| **9** | Open All | Shows all search URLs | Console output |
| **10** | Copy URLs | Displays URLs for copying | Console output |
| **11** | Save TXT | Saves to text file | `.txt` file |
| **12** | Save PDF | Saves to PDF | `.pdf` file |
| **13** | Save JSON | Saves to JSON | `.json` file |
| **14** | Save All | Saves TXT + PDF + JSON | All 3 files |
| **0** | Exit | Closes the tool | Goodbye message |

---

## 📁 File Outputs

### Option 11: Save to TXT

**Filename:** `stackoverflow-searches-XXXXX.txt`

**Contents:**
```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║              Stack Overflow Search Strategies                               ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

Issue #33898: Support for Custom Metadata Hydrators in Text Splitters
URL: https://github.com/langchain-ai/langchain/issues/33898
State: OPEN
Generated: 11/9/2025, 8:53:50 AM

═══════════════════════════════════════════════════════════════════════════════

Strategy 1: Technology + Title Keywords
───────────────────────────────────────────────────────────────────────────────
Query: python Support Custom Metadata Hydrators Text
URL: https://stackoverflow.com/search?q=python%20Support...
Keywords: python, Support, Custom, Metadata, Hydrators, Text

Strategy 2: Technology + Code Term
───────────────────────────────────────────────────────────────────────────────
Query: python charactertextsplitter
URL: https://stackoverflow.com/search?q=python%20charactertextsplitter
Keywords: python, charactertextsplitter

... (all 7 strategies)

═══════════════════════════════════════════════════════════════════════════════

How to use:
1. Copy any URL above
2. Open in your browser
3. Search Stack Overflow for solutions
4. Try different strategies if first one doesn't work

Built with ❤️  for developers.
```

**Use for:**
- Quick reference
- Sharing with team
- Documentation
- Offline access

---

### Option 12: Save to PDF

**Filename:** `stackoverflow-searches-XXXXX.pdf`

**Contents:**
- Professional PDF formatting
- GitHub issue information
- All 7 search strategies
- Clickable URLs
- Usage instructions

**Features:**
- ✅ Clickable links
- ✅ Professional formatting
- ✅ Easy to share
- ✅ Print-friendly

**Use for:**
- Team presentations
- Documentation
- Knowledge base
- Archiving

---

### Option 13: Save to JSON

**Filename:** `stackoverflow-searches-XXXXX.json`

**Contents:**
```json
{
  "issue": {
    "number": 33898,
    "title": "Support for Custom Metadata Hydrators in Text Splitters",
    "url": "https://github.com/langchain-ai/langchain/issues/33898",
    "state": "open",
    "comments": 1,
    "labels": ["feature request"]
  },
  "searchStrategies": [
    {
      "strategyNumber": 1,
      "strategyName": "Technology + Title Keywords",
      "query": "python Support Custom Metadata Hydrators Text",
      "url": "https://stackoverflow.com/search?q=python%20Support...",
      "keywords": ["python", "Support", "Custom", "Metadata", "Hydrators", "Text"]
    },
    ... (all 7 strategies)
  ],
  "metadata": {
    "generatedAt": "2025-11-09T08:53:50.000Z",
    "tool": "Stack Overflow Search Founder",
    "version": "1.0.0"
  }
}
```

**Use for:**
- API integration
- Automation scripts
- Data analysis
- Programmatic access

---

### Option 14: Save All

**Generates 3 files:**
1. `stackoverflow-searches-XXXXX.txt` (4.7 KB)
2. `stackoverflow-searches-XXXXX.pdf` (22 KB)
3. `stackoverflow-searches-XXXXX.json` (2.7 KB)

**Total:** ~30 KB for all formats

**Use for:**
- Complete documentation
- Multiple use cases
- Team sharing
- Archiving

---

## 🎯 Usage Examples

### Example 1: Quick Search
```bash
npm run stackoverflow-finder <issue-url>

# When menu appears:
Enter: 1

# Result: Opens Strategy 1 URL
```

### Example 2: Save for Later
```bash
npm run stackoverflow-finder <issue-url>

# When menu appears:
Enter: 11

# Result: Saves TXT file
# File: stackoverflow-searches-33898.txt
```

### Example 3: Team Sharing
```bash
npm run stackoverflow-finder <issue-url>

# When menu appears:
Enter: 12

# Result: Saves PDF file
# Share: stackoverflow-searches-33898.pdf with team
```

### Example 4: Automation
```bash
npm run stackoverflow-finder <issue-url>

# When menu appears:
Enter: 13

# Result: Saves JSON file
# Use: In scripts or APIs
```

### Example 5: Complete Documentation
```bash
npm run stackoverflow-finder <issue-url>

# When menu appears:
Enter: 14

# Result: Saves all 3 files
# TXT + PDF + JSON
```

### Example 6: Exit Gracefully
```bash
npm run stackoverflow-finder <issue-url>

# When menu appears:
Enter: 0

# Result: Exits with goodbye message
```

---

## 💡 Best Practices

### 1. Start with Strategy 1
```
Enter: 1
```
Most relevant for general issues.

### 2. Save All for Important Issues
```
Enter: 14
```
Complete documentation in all formats.

### 3. Use JSON for Automation
```
Enter: 13
```
Easy to parse and integrate.

### 4. Share PDF with Team
```
Enter: 12
```
Professional and easy to read.

### 5. Keep TXT for Quick Reference
```
Enter: 11
```
Lightweight and fast to open.

---

## 🔄 Workflow Examples

### Workflow 1: Quick Problem Solving
```bash
# 1. Run finder
npm run stackoverflow-finder <issue-url>

# 2. Try best strategy
Enter: 1

# 3. If no results, try next
Run again, Enter: 2

# 4. Exit when done
Enter: 0
```

### Workflow 2: Documentation
```bash
# 1. Run finder
npm run stackoverflow-finder <issue-url>

# 2. Save all formats
Enter: 14

# 3. Add to knowledge base
# Files: TXT, PDF, JSON

# 4. Exit
Enter: 0
```

### Workflow 3: Team Collaboration
```bash
# 1. Run finder
npm run stackoverflow-finder <issue-url>

# 2. Save PDF
Enter: 12

# 3. Share with team
# Send: stackoverflow-searches-XXXXX.pdf

# 4. Team tries different strategies
```

---

## 📊 File Size Reference

| Format | Size | Best For |
|--------|------|----------|
| TXT | ~5 KB | Quick reference, sharing |
| PDF | ~22 KB | Presentations, documentation |
| JSON | ~3 KB | Automation, APIs |
| All | ~30 KB | Complete documentation |

---

## 🎨 Exit Message

When you enter `0`, you'll see:

```
═══════════════════════════════════════════════════════════════════════════════
                          👋 Thank You!
═══════════════════════════════════════════════════════════════════════════════

Stack Overflow Search Founder session ended.

📁 Generated files are saved in the current directory.
🔍 Use the search URLs to find solutions on Stack Overflow.

💡 Tip: Run again anytime with:
   npm run stackoverflow-finder <github-issue-url>

Built with ❤️  for developers.
```

---

## ✅ Quick Reference Card

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Menu Options Quick Reference                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1-7   Open specific search strategy                                       │
│  9     Show all search URLs                                                │
│  10    Copy all URLs                                                       │
│  11    Save to TXT file                                                    │
│  12    Save to PDF                                                         │
│  13    Save to JSON                                                        │
│  14    Save All (TXT + PDF + JSON)                                        │
│  0     Exit                                                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Commands Summary

```bash
# Run Stack Overflow Finder
npm run stackoverflow-finder <github-issue-url>

# Example
npm run stackoverflow-finder https://github.com/langchain-ai/langchain/issues/33898

# Then choose:
# 1-7: Try specific strategy
# 11: Save TXT
# 12: Save PDF
# 13: Save JSON
# 14: Save All
# 0: Exit
```

---

**Built with ❤️ for developers who need organized search strategies.**
