import React, { useState, useEffect } from 'react';
import { AISignal } from '../types/market';
import { marketAPI } from '../services/api';
import { Brain, TrendingUp, TrendingDown, Minus, Target, Shield, DollarSign } from 'lucide-react';

export const AISignals: React.FC = () => {
  const [signals, setSignals] = useState<AISignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        console.log('Fetching AI signals...');
        const response = await marketAPI.getAllSignals();
        console.log('AI signals response:', response);
        if (response.data.success) {
          console.log('Signals data:', response.data.signals);
          setSignals(response.data.signals);
        } else {
          console.log('API returned success: false');
        }
      } catch (error) {
        console.error('Error fetching AI signals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSignals();
    const interval = setInterval(fetchSignals, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'BUY': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'SELL': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <Minus className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'SELL': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/30 rounded-2xl p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Brain className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">AI Market Signals</h2>
            <p className="text-gray-400 text-sm">Real-time AI-powered trading recommendations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {signals.map((signal) => (
            <div 
              key={signal.symbol}
              className="bg-gray-900/60 border border-gray-700/40 rounded-xl p-4 hover:bg-gray-900/80 transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedSymbol(selectedSymbol === signal.symbol ? null : signal.symbol)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                    {signal.symbol.substring(0, 2)}
                  </div>
                  <span className="font-medium text-white">{signal.symbol}</span>
                </div>
                <div className={`px-2 py-1 rounded-lg border flex items-center gap-1 ${getSignalColor(signal.signal)}`}>
                  {getSignalIcon(signal.signal)}
                  <span className="text-xs font-medium">{signal.signal}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Confidence</span>
                  <span className={`font-medium ${getConfidenceColor(signal.confidence)}`}>
                    {signal.confidence.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Trend</span>
                  <span className={`text-sm capitalize ${signal.trend === 'bullish' ? 'text-green-400' : 'text-red-400'}`}>
                    {signal.trend}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Strength</span>
                  <span className="text-white text-sm">{signal.strength.toFixed(1)}/100</span>
                </div>
              </div>

              {selectedSymbol === signal.symbol && (
                <div className="mt-4 pt-4 border-t border-gray-700/50 space-y-4">
                  <div className="bg-gray-800/60 rounded-lg p-3">
                    <h4 className="text-white font-medium mb-2">AI Analysis</h4>
                    <div className="text-gray-300 text-sm whitespace-pre-line">{signal.analysis}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {signal.entryPrice && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="w-4 h-4 text-blue-400" />
                          <span className="text-blue-400 text-xs">Entry Price</span>
                        </div>
                        <span className="text-white text-sm font-medium">${signal.entryPrice.toFixed(4)}</span>
                      </div>
                    )}
                    
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-4 h-4 text-red-400" />
                        <span className="text-red-400 text-xs">Stop Loss</span>
                      </div>
                      <span className="text-white text-sm font-medium">${signal.stopLoss.toFixed(4)}</span>
                    </div>
                    
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-xs">Take Profit</span>
                      </div>
                      <span className="text-white text-sm font-medium">${signal.takeProfit.toFixed(4)}</span>
                    </div>
                    
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-400 text-xs">Risk/Reward</span>
                      </div>
                      <span className="text-white text-sm font-medium">{signal.riskReward}</span>
                    </div>
                  </div>

                  {signal.technicalIndicators && (
                    <div className="bg-gray-800/40 rounded-lg p-3">
                      <h4 className="text-white font-medium mb-2">Technical Indicators</h4>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-gray-400">Volatility:</span>
                          <span className="text-white ml-2">{signal.technicalIndicators.volatility}%</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Momentum:</span>
                          <span className="text-white ml-2">{signal.technicalIndicators.momentum}%</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Support:</span>
                          <span className="text-white ml-2">${signal.technicalIndicators.support}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Resistance:</span>
                          <span className="text-white ml-2">${signal.technicalIndicators.resistance}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};