/**
 * Insight Store - Pattern and insight storage
 */

export type InsightType = 'pattern' | 'mistake' | 'optimization' | 'learning';

export interface InsightContext {
  project: string;
  files: string[];
}

export interface InsightData {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  context: InsightContext;
  tags: string[];
  createdAt: string;
}

export interface InsightFilter {
  type?: InsightType;
  tag?: string;
}

export class InsightStore {
  /**
   * Create a new insight store
   * @param dataDir - Directory to store insight data (default: ~/.glean/insights)
   */
  constructor(dataDir?: string);

  /**
   * Save an insight
   * @param insight - Insight data to save
   * @returns ID of the saved insight
   */
  save(insight: InsightData): Promise<string>;

  /**
   * Load an insight by ID
   * @param id - Insight ID
   * @returns Insight data or null if not found
   */
  load(id: string): Promise<InsightData | null>;

  /**
   * List insights with optional filter
   * @param filter - Filter by type or tag
   * @returns Array of matching insights
   */
  list(filter?: InsightFilter): Promise<InsightData[]>;

  /**
   * Search insights by query
   * @param query - Search query
   * @returns Matching insights
   */
  search(query: string): Promise<InsightData[]>;
}
