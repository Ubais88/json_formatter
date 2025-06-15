import React from "react";
import { FileJson, X, ChevronLeft, ChevronRight } from "lucide-react";

interface HeaderProps {
  searchRef: React.RefObject<HTMLInputElement>;
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNextMatch: () => void;
  onPrevMatch: () => void;
  onClearSearch: () => void;
  totalMatches: number;
  currentMatchIndex: number;
}

const Header: React.FC<HeaderProps> = ({
  searchRef,
  searchQuery,
  onSearchChange,
  onNextMatch,
  onPrevMatch,
  onClearSearch,
  totalMatches = 0,
  currentMatchIndex = 0,
}) => {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 py-2 flex items-center justify-between">
        {/* Logo and title */}
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-md">
            <FileJson className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            JSON Formatter Pro
          </h1>
        </div>

        {/* Modern inline search */}
        <div className="relative w-80 transition-all">
          <input
            ref={searchRef}
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={onSearchChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onNextMatch();
              }
            }}
            className="w-full text-sm pr-28 pl-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {searchQuery && (
            <div className="absolute inset-y-0 right-1 flex items-center space-x-1 pr-1">
              {/* Match count */}
              <span className="text-xs text-gray-700 dark:text-gray-300 mr-1">
                {totalMatches === 0
                  ? "0"
                  : `${currentMatchIndex + 1} / ${totalMatches}`}
              </span>
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />

              {/* Prev button */}
              <button
                onClick={onPrevMatch}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>

              {/* Next button */}
              <button
                onClick={onNextMatch}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                title="Next"
              >
                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>

              {/* Clear button */}
              <button
                onClick={onClearSearch}
                className="p-1 hover:bg-red-200 dark:hover:bg-red-900 rounded"
                title="Clear"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
