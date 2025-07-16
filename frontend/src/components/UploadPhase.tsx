import React from 'react';
import { FileUpload } from './FileUpload';
import { LoadingSpinner } from './LoadingSpinner';
import { FileData } from '../types';
import { GitMerge } from 'lucide-react';

interface UploadPhaseProps {
  fileA: File | null;
  fileB: File | null;
  isLoading: boolean;
  onFileASelect: (file: File) => void;
  onFileBSelect: (file: File) => void;
  onFileARemove: () => void;
  onFileBRemove: () => void;
  onMerge: () => void;
}

export const UploadPhase: React.FC<UploadPhaseProps> = ({
  fileA,
  fileB,
  isLoading,
  onFileASelect,
  onFileBSelect,
  onFileARemove,
  onFileBRemove,
  onMerge
}) => {
  const canMerge = fileA && fileB && !isLoading;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <GitMerge className="h-12 w-12 text-purple-500" />
          <h1 className="text-4xl font-bold text-white">MergeAI</h1>
        </div>
        <p className="text-gray-400 text-lg">
          Intelligent C# file merging with conflict resolution
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <FileUpload
          label="File A"
          file={fileA}
          onFileSelect={onFileASelect}
          onFileRemove={onFileARemove}
        />
        <FileUpload
          label="File B"
          file={fileB}
          onFileSelect={onFileBSelect}
          onFileRemove={onFileBRemove}
        />
      </div>

      <div className="text-center">
        <button
          onClick={onMerge}
          disabled={!canMerge}
          className={`
            inline-flex items-center space-x-3 px-8 py-4 rounded-xl text-lg font-semibold
            transition-all duration-200 transform
            ${canMerge
              ? 'bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white shadow-lg hover:scale-105'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="md" />
              <span>Analyzing Files...</span>
            </>
          ) : (
            <>
              <GitMerge className="h-6 w-6" />
              <span>Merge Files</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};