export interface NameRecord {
  name: string;
  tags: Record<string, string[]>;
}

export interface SourceConfig {
  tags: Record<string, string[]>;
}

export type SourcesConfig = Record<string, SourceConfig>;

export type TagIndex = Record<string, string[]>;
