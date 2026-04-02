export type AppMode = 'private' | 'decision';

export interface Coach {
  id: string;
  name: string;
  nameEn: string;
  avatar: string;
  role: string;
  tags: string[];
  tagColors: string[];
  description: string;
  isDefault?: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  coachId?: string;
  timestamp: Date;
  structuredTags?: string[];
  isLoading?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  mode: AppMode;
  messages: Message[];
  selectedCoaches?: string[];
  createdAt: Date;
  updatedAt: Date;
}
