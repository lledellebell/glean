/**
 * Learn Store - Learning items with spaced repetition
 */

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

export type NewLearnItem = Omit<LearnItem, 'id' | 'createdAt' | 'updatedAt'>;

export class LearnStore {
  /**
   * Create a new learn store
   * @param dataDir - Directory to store learning data (default: ~/.glean/learn)
   */
  constructor(dataDir?: string);

  /**
   * Add a new learning item
   * @param item - Learning item data (without id and timestamps)
   * @returns ID of the created item
   */
  add(item: NewLearnItem): Promise<string>;

  /**
   * Get a learning item by ID
   * @param id - Item ID
   * @returns Learning item or null if not found
   */
  get(id: string): Promise<LearnItem | null>;

  /**
   * List all learning items
   * @returns Array of all learning items
   */
  list(): Promise<LearnItem[]>;

  /**
   * Get items due for review today
   * @returns Array of due learning items
   */
  getDueItems(): Promise<LearnItem[]>;

  /**
   * Update an item after review
   * @param id - Item ID
   * @param confidence - Confidence level from review (1-5)
   * @returns Updated learning item
   */
  updateReview(id: string, confidence: number): Promise<LearnItem>;
}
