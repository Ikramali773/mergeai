import React, { useRef, useState } from 'react';
import { Upload, File, X, CheckCircle } from 'lucide-react';
import { UploadedFile } from '../hooks/useFileUpload';

interface FileUploadProps {
  file?: UploadedFile;
  onFileUpload: (file: File) => void;
  onFileRemove: () => void;
  slot: number;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  file,
  onFileUpload,
  onFileRemove,
  slot,
  isLoading
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.cs')) {
      onFileUpload(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileUpload(selectedFile);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <label className="block text-sm font-medium text-gray-300 mb-3 font-mono">
        File {slot + 1}
      </label>
      
      {!file ? (
        <div
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
            transition-all duration-300 bg-glass backdrop-blur-sm
            ${isDragOver 
              ? 'border-accent-blue bg-blue-600/10 scale-105' 
              : 'border-glass-border hover:border-accent-purple hover:bg-glass-border/30'
            }
            ${isLoading ? 'pointer-events-none opacity-50' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".cs"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Upload className={`w-12 h-12 mx-auto mb-4 transition-colors ${
            isDragOver ? 'text-accent-blue' : 'text-gray-400'
          }`} />
          
          <p className="text-gray-300 font-medium mb-2">
            Drop your C# file here
          </p>
          <p className="text-gray-500 text-sm">
            or <span className="text-accent-blue underline">browse to upload</span>
          </p>
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-glass backdrop-blur-sm rounded-xl">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue"></div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-glass backdrop-blur-sm border border-glass-border rounded-xl p-6 animate-slide-up">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                <File className="w-8 h-8 text-accent-green" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-medium truncate font-mono text-sm">
                  {file.name}
                </p>
                <p className="text-gray-400 text-xs">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-accent-green" />
              <button
                onClick={onFileRemove}
                className="text-gray-400 hover:text-red-400 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* File preview */}
          <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
            <p className="text-xs text-gray-400 mb-1 font-mono">Preview:</p>
            <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap overflow-hidden line-clamp-3">
              {file.content.slice(0, 120)}...
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};