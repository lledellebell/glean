/**
 * Glean Bridge 데이터 스키마
 * 외부 플러그인과의 연동 인터페이스
 */

// 지원하는 플러그인 타입
export type PluginType =
  | 'claude-code'      // anthropics/claude-code
  | 'task-master'      // claude-task-master
  | 'obsidian'         // obsidian-skills
  | 'notion'           // notion 연동
  | 'github'           // GitHub API
  | 'custom';          // 사용자 정의

// 플러그인 상태
export type PluginStatus = 'connected' | 'disconnected' | 'error' | 'not_installed';

// 데이터 흐름 방향
export type DataDirection = 'import' | 'export' | 'bidirectional';

// 연결된 플러그인 정보
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

// 플러그인 설정
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
    [key: string]: string; // 환경변수 참조
  };
}

// 플러그인 기능
export interface PluginCapability {
  name: string;
  description: string;
  dataType: 'harvest' | 'insight' | 'learn' | 'task' | 'note' | 'commit' | 'pr';
  direction: DataDirection;
}

// 데이터 변환 매핑
export interface DataMapping {
  sourceField: string;
  targetField: string;
  transform?: 'direct' | 'format' | 'custom';
  customTransform?: string; // 함수명
}

// Bridge 이벤트
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

// 동기화 결과
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

// Bridge 설정 (전역)
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

// Bridge 인덱스
export interface BridgeIndex {
  lastUpdated: string;
  connectedPlugins: string[]; // plugin IDs
  totalSyncs: number;
  lastSync: string | null;
  events: BridgeEvent[];
}

// 플러그인 감지 결과
export interface PluginDetectionResult {
  type: PluginType;
  detected: boolean;
  path?: string;
  version?: string;
  capabilities?: PluginCapability[];
}

// Import/Export 요청
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
