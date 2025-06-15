import { SavedJSON } from '../types';

export const saveJSONToStorage = (tabId: string, content: string, formatted: boolean): void => {
  const key = `json_formatter_${tabId}`;
  const savedData: SavedJSON = {
    id: tabId,
    content,
    timestamp: Date.now(),
    formatted
  };
  
  sessionStorage.setItem(key, JSON.stringify(savedData));
  
  // Also save to localStorage for persistence across sessions
  const historyKey = `json_formatter_history_${tabId}`;
  const existing = localStorage.getItem(historyKey);
  const history: SavedJSON[] = existing ? JSON.parse(existing) : [];
  
  // Keep only last 10 entries
  history.unshift(savedData);
  if (history.length > 10) {
    history.splice(10);
  }
  
  localStorage.setItem(historyKey, JSON.stringify(history));
};

export const loadJSONFromStorage = (tabId: string): SavedJSON | null => {
  const key = `json_formatter_${tabId}`;
  const saved = sessionStorage.getItem(key);
  
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }
  
  return null;
};

export const getJSONHistory = (tabId: string): SavedJSON[] => {
  const historyKey = `json_formatter_history_${tabId}`;
  const saved = localStorage.getItem(historyKey);
  
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  
  return [];
};


export const clearJSONHistory = (tabId: string): void => {
  console.log(tabId)
  const historyKey = `json_formatter_history_${tabId}`;
  localStorage.removeItem(historyKey);
};


export const clearStorage = (tabId: string): void => {
  const key = `json_formatter_${tabId}`;
  sessionStorage.removeItem(key);
};


export const updateSessionJSONStorage = (
  tabId: string,
  content: string,
  formatted: boolean
): void => {
  const key = `json_formatter_${tabId}`;
  const savedData: SavedJSON = {
    id: tabId,
    content,
    timestamp: Date.now(),
    formatted,
  };

  sessionStorage.setItem(key, JSON.stringify(savedData));
};
