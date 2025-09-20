# QuantumTrade Pro

A sophisticated multi-asset AI trading platform that provides real-time market data, advanced technical analysis, and AI-powered trading signals for cryptocurrencies, forex, indices, and commodities.

![QuantumTrade Pro](https://img.shields.io/badge/QuantumTrade-Pro-blue?style=for-the-badge&logo=chart-line)
![React](https://img.shields.io/badge/React-18.3.1-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue?style=flat-square&logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=flat-square&logo=node.js)

## 🚀 Features

### 📊 Multi-Asset Market Data
- **Cryptocurrencies**: BTC, ETH, ADA, SOL, DOT, LINK, AVAX, MATIC
- **Forex Pairs**: EUR/USD, GBP/USD, USD/JPY, AUD/USD, USD/CAD, NZD/USD, USD/CHF
- **Stock Indices**: US30, NAS100, SPX500, UK100, GER30, FRA40, JPN225
- **Commodities**: Gold (XAU/USD), Silver (XAG/USD), Oil, Natural Gas, Copper, Wheat

### 🧠 AI-Powered Trading Signals
- Real-time AI analysis using advanced technical indicators
- Smart entry, exit, and stop-loss recommendations
- Confidence scoring and risk/reward analysis
- Technical indicators: SMA, EMA, RSI, MACD, Bollinger Bands, Stochastic

### �� Advanced Charting
- Live price charts with real-time updates
- Technical analysis charts with multiple indicators
- Interactive price history visualization
- Responsive design for all screen sizes

### 🔄 Real-Time Updates
- WebSocket-based live data streaming
- 1-second update intervals for real-time accuracy
- Connection status monitoring
- Automatic reconnection handling

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Data visualization library
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **WebSocket** - Real-time communication
- **Axios** - HTTP client for API calls
- **CORS** - Cross-origin resource sharing

### APIs & Data Sources
- **CoinGecko API** - Cryptocurrency data
- **ExchangeRate-API** - Forex rates
- **Alpha Vantage** - Stock market data
- **Metals API** - Precious metals pricing

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/quantumtrade-pro.git
   cd quantumtrade-pro
   ```

2. **Install dependencies**
   ```bash
   cd project
   npm install
   ```

3. **Start the development server**
   ```bash
   # Terminal 1 - Start the backend server
   node server/index.js
   
   # Terminal 2 - Start the frontend development server
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - WebSocket: ws://localhost:5000

## 🚀 Available Scripts

```bash
# Development
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Server
node server/index.js # Start backend server
```

## �� Project Structure

```
project/
├── src/
│   ├── components/          # React components
│   │   ├── AISignals.tsx   # AI trading signals
│   │   ├── AdvancedChart.tsx # Technical analysis charts
│   │   ├── ConnectionStatus.tsx # WebSocket status
│   │   ├── MarketOverview.tsx  # Market data overview
│   │   └── PriceChart.tsx      # Live price charts
│   ├── hooks/
│   │   └── useWebSocket.ts     # WebSocket hook
│   ├── services/
│   │   └── api.ts              # API service layer
│   ├── types/
│   │   └── market.ts           # TypeScript type definitions
│   ├── App.tsx                 # Main application component
│   └── main.tsx                # Application entry point
├── server/
│   └── index.js                # Backend server
├── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the project root:

```env
# API Keys (Optional - fallback to mock data if not provided)
COINGECKO_API_KEY=your_coingecko_api_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
EXCHANGE_RATE_API_KEY=your_exchange_rate_api_key

# Server Configuration
PORT=5000
NODE_ENV=development
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/market/overview` | GET | Get all market data |
| `/api/market/:symbol` | GET | Get specific market data |
| `/api/ai/signals` | GET | Get AI trading signals |
| `/api/ai/analysis/:symbol` | GET | Get AI analysis for symbol |

## 🎯 Features in Detail

### Market Overview
- Real-time price updates for all asset classes
- 24h change percentages and volume data
- Market cap information for cryptocurrencies
- High/low prices for the last 24 hours

### AI Trading Signals
- **Signal Types**: BUY, SELL, HOLD
- **Confidence Scoring**: 0-100% confidence levels
- **Technical Analysis**: RSI, MACD, Bollinger Bands, Moving Averages
- **Risk Management**: Stop-loss and take-profit recommendations
- **Risk/Reward Ratio**: Calculated risk-to-reward ratios

### Live Charts
- Interactive price charts with historical data
- Real-time updates via WebSocket
- Responsive design for mobile and desktop
- Multiple chart types and timeframes

### Technical Analysis
- Advanced technical indicators
- Support and resistance levels
- Trend analysis and momentum indicators
- Volatility and volume analysis

## 🔒 Security Features

- CORS protection
- Input validation and sanitization
- Error handling and logging
- Rate limiting for API calls
- Secure WebSocket connections

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Deploy to Vercel/Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting platform
3. Configure environment variables

### Deploy Backend
- Deploy to Heroku, Railway, or any Node.js hosting platform
- Set environment variables
- Ensure WebSocket support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [CoinGecko](https://coingecko.com/) for cryptocurrency data
- [ExchangeRate-API](https://exchangerate-api.com/) for forex rates
- [Alpha Vantage](https://www.alphavantage.co/) for stock market data
- [Recharts](https://recharts.org/) for charting components
- [Lucide](https://lucide.dev/) for beautiful icons

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation
- Review the code comments

---

**Built with ❤️ using React, TypeScript, and Node.js** 
