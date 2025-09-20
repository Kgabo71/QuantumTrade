import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CryptoData } from '../types/market';
import { format } from 'date-fns';

interface PriceChartProps {
  data: CryptoData;
}

export const PriceChart: React.FC<PriceChartProps> = ({ data }) => {
  const chartData = data.priceHistory
    .slice()
    .reverse()
    .map((point, index) => ({
      time: format(new Date(point.timestamp), 'HH:mm:ss'),
      price: point.price,
      index
    }));

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
          <h3 className="text-lg font-semibold text-white">{data.symbol} Price Chart</h3>
          <p className="text-gray-400 text-sm">{getAssetTypeLabel(data.assetType)} • Live price movement</p>
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
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
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
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '12px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              }}
              labelStyle={{ color: '#E5E7EB' }}
              itemStyle={{ color: isPositiveChange ? '#10B981' : '#EF4444' }}
              formatter={(value: number) => [formatPrice(value, data.assetType), 'Price']}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke={isPositiveChange ? '#10B981' : '#EF4444'}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: isPositiveChange ? '#10B981' : '#EF4444' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};