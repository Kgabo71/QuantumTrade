import React from 'react';
import { Wifi, WifiOff, Clock } from 'lucide-react';

interface ConnectionStatusProps {
  status: 'connecting' | 'connected' | 'disconnected';
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: <Wifi className="w-4 h-4" />,
          text: 'Connected',
          color: 'text-green-400 bg-green-400/10 border-green-400/20'
        };
      case 'connecting':
        return {
          icon: <Clock className="w-4 h-4 animate-spin" />,
          text: 'Connecting',
          color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
        };
      default:
        return {
          icon: <WifiOff className="w-4 h-4" />,
          text: 'Disconnected',
          color: 'text-red-400 bg-red-400/10 border-red-400/20'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${config.color}`}>
      {config.icon}
      <span className="text-sm font-medium">{config.text}</span>
    </div>
  );
};