import React from "react";
import { X, Clock, FileText, Trash2 } from "lucide-react";
import { SavedJSON } from "../types";
import { clearJSONHistory } from "../utils/storage";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: SavedJSON[];
  onRestore: (item: SavedJSON) => void;
  tabId: string;
}

const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onRestore,
  tabId,
}) => {
  if (!isOpen) return null;

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              JSON History
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          {history.length > 0 && (
            <div className="flex justify-end mb-4">
              <button
                onClick={() => {
                  clearJSONHistory(tabId);
                  onClose();
                }}
                className="text-sm text-red-600 "
              >
                <Trash2 className="w-5 h-5 mr-2" />
              </button>
            </div>
          )}
          <div className="max-h-96 overflow-y-auto">
            {history.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No saved history found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => {
                      onRestore(item);
                      onClose();
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatTimestamp(item.timestamp)}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          item.formatted
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        }`}
                      >
                        {item.formatted ? "Formatted" : "Compact"}
                      </span>
                    </div>
                    <pre className="text-sm text-gray-800 dark:text-gray-200 font-mono bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-hidden">
                      {truncateContent(item.content)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
