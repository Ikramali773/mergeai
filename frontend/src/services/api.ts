import { MergeResponse, ResolveResponse, ConflictEntry } from '../types';

const API_BASE_URL = 'http://localhost:8000'; // Update this to match your backend URL

export const mergeFiles = async (fileA: File, fileB: File): Promise<MergeResponse> => {
  const formData = new FormData();
  formData.append('file1', fileA);
  formData.append('file2', fileB);

  const response = await fetch(`${API_BASE_URL}/merge`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = 'Merge failed';
    try {
      const error = await response.json();
      errorMessage = error.detail || errorMessage;
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

export const resolveConflicts = async (
  fileA: File, 
  fileB: File, 
  resolutions: ConflictEntry[]
): Promise<ResolveResponse> => {
  const formData = new FormData();
  formData.append('file1', fileA);
  formData.append('file2', fileB);
  
  // Convert resolutions to the format expected by backend
  const backendResolutions = resolutions.map(conflict => ({
    Id: conflict.Id,
    Choice: conflict.Choice
  }));
  
  // Create a proper file for the resolutions
  const resolutionsFile = new File(
    [JSON.stringify(backendResolutions)], 
    'resolutions.json', 
    { type: 'application/json' }
  );
  formData.append('resolutions', resolutionsFile);

  const response = await fetch(`${API_BASE_URL}/merge/resolve`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = 'Resolution failed';
    try {
      const error = await response.json();
      errorMessage = error.detail || errorMessage;
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

export const downloadFile = async (filename: string): Promise<Blob> => {
  const response = await fetch(`${API_BASE_URL}/download/${filename}`);
  
  if (!response.ok) {
    throw new Error('Download failed');
  }
  
  return response.blob();
};

export const pingBackend = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ping`);
    return response.ok;
  } catch {
    return false;
  }
};