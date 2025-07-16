import React from 'react';
import { ConflictItem } from './ConflictItem';
import { LoadingSpinner } from './LoadingSpinner';
import { ConflictEntry } from '../types';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface ConflictPhaseProps {
  conflicts: ConflictEntry[];
  isLoading: boolean;
  onResolutionChange: (id: number, choice: 'A' | 'B' | 'Both') => void;
  onApplyResolutions: () => void;
}

export const ConflictPhase: React.FC<ConflictPhaseProps> = ({
  conflicts,
  isLoading,
  onResolutionChange,
  onApplyResolutions
}) => {
  const resolvedCount = conflicts.filter(c => c.Choice).length;
  const allResolved = resolvedCount === conflicts.length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <AlertTriangle className="h-10 w-10 text-yellow-500" />
          <h2 className="text-3xl font-bold text-white">Resolve Conflicts</h2>
        </div>
        <p className="text-gray-400">
          {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''} found. 
          Choose your preferred resolution for each.
        </p>
      </div>

      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">
            Progress: {resolvedCount} of {conflicts.length} resolved
          </span>
          <div className="flex items-center space-x-2">
            {allResolved && <CheckCircle className="h-5 w-5 text-green-500" />}
            <div className="w-32 bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(resolvedCount / conflicts.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {conflicts.map((conflict, index) => (
          <ConflictItem
            key={conflict.id}
            conflict={conflict}
            index={index}
            onResolutionChange={onResolutionChange}
          />
        ))}
      </div>

      <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 p-6">
        <div className="max-w-6xl mx-auto text-center">
          <button
            onClick={onApplyResolutions}
            disabled={!allResolved || isLoading}
            className={`
              inline-flex items-center space-x-3 px-8 py-4 rounded-xl text-lg font-semibold
              transition-all duration-200 transform
              ${allResolved && !isLoading
                ? 'bg-gradient-to-r from-teal-600 to-purple-600 hover:from-teal-700 hover:to-purple-700 text-white shadow-lg hover:scale-105'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="md" />
                <span>Applying Resolutions...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-6 w-6" />
                <span>Apply Resolutions</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};