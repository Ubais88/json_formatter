export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}

export interface SavedJSON {
  id: string;
  content: string;
  timestamp: number;
  formatted: boolean;
}

export type Theme = 'light' | 'dark';