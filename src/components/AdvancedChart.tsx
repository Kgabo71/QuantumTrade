import React from 'react';
import { 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  ComposedChart
} from 'recharts';
import { CryptoData } from '../types/market';
import { format } from 'date-fns';

interface AdvancedChartProps {
  data: CryptoData;
  technicalIndicators?: {
    sma20: string;
    sma50: string;
    rsi: string;
    macd: string;
    bollingerUpper: string;
    bollingerLower: string;
    stochastic: string;
  };
  entryPrice?: number | null;
  stopLoss?: number;
  takeProfit?: number;
}

export const AdvancedChart: React.FC<AdvancedChartProps> = ({ 
  data, 
  technicalIndicators, 
  entryPrice, 
  stopLoss, 
  takeProfit 
}) => {
  const chartData = data.priceHistory
    .slice()
    .reverse()
    .map((point, index) => {
      const time = new Date(point.timestamp);
      return {
        time: format(time, 'HH:mm:ss'),
        price: point.price,
        sma20: technicalIndicators?.sma20 !== 'N/A' ? parseFloat(technicalIndicators.sma20) : null,
        sma50: technicalIndicators?.sma50 !== 'N/A' ? parseFloat(technicalIndicators.sma50) : null,
        bollingerUpper: technicalIndicators?.bollingerUpper !== 'N/A' ? parseFloat(technicalIndicators.bollingerUpper) : null,
        bollingerLower: technicalIndicators?.bollingerLower !== 'N/A' ? parseFloat(technicalIndicators.bollingerLower) : null,
        index
      };
    });

  const isPositiveChange = data.change24h >= 0;

  const formatPrice = (price: number, assetType: string) => {
    if (assetType === 'forex') {
      return price > 10 ? price.toFixed(2) : price.toFixed(4);
    }
    return price > 1000 ? `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : `$${price.toFixed(4)}`;
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
    <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/30 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">{data.symbol} Advanced Chart</h3>
          <p className="text-gray-400 text-sm">{getAssetTypeLabel(data.assetType)} • Technical Analysis</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">
            {formatPrice(data.price, data.assetType)}
          </p>
          <p className={`text-sm font-medium ${isPositiveChange ? 'text-green-400' : 'text-red-400'}`}>
            {isPositiveChange ? '+' : ''}{data.change24h.toFixed(2)}%
          </p>
        </div>
      </div>
      
      {/* Technical Indicators Summary */}
      {technicalIndicators && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-900/60 rounded-lg">
          <div className="text-center">
            <p className="text-gray-400 text-xs">RSI</p>
            <p className="text-white font-medium">{technicalIndicators.rsi}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-xs">SMA 20</p>
            <p className="text-white font-medium">{formatPrice(parseFloat(technicalIndicators.sma20 || '0') || 0, data.assetType)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-xs">SMA 50</p>
            <p className="text-white font-medium">{formatPrice(parseFloat(technicalIndicators.sma50 || '0') || 0, data.assetType)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-xs">Stochastic</p>
            <p className="text-white font-medium">{technicalIndicators.stochastic}</p>
          </div>
        </div>
      )}

      {/* Main Chart */}
      <div className="h-80 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={['dataMin - 50', 'dataMax + 50']}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickFormatter={(value) => formatPrice(value, data.assetType)}
            />
            
            {/* Bollinger Bands */}
            {technicalIndicators?.bollingerUpper !== 'N/A' && (
              <>
                <Line
                  type="monotone"
                  dataKey="bollingerUpper"
                  stroke="#8B5CF6"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                  name="BB Upper"
                />
                <Line
                  type="monotone"
                  dataKey="bollingerLower"
                  stroke="#8B5CF6"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                  name="BB Lower"
                />
              </>
            )}
            
            {/* Moving Averages */}
            {technicalIndicators?.sma20 !== 'N/A' && (
              <Line
                type="monotone"
                dataKey="sma20"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={false}
                name="SMA 20"
              />
            )}
            
            {technicalIndicators?.sma50 !== 'N/A' && (
              <Line
                type="monotone"
                dataKey="sma50"
                stroke="#EF4444"
                strokeWidth={2}
                dot={false}
                name="SMA 50"
              />
            )}
            
            {/* Price Line */}
            <Line
              type="monotone"
              dataKey="price"
              stroke={isPositiveChange ? '#10B981' : '#EF4444'}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: isPositiveChange ? '#10B981' : '#EF4444' }}
              name="Price"
            />
            
            {/* Entry/Exit Lines */}
            {entryPrice && (
              <ReferenceLine 
                y={entryPrice} 
                stroke="#3B82F6" 
                strokeWidth={2}
                strokeDasharray="10 5"
                label={{ value: "Entry", position: "top" }}
              />
            )}
            
            {stopLoss && (
              <ReferenceLine 
                y={stopLoss} 
                stroke="#EF4444" 
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{ value: "Stop Loss", position: "top" }}
              />
            )}
            
            {takeProfit && (
              <ReferenceLine 
                y={takeProfit} 
                stroke="#10B981" 
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{ value: "Take Profit", position: "top" }}
              />
            )}
            
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '12px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              }}
              labelStyle={{ color: '#E5E7EB' }}
              formatter={(value: number, name: string) => {
                if (name === 'Price' || name.includes('SMA') || name.includes('BB')) {
                  return [formatPrice(value, data.assetType), name];
                }
                return [value, name];
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Trading Levels */}
      {(entryPrice || stopLoss || takeProfit) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-900/40 rounded-lg">
          {entryPrice && (
            <div className="text-center">
              <p className="text-blue-400 text-sm font-medium">Entry Price</p>
              <p className="text-white text-lg">{formatPrice(entryPrice, data.assetType)}</p>
            </div>
          )}
          {stopLoss && (
            <div className="text-center">
              <p className="text-red-400 text-sm font-medium">Stop Loss</p>
              <p className="text-white text-lg">{formatPrice(stopLoss, data.assetType)}</p>
            </div>
          )}
          {takeProfit && (
            <div className="text-center">
              <p className="text-green-400 text-sm font-medium">Take Profit</p>
              <p className="text-white text-lg">{formatPrice(takeProfit, data.assetType)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};