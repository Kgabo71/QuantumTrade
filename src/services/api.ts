import axios from 'axios';
import { AISignal } from '../types/market';

const API_BASE = 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE,
});

export const marketAPI = {
  getOverview: () => api.get('/market/overview'),
  getSymbol: (symbol: string) => api.get(`/market/${symbol}`),
  getAIAnalysis: (symbol: string) => api.get<{success: boolean; analysis: AISignal}>(`/ai/analysis/${symbol}`),
  getAllSignals: () => api.get<{success: boolean; signals: AISignal[]}>('/ai/signals'),
};