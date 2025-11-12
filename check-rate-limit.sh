#!/bin/bash

echo "🔍 Checking GitHub API Rate Limit..."
echo ""

# Load token from .env
if [ -f .env ]; then
    source .env
fi

if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ GITHUB_TOKEN not set"
    exit 1
fi

# Check rate limit
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/rate_limit | \
  node -e "
    const data = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
    const core = data.resources.core;
    const reset = new Date(core.reset * 1000);
    const now = new Date();
    const minutesUntilReset = Math.ceil((reset - now) / 60000);
    
    console.log('📊 Rate Limit Status:');
    console.log('');
    console.log('  Remaining:', core.remaining, '/', core.limit);
    console.log('  Used:', core.used);
    console.log('  Resets at:', reset.toLocaleString());
    console.log('  Time until reset:', minutesUntilReset, 'minutes');
    console.log('');
    
    if (core.remaining === 0) {
      console.log('❌ Rate limit exceeded!');
      console.log('⏰ Wait', minutesUntilReset, 'minutes before testing again.');
    } else if (core.remaining < 100) {
      console.log('⚠️  Low on requests! Only', core.remaining, 'left.');
    } else {
      console.log('✅ Good to go! You have', core.remaining, 'requests remaining.');
    }
  "
