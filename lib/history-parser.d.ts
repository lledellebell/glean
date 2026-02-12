/**
 * Glean History Parser - Type Definitions
 */

export interface SessionFile {
  filepath: string;
  project: string;
  projectPath: string;
  size: number;
  modified: Date;
}

export interface ParsedMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp?: string;
}

export interface ParsedSession {
  messages: ParsedMessage[];
  totalLines: number;
  filteredLines: number;
}

export interface SessionChunk {
  messages: ParsedMessage[];
  chunkIndex: number;
  totalChunks: number;
}

export interface DiscoverOptions {
  project?: string;
  all?: boolean;
  limit?: number;
  since?: string;
}

export interface FormatOptions {
  projectPath?: string;
  chunkIndex?: number;
  totalChunks?: number;
}

export function projectDirToPath(dirName: string): string;
export function pathToProjectDir(path: string): string;
export function discoverSessions(options?: DiscoverOptions): Promise<SessionFile[]>;
export function parseSession(filepath: string): Promise<ParsedSession>;
export function chunkSession(parsed: ParsedSession, maxSize?: number): SessionChunk[];
export function formatForAgent(parsed: ParsedSession | ParsedMessage[], options?: FormatOptions): string;

declare const _default: {
  projectDirToPath: typeof projectDirToPath;
  pathToProjectDir: typeof pathToProjectDir;
  discoverSessions: typeof discoverSessions;
  parseSession: typeof parseSession;
  chunkSession: typeof chunkSession;
  formatForAgent: typeof formatForAgent;
};

export default _default;
