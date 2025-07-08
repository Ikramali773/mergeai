import { useState, useCallback } from 'react';
import axios from 'axios';

export interface UploadedFile {
  id: string;
  name: string;
  content: string;
  size: number;
  type: string;
  file: File; // Keep reference to original File object for backend upload
}

const API_BASE_URL = 'http://localhost:8000';

export const useFileUpload = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mergedCode, setMergedCode] = useState<string>('');
  const [mergeLogs, setMergeLogs] = useState<string[]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  const uploadFile = useCallback((file: File, slot: number) => {
    setIsLoading(true);
    setError('');
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const uploadedFile: UploadedFile = {
        id: `file-${slot}-${Date.now()}`,
        name: file.name,
        content,
        size: file.size,
        type: file.type,
        file, // Store original file for backend upload
      };

      setFiles(prev => {
        const newFiles = [...prev];
        newFiles[slot] = uploadedFile;
        return newFiles;
      });
      setIsLoading(false);
    };

    reader.onerror = () => {
      setError('Failed to read file');
      setIsLoading(false);
    };

    reader.readAsText(file);
  }, []);

  const removeFile = useCallback((slot: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      delete newFiles[slot];
      return newFiles;
    });
    // Clear results when files are removed
    setMergedCode('');
    setMergeLogs([]);
    setDownloadUrl('');
    setError('');
  }, []);

  const mergeFiles = useCallback(async () => {
    const validFiles = files.filter(Boolean);
    if (validFiles.length < 2) {
      setError('Please upload both files before merging.');
      return;
    }

    setIsLoading(true);
    setError('');
    setMergeLogs(['🚀 Starting merge process...', '📤 Uploading files to server...']);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file1', validFiles[0].file);
      formData.append('file2', validFiles[1].file);

      // Add progress log
      setMergeLogs(prev => [...prev, '🔍 Analyzing file structures...']);

      // Make API call to backend
      const response = await axios.post(`${API_BASE_URL}/merge`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout
      });

      const { merged_file, logs, download_url } = response.data;

      // Update logs from backend
      const backendLogs = logs || [];
      setMergeLogs(prev => [
        ...prev,
        '🤖 AI processing complete',
        ...backendLogs.map((log: string) => `📋 ${log}`),
        '✅ Merge completed successfully!'
      ]);

      // Set download URL
      const fullDownloadUrl = `${API_BASE_URL}${download_url}`;
      setDownloadUrl(fullDownloadUrl);

      // Fetch the merged code content
      setMergeLogs(prev => [...prev, '📥 Fetching merged code...']);
      const mergedResponse = await axios.get(download_url, {
        baseURL: API_BASE_URL,
        responseType: 'text',
      });
      
      setMergedCode(mergedResponse.data);
      setMergeLogs(prev => [...prev, '🎉 Ready for download!']);

    } catch (error: any) {
      console.error('Merge failed:', error);
      
      let errorMessage = 'Merge failed. Please try again.';
      if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to server. Please ensure the backend is running on http://localhost:8000';
      } else if (error.response?.data?.detail) {
        errorMessage = `Server error: ${error.response.data.detail}`;
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      setError(errorMessage);
      setMergeLogs(prev => [...prev, `❌ ${errorMessage}`]);
    } finally {
      setIsLoading(false);
    }
  }, [files]);

  const downloadMergedFile = useCallback(() => {
    if (!downloadUrl) {
      setError('No file available for download');
      return;
    }

    try {
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'merged-code.cs';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      setError('Download failed. Please try again.');
    }
  }, [downloadUrl]);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  return {
    files,
    isLoading,
    mergedCode,
    mergeLogs,
    downloadUrl,
    error,
    uploadFile,
    removeFile,
    mergeFiles,
    downloadMergedFile,
    clearError,
  };
};