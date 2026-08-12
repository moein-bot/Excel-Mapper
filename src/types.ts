export interface FileData {
  name: string;
  headers: string[];
  rows: Record<string, string | number | boolean | null>[];
  totalRows: number;
}

export interface MappingPair {
  templateCol: string;
  inputCol: string;
}

export interface SavedMapping {
  id: number;
  name: string;
  mapping_config: MappingPair[];
  template_headers: string[];
  created_at: string;
  user_id: string;
}

export type AppStep = 'upload' | 'map' | 'preview' | 'export';
