import React from 'react';
import { CryptoData } from '../types/market';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MarketOverviewProps {
  marketData: CryptoData[];
}

export const MarketOverview: React.FC<MarketOverviewProps> = ({ marketData }) => {
  const markets = marketData;

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const formatPrice = (price: number, assetType: string) => {
    if (assetType === 'forex') {
      return price > 10 ? price.toFixed(2) : price.toFixed(4);
    }
    return price > 1000 ? `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : `$${price.toFixed(4)}`;
  };

  const formatVolume = (volume: number) => {
    if (volume > 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume > 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    if (volume > 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  };

  const getAssetTypeColor = (assetType: string) => {
    switch (assetType) {
      case 'crypto': return 'from-blue-500 to-purple-600';
      case 'forex': return 'from-green-500 to-emerald-600';
      case 'indices': return 'from-orange-500 to-red-600';
      case 'commodities': return 'from-yellow-500 to-amber-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getAssetTypeLabel = (assetType: string) => {
    switch (assetType) {
      case 'crypto': return 'Crypto';
      case 'forex': return 'Forex';
      case 'indices': return 'Index';
      case 'commodities': return 'Commodity';
      default: return 'Asset';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {markets.map((market) => (
        <div key={market.symbol} className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/30 rounded-2xl p-6 hover:bg-gray-800/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${getAssetTypeColor(market.assetType)} rounded-full flex items-center justify-center text-white font-bold`}>
                {market.symbol.substring(0, 2)}
              </div>
              <div>
                <h3 className="font-semibold text-white">{market.symbol}</h3>
                <p className="text-xs text-gray-400">{getAssetTypeLabel(market.assetType)}</p>
              </div>
            </div>
            {getTrendIcon(market.change24h)}
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-2xl font-bold text-white">{formatPrice(market.price, market.assetType)}</p>
              <p className={`text-sm font-medium flex items-center gap-1 ${
                market.change24h >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {market.change24h >= 0 ? '+' : ''}{market.change24h.toFixed(2)}%
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-gray-400">Volume 24h</p>
                <p className="text-white font-medium">{formatVolume(market.volume)}</p>
              </div>
              <div>
                <p className="text-gray-400">{market.marketCap ? 'Market Cap' : 'High 24h'}</p>
                <p className="text-white font-medium">
                  {market.marketCap ? formatVolume(market.marketCap) : formatPrice(market.high24h, market.assetType)}
                </p>
              </div>
            </div>
            
            <div className="pt-3 border-t border-gray-700/50">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">24h Range</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-red-400">{formatPrice(market.low24h, market.assetType)}</span>
                <span className="text-green-400">{formatPrice(market.high24h, market.assetType)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};