/**
 * Glean - Knowledge harvesting from AI coding sessions
 * TypeScript definitions
 */

// Spaced Repetition
export interface SpaceRepData {
  confidence: number;
  easeFactor: number;
  interval: number;
  reviewCount: number;
  nextReview?: string;
  lastReview?: string;
  streak?: number;
  status?: 'active' | 'mastered';
}

export interface LearnItem {
  id: string;
  topic: string;
  content: string;
  spaceRep: SpaceRepData;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewResult {
  nextReview: string;
  interval: number;
  easeFactor: number;
}

export function calculateNextReview(item: LearnItem, confidence: number): ReviewResult;
export function isDueToday(dateString: string): boolean;
export function getReviewPriority(item: LearnItem): 'urgent' | 'normal' | 'low';
export function updateAfterReview(item: LearnItem, confidence: number): LearnItem;
export const BASE_INTERVALS: Record<number, number>;

// Harvest Store
export interface HarvestData {
  id: string;
  session: {
    startTime: string;
    endTime: string;
    project: string;
    duration: number;
  };
  summary: string;
  mainTasks: string[];
  changedFiles: string[];
  commits: Array<{
    hash: string;
    message: string;
    timestamp: string;
  }>;
  insights: string[];
}

export class HarvestStore {
  constructor(dataDir?: string);
  save(harvest: HarvestData): Promise<string>;
  load(id: string): Promise<HarvestData | null>;
  list(): Promise<HarvestData[]>;
  search(query: string): Promise<HarvestData[]>;
}

// Insight Store
export interface InsightData {
  id: string;
  type: 'pattern' | 'mistake' | 'optimization' | 'learning';
  title: string;
  description: string;
  context: {
    project: string;
    files: string[];
  };
  tags: string[];
  createdAt: string;
}

export class InsightStore {
  constructor(dataDir?: string);
  save(insight: InsightData): Promise<string>;
  load(id: string): Promise<InsightData | null>;
  list(filter?: { type?: string; tag?: string }): Promise<InsightData[]>;
  search(query: string): Promise<InsightData[]>;
}

// Learn Store
export class LearnStore {
  constructor(dataDir?: string);
  add(item: Omit<LearnItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  get(id: string): Promise<LearnItem | null>;
  list(): Promise<LearnItem[]>;
  getDueItems(): Promise<LearnItem[]>;
  updateReview(id: string, confidence: number): Promise<LearnItem>;
}

// Bridge - Claude Code
export class ClaudeCodeBridge {
  constructor(options?: { projectPath?: string });
  getRecentCommits(limit?: number): Promise<Array<{
    hash: string;
    message: string;
    author: string;
    timestamp: string;
  }>>;
  getCurrentBranch(): Promise<string>;
  getChangedFiles(): Promise<string[]>;
}

// Bridge - Obsidian
export interface ObsidianConfig {
  vaultPath: string;
  folder?: string;
}

export class ObsidianBridge {
  constructor(config: ObsidianConfig);
  exportInsight(insight: InsightData): Promise<string>;
  exportLearnItem(item: LearnItem): Promise<string>;
  exportHarvest(harvest: HarvestData): Promise<string>;
}

// Bridge - Data Transformer
export function harvestToMarkdown(harvest: HarvestData): string;
export function insightToObsidianNote(insight: InsightData): { filename: string; content: string };
export function learnToObsidianNote(item: LearnItem): { filename: string; content: string };
export function commitToHarvestChange(commit: any): any;
export function prToInsight(pr: any): InsightData;

// Bridge - Plugin Detector
export interface PluginCapability {
  dataType: string;
  direction: 'import' | 'export' | 'both';
}

export interface PluginDefinition {
  name: string;
  detectPaths: string[];
  capabilities: PluginCapability[];
}

export interface PluginDetectionResult {
  name: string;
  detected: boolean;
  path: string | null;
  version: string | null;
  capabilities: PluginCapability[];
}

export function detectAllPlugins(basePath?: string): Promise<PluginDetectionResult[]>;
export const KNOWN_PLUGINS: Record<string, PluginDefinition>;

// Version
export const VERSION: string;
