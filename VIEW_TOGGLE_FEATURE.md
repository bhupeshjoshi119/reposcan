# Repository View Toggle Feature

## Overview
Added the ability to switch between **Grid View** and **List View** for displaying repository search results, giving users flexibility in how they browse repositories.

## Features

### Grid View (Default)
- **Layout**: 3-column responsive grid (1 column on mobile, 2 on tablet, 3 on desktop)
- **Best for**: Visual browsing, quick scanning of multiple repositories
- **Content**: Compact cards with essential information and actions

### List View
- **Layout**: Single-column vertical list with expanded information
- **Best for**: Detailed comparison, reading descriptions, comprehensive view
- **Content**: Expanded cards with more visible details and better readability

## Components Added

### 1. `ViewToggle.tsx`
- Toggle button component with Grid/List icons
- Responsive design (hides text labels on small screens)
- Smooth transitions and hover effects
- Tooltips for better UX

### 2. `RepositoryList.tsx`
- Container component for list view
- Same props interface as `RepositoryGrid` for consistency
- Handles loading and empty states

### 3. `RepositoryListItem.tsx`
- Individual repository item for list view
- Expanded layout with more visible information
- Horizontal layout with avatar, content, and actions
- Better topic display (shows up to 6 topics vs 4 in grid)
- More prominent stats and metadata

### 4. `useViewPreference.ts`
- Custom hook for persisting user's view preference
- Uses localStorage to remember choice across sessions
- Defaults to grid view for new users

## Implementation Details

### State Management
```typescript
const { viewMode, setViewMode } = useViewPreference();
```

### View Switching
The main Index component conditionally renders either:
- `<RepositoryGrid />` for grid view
- `<RepositoryList />` for list view

### Persistence
User's view preference is automatically saved to localStorage and restored on page reload.

### Responsive Design
- View toggle shows icons only on mobile, icons + text on larger screens
- List view is optimized for mobile with proper spacing and touch targets
- Grid view maintains responsive breakpoints

## Usage

1. **View Toggle**: Click the Grid/List toggle buttons in the top-right of search results
2. **Automatic Persistence**: Your choice is remembered for future visits
3. **Consistent Experience**: Both views support all existing features (bookmarks, comparison, analysis, etc.)

## Benefits

- **User Choice**: Different users prefer different viewing styles
- **Use Case Optimization**: Grid for browsing, List for detailed comparison
- **Accessibility**: List view provides better readability for some users
- **Mobile Friendly**: Both views are optimized for different screen sizes
- **Feature Parity**: All actions available in both views

## Technical Notes

- Both views share the same component props interface for consistency
- Quality score badges and all interactive elements work in both views
- Performance is maintained with efficient rendering
- TypeScript support with proper type definitions
- Follows existing design system and styling patterns