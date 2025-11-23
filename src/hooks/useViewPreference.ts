import { useState, useEffect } from 'react';

type ViewMode = 'grid' | 'list';

export const useViewPreference = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('repository-view-mode');
    return (saved as ViewMode) || 'grid';
  });

  useEffect(() => {
    localStorage.setItem('repository-view-mode', viewMode);
  }, [viewMode]);

  return { viewMode, setViewMode };
};