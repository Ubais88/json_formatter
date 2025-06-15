export const formatJSON = (input: string): { result: string; error?: string } => {
  try {
    const parsed = JSON.parse(input);
    return { result: JSON.stringify(parsed, null, 2) };
  } catch (error) {
    return { 
      result: input, 
      error: error instanceof Error ? error.message : 'Invalid JSON' 
    };
  }
};

export const minifyJSON = (input: string): { result: string; error?: string } => {
  try {
    const parsed = JSON.parse(input);
    return { result: JSON.stringify(parsed) };
  } catch (error) {
    return { 
      result: input, 
      error: error instanceof Error ? error.message : 'Invalid JSON' 
    };
  }
};

export const validateJSON = (input: string): { isValid: boolean; error?: string } => {
  try {
    JSON.parse(input);
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Invalid JSON' 
    };
  }
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

export const downloadJSON = (content: string, filename: string = 'formatted.json') => {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};