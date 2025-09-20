import { useState, useMemo } from 'react';
import { MarketOverview } from './components/MarketOverview';
import { PriceChart } from './components/PriceChart';
import { AdvancedChart } from './components/AdvancedChart';
import { AISignals } from './components/AISignals';
import { ConnectionStatus } from './components/ConnectionStatus';
import { useWebSocket } from './hooks/useWebSocket';
import { BarChart3, Brain, Activity, Settings, TrendingUp, Globe, Zap } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'advanced-charts' | 'ai-signals'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'crypto' | 'forex' | 'indices' | 'commodities'>('all');
  const { marketData, connectionStatus } = useWebSocket('ws://localhost:5000');
  
  const markets = Object.values(marketData);
  const selectedMarket = markets[0]; // Default to first market for chart

  // Filter markets by category
  const filteredMarkets = useMemo(() => {
    if (selectedCategory === 'all') return markets;
    return markets.filter(market => market.assetType === selectedCategory);
  }, [markets, selectedCategory]);

  // Group markets by category for overview
  const marketsByCategory = useMemo(() => {
    const groups = {
      crypto: markets.filter(m => m.assetType === 'crypto'),
      forex: markets.filter(m => m.assetType === 'forex'),
      indices: markets.filter(m => m.assetType === 'indices'),
      commodities: markets.filter(m => m.assetType === 'commodities')
    };
    return groups;
  }, [markets]);

  const tabs = [
    { id: 'overview' as const, label: 'Market Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'charts' as const, label: 'Live Charts', icon: <Activity className="w-4 h-4" /> },
    { id: 'advanced-charts' as const, label: 'Technical Analysis', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'ai-signals' as const, label: 'AI Signals', icon: <Brain className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.1),transparent_70%)]"></div>
      
      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              QuantumTrade Pro
            </h1>
            <p className="text-gray-400 mt-2">Multi-Asset AI Trading Platform - Crypto, Forex, Indices & Commodities</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {marketsByCategory.crypto.length} Crypto
              </span>
              <span className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                {marketsByCategory.forex.length} Forex
              </span>
              <span className="flex items-center gap-1">
                <BarChart3 className="w-4 h-4" />
                {marketsByCategory.indices.length} Indices
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                {marketsByCategory.commodities.length} Commodities
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <ConnectionStatus status={connectionStatus} />
            <button className="p-2 bg-gray-800/40 hover:bg-gray-800/60 border border-gray-700/30 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-8 bg-gray-800/20 p-1 rounded-2xl backdrop-blur-xl border border-gray-700/30">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {[
            { id: 'all', label: 'All Markets', count: markets.length },
            { id: 'crypto', label: 'Crypto', count: marketsByCategory.crypto.length },
            { id: 'forex', label: 'Forex', count: marketsByCategory.forex.length },
            { id: 'indices', label: 'Indices', count: marketsByCategory.indices.length },
            { id: 'commodities', label: 'Commodities', count: marketsByCategory.commodities.length }
          ].map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'bg-gray-800/40 text-gray-400 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              {category.label} ({category.count})
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-semibold text-white">Market Overview</h2>
                <span className="text-gray-400">• Real-time multi-asset prices</span>
              </div>
              <MarketOverview marketData={filteredMarkets} />
            </div>
          )}

          {activeTab === 'charts' && selectedMarket && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Activity className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-semibold text-white">Live Price Charts</h2>
                <span className="text-gray-400">• Real-time price movements</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredMarkets.slice(0, 8).map((market) => (
                  <PriceChart key={market.symbol} data={market} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'advanced-charts' && selectedMarket && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-semibold text-white">Technical Analysis Charts</h2>
                <span className="text-gray-400">• MA, RSI, Bollinger Bands & Entry Points</span>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {filteredMarkets.slice(0, 4).map((market) => (
                  <AdvancedChart 
                    key={market.symbol} 
                    data={market}
                    technicalIndicators={{
                      sma20: '0',
                      sma50: '0',
                      rsi: '50',
                      macd: '0',
                      bollingerUpper: '0',
                      bollingerLower: '0',
                      stochastic: '50'
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ai-signals' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Brain className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-semibold text-white">AI Trading Signals</h2>
                <span className="text-gray-400">• Smart entry, exit & stop-loss recommendations</span>
              </div>
              <AISignals />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-700/30 text-center text-gray-400">
          <p>CryptoAI Pro • Advanced Market Intelligence • Real-time Data & AI Analysis</p>
        </div>
      </div>
    </div>
  );
}

export default App;