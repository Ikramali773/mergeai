import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Download, ArrowLeft, CheckCircle } from 'lucide-react';
import { downloadFile } from '../utils/api';

interface FinalMergeProps {
  mergedContent: string;
  downloadUrl?: string;
  onBack: () => void;
}

export const FinalMerge: React.FC<FinalMergeProps> = ({ mergedContent, downloadUrl, onBack }) => {
  const handleDownload = () => {
    if (downloadUrl) {
      // Use the backend download URL
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'merged_file.cs';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Fallback to blob download
      const blob = new Blob([mergedContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged_file.cs';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Merge Complete</h1>
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span>Files successfully merged</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleDownload}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform duration-200 flex items-center gap-2"
          >
            <Download className="h-5 w-5" />
            Download Final File
          </button>
        </div>

        {/* Merged Code Display */}
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-700 bg-gray-700/50">
            <h2 className="text-lg font-semibold text-white">Merged C# Code</h2>
            <p className="text-gray-400 text-sm mt-1">
              Final merged result - ready for download
            </p>
          </div>
          <div className="relative">
            <SyntaxHighlighter
              language="csharp"
              style={oneDark}
              customStyle={{
                margin: 0,
                borderRadius: 0,
                fontSize: '14px',
                padding: '24px',
                minHeight: '500px'
              }}
              showLineNumbers={true}
              lineNumberStyle={{
                color: '#6B7280',
                paddingRight: '16px',
                marginRight: '16px',
                borderRight: '1px solid #374151'
              }}
            >
              {mergedContent}
            </SyntaxHighlighter>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-700 text-gray-300 rounded-xl font-medium hover:bg-gray-600 transition-colors"
          >
            Start New Merge
          </button>
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-medium hover:scale-105 transition-transform duration-200"
          >
            Download Again
          </button>
        </div>
      </div>
    </div>
  );
};