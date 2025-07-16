export interface ConflictData {
  id: number;
  location: string;
  name: string;
  file1Body: string;
  file2Body: string;
}

export interface MergeResponse {
  merged_file: string;
  logs: any[];
  download_url: string;
}

export interface ConflictResolution {
  Id: number;
  Choice: 'A' | 'B' | 'Both';
}

export type WorkflowStep = 'upload' | 'conflicts' | 'final';