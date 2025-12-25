export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Photo {
  id: string;
  url: string;
  caption?: string;
  width: number;
  height: number;
  aspectRatio: number;
}

export type Theme = 'modern' | 'classic' | 'playful' | 'dark' | 'minimalist' | 'vintage' | 'whimsical';

export interface MemoryEvent {
  id: string;
  userId: string;
  title: string;
  occasion: string; // e.g., Birthday, Anniversary
  recipientName: string;
  message: string;
  photos: Photo[];
  theme: Theme;
  views: number;
  likes: number;
  createdAt: number;
  isPublic: boolean;
  shareCode: string;
}

// Algorithm Types
export interface SearchResult {
  event: MemoryEvent;
  score: number;
}

// Wizard State
export interface WizardState {
  step: number;
  data: Partial<MemoryEvent>;
}