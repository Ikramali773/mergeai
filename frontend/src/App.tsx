import React from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { CodeViewer } from './components/CodeViewer';
import { MergeLogs } from './components/MergeLogs';
import { Footer } from './components/Footer';
import { ErrorAlert } from './components/ErrorAlert';
import { useFileUpload } from './hooks/useFileUpload';
import { Zap, Sparkles, AlertTriangle } from 'lucide-react';

function App() {
  const {
    files,
    isLoading,
    mergedCode,
    mergeLogs,
    error,
    uploadFile,
    removeFile,
    mergeFiles,
    downloadMergedFile,
    clearError,
  } = useFileUpload();

  const canMerge = files.filter(Boolean).length >= 2 && !isLoading;
  const hasResults = mergedCode.length > 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
      
      <div className="relative z-10">
        <Header />
        
        <main className="max-w-6xl mx-auto px-4 pb-12">
          {/* Error Alert */}
          <ErrorAlert error={error} onClose={clearError} />

          {/* Backend Connection Status */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-glass backdrop-blur-sm border border-glass-border rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-300 text-sm font-mono">
                Backend: localhost:8000
              </span>
            </div>
            <p className="text-gray-500 text-xs mt-2">
              Ensure your backend server is running for file merging
            </p>
          </div>

          {/* File Upload Section */}
          <section className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-200 mb-3">
                Upload Your C# Files
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Select two C# files to merge using our advanced AST-aware AI technology. 
                Conflicts will be automatically resolved while preserving code structure.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <FileUpload
                file={files[0]}
                onFileUpload={(file) => uploadFile(file, 0)}
                onFileRemove={() => removeFile(0)}
                slot={0}
                isLoading={isLoading}
              />
              <FileUpload
                file={files[1]}
                onFileUpload={(file) => uploadFile(file, 1)}
                onFileRemove={() => removeFile(1)}
                slot={1}
                isLoading={isLoading}
              />
            </div>
          </section>

          {/* Merge Button */}
          <section className="text-center mb-12">
            <button
              onClick={mergeFiles}
              disabled={!canMerge}
              className={`
                relative inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg
                transition-all duration-300 transform
                ${canMerge
                  ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white hover:scale-105 hover:shadow-lg animate-pulse-glow'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>Merging Files...</span>
                </>
              ) : (
                <>
                  <Zap className="w-6 h-6" />
                  <span>Merge Now</span>
                  <Sparkles className="w-5 h-5" />
                </>
              )}
            </button>
            
            {canMerge && !isLoading && (
              <p className="text-gray-400 text-sm mt-3">
                AI-powered merge with conflict resolution
              </p>
            )}

            {!canMerge && !isLoading && files.filter(Boolean).length < 2 && (
              <div className="flex items-center justify-center gap-2 mt-3 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <p className="text-sm">Please upload both files to enable merging</p>
              </div>
            )}
          </section>

          {/* Results Section */}
          {(hasResults || isLoading || mergeLogs.length > 0) && (
            <section className="space-y-8">
              {/* Merge Logs */}
              <MergeLogs logs={mergeLogs} isVisible={mergeLogs.length > 0} />
              
              {/* Code Viewer */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-200">
                    Merged Code Result
                  </h3>
                  {hasResults && (
                    <button
                      onClick={downloadMergedFile}
                      className="flex items-center gap-2 px-4 py-2 bg-accent-green hover:bg-accent-green/80 text-white rounded-lg transition-colors font-medium"
                    >
                      <span>Download</span>
                    </button>
                  )}
                </div>
                <CodeViewer 
                  code={mergedCode} 
                  onDownload={downloadMergedFile}
                  isLoading={isLoading}
                />
              </div>
            </section>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;