export type View = 'home' | 'browser' | 'files' | 'music' | 'chat' | 'docs';

export interface NewsItem {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  source: string;
}

export interface SportUpdate {
  id: string;
  match: string;
  score: string;
  league: string;
  status: string;
}

export interface StockData {
  symbol: string;
  price: number;
  change: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}
