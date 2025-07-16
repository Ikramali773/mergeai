import React from 'react';
import { ConflictEntry } from '../types';
import { CodePanel } from './CodePanel';

interface ConflictItemProps {
  conflict: ConflictEntry;
  index: number;
  onResolutionChange: (id: number, choice: 'A' | 'B' | 'Both') => void;
}

export const ConflictItem: React.FC<ConflictItemProps> = ({
  conflict,
  index,
  onResolutionChange
}) => {
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-6">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-white">{index + 1}</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">
            {conflict.type}: {conflict.method}
          </h3>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <CodePanel title="File A" code={conflict.fileASnippet} />
        <CodePanel title="File B" code={conflict.fileBSnippet} />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-300">Choose resolution:</p>
        <div className="space-y-2">
          {[
            { value: 'A', label: 'Keep File A' },
            { value: 'B', label: 'Keep File B' },
            { value: 'Both', label: 'Keep Both' }
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <input
                type="radio"
                name={`conflict-${conflict.Id}`}
                value={option.value}
                checked={conflict.Choice === option.value}
                onChange={() => onResolutionChange(conflict.Id, option.value as any)}
                className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 focus:ring-purple-500 focus:ring-2"
              />
              <span className="text-gray-300 group-hover:text-white transition-colors duration-200">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};