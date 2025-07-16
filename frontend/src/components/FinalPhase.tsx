import React from 'react';
import { Download, CheckCircle, RotateCcw } from 'lucide-react';

interface FinalPhaseProps {
  mergedCode: string;
  downloadUrl: string;
  onDownload: () => void;
  onStartOver: () => void;
}

export const FinalPhase: React.FC<FinalPhaseProps> = ({
  mergedCode,
  downloadUrl,
  onDownload,
  onStartOver
}) => {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <CheckCircle className="h-12 w-12 text-green-500" />
          <h2 className="text-4xl font-bold text-white">Merge Complete!</h2>
        </div>
        <p className="text-gray-400 text-lg">
          Your files have been successfully merged. Review the final code below.
        </p>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="px-6 py-4 bg-gray-700 border-b border-gray-600 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Merged Code</h3>
          <span className="text-sm text-gray-400">
            {mergedCode.split('\n').length} lines
          </span>
        </div>
        <div className="p-6">
          <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap overflow-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            {mergedCode}
          </pre>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onDownload}
          className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-teal-600 to-purple-600 hover:from-teal-700 hover:to-purple-700 text-white rounded-xl text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          <Download className="h-6 w-6" />
          <span>Download Final File</span>
        </button>
        
        <button
          onClick={onStartOver}
          className="inline-flex items-center space-x-3 px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-lg font-semibold transition-all duration-200"
        >
          <RotateCcw className="h-6 w-6" />
          <span>Start Over</span>
        </button>
      </div>
    </div>
  );
};