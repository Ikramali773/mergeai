// src/utils/api.ts

import axios from 'axios';
import type { MergeResponse, Resolution } from '../types/merge';

const API_BASE = 'http://localhost:8000';

export async function mergeFiles(
  file1: File,
  file2: File
): Promise<MergeResponse> {
  const form = new FormData();
  form.append('file1', file1);
  form.append('file2', file2);

  const { data } = await axios.post<MergeResponse>(
    `${API_BASE}/merge`,
    form,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );

  return data;
}

export async function resolveMerge(
  file1: File,
  file2: File,
  resolutions: Resolution[]
): Promise<MergeResponse> {
  const form = new FormData();
  form.append('file1', file1);
  form.append('file2', file2);

  // Resolutions JSON must be sent as a field named "resolutions"
  const jsonBlob = new Blob([JSON.stringify(resolutions)], {
    type: 'application/json',
  });
  form.append('resolutions', jsonBlob, 'resolutions.json');

  const { data } = await axios.post<MergeResponse>(
    `${API_BASE}/merge/resolve`,
    form,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );

  return data;
}

export async function downloadFile(downloadUrl: string): Promise<string> {
  const res = await axios.get<string>(`${API_BASE}${downloadUrl}`);
  return res.data;
}
