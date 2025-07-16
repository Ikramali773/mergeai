import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { ConflictReview } from './components/ConflictReview';
import { FinalMerge } from './components/FinalMerge';
import { WorkflowStep, ConflictData, ConflictResolution } from './types/merge';
import { mergeFiles, resolveConflicts, downloadFile } from './utils/api';

function App() {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload');
  const [conflicts, setConflicts] = useState<ConflictData[]>([]);
  const [mergedContent, setMergedContent] = useState<string>('');
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [originalFiles, setOriginalFiles] = useState<{ fileA: File | null; fileB: File | null }>({
    fileA: null,
    fileB: null
  });
  const [isLoading, setIsLoading] = useState(false);

  // Parse conflicts from logs
  const parseConflictsFromLogs = (logs: any[]): ConflictData[] => {
    return logs
      .filter(log => log.type === 'conflict')
      .map(log => ({
        id: log.id || Math.random(),
        location: log.location || 'Unknown',
        name: log.name || 'Unknown',
        file1Body: log.file1Body || log.content1 || '',
        file2Body: log.file2Body || log.content2 || ''
      }));
  };

  // API call for initial merge
  const handleMerge = async (fileA: File, fileB: File) => {
    setIsLoading(true);
    setOriginalFiles({ fileA, fileB });
    
    try {
      const response = await mergeFiles(fileA, fileB);
      
      // Parse conflicts from logs
      const conflictData = parseConflictsFromLogs(response.logs);
      
      if (conflictData.length > 0) {
        setConflicts(conflictData);
        setCurrentStep('conflicts');
      } else {
        // No conflicts, fetch the merged content
        const downloadUrl = downloadFile(response.merged_file);
        const contentResponse = await fetch(downloadUrl);
        const content = await contentResponse.text();
        
        setMergedContent(content);
        setDownloadUrl(downloadUrl);
        setCurrentStep('final');
      }
    } catch (error) {
      console.error('Merge failed:', error);
      alert(`Merge failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // API call for conflict resolution
  const handleResolveConflicts = async (resolutions: ConflictResolution[]) => {
    if (!originalFiles.fileA || !originalFiles.fileB) {
      alert('Original files not found. Please start over.');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await resolveConflicts(
        originalFiles.fileA,
        originalFiles.fileB,
        resolutions
      );
      
      // Fetch the merged content
      const downloadUrl = downloadFile(response.merged_file);
      const contentResponse = await fetch(downloadUrl);
      const content = await contentResponse.text();
      
      setMergedContent(content);
      setDownloadUrl(downloadUrl);
      setCurrentStep('final');
    } catch (error) {
      console.error('Conflict resolution failed:', error);
      alert(`Failed to resolve conflicts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentStep('upload');
    setConflicts([]);
    setMergedContent('');
    setDownloadUrl('');
    setOriginalFiles({ fileA: null, fileB: null });
  };

  const handleCloseConflicts = () => {
    setCurrentStep('upload');
    setConflicts([]);
    setOriginalFiles({ fileA: null, fileB: null });
  };

  return (
    <div className="transition-all duration-500 ease-in-out">
      {currentStep === 'upload' && (
        <FileUpload 
          onMerge={handleMerge} 
          isLoading={isLoading}
        />
      )}
      
      {currentStep === 'conflicts' && (
        <ConflictReview
          conflicts={conflicts}
          onClose={handleCloseConflicts}
          onResolve={handleResolveConflicts}
          isLoading={isLoading}
        />
      )}
      
      {currentStep === 'final' && (
        <FinalMerge
          mergedContent={mergedContent}
          downloadUrl={downloadUrl}
          onBack={handleBack}
        />
      )}
    </div>
  );
}

export default App;