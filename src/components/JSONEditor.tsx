import React, { useRef, useEffect } from "react";
import { Theme } from "../types";

import Editor from "@monaco-editor/react";
import * as monacoEditor from "monaco-editor";

interface JSONEditorProps {
  value: string;
  onChange: (value: string) => void;
  theme: Theme;
  isValid: boolean;
  error?: string;
  fontSize?: number;
  searchRef?: React.RefObject<HTMLInputElement>;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchResultChange?: (total: number, currentIndex: number) => void;
  goToMatchIndex?: number;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
  onFormat: (e: string) => void;
  onMinify: (e: string) => void;
  onEditorChange?: (value: string) => void;
}

const JSONEditor: React.FC<JSONEditorProps> = ({
  value,
  onChange,
  theme,
  isValid,
  error,
  fontSize = 14,
  searchRef,
  searchQuery,
  setSearchQuery,
  onSearchResultChange,
  goToMatchIndex,
  increaseFontSize,
  decreaseFontSize,
  resetFontSize,
  onFormat,
  onMinify,
  onEditorChange,
}) => {
  const editorRef = useRef<any>(null);

  const matchRangesRef = useRef<monacoEditor.editor.FindMatch[]>([]);
  const decorationsRef = useRef<string[]>([]);

  const handleEditorDidMount = (editor: any, monaco: typeof monacoEditor) => {
    editorRef.current = editor;

    // Configure editor options
    editor.updateOptions({
      fontSize: fontSize,
      minimap: { enabled: true },
      scrollBeyondLastLine: true,
      wordWrap: "on",
      lineNumbers: "on",
      folding: true,
      bracketPairColorization: { enabled: true },
      autoIndent: "full",
      formatOnPaste: true,
      formatOnType: true,
      find: {
        addExtraSpaceOnTop: false,
        autoFindInSelection: "never",
      },
    });

    const keybindingsToRemove = [
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyM,
    ];
    editor._standaloneKeybindingService
      ._getResolver()
      ._lookupMap.forEach((bindings: any[], _key: string) => {
        bindings.forEach((binding) => {
          if (keybindingsToRemove.includes(binding.keybinding)) {
            editor._standaloneKeybindingService.addDynamicKeybinding(
              binding.command,
              null,
              () => {}
            );
          }
        });
      });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
      const selection = editor.getSelection();
      const selectedText = editor.getModel()?.getValueInRange(selection) || "";

      if (selectedText.trim()) {
        setSearchQuery?.(selectedText);
      }
      searchRef?.current?.focus();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Equal, () => {
      increaseFontSize(); // Zoom in
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Minus, () => {
      decreaseFontSize(); // Zoom out
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Digit0, () => {
      resetFontSize(); // Reset zoom
    });

    // Custom keybindings
    const value = editor.getValue();
    if (onFormat) {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () =>
        onFormat(value)
      );
    }

    // Add custom Ctrl+M → Minify
    if (onMinify) {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyM, () => {
        onMinify(value);
      });
    }
  };

  const handleEditorChange = (newValue: string | undefined) => {
    onChange(newValue || "");
    onEditorChange?.(newValue || "");
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ fontSize });
    }
  }, [fontSize]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !searchQuery || !searchQuery.trim()) {
      // Clear previous decorations
      if (editor) {
        decorationsRef.current = editor.deltaDecorations(
          decorationsRef.current,
          []
        );
      }
      matchRangesRef.current = [];
      if (onSearchResultChange) {
        onSearchResultChange(0, -1);
      }
      return;
    }

    const model = editor.getModel();
    if (!model) return;

    const matches = model.findMatches(
      searchQuery,
      true,
      false,
      false,
      null,
      true
    );
    matchRangesRef.current = matches;

    const decorations = matches.map((match: any, i: any) => ({
      range: match.range,
      options: {
        inlineClassName:
          i === 0
            ? "editor-search-highlight-current"
            : "editor-search-highlight",
      },
    }));

    decorationsRef.current = editor.deltaDecorations(
      decorationsRef.current,
      decorations
    );

    if (matches.length > 0) {
      editor.revealRangeInCenter(matches[0].range);
    }

    if (onSearchResultChange) {
      onSearchResultChange(matches.length, matches.length > 0 ? 0 : -1);
    }
  }, [searchQuery]);

  useEffect(() => {
    const editor = editorRef.current;
    const matches = matchRangesRef.current;

    if (!editor || !matches || matches.length === 0 || goToMatchIndex == null)
      return;

    const clampedIndex = Math.max(
      0,
      Math.min(goToMatchIndex, matches.length - 1)
    );
    const newDecorations = matches.map((match, i) => ({
      range: match.range,
      options: {
        inlineClassName:
          i === clampedIndex
            ? "editor-search-highlight-current"
            : "editor-search-highlight",
      },
    }));

    decorationsRef.current = editor.deltaDecorations(
      decorationsRef.current,
      newDecorations
    );
    editor.revealRangeInCenter(matches[clampedIndex].range);
  }, [goToMatchIndex]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="json"
          value={value}
          onChange={handleEditorChange}
          onMount={(editor, monacoInstance) =>
            handleEditorDidMount(editor, monacoInstance)
          }
          theme={theme === "dark" ? "vs-dark" : "vs"}
          options={{
            padding: { top: 10, bottom: 10 },
            scrollbar: {
              vertical: "auto",
              horizontal: "auto",
            },
          }}
        />
      </div>

      {!isValid && error && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-4 w-4 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-2">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Invalid JSON
              </h3>
              <div className="mt-1 text-xs text-red-700 dark:text-red-300">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JSONEditor;
