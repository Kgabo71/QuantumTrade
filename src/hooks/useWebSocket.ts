import { useState, useEffect, useRef } from 'react';
import { CryptoData, MarketUpdate } from '../types/market';

export const useWebSocket = (url: string) => {
  const [marketData, setMarketData] = useState<Record<string, CryptoData>>({});
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connect = () => {
      setConnectionStatus('connecting');
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        setConnectionStatus('connected');
        console.log('WebSocket connected');
      };

      ws.current.onmessage = (event) => {
        try {
          const message: MarketUpdate = JSON.parse(event.data);
          if (message.type === 'marketUpdate') {
            setMarketData(message.data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = () => {
        setConnectionStatus('disconnected');
        console.log('WebSocket disconnected');
        // Attempt to reconnect after 3 seconds
        setTimeout(connect, 3000);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('disconnected');
      };
    };

    connect();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url]);

  return { marketData, connectionStatus };
};