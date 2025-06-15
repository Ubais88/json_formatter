import { useEffect } from "react";

interface ShortcutHandlers {
  onFormat: () => void;
  onMinify: () => void;
  onCopy: () => void;
  onClear: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export const useKeyboardShortcuts = (handlers: ShortcutHandlers) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case "enter":
            event.preventDefault();
            handlers.onFormat();
            break;
          case "m":
            event.preventDefault();
            handlers.onMinify();
            break;
          case "c":
            // Only handle if no text is selected (to allow normal copy)
            if (window.getSelection()?.toString() === "") {
              event.preventDefault();
              handlers.onCopy();
            }
            break;
          case "l":
            event.preventDefault();
            handlers.onClear();
            break;
          case "=": // Ctrl + = is the actual key for Ctrl + (+)
          case "+":
            event.preventDefault();
            handlers.onZoomIn();
            break;
          case "-":
            event.preventDefault();
            handlers.onZoomOut();
            break;
          case "0":
            event.preventDefault();
            handlers.onResetZoom(); // Add this handler
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handlers]);
};
