import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Terminal, Clock } from 'lucide-react';

interface MergeLogsProps {
  logs: string[];
  isVisible: boolean;
}

export const MergeLogs: React.FC<MergeLogsProps> = ({ logs, isVisible }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible || logs.length === 0) return null;

  return (
    <div className="bg-glass backdrop-blur-sm border border-glass-border rounded-xl overflow-hidden animate-slide-up">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-glass-border/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-accent-green" />
          <span className="text-gray-200 font-medium">Merge Logs</span>
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">
            {logs.length} entries
          </span>
        </div>
        
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>
      
      {/* Content */}
      {isExpanded && (
        <div className="border-t border-glass-border bg-gray-900/20">
          <div className="p-4 max-h-64 overflow-auto">
            <div className="space-y-2">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 text-sm animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Clock className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-500 font-mono text-xs">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                  <span className="text-gray-300 font-mono flex-1">{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};