
export interface CandleData {
  time: string; // ISO date or localized string
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockInfo {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  name?: string;
}

export interface Asset {
  id: string;
  symbol: string; // or name for custom assets
  name: string;
  quantity: number;
  avgCost: number;
  type: 'STOCK' | 'CASH' | 'CRYPTO' | 'REAL_ESTATE';
  currentPrice?: number; // Updated via API
  lastUpdated?: string; // Time of last transaction or update
}

export interface Transaction {
  id: string;
  date: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  total: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalProfit: number;
  totalProfitPercent: number;
  cashBalance: number;
}

export type TimeRange = '1D' | '1M' | '1Y';

export enum AppMode {
  MOCK = 'MOCK',
  REAL = 'REAL'
}
