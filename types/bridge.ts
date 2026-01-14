/**
 * Glean Bridge Data Schema
 * Interface for integration with external plugins
 */

// Supported plugin types
export type PluginType =
  | 'claude-code'      // anthropics/claude-code
  | 'task-master'      // claude-task-master
  | 'obsidian'         // obsidian-skills
  | 'notion'           // notion integration
  | 'github'           // GitHub API
  | 'custom';          // user-defined

// Plugin status
export type PluginStatus = 'connected' | 'disconnected' | 'error' | 'not_installed';

// Data flow direction
export type DataDirection = 'import' | 'export' | 'bidirectional';

// Connected plugin information
export interface ConnectedPlugin {
  id: string;
  type: PluginType;
  name: string;
  version?: string;
  status: PluginStatus;
  lastSync: string | null;
  config: PluginConfig;
  capabilities: PluginCapability[];
}

// Plugin configuration
export interface PluginConfig {
  enabled: boolean;
  autoSync: boolean;
  syncInterval?: number; // minutes
  dataDirection: DataDirection;
  filters?: {
    topics?: string[];
    types?: string[];
    minConfidence?: number;
  };
  credentials?: {
    [key: string]: string; // environment variable reference
  };
}

// Plugin capability
export interface PluginCapability {
  name: string;
  description: string;
  dataType: 'harvest' | 'insight' | 'learn' | 'task' | 'note' | 'commit' | 'pr';
  direction: DataDirection;
}

// Data transformation mapping
export interface DataMapping {
  sourceField: string;
  targetField: string;
  transform?: 'direct' | 'format' | 'custom';
  customTransform?: string; // function name
}

// Bridge event
export interface BridgeEvent {
  id: string;
  timestamp: string;
  type: 'sync' | 'import' | 'export' | 'error';
  plugin: PluginType;
  dataType: string;
  itemCount: number;
  status: 'success' | 'partial' | 'failed';
  details?: string;
  error?: string;
}

// Sync result
export interface SyncResult {
  plugin: PluginType;
  direction: DataDirection;
  timestamp: string;
  imported: {
    count: number;
    items: string[]; // IDs
  };
  exported: {
    count: number;
    items: string[];
  };
  errors: {
    count: number;
    messages: string[];
  };
}

// Bridge configuration (global)
export interface BridgeConfig {
  version: '1.0';
  plugins: {
    [key in PluginType]?: PluginConfig;
  };
  globalSettings: {
    autoDetect: boolean;
    syncOnStartup: boolean;
    conflictResolution: 'local' | 'remote' | 'newer' | 'ask';
  };
}

// Bridge index
export interface BridgeIndex {
  lastUpdated: string;
  connectedPlugins: string[]; // plugin IDs
  totalSyncs: number;
  lastSync: string | null;
  events: BridgeEvent[];
}

// Plugin detection result
export interface PluginDetectionResult {
  type: PluginType;
  detected: boolean;
  path?: string;
  version?: string;
  capabilities?: PluginCapability[];
}

// Import/Export request
export interface DataTransferRequest {
  plugin: PluginType;
  direction: DataDirection;
  dataType: 'harvest' | 'insight' | 'learn' | 'all';
  filter?: {
    ids?: string[];
    dateRange?: { start: string; end: string };
    topics?: string[];
  };
  options?: {
    dryRun?: boolean;
    overwrite?: boolean;
    createBackup?: boolean;
  };
}
