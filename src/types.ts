export type SupplierType = 'Airline' | 'Hotel' | 'Cruise';

export interface Supplier {
  id: string;
  name: string;
  type: SupplierType;
  logoUrl: string;
  bannerUrl: string;
  shortDescription: string;
  longDescription: string;
  avatarImageUrl: string;
  websiteUrl: string;
  knowledgeBaseUrl: string;
  knowledgeBaseText: string;
  geminiVoiceName: string;
  // NEW: ElevenLabs specific properties
  elevenLabsVoiceId?: string;
  useElevenLabs?: boolean;
}

export interface Message {
  id: string;
  text: string;
  timestamp: Date;
  sender: 'user' | 'supplier';
}

export interface ChatHistory {
  id: string;
  supplierId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  agency: string;
  createdAt: Date;
}