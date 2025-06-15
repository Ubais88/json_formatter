import React, { useState, useEffect, useCallback, useRef } from "react";
import Header from "./components/Header";
import Toolbar from "./components/Toolbar";
import JSONEditor from "./components/JSONEditor";
import ToastContainer from "./components/ToastContainer";
import HistoryModal from "./components/HistoryModal";
import { useTabId } from "./hooks/useTabId";
import { useTheme } from "./hooks/useTheme";
import { useToast } from "./hooks/useToast";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import {
  formatJSON,
  minifyJSON,
  validateJSON,
  copyToClipboard,
  downloadJSON,
  readFileAsText,
} from "./utils/jsonUtils";
import {
  saveJSONToStorage,
  loadJSONFromStorage,
  getJSONHistory,
  updateSessionJSONStorage,
} from "./utils/storage";
import { SavedJSON } from "./types";

const SAMPLE_JSON = `{
  "name": "JSON Formatter Pro",
  "version": "1.0.0",
  "description": "A powerful JSON formatter with tab-isolated storage",
  "author": "Mohd Ubais",
  "features": [
    "Format and minify JSON",
    "Tab-isolated storage",
    "Dark/light theme",
    "Keyboard shortcuts",
    "File import/export",
    "History management"
  ],
  "settings": {
    "autoValidate": true,
    "preserveHistory": true,
    "maxHistoryItems": 10
  }
}`;

function App() {
  const [jsonContent, setJsonContent] = useState<string>("");
  const [isValidJSON, setIsValidJSON] = useState<boolean>(true);
  const [validationError, setValidationError] = useState<string>("");
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const defaultFontSize = 14;
  const [fontSize, setFontSize] = useState(defaultFontSize);

  const increaseFontSize = () => setFontSize((prev) => Math.min(prev + 1, 32));
  const decreaseFontSize = () => setFontSize((prev) => Math.max(prev - 1, 10));
  const resetFontSize = () => setFontSize(defaultFontSize);

  const [totalMatches, setTotalMatches] = useState<number>(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0);

const onNextMatch = () => {
  setCurrentMatchIndex((prev) => {
    if (totalMatches === 0) return 0;
    return (prev + 1) % totalMatches;
  });
};

const onPrevMatch = () => {
  setCurrentMatchIndex((prev) => {
    if (totalMatches === 0) return 0;
    return (prev - 1 + totalMatches) % totalMatches;
  });
};


  const tabId = useTabId();
  const { theme, toggleTheme } = useTheme();
  const { toasts, addToast, removeToast } = useToast();

  // Load saved JSON when tab ID is available
  useEffect(() => {
    if (!tabId) return;

    const saved = loadJSONFromStorage(tabId);
    if (saved) {
      setJsonContent(saved.content);
      addToast("Restored previous session", "info");
    } else {
      // Set sample JSON for new sessions
      setJsonContent(SAMPLE_JSON);
    }
  }, [tabId, addToast]);

  // Validate JSON whenever content changes
  useEffect(() => {
    if (!jsonContent.trim()) {
      setIsValidJSON(true);
      setValidationError("");
      return;
    }

    const validation = validateJSON(jsonContent);
    setIsValidJSON(validation.isValid);
    setValidationError(validation.error || "");
  }, [jsonContent]);

  const handleFormat = useCallback(
    (input?: string | React.MouseEvent) => {
      const data = typeof input === "string" ? input : jsonContent;
      if (!data.trim()) {
        addToast("Please enter some JSON to format", "error");
        return;
      }

      const result = formatJSON(data);
      if (result.error) {
        addToast(`Format failed: ${result.error}`, "error");
      } else {
        setJsonContent(result.result);
        addToast("JSON formatted successfully", "success");
      }
      console.log("result --> ", result);
    },
    [jsonContent, addToast]
  );

  const handleMinify = useCallback(
    (input?: string | React.MouseEvent) => {
      const data = typeof input === "string" ? input : jsonContent;

      if (!data.trim()) {
        addToast("Please enter some JSON to minify", "error");
        return;
      }

      const result = minifyJSON(data);
      if (result.error) {
        addToast(`Minify failed: ${result.error}`, "error");
      } else {
        setJsonContent(result.result);
        addToast("JSON minified successfully", "success");
      }
      console.log("result --> ", result);
    },
    [jsonContent, addToast]
  );

  const handleCopy = useCallback(
    async () => {
      if (!jsonContent.trim()) {
        addToast("Nothing to copy", "error");
        return;
      }

      const success = await copyToClipboard(jsonContent);
      if (success) {
        addToast("JSON copied to clipboard", "success");
      } else {
        addToast("Failed to copy to clipboard", "error");
      }
    },
    [jsonContent, addToast]
  );

  const handleClear = useCallback(() => {
    setJsonContent("");
    addToast("JSON cleared", "info");
  }, [addToast]);

  const handleSave = useCallback(() => {
    if (!jsonContent.trim()) {
      addToast("Nothing to save", "error");
      return;
    }

    if (!tabId) {
      addToast("Tab ID not available", "error");
      return;
    }

    const isFormatted =
      jsonContent.includes("\n") && jsonContent.includes("  ");
    saveJSONToStorage(tabId, jsonContent, isFormatted);
    addToast("JSON saved successfully", "success");
  }, [jsonContent, tabId, addToast]);


  const handleEditorChange = (value: string) => {
    setJsonContent(value);
    updateSessionJSONStorage(tabId, value, false);
  };

  const handleRestore = useCallback(() => {
    if (!tabId) {
      addToast("Tab ID not available", "error");
      return;
    }

    const saved = loadJSONFromStorage(tabId);
    if (saved) {
      setJsonContent(saved.content);
      addToast("JSON restored successfully", "success");
    } else {
      addToast("No saved JSON found", "error");
    }
  }, [tabId, addToast]);

  const handleExport = useCallback(() => {
    if (!jsonContent.trim() || !isValidJSON) {
      addToast("Please enter valid JSON to export", "error");
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    downloadJSON(jsonContent, `json-export-${timestamp}.json`);
    addToast("JSON exported successfully", "success");
  }, [jsonContent, isValidJSON, addToast]);

  const handleImport = useCallback(
    async (file: File) => {
      try {
        const content = await readFileAsText(file);
        const validation = validateJSON(content);

        if (validation.isValid) {
          setJsonContent(content);
          addToast("JSON imported successfully", "success");
        } else {
          addToast(`Invalid JSON file: ${validation.error}`, "error");
        }
      } catch (error) {
        addToast("Failed to read file", "error");
      }
    },
    [addToast]
  );

  const handleShowHistory = useCallback(() => {
    setIsHistoryModalOpen(true);
  }, []);

  const handleRestoreFromHistory = useCallback(
    (item: SavedJSON) => {
      setJsonContent(item.content);
      addToast("JSON restored from history", "success");
    },
    [addToast]
  );

  const getHistory = useCallback(() => {
    return tabId ? getJSONHistory(tabId) : [];
  }, [tabId]);

  // Set up keyboard shortcuts
  useKeyboardShortcuts({
    onFormat: handleFormat,
    onMinify: handleMinify,
    onCopy: handleCopy,
    onClear: handleClear,
    onZoomIn: increaseFontSize,
    onZoomOut: decreaseFontSize,
    onResetZoom: resetFontSize,
  });

  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchResultChange = (total: number, currentIndex: number) => {
    setTotalMatches(total);
    setCurrentMatchIndex(currentIndex);
  };

  const onClearSearch = () => {
    setSearchQuery("");
    setCurrentMatchIndex(0);
    setTotalMatches(0);
  };


  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col">
      <Header
        searchRef={searchRef}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onNextMatch={onNextMatch}
        onPrevMatch={onPrevMatch}
        onClearSearch={onClearSearch}
        totalMatches={totalMatches}
        currentMatchIndex={currentMatchIndex}
      />
      <Toolbar
        onFormat={handleFormat}
        onMinify={handleMinify}
        onCopy={handleCopy}
        onClear={handleClear}
        onSave={handleSave}
        onRestore={handleRestore}
        onExport={handleExport}
        onImport={handleImport}
        onShowHistory={handleShowHistory}
        theme={theme}
        onToggleTheme={toggleTheme}
        isValidJSON={isValidJSON}
        hasContent={!!jsonContent.trim()}
        increaseFontSize={increaseFontSize}
        decreaseFontSize={decreaseFontSize}
        resetFontSize={resetFontSize}
      />

      <div className="flex-1 p-2 overflow-hidden">
        <JSONEditor
          value={jsonContent}
          onChange={setJsonContent}
          theme={theme}
          isValid={isValidJSON}
          error={validationError}
          fontSize={fontSize}
          searchRef={searchRef}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          //added new
          goToMatchIndex={currentMatchIndex}
          onSearchResultChange={handleSearchResultChange}
          increaseFontSize={increaseFontSize}
          decreaseFontSize={decreaseFontSize}
          resetFontSize={resetFontSize}
          onFormat={handleFormat}
          onMinify={handleMinify}
          onEditorChange={handleEditorChange}
        />
      </div>

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={getHistory()}
        onRestore={handleRestoreFromHistory}
        tabId={tabId}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;
