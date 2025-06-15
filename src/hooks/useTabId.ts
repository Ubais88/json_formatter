import { useEffect, useState } from 'react';

// Generate a unique tab ID for tab-isolated storage
const generateTabId = (): string => {
  return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useTabId = () => {
  const [tabId, setTabId] = useState<string>('');

  useEffect(() => {
    // Check if we already have a tab ID in sessionStorage
    let existingTabId = sessionStorage.getItem('json_formatter_tab_id');
    
    if (!existingTabId) {
      // Generate new tab ID if none exists
      existingTabId = generateTabId();
      sessionStorage.setItem('json_formatter_tab_id', existingTabId);
    }
    
    setTabId(existingTabId);
  }, []);

  return tabId;
};