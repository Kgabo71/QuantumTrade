export interface CryptoData {
  symbol: string;
  assetType: 'crypto' | 'forex' | 'indices' | 'commodities';
  price: number;
  change24h: number;
  volume: number;
  marketCap: number | null;
  high24h: number;
  low24h: number;
  lastUpdate: number;
  priceHistory: PricePoint[];
}

export interface PricePoint {
  price: number;
  timestamp: number;
}

export interface AISignal {
  symbol: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  strength: number;
  entryPrice: number | null;
  exitPrice: number | null;
  stopLoss: number;
  takeProfit: number;
  riskReward: string;
  analysis: string;
  technicalIndicators?: {
    volatility: string;
    momentum: string;
    support: string;
    resistance: string;
  };
}

export interface MarketUpdate {
  type: 'marketUpdate';
  data: Record<string, CryptoData>;
}