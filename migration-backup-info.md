# Migration Backup Information

## Current Repository Status
- **Source Repository**: https://github.com/bhupeshjoshi119/reposcan.git
- **Current Branch**: main
- **Last Commit**: 33d8414 - "Backup before migration: Save current state with specs and environment changes"
- **Git User**: bhupeshjoshi119 (bhupeshjoshi119@gmail.com)

## Target Repository Verification
- **Target Repository**: https://github.com/bhupeshjoshi119/open-repo-lens.git
- **Access Status**: ✅ Verified (can list remote refs)
- **Available Branches**: main, backup, experimental/chrome-ai-advanced, feature/ai-powered-analysis, gemini-neno, not-deployed-working, and several patch branches

## Project Structure Overview
```
├── src/                    # React application source code
│   ├── components/         # React components including IDE components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   ├── integrations/      # External service integrations
│   ├── lib/               # Utility libraries
│   ├── pages/             # Page components
│   ├── services/          # Service layer (GitHub API, auth, etc.)
│   └── utils/             # Utility functions
├── api/                   # API endpoints
├── public/                # Static assets
├── supabase/              # Supabase configuration and functions
├── scripts/               # Deployment and setup scripts
├── .kiro/                 # Kiro IDE specifications
│   └── specs/             # Feature specifications
├── package.json           # Project dependencies and scripts
├── vercel.json            # Deployment configuration
├── vite.config.ts         # Vite build configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── .env files             # Environment configuration
```

## Key Dependencies
- **Frontend**: React 18.3.1, TypeScript, Vite
- **UI Framework**: Radix UI components, Tailwind CSS
- **State Management**: TanStack Query
- **Authentication**: Supabase Auth
- **GitHub Integration**: Octokit REST API
- **Code Editor**: Monaco Editor
- **PDF Generation**: jsPDF, html2canvas
- **AI/ML**: TensorFlow.js

## Configuration Files to Update
- package.json (repository field)
- vercel.json (deployment settings)
- Any hardcoded repository URLs in source code
- Documentation files referencing the old repository

## Environment Variables
- GitHub OAuth configuration
- Supabase configuration
- API keys and tokens

## Special Files
- .env and .env.example (environment configuration)
- Scripts in /scripts directory (deployment automation)
- Supabase functions and configuration
- Kiro IDE specifications in .kiro/specs/

## Migration Checklist
✅ Repository access verified
✅ Current state backed up with commit 33d8414
✅ Project structure documented
✅ Dependencies cataloged
✅ Configuration files identified
⏳ Ready for migration execution