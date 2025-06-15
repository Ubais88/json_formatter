import React, { useRef } from 'react';
import { 
  FileText, 
  Minimize2, 
  Copy, 
  Trash2, 
  Save, 
  RotateCcw, 
  Sun, 
  Moon, 
  Download, 
  Upload,
  History,
  ZoomIn,
  ZoomOut,
  RefreshCcwDot
} from 'lucide-react';
import { Theme } from '../types';

interface ToolbarProps {
  onFormat: () => void;
  onMinify: () => void;
  onCopy: () => void;
  onClear: () => void;
  onSave: () => void;
  onRestore: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onShowHistory: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  isValidJSON: boolean;
  hasContent: boolean;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onFormat,
  onMinify,
  onCopy,
  onClear,
  onSave,
  onRestore,
  onExport,
  onImport,
  onShowHistory,
  theme,
  onToggleTheme,
  isValidJSON,
  hasContent,
  increaseFontSize,
  decreaseFontSize,
  resetFontSize
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
      // Reset input value to allow selecting the same file again
      event.target.value = '';
    }
  };

  const ToolbarButton: React.FC<{
    onClick: () => void;
    icon: React.ReactNode;
    title: string;
    disabled?: boolean;
    shortcut?: string;
  }> = ({ onClick, icon, title, disabled = false, shortcut }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={`${title}${shortcut ? ` (${shortcut})` : ''}`}
      className={`
        p-1.5 rounded-md transition-all duration-200 relative
        ${disabled 
          ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
          : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700'
        }
      `}
    >
      <div className="w-4 h-4">
        {icon}
      </div>
    </button>
  );

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-1">
        <ToolbarButton
          onClick={onFormat}
          icon={<FileText className="w-4 h-4" />}
          title="Format JSON"
          disabled={!hasContent}
          shortcut="Ctrl+Enter"
        />
        <ToolbarButton
          onClick={onMinify}
          icon={<Minimize2 className="w-4 h-4" />}
          title="Minify JSON"
          disabled={!hasContent}
          shortcut="Ctrl+M"
        />
        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
        <ToolbarButton
          onClick={onCopy}
          icon={<Copy className="w-4 h-4" />}
          title="Copy JSON"
          disabled={!hasContent}
          shortcut="Ctrl+C"
        />
        <ToolbarButton
          onClick={onClear}
          icon={<Trash2 className="w-4 h-4" />}
          title="Clear JSON"
          disabled={!hasContent}
          shortcut="Ctrl+L"
        />
        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
        <ToolbarButton
          onClick={onSave}
          icon={<Save className="w-4 h-4" />}
          title="Save JSON"
          disabled={!hasContent}
        />
        <ToolbarButton
          onClick={onRestore}
          icon={<RotateCcw className="w-4 h-4" />}
          title="Restore Last Saved"
        />
        <ToolbarButton
          onClick={onShowHistory}
          icon={<History className="w-4 h-4" />}
          title="Show History"
        />
      </div>

      <div className="flex items-center space-x-1">
        <ToolbarButton
          onClick={handleImportClick}
          icon={<Upload className="w-4 h-4" />}
          title="Import JSON File"
        />
        <ToolbarButton
          onClick={onExport}
          icon={<Download className="w-4 h-4" />}
          title="Export JSON File"
          disabled={!isValidJSON || !hasContent}
        />
        <ToolbarButton
          onClick={increaseFontSize}
          icon={<ZoomIn className="w-4 h-4" />}
          title="Zoom In"
          shortcut="Ctrl +"
        />
        <ToolbarButton
          onClick={decreaseFontSize}
          icon={<ZoomOut className="w-4 h-4" />}
          title="Zoom Out"
          shortcut="Ctrl -"
        />
        <ToolbarButton
          onClick={resetFontSize}
          icon={<RefreshCcwDot className="w-4 h-4" />} // You can also use an icon like `RotateCcw` from Lucide
          title="Reset Zoom"
          shortcut="Ctrl 0"
        />
        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
        <ToolbarButton
          onClick={onToggleTheme}
          icon={
            theme === "light" ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )
          }
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default Toolbar;