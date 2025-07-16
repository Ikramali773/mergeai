import React, { useState, useRef } from 'react';
import { Upload, File, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onMerge: (fileA: File, fileB: File) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onMerge, isLoading }) => {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [dragOverA, setDragOverA] = useState(false);
  const [dragOverB, setDragOverB] = useState(false);
  
  const fileARef = useRef<HTMLInputElement>(null);
  const fileBRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File, target: 'A' | 'B') => {
    if (file.name.endsWith('.cs')) {
      if (target === 'A') setFileA(file);
      else setFileB(file);
    } else {
      alert('Please select a .cs file');
    }
  };

  const handleDrop = (e: React.DragEvent, target: 'A' | 'B') => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file, target);
    if (target === 'A') setDragOverA(false);
    else setDragOverB(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleMerge = () => {
    if (fileA && fileB) {
      onMerge(fileA, fileB);
    }
  };

  const canMerge = fileA && fileB && !isLoading;

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Code Merge Workflow
          </h1>
          <p className="text-gray-400 text-lg">
            Upload two C# files to merge and resolve conflicts
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* File A Upload Zone */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer
              ${dragOverA 
                ? 'border-purple-500 bg-purple-500/10' 
                : fileA 
                  ? 'border-green-500 bg-green-500/10' 
                  : 'border-gray-600 bg-gray-800/50 hover:border-purple-400 hover:bg-gray-800'
              }`}
            onDrop={(e) => handleDrop(e, 'A')}
            onDragOver={handleDragOver}
            onDragEnter={() => setDragOverA(true)}
            onDragLeave={() => setDragOverA(false)}
            onClick={() => fileARef.current?.click()}
          >
            <input
              ref={fileARef}
              type="file"
              accept=".cs"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'A')}
            />
            <div className="text-center">
              {fileA ? (
                <>
                  <File className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">File A Selected</h3>
                  <p className="text-green-400 font-medium">{fileA.name}</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {(fileA.size / 1024).toFixed(1)} KB
                  </p>
                </>
              ) : (
                <>
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Upload File A</h3>
                  <p className="text-gray-400">
                    Drag & drop your .cs file here or click to browse
                  </p>
                </>
              )}
            </div>
          </div>

          {/* File B Upload Zone */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer
              ${dragOverB 
                ? 'border-purple-500 bg-purple-500/10' 
                : fileB 
                  ? 'border-green-500 bg-green-500/10' 
                  : 'border-gray-600 bg-gray-800/50 hover:border-purple-400 hover:bg-gray-800'
              }`}
            onDrop={(e) => handleDrop(e, 'B')}
            onDragOver={handleDragOver}
            onDragEnter={() => setDragOverB(true)}
            onDragLeave={() => setDragOverB(false)}
            onClick={() => fileBRef.current?.click()}
          >
            <input
              ref={fileBRef}
              type="file"
              accept=".cs"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'B')}
            />
            <div className="text-center">
              {fileB ? (
                <>
                  <File className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">File B Selected</h3>
                  <p className="text-green-400 font-medium">{fileB.name}</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {(fileB.size / 1024).toFixed(1)} KB
                  </p>
                </>
              ) : (
                <>
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Upload File B</h3>
                  <p className="text-gray-400">
                    Drag & drop your .cs file here or click to browse
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Merge Button */}
        <div className="text-center">
          <button
            onClick={handleMerge}
            disabled={!canMerge}
            className={`relative px-12 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform
              ${canMerge
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 active:scale-95'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing...
              </span>
            ) : (
              'Merge Files'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};