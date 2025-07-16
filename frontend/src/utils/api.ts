const API_BASE_URL = 'http://localhost:8000';

export const mergeFiles = async (fileA: File, fileB: File): Promise<{
  merged_file: string;
  logs: any[];
  download_url: string;
}> => {
  const formData = new FormData();
  formData.append('file1', fileA);
  formData.append('file2', fileB);

  const response = await fetch(`${API_BASE_URL}/merge`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Merge failed');
  }

  return response.json();
};

export const resolveConflicts = async (
  fileA: File, 
  fileB: File, 
  resolutions: Array<{ Id: number; Choice: 'A' | 'B' | 'Both' }>
): Promise<{
  merged_file: string;
  logs: any[];
  download_url: string;
}> => {
  const formData = new FormData();
  formData.append('file1', fileA);
  formData.append('file2', fileB);
  
  // Convert resolutions to JSON blob
  const resolutionsBlob = new Blob([JSON.stringify(resolutions)], {
    type: 'application/json'
  });
  formData.append('resolutions', resolutionsBlob, 'resolutions.json');

  const response = await fetch(`${API_BASE_URL}/merge/resolve`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Conflict resolution failed');
  }

  return response.json();
};

export const downloadFile = (filename: string): string => {
  return `${API_BASE_URL}/download/${filename}`;
};