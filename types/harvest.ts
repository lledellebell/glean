/**
 * Glean Harvest Types
 * @license MIT
 */

export interface FileChange {
  path: string;
  action: 'created' | 'modified' | 'deleted';
  language: string;
  linesAdded: number;
  linesRemoved: number;
}

export interface Commit {
  hash: string;
  message: string;
  timestamp: string;
  filesChanged: number;
}

export interface ToolUsage {
  tool: string;
  count: number;
  examples?: string[];
}

export interface ExtractedInsight {
  type: 'pattern' | 'mistake' | 'optimization' | 'learning';
  content: string;
  confidence: number;
}

export interface Harvest {
  id: string;
  version: '1.0';
  timestamp: string;

  session: {
    startTime: string;
    endTime: string;
    duration: number;
    project: string;
    branch?: string;
  };

  summary: {
    description: string;
    mainTasks: string[];
    keywords: string[];
  };

  changes: {
    files: FileChange[];
    commits: Commit[];
    totalLinesAdded: number;
    totalLinesRemoved: number;
  };

  tools: ToolUsage[];
  insights: ExtractedInsight[];

  followUp: {
    todos: string[];
    questions: string[];
    blockers: string[];
  };

  meta: {
    harvestMode: 'quick' | 'full' | 'auto';
    processingTime: number;
    agentVersion: string;
  };
}

export interface HarvestIndex {
  totalHarvests: number;
  lastHarvest: string;
  projects: {
    [projectPath: string]: {
      harvestCount: number;
      lastHarvest: string;
      totalDuration: number;
    };
  };
}

export interface QuickHarvest {
  id: string;
  timestamp: string;
  project: string;
  duration: number;
  summary: string;
  filesChanged: number;
  commits: number;
  topInsights: string[];
}
