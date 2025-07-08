import React from 'react';
import { Copy, Download, AlertCircle } from 'lucide-react';
import { Editor } from '@monaco-editor/react';

interface CodeViewerProps {
  code: string;
  onDownload: () => void;
  isLoading?: boolean;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ code, onDownload, isLoading = false }) => {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-glass backdrop-blur-sm border border-glass-border rounded-xl p-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue"></div>
          <p className="text-gray-300 font-medium">Processing your files...</p>
          <p className="text-gray-500 text-sm">AI is analyzing and merging your C# code</p>
        </div>
      </div>
    );
  }

  if (!code) {
    return (
      <div className="bg-glass backdrop-blur-sm border border-glass-border rounded-xl p-8 text-center">
        <div className="text-gray-400 mb-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🔄</span>
          </div>
          <p className="text-lg font-medium">Merged code will appear here</p>
          <p className="text-sm text-gray-500 mt-2">
            Upload your C# files and click "Merge Now" to see the AI-generated result
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-glass backdrop-blur-sm border border-glass-border rounded-xl overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-glass-border bg-gray-800/30">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-gray-300 font-mono text-sm ml-3">merged-code.cs</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700/50"
            title="Copy to clipboard"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={onDownload}
            className="p-2 text-gray-400 hover:text-accent-green transition-colors rounded-lg hover:bg-gray-700/50"
            title="Download file"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Monaco Editor */}
      <div className="h-96">
        <Editor
          height="100%"
          defaultLanguage="csharp"
          value={code}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
};