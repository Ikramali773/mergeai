import React from 'react';

interface CodePanelProps {
  title: string;
  code: string;
  className?: string;
}

export const CodePanel: React.FC<CodePanelProps> = ({ title, code, className = '' }) => {
  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 ${className}`}>
      <div className="px-4 py-3 bg-gray-700 rounded-t-lg border-b border-gray-600">
        <h4 className="text-sm font-medium text-gray-300">{title}</h4>
      </div>
      <div className="p-4">
        <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap overflow-auto max-h-64 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {code}
        </pre>
      </div>
    </div>
  );
};