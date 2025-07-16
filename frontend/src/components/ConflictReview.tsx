import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { X, CheckCircle, Loader2 } from 'lucide-react';
import { ConflictData, ConflictResolution } from '../types/merge';

interface ConflictReviewProps {
  conflicts: ConflictData[];
  onClose: () => void;
  onResolve: (resolutions: ConflictResolution[]) => void;
  isLoading: boolean;
}

export const ConflictReview: React.FC<ConflictReviewProps> = ({
  conflicts,
  onClose,
  onResolve,
  isLoading
}) => {
  const [resolutions, setResolutions] = useState<Record<number, 'fileA' | 'fileB' | 'both'>>({});

  const handleResolutionChange = (conflictId: number, resolution: 'fileA' | 'fileB' | 'both') => {
    setResolutions(prev => ({
      ...prev,
      [conflictId]: resolution
    }));
  };

  const handleApplyResolutions = () => {
    const resolutionArray: ConflictResolution[] = conflicts.map(conflict => ({
      Id: conflict.id,
      Choice: resolutions[conflict.id] === 'fileA' ? 'A' : 
              resolutions[conflict.id] === 'fileB' ? 'B' : 'Both'
    }));
    onResolve(resolutionArray);
  };

  const allResolved = conflicts.every(conflict => resolutions[conflict.id]);

  return (
    <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 bg-gray-800 rounded-xl p-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Resolve Conflicts</h2>
              <p className="text-gray-400">
                {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''} found. 
                Choose how to resolve each one.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Conflicts */}
          <div className="space-y-8">
            {conflicts.map((conflict, index) => (
              <div key={conflict.id} className="bg-gray-800 rounded-xl overflow-hidden">
                {/* Conflict Header */}
                <div className="p-6 border-b border-gray-700">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Conflict #{conflict.id}: {conflict.location}.{conflict.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    {resolutions[conflict.id] && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    <span className="text-gray-400">
                      {resolutions[conflict.id] ? 'Resolved' : 'Needs resolution'}
                    </span>
                  </div>
                </div>

                {/* Code Comparison */}
                <div className="p-6">
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* File A */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-white">File A</h4>
                      <div className="rounded-lg overflow-hidden border border-gray-700">
                        <SyntaxHighlighter
                          language="csharp"
                          style={oneDark}
                          customStyle={{
                            margin: 0,
                            borderRadius: 0,
                            fontSize: '14px',
                            maxHeight: '300px',
                            overflow: 'auto'
                          }}
                        >
                          {conflict.file1Body}
                        </SyntaxHighlighter>
                      </div>
                    </div>

                    {/* File B */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-white">File B</h4>
                      <div className="rounded-lg overflow-hidden border border-gray-700">
                        <SyntaxHighlighter
                          language="csharp"
                          style={oneDark}
                          customStyle={{
                            margin: 0,
                            borderRadius: 0,
                            fontSize: '14px',
                            maxHeight: '300px',
                            overflow: 'auto'
                          }}
                        >
                          {conflict.file2Body}
                        </SyntaxHighlighter>
                      </div>
                    </div>
                  </div>

                  {/* Resolution Options */}
                  <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
                    <h5 className="text-white font-medium mb-4">Choose resolution:</h5>
                    <div className="space-y-3">
                      {[
                        { value: 'fileA', label: 'Keep File A' },
                        { value: 'fileB', label: 'Keep File B' },
                        { value: 'both', label: 'Keep Both' }
                      ].map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-3 cursor-pointer text-gray-300 hover:text-white transition-colors"
                        >
                          <input
                            type="radio"
                            name={`conflict-${conflict.id}`}
                            value={option.value}
                            checked={resolutions[conflict.id] === option.value}
                            onChange={() => handleResolutionChange(conflict.id, option.value as 'fileA' | 'fileB' | 'both')}
                            className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 focus:ring-purple-500 focus:ring-2"
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Apply Button */}
          <div className="sticky bottom-0 bg-gray-900 p-6 mt-8">
            <div className="text-center">
              <button
                onClick={handleApplyResolutions}
                disabled={!allResolved || isLoading}
                className={`px-12 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform
                  ${allResolved && !isLoading
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
              >
                {isLoading ? (
                  <span className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Applying Resolutions...
                  </span>
                ) : (
                  'Apply Resolutions'
                )}
              </button>
              {!allResolved && (
                <p className="text-gray-400 mt-2">
                  Please resolve all conflicts before continuing
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};