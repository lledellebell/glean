/**
 * Glean Harvest Data Schema
 * Format for storing knowledge harvested from sessions
 */

// File change information
export interface FileChange {
  path: string;
  action: 'created' | 'modified' | 'deleted';
  language: string;
  linesAdded: number;
  linesRemoved: number;
}

// Git commit information
export interface Commit {
  hash: string;
  message: string;
  timestamp: string;
  filesChanged: number;
}

// Tool usage statistics
export interface ToolUsage {
  tool: string;
  count: number;
  examples?: string[];
}

// Extracted insight (brief)
export interface ExtractedInsight {
  type: 'pattern' | 'mistake' | 'optimization' | 'learning';
  content: string;
  confidence: number; // 0-1
}

// Main Harvest data
export interface Harvest {
  // Metadata
  id: string;
  version: '1.0';
  timestamp: string;

  // Session information
  session: {
    startTime: string;
    endTime: string;
    duration: number; // seconds
    project: string;
    branch?: string;
  };

  // Work summary
  summary: {
    description: string;
    mainTasks: string[];
    keywords: string[];
  };

  // Changes
  changes: {
    files: FileChange[];
    commits: Commit[];
    totalLinesAdded: number;
    totalLinesRemoved: number;
  };

  // Tool usage
  tools: ToolUsage[];

  // Extracted insights (details in insight module)
  insights: ExtractedInsight[];

  // Follow-up items
  followUp: {
    todos: string[];
    questions: string[];
    blockers: string[];
  };

  // Meta
  meta: {
    harvestMode: 'quick' | 'full' | 'auto';
    processingTime: number; // ms
    agentVersion: string;
  };
}

// Store index
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

// Quick Harvest (brief version)
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
