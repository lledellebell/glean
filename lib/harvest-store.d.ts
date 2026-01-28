/**
 * Harvest Store - Session harvest data management
 */

export interface HarvestSession {
  startTime: string;
  endTime: string;
  project: string;
  duration: number;
}

export interface HarvestCommit {
  hash: string;
  message: string;
  timestamp: string;
}

export interface HarvestData {
  id: string;
  session: HarvestSession;
  summary: string;
  mainTasks: string[];
  changedFiles: string[];
  commits: HarvestCommit[];
  insights: string[];
}

export class HarvestStore {
  /**
   * Create a new harvest store
   * @param dataDir - Directory to store harvest data (default: ~/.glean/harvests)
   */
  constructor(dataDir?: string);

  /**
   * Save a harvest
   * @param harvest - Harvest data to save
   * @returns ID of the saved harvest
   */
  save(harvest: HarvestData): Promise<string>;

  /**
   * Load a harvest by ID
   * @param id - Harvest ID
   * @returns Harvest data or null if not found
   */
  load(id: string): Promise<HarvestData | null>;

  /**
   * List all harvests
   * @returns Array of all harvest data
   */
  list(): Promise<HarvestData[]>;

  /**
   * Search harvests by query
   * @param query - Search query
   * @returns Matching harvests
   */
  search(query: string): Promise<HarvestData[]>;
}
