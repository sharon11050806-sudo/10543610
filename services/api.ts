import { CandleData, StockInfo, Asset, AppMode } from '../types';
import { GoogleGenAI } from "@google/genai";

// Environment Variable Handling
// Note: In Vite, we use import.meta.env. In CRA/Webpack, process.env.
// We'll use a safe accessor function.
const getEnv = (key: string): string | undefined => {
  // @ts-ignore
  return typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env[key] : process.env[key];
};

const FINNHUB_KEY = getEnv('VITE_FINNHUB_API_KEY');
const GEMINI_KEY = getEnv('API_KEY'); // As per Gemini instructions
const FIREBASE_CONFIG = getEnv('VITE_FIREBASE_CONFIG_STRING');

// Determine Mode
export const APP_MODE: AppMode = (FINNHUB_KEY && GEMINI_KEY) ? AppMode.REAL : AppMode.MOCK;

// --- Mock Data Generators ---

const generateMockCandles = (symbol: string, days: number): CandleData[] => {
  const data: CandleData[] = [];
  let price = 150.0;
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const volatility = price * 0.02;
    const open = price + (Math.random() - 0.5) * volatility;
    const close = open + (Math.random() - 0.5) * volatility;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = Math.floor(Math.random() * 1000000) + 500000;

    data.push({
      time: date.toISOString().split('T')[0],
      timestamp: date.getTime(),
      open,
      high,
      low,
      close,
      volume
    });
    price = close;
  }
  return data;
};

// --- API Service Class ---

class MarketService {
  private mode: AppMode;
  private geminiClient: GoogleGenAI | null = null;

  constructor() {
    this.mode = APP_MODE;
    if (this.mode === AppMode.REAL && GEMINI_KEY) {
      this.geminiClient = new GoogleGenAI({ apiKey: GEMINI_KEY });
    }
  }

  getMode(): AppMode {
    return this.mode;
  }

  async getStockCandles(symbol: string, range: '1D' | '1M' | '1Y'): Promise<CandleData[]> {
    if (this.mode === AppMode.MOCK) {
      console.log(`[Mock Mode] Generating candles for ${symbol}`);
      const days = range === '1Y' ? 365 : range === '1M' ? 30 : 1;
      // For 1D in mock, we simulate hourly candles, but for simplicity let's stick to daily for 1M/1Y
      if (range === '1D') return generateMockCandles(symbol, 7); // Show last week
      return generateMockCandles(symbol, days);
    }

    try {
      // Real API Call to Finnhub
      const resolution = range === '1D' ? '60' : 'D';
      const from = Math.floor(Date.now() / 1000) - (range === '1Y' ? 31536000 : range === '1M' ? 2592000 : 86400);
      const to = Math.floor(Date.now() / 1000);
      
      const response = await fetch(`https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_KEY}`);
      const data = await response.json();

      if (data.s === 'ok') {
        return data.t.map((timestamp: number, index: number) => ({
          time: new Date(timestamp * 1000).toLocaleDateString(),
          timestamp: timestamp * 1000,
          open: data.o[index],
          high: data.h[index],
          low: data.l[index],
          close: data.c[index],
          volume: data.v[index],
        }));
      }
      throw new Error('Finnhub API Error');
    } catch (error) {
      console.error("API Fetch Failed, falling back to mock", error);
      return generateMockCandles(symbol, 30);
    }
  }

  async getQuote(symbol: string): Promise<StockInfo> {
    if (this.mode === AppMode.MOCK) {
      const price = 100 + Math.random() * 100;
      const change = (Math.random() - 0.5) * 5;
      return {
        symbol,
        price: parseFloat(price.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(((change / price) * 100).toFixed(2)),
        name: `${symbol} Corp (Mock)`
      };
    }

    try {
      const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`);
      const data = await response.json();
      return {
        symbol,
        price: data.c,
        change: data.d,
        changePercent: data.dp,
        name: symbol
      };
    } catch (error) {
       console.error("Quote Fetch Failed", error);
       return { symbol, price: 0, change: 0, changePercent: 0 };
    }
  }

  async getAIAnalysis(symbol: string, currentPrice: number, trend: string): Promise<string> {
    if (this.mode === AppMode.MOCK || !this.geminiClient) {
      return `[模擬分析模式] 針對 ${symbol} 的分析：
      
1. 技術面：目前股價為 ${currentPrice}，呈現${trend}趨勢。RSI 指標顯示中性偏強。
2. 基本面：該公司近期財報表現穩定，營收成長符合預期。
3. 建議：短期內可考慮區間操作，支撐位觀察近期低點。長期投資者建議分批佈局。

(此為系統內建模擬回應，請設定 API Key 以獲得即時 AI 分析)`;
    }

    try {
      const prompt = `你是一位專業的金融分析師。請針對股票代號 ${symbol} (現價: ${currentPrice}) 給予一份簡短的投資分析與建議。請直接給出純文字回應，不要使用 Markdown 格式，不要使用粗體或標題符號。請包含總結、風險提示以及操作建議。`;
      
      const response = await this.geminiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      return response.text;
    } catch (error) {
      console.error("Gemini AI Error", error);
      return "AI 分析服務暫時無法使用，請稍後再試。";
    }
  }
}

export const marketService = new MarketService();