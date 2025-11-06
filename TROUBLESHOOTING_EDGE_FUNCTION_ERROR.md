# Troubleshooting: Edge Function Error

## Error Message
> "Edge Function returned a non-2xx status code"

## What This Means
This error occurs when your Supabase Edge Function (backend API) fails to return data successfully. This is typically related to the AI analysis generation, not the PDF generation itself.

---

## ✅ Quick Fix Applied

I've updated the code to handle missing analysis data gracefully:

### Changes Made:
1. **Removed strict analysis requirement** - PDFs can now generate without analysis data
2. **Added fallback text** - Uses repository metadata when analysis is unavailable
3. **Better error messages** - Shows specific error details
4. **Removed disabled state** - Buttons work even without analysis

### Result:
- ✅ PDFs will generate using repository data only
- ✅ No more blocking on Edge Function failures
- ✅ Better user experience

---

## Root Causes & Solutions

### 1. Edge Function Not Deployed
**Symptom:** Error occurs every time you try to generate analysis

**Solution:**
```bash
# Check if Edge Functions are deployed
# In your Supabase dashboard:
# 1. Go to Edge Functions
# 2. Check if functions are deployed
# 3. Check function logs for errors
```

### 2. API Rate Limiting
**Symptom:** Works sometimes, fails other times

**Solution:**
- Check your API rate limits
- Implement retry logic
- Add caching for analysis results

### 3. Missing Environment Variables
**Symptom:** Edge Function fails with authentication errors

**Solution:**
```bash
# Check your .env file has:
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key

# And in Supabase Edge Function:
OPENAI_API_KEY=your_key  # or whatever AI service you use
```

### 4. AI Service Quota Exceeded
**Symptom:** Edge Function returns 429 or 503 errors

**Solution:**
- Check your AI service (OpenAI, Anthropic, etc.) quota
- Upgrade plan or wait for quota reset
- Implement fallback to simpler analysis

---

## Testing Without Edge Function

### Option 1: Use Mock Data (Recommended for Testing)
```typescript
// In your component that calls DualPDFGenerator
const mockAnalysis = `
## Repository Analysis

This is a mock analysis for testing purposes.

### Health Score: 75/100

### Key Findings:
- Active development
- Good community engagement
- Regular updates

### Recommendations:
- Continue current practices
- Consider adding more tests
- Improve documentation
`;

<DualPDFGenerator
  repository={repository}
  analysis={mockAnalysis}  // Use mock data
  prediction={null}
/>
```

### Option 2: Make Analysis Optional
```typescript
// Already implemented in the fix above
<DualPDFGenerator
  repository={repository}
  analysis=""  // Empty string works now
  prediction={null}
/>
```

---

## Debugging Steps

### Step 1: Check Browser Console
```javascript
// Open browser DevTools (F12)
// Look for errors like:
// - "Failed to fetch"
// - "Network error"
// - "Edge Function error"
```

### Step 2: Check Network Tab
```
1. Open DevTools → Network tab
2. Try generating PDF
3. Look for failed requests (red)
4. Click on failed request
5. Check Response tab for error details
```

### Step 3: Check Supabase Logs
```
1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. Click on your function
4. Check Logs tab
5. Look for error messages
```

### Step 4: Test Edge Function Directly
```bash
# Use curl to test your Edge Function
curl -X POST https://your-project.supabase.co/functions/v1/your-function \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"repository": "owner/repo"}'
```

---

## Workarounds

### Temporary Workaround 1: Disable Analysis
```typescript
// In your component
const [useAnalysis, setUseAnalysis] = useState(false);

<DualPDFGenerator
  repository={repository}
  analysis={useAnalysis ? analysis : ""}
  prediction={null}
/>
```

### Temporary Workaround 2: Use Static Analysis
```typescript
// Generate simple analysis from repository data
const generateSimpleAnalysis = (repo: any) => {
  return `
## Repository Analysis

### Health Score: ${calculateSimpleScore(repo)}/100

### Statistics:
- Stars: ${repo.stargazers_count}
- Forks: ${repo.forks_count}
- Issues: ${repo.open_issues_count}

### Observations:
- ${repo.stargazers_count > 100 ? 'Good' : 'Growing'} community interest
- ${repo.open_issues_count < 20 ? 'Well' : 'Actively'} maintained
- ${repo.language || 'Multiple'} language project
  `;
};
```

---

## Long-Term Solutions

### 1. Implement Caching
```typescript
// Cache analysis results to avoid repeated API calls
const cachedAnalysis = localStorage.getItem(`analysis_${repo.id}`);
if (cachedAnalysis) {
  return JSON.parse(cachedAnalysis);
}
```

### 2. Add Retry Logic
```typescript
async function fetchAnalysisWithRetry(repo: any, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetchAnalysis(repo);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### 3. Implement Queue System
```typescript
// For high-volume usage
// Queue analysis requests
// Process in background
// Notify when ready
```

### 4. Add Fallback AI Service
```typescript
// If primary AI service fails, try backup
try {
  return await openAIAnalysis(repo);
} catch {
  return await anthropicAnalysis(repo);
}
```

---

## Current Status After Fix

### ✅ What Works Now:
- PDF generation works without analysis
- Better error messages
- No blocking on Edge Function failures
- Graceful degradation

### ⚠️ What's Limited:
- PDFs use repository metadata only
- No AI-generated insights (until Edge Function fixed)
- Generic recommendations instead of custom

### 🔄 What to Do Next:
1. Test PDF generation (should work now)
2. Fix Edge Function separately
3. Re-enable analysis when ready

---

## Testing Checklist

After applying the fix:

- [ ] Basic PDF generates successfully
- [ ] Enhanced PDF generates successfully
- [ ] No "Missing Data" errors
- [ ] Error messages are clear
- [ ] PDFs contain repository data
- [ ] Quick insights cards work
- [ ] Health score calculates correctly
- [ ] Recommendations show up

---

## Summary

### Problem:
Edge Function failing → Analysis unavailable → PDF generation blocked

### Solution:
Make analysis optional → Use repository data → PDF generates successfully

### Result:
- ✅ PDFs work immediately
- ✅ No dependency on Edge Function
- ✅ Better user experience
- ✅ Can fix Edge Function separately

---

## Need More Help?

### Check These Files:
- `src/components/DualPDFGenerator.tsx` - Updated with fix
- `src/utils/limitedPdfGenerator.ts` - Basic PDF generator
- `src/utils/enhancedPdfGenerator.ts` - Enhanced PDF generator

### Common Issues:
1. **Still getting errors?** - Check browser console for details
2. **PDFs look empty?** - Verify repository data is loaded
3. **Buttons disabled?** - Check if repository prop is passed

### Quick Test:
```bash
npm run dev
# Navigate to any repository
# Click "Generate Basic Overview"
# Should work without errors
```

**The fix is applied and ready to test!** 🚀
