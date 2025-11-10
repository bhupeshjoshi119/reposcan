# 📜 License Checker CLI - Guide

## ✅ Your Current License

**License:** BSD 3-Clause License (OSI-Approved ✓)
**Copyright:** 2025, TechHub
**Status:** Valid and recognized

---

## 🚀 Usage

### Check Current Project
```bash
npm run license-checker
```

### Check Another Project
```bash
npm run license-checker /path/to/project
```

---

## 📊 What It Checks

1. **License File Detection**
   - Finds LICENSE, LICENSE.md, LICENSE.txt, COPYING, etc.

2. **OSI Verification**
   - Matches against 12 popular OSI-approved licenses
   - Verifies license text authenticity

3. **Package.json Validation**
   - Checks if license field exists
   - Validates SPDX identifier

4. **License Characteristics**
   - Shows permissions (commercial use, modification, etc.)
   - Displays restrictions and requirements

---

## 🎯 Supported OSI Licenses

| License | ID | Type |
|---------|----|----- |
| MIT License | MIT | Permissive |
| Apache 2.0 | Apache-2.0 | Permissive |
| BSD 3-Clause | BSD-3-Clause | Permissive ✅ (Your license) |
| BSD 2-Clause | BSD-2-Clause | Permissive |
| GNU GPL v3 | GPL-3.0 | Copyleft |
| GNU GPL v2 | GPL-2.0 | Copyleft |
| GNU LGPL v3 | LGPL-3.0 | Copyleft |
| Mozilla Public License 2.0 | MPL-2.0 | Weak Copyleft |
| ISC License | ISC | Permissive |
| Eclipse Public License 2.0 | EPL-2.0 | Weak Copyleft |
| Artistic License 2.0 | Artistic-2.0 | Permissive |
| Unlicense | Unlicense | Public Domain |

---

## 📝 Your License (BSD 3-Clause)

### ✅ Permissions
- Commercial use
- Modification
- Distribution
- Private use

### ⚠️ Conditions
- Must include license and copyright notice
- Cannot use copyright holder name for endorsement

### ❌ Limitations
- No liability
- No warranty

---

## 🔧 Fix: Add License to package.json

Add this to your `package.json`:

```json
{
  "license": "BSD-3-Clause"
}
```

---

## 🌐 Resources

- **OSI Licenses:** https://opensource.org/licenses
- **Choose a License:** https://choosealicense.com
- **SPDX License List:** https://spdx.org/licenses/
- **Your License:** https://opensource.org/licenses/BSD-3-Clause

---

## 📊 Example Output

```
✅ Found license file: LICENSE

📜 License Name: BSD 3-Clause License
🆔 License ID: BSD-3-Clause
🔗 OSI URL: https://opensource.org/licenses/BSD-3-Clause
✅ Status: OSI-Approved ✓

📊 License Details:
   📅 Copyright Year: 2025
   👤 Copyright Holder: TechHub

✅ Your license is OSI-approved and recognized!
```

---

## 🎯 Quick Commands

```bash
# Check license
npm run license-checker

# Check specific project
npm run license-checker /path/to/project

# View help
npm run license-checker --help
```

---

**Your project is properly licensed with BSD 3-Clause (OSI-Approved)! ✅**
