import { MemoryEvent, Photo, SearchResult } from '../types';

/**
 * 1. LRU Cache Implementation (O(1) access)
 * Used to cache viewed MemoryEvents to reduce "DB hits" (simulated).
 */
export class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, V>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    
    // Refresh item: remove and re-insert to mark as recently used
    const val = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  put(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Remove oldest (first item in Map iterator)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(key, value);
  }

  debug(): void {
    console.log('LRU Cache State:', Array.from(this.cache.keys()));
  }
}

/**
 * 2. Search and Ranking Algorithm
 * Filters by prefix match and sorts by engagement score.
 * Engagement Score = (Views * 1) + (Likes * 2)
 */
export const searchAndRankEvents = (
  events: MemoryEvent[], 
  query: string
): SearchResult[] => {
  const normalizedQuery = query.toLowerCase();

  // 1. Filter (Prefix/Substring match)
  const filtered = events.filter(e => 
    e.title.toLowerCase().includes(normalizedQuery) ||
    e.recipientName.toLowerCase().includes(normalizedQuery) ||
    e.occasion.toLowerCase().includes(normalizedQuery)
  );

  // 2. Score & Sort
  const ranked = filtered.map(event => ({
    event,
    score: (event.views * 1) + (event.likes * 2)
  }));

  // Sort descending by score, then by date
  ranked.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return b.event.createdAt - a.event.createdAt;
  });

  return ranked;
};

/**
 * 3. Enhanced "Minimum Cost" Layout Algorithm (Dynamic Programming)
 * Finds the optimal partition of photos into rows to minimize the deviation from target height.
 * This is similar to the Knuth-Plass line breaking algorithm used in TeX.
 */
export interface LayoutRow {
  photos: Photo[];
  height: number;
}

export const computeGreedyLayout = (
  photos: Photo[], 
  containerWidth: number, 
  targetRowHeight: number = 250
): LayoutRow[] => {
  if (containerWidth <= 0 || photos.length === 0) return [];

  // 1. Precompute aspect ratios
  const aspects = photos.map(p => p.aspectRatio);

  // table[i] = min cost to layout photos[0...i-1]
  // breaks[i] = the index of the start of the last row ending at i
  const n = photos.length;
  const dp = new Array(n + 1).fill(Infinity);
  const breaks = new Array(n + 1).fill(0);
  dp[0] = 0;

  for (let i = 0; i < n; i++) {
    let currentAspectRatioSum = 0;
    
    // Try forming a row ending at i (photos[j...i])
    // Look back to find optimal j
    for (let j = i; j >= 0; j--) {
      currentAspectRatioSum += aspects[j]; // Sum of aspect ratios for photos[j...i]
      
      // Calculate what height this row would need to be to fill containerWidth exactly
      // Width = Height * AspectSum  => Height = Width / AspectSum
      const rowHeight = containerWidth / currentAspectRatioSum;
      
      // Heuristic: Penalize deviation from targetRowHeight
      // Using squared difference to punish large deviations heavily
      const deviation = Math.abs(rowHeight - targetRowHeight);
      
      // Cost function: 
      // 1. Deviation cost
      // 2. Avoid extremely tall rows (rowHeight > target * 1.5)
      // 3. Avoid extremely short rows (rowHeight < target * 0.5)
      let cost = Math.pow(deviation, 2);
      
      if (rowHeight > targetRowHeight * 2.5) cost += 100000; // Too tall (single portrait items usually)
      if (rowHeight < targetRowHeight * 0.5) cost += 100000; // Too short (too many items)

      if (dp[j] + cost < dp[i + 1]) {
        dp[i + 1] = dp[j] + cost;
        breaks[i + 1] = j;
      }
    }
  }

  // Reconstruct the solution
  const rows: LayoutRow[] = [];
  let curr = n;
  while (curr > 0) {
    const prev = breaks[curr];
    const rowPhotos = photos.slice(prev, curr);
    
    // Recalculate exact height for this final row configuration
    const aspectSum = rowPhotos.reduce((sum, p) => sum + p.aspectRatio, 0);
    let height = containerWidth / aspectSum;

    // Sanity cap for the very last row or single item rows
    if (height > targetRowHeight * 1.5) {
      height = targetRowHeight;
    }

    // Add to front because we are backtracking
    rows.unshift({
      photos: rowPhotos,
      height: height
    });
    curr = prev;
  }

  return rows;
};