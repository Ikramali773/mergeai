export interface FileData {
  name: string;
  content: string;
}

export interface ConflictEntry {
  Id: number;
  type: string;
  method: string;
  fileASnippet: string;
  fileBSnippet: string;
  Choice?: 'A' | 'B' | 'Both';
}

export interface MergeResponse {
  merged_file: string;
  logs: ConflictEntry[];
  download_url: string;
}

export interface ResolveResponse {
  merged_file: string;
  logs: ConflictEntry[];
  download_url: string;
}

export type WorkflowPhase = 'upload' | 'conflicts' | 'final';