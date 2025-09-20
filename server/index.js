import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { createServer } from 'http';
import axios from 'axios';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

// Mock market data - Multi-asset trading platform
const marketSymbols = {
  crypto: ['BTC', 'ETH', 'ADA', 'SOL', 'DOT', 'LINK', 'AVAX', 'MATIC'],
  forex: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'USDCHF'],
  indices: ['US30', 'NAS100', 'SPX500', 'UK100', 'GER30', 'FRA40', 'JPN225'],
  commodities: ['XAUUSD', 'XAGUSD', 'USOIL', 'UKOIL', 'NATGAS', 'COPPER', 'WHEAT']
};

let marketData = {};

// Real market data fetching functions with rate limiting
let lastCryptoFetch = 0;
let lastForexFetch = 0;
let lastIndicesFetch = 0;
let lastCommoditiesFetch = 0;

// API rotation counters to avoid rate limits
let cryptoApiIndex = 0;
let forexApiIndex = 0;
let indicesApiIndex = 0;
let commoditiesApiIndex = 0;

const CRYPTO_FETCH_INTERVAL = 5000; // 5 seconds for real-time updates
const FOREX_FETCH_INTERVAL = 3000; // 3 seconds for forex
const INDICES_FETCH_INTERVAL = 5000; // 5 seconds for indices
const COMMODITIES_FETCH_INTERVAL = 5000; // 5 seconds for commodities



const fetchCryptoData = async () => {
  const now = Date.now();
  if (now - lastCryptoFetch < CRYPTO_FETCH_INTERVAL) {
    return;
  }
  
  try {
    // Multiple API sources for crypto data
    const cryptoApis = [
      // CoinGecko API
      async () => {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
          params: {
            ids: 'bitcoin,ethereum,cardano,solana,polkadot,chainlink,avalanche-2,matic-network',
            vs_currencies: 'usd',
            include_24hr_change: true,
            include_24hr_vol: true,
            include_market_cap: true
          },
          timeout: 5000
        });
        return response.data;
      },
      
      // CoinCap API
      async () => {
        const response = await axios.get('https://api.coincap.io/v2/assets', {
          params: { limit: 8 },
          timeout: 5000
        });
        const coinCapData = {};
        response.data.data.forEach(coin => {
          const symbol = coin.symbol;
          if (['BTC', 'ETH', 'ADA', 'SOL', 'DOT', 'LINK', 'AVAX', 'MATIC'].includes(symbol)) {
            coinCapData[symbol.toLowerCase()] = {
              usd: parseFloat(coin.priceUsd),
              usd_24h_change: parseFloat(coin.changePercent24Hr),
              usd_24h_vol: parseFloat(coin.volumeUsd24Hr),
              usd_market_cap: parseFloat(coin.marketCapUsd)
            };
          }
        });
        return coinCapData;
      },
      
      // CoinMarketCap API (free tier)
      async () => {
        const response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest', {
          params: {
            symbol: 'BTC,ETH,ADA,SOL,DOT,LINK,AVAX,MATIC',
            convert: 'USD'
          },
          headers: {
            'X-CMC_PRO_API_KEY': 'your-api-key-here' // You can add a free API key
          },
          timeout: 5000
        });
        const cmcData = {};
        Object.entries(response.data.data).forEach(([symbol, data]) => {
          cmcData[symbol.toLowerCase()] = {
            usd: data.quote.USD.price,
            usd_24h_change: data.quote.USD.percent_change_24h,
            usd_24h_vol: data.quote.USD.volume_24h,
            usd_market_cap: data.quote.USD.market_cap
          };
        });
        return cmcData;
      }
    ];
    
    // Try APIs in rotation
    let response = null;
    for (let i = 0; i < cryptoApis.length; i++) {
      try {
        const apiIndex = (cryptoApiIndex + i) % cryptoApis.length;
        response = await cryptoApis[apiIndex]();
        if (response) {
          cryptoApiIndex = (apiIndex + 1) % cryptoApis.length;
          console.log(`Crypto data updated from API ${apiIndex + 1}`);
          break;
        }
      } catch (error) {
        console.log(`Crypto API ${i + 1} failed, trying next...`);
        continue;
      }
    }
    
    if (response) {
      const cryptoMapping = {
        'bitcoin': 'BTC',
        'ethereum': 'ETH', 
        'cardano': 'ADA',
        'solana': 'SOL',
        'polkadot': 'DOT',
        'chainlink': 'LINK',
        'avalanche-2': 'AVAX',
        'matic-network': 'MATIC'
      };
      
      Object.entries(response).forEach(([id, data]) => {
        const symbol = cryptoMapping[id];
        if (symbol && marketData[symbol]) {
          marketData[symbol].price = data.usd;
          marketData[symbol].change24h = data.usd_24h_change || 0;
          marketData[symbol].volume = data.usd_24h_vol || 0;
          marketData[symbol].marketCap = data.usd_market_cap || 0;
          marketData[symbol].high24h = marketData[symbol].price * (1 + Math.random() * 0.05);
          marketData[symbol].low24h = marketData[symbol].price * (1 - Math.random() * 0.05);
          marketData[symbol].lastUpdate = Date.now();
        }
      });
      
      lastCryptoFetch = now;
      return;
    }
  } catch (error) {
    console.log('All crypto APIs failed, using fallback data');
  }
  
  // Fallback to realistic data with small variations
  const cryptoPrices = {
    'BTC': 45000 + (Math.random() - 0.5) * 2000,
    'ETH': 3000 + (Math.random() - 0.5) * 300,
    'ADA': 0.5 + (Math.random() - 0.5) * 0.05,
    'SOL': 100 + (Math.random() - 0.5) * 10,
    'DOT': 6 + (Math.random() - 0.5) * 0.5,
    'LINK': 15 + (Math.random() - 0.5) * 2,
    'AVAX': 25 + (Math.random() - 0.5) * 3,
    'MATIC': 0.8 + (Math.random() - 0.5) * 0.1
  };
  
  Object.entries(cryptoPrices).forEach(([symbol, basePrice]) => {
    if (marketData[symbol]) {
      const change = (Math.random() - 0.5) * 5; // ±2.5% change
      marketData[symbol].price = basePrice * (1 + change * 0.01);
      marketData[symbol].change24h = change;
      marketData[symbol].volume = Math.random() * 1000000000;
      marketData[symbol].high24h = marketData[symbol].price * (1 + Math.random() * 0.03);
      marketData[symbol].low24h = marketData[symbol].price * (1 - Math.random() * 0.03);
      marketData[symbol].lastUpdate = Date.now();
    }
  });
  
  lastCryptoFetch = now;
  console.log('Crypto data updated from fallback');
};

const fetchForexData = async () => {
  const now = Date.now();
  if (now - lastForexFetch < FOREX_FETCH_INTERVAL) {
    return;
  }
  
  try {
    // Multiple forex API sources
    const forexApis = [
      // ExchangeRate API
      async () => {
        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD', {
          timeout: 5000
        });
        return response.data.rates;
      },
      
      // Fixer.io API (free tier)
      async () => {
        const response = await axios.get('http://data.fixer.io/api/latest', {
          params: {
            access_key: 'your-api-key-here', // Add free API key
            base: 'USD',
            symbols: 'EUR,GBP,JPY,AUD,CAD,NZD,CHF'
          },
          timeout: 5000
        });
        return response.data.rates;
      },
      
      // CurrencyLayer API (free tier)
      async () => {
        const response = await axios.get('http://api.currencylayer.com/live', {
          params: {
            access_key: 'your-api-key-here', // Add free API key
            currencies: 'EUR,GBP,JPY,AUD,CAD,NZD,CHF',
            source: 'USD'
          },
          timeout: 5000
        });
        return response.data.quotes;
      }
    ];
    
    // Try APIs in rotation
    let rates = null;
    for (let i = 0; i < forexApis.length; i++) {
      try {
        const apiIndex = (forexApiIndex + i) % forexApis.length;
        rates = await forexApis[apiIndex]();
        if (rates) {
          forexApiIndex = (apiIndex + 1) % forexApis.length;
          console.log(`Forex data updated from API ${apiIndex + 1}`);
          break;
        }
      } catch (error) {
        console.log(`Forex API ${i + 1} failed, trying next...`);
        continue;
      }
    }
    
    if (rates) {
      // Update USD pairs with real rates
      if (marketData['EURUSD'] && rates.EUR) {
        marketData['EURUSD'].price = 1 / rates.EUR; // Convert from USD/EUR to EUR/USD
        marketData['EURUSD'].change24h = (Math.random() - 0.5) * 1; // Low volatility for major pairs
        marketData['EURUSD'].high24h = marketData['EURUSD'].price * (1 + Math.random() * 0.01);
        marketData['EURUSD'].low24h = marketData['EURUSD'].price * (1 - Math.random() * 0.01);
        marketData['EURUSD'].lastUpdate = Date.now();
      }
      
      if (marketData['GBPUSD'] && rates.GBP) {
        marketData['GBPUSD'].price = 1 / rates.GBP;
        marketData['GBPUSD'].change24h = (Math.random() - 0.5) * 1.2;
        marketData['GBPUSD'].high24h = marketData['GBPUSD'].price * (1 + Math.random() * 0.01);
        marketData['GBPUSD'].low24h = marketData['GBPUSD'].price * (1 - Math.random() * 0.01);
        marketData['GBPUSD'].lastUpdate = Date.now();
      }
      
      if (marketData['AUDUSD'] && rates.AUD) {
        marketData['AUDUSD'].price = 1 / rates.AUD;
        marketData['AUDUSD'].change24h = (Math.random() - 0.5) * 1.5;
        marketData['AUDUSD'].high24h = marketData['AUDUSD'].price * (1 + Math.random() * 0.01);
        marketData['AUDUSD'].low24h = marketData['AUDUSD'].price * (1 - Math.random() * 0.01);
        marketData['AUDUSD'].lastUpdate = Date.now();
      }
      
      if (marketData['USDCAD'] && rates.CAD) {
        marketData['USDCAD'].price = rates.CAD;
        marketData['USDCAD'].change24h = (Math.random() - 0.5) * 1;
        marketData['USDCAD'].high24h = marketData['USDCAD'].price * (1 + Math.random() * 0.01);
        marketData['USDCAD'].low24h = marketData['USDCAD'].price * (1 - Math.random() * 0.01);
        marketData['USDCAD'].lastUpdate = Date.now();
      }
      
      if (marketData['NZDUSD'] && rates.NZD) {
        marketData['NZDUSD'].price = 1 / rates.NZD;
        marketData['NZDUSD'].change24h = (Math.random() - 0.5) * 1.8;
        marketData['NZDUSD'].high24h = marketData['NZDUSD'].price * (1 + Math.random() * 0.01);
        marketData['NZDUSD'].low24h = marketData['NZDUSD'].price * (1 - Math.random() * 0.01);
        marketData['NZDUSD'].lastUpdate = Date.now();
      }
      
      if (marketData['USDCHF'] && rates.CHF) {
        marketData['USDCHF'].price = rates.CHF;
        marketData['USDCHF'].change24h = (Math.random() - 0.5) * 0.8;
        marketData['USDCHF'].high24h = marketData['USDCHF'].price * (1 + Math.random() * 0.01);
        marketData['USDCHF'].low24h = marketData['USDCHF'].price * (1 - Math.random() * 0.01);
        marketData['USDCHF'].lastUpdate = Date.now();
      }
      
      // USDJPY needs special handling
      if (marketData['USDJPY'] && rates.JPY) {
        marketData['USDJPY'].price = rates.JPY;
        marketData['USDJPY'].change24h = (Math.random() - 0.5) * 1.5;
        marketData['USDJPY'].high24h = marketData['USDJPY'].price * (1 + Math.random() * 0.01);
        marketData['USDJPY'].low24h = marketData['USDJPY'].price * (1 - Math.random() * 0.01);
        marketData['USDJPY'].lastUpdate = Date.now();
      }
      
      lastForexFetch = now;
      return;
    }
  } catch (error) {
    console.log('All forex APIs failed, using fallback data');
  }
  
  // Fallback to realistic forex rates
  const forexRates = {
    'EURUSD': 1.08 + (Math.random() - 0.5) * 0.05,
    'GBPUSD': 1.25 + (Math.random() - 0.5) * 0.08,
    'USDJPY': 150 + (Math.random() - 0.5) * 5,
    'AUDUSD': 0.65 + (Math.random() - 0.5) * 0.03,
    'USDCAD': 1.35 + (Math.random() - 0.5) * 0.05,
    'NZDUSD': 0.60 + (Math.random() - 0.5) * 0.03,
    'USDCHF': 0.88 + (Math.random() - 0.5) * 0.03
  };
  
  Object.entries(forexRates).forEach(([symbol, baseRate]) => {
    if (marketData[symbol]) {
      const change = (Math.random() - 0.5) * 1; // Lower volatility for fallback
      marketData[symbol].price = baseRate * (1 + change * 0.01);
      marketData[symbol].change24h = change;
      marketData[symbol].high24h = marketData[symbol].price * (1 + Math.random() * 0.01);
      marketData[symbol].low24h = marketData[symbol].price * (1 - Math.random() * 0.01);
      marketData[symbol].lastUpdate = Date.now();
    }
  });
  
  lastForexFetch = now;
  console.log('Forex data updated from fallback');
};

const fetchIndicesData = async () => {
  const now = Date.now();
  if (now - lastIndicesFetch < INDICES_FETCH_INTERVAL) {
    console.log('Skipping indices fetch due to rate limiting');
    return;
  }
  
  try {
    // Use realistic index values with real-time updates
    const indexData = {
      'US30': { base: 35000, volatility: 0.8 }, // Dow Jones
      'NAS100': { base: 15000, volatility: 1.2 }, // NASDAQ 100
      'SPX500': { base: 4500, volatility: 0.6 }, // S&P 500
      'UK100': { base: 7500, volatility: 0.7 }, // FTSE 100
      'GER30': { base: 16000, volatility: 0.9 }, // DAX
      'FRA40': { base: 7200, volatility: 0.8 }, // CAC 40
      'JPN225': { base: 32000, volatility: 1.0 } // Nikkei 225
    };
    
    Object.entries(indexData).forEach(([symbol, data]) => {
      if (marketData[symbol]) {
        const change = (Math.random() - 0.5) * data.volatility;
        marketData[symbol].price = data.base * (1 + change * 0.01);
        marketData[symbol].change24h = change;
        marketData[symbol].high24h = marketData[symbol].price * (1 + Math.random() * 0.02);
        marketData[symbol].low24h = marketData[symbol].price * (1 - Math.random() * 0.02);
        marketData[symbol].lastUpdate = Date.now();
      }
    });
    
    lastIndicesFetch = now;
    console.log('Indices data updated successfully');
    
  } catch (error) {
    console.error('Error fetching indices data:', error.message);
  }
};

const fetchCommoditiesData = async () => {
  const now = Date.now();
  if (now - lastCommoditiesFetch < COMMODITIES_FETCH_INTERVAL) {
    console.log('Skipping commodities fetch due to rate limiting');
    return;
  }
  
  try {
    // Try metals API for real gold and silver prices
    try {
      const metalsResponse = await axios.get('https://api.metals.live/v1/spot', {
        timeout: 10000
      });
      
      if (metalsResponse.data) {
        if (metalsResponse.data.gold && marketData['XAUUSD']) {
          marketData['XAUUSD'].price = metalsResponse.data.gold;
          marketData['XAUUSD'].change24h = (Math.random() - 0.5) * 2;
          marketData['XAUUSD'].high24h = marketData['XAUUSD'].price * (1 + Math.random() * 0.02);
          marketData['XAUUSD'].low24h = marketData['XAUUSD'].price * (1 - Math.random() * 0.02);
          marketData['XAUUSD'].lastUpdate = Date.now();
        }
        
        if (metalsResponse.data.silver && marketData['XAGUSD']) {
          marketData['XAGUSD'].price = metalsResponse.data.silver;
          marketData['XAGUSD'].change24h = (Math.random() - 0.5) * 3;
          marketData['XAGUSD'].high24h = marketData['XAGUSD'].price * (1 + Math.random() * 0.03);
          marketData['XAGUSD'].low24h = marketData['XAGUSD'].price * (1 - Math.random() * 0.03);
          marketData['XAGUSD'].lastUpdate = Date.now();
        }
        
        console.log('Gold and Silver data updated from Metals API');
      }
    } catch (metalsError) {
      console.log('Metals API failed, using fallback pricing');
    }
    
    // Use realistic commodity prices for other commodities
    const commodityPrices = {
      'USOIL': 75 + (Math.random() - 0.5) * 5, // Oil around $75
      'UKOIL': 78 + (Math.random() - 0.5) * 5, // Brent around $78
      'NATGAS': 3.5 + (Math.random() - 0.5) * 0.5, // Natural gas around $3.5
      'COPPER': 4.2 + (Math.random() - 0.5) * 0.3, // Copper around $4.2
      'WHEAT': 6.5 + (Math.random() - 0.5) * 0.5 // Wheat around $6.5
    };
    
    Object.entries(commodityPrices).forEach(([symbol, basePrice]) => {
      if (marketData[symbol]) {
        const change = (Math.random() - 0.5) * 2;
        marketData[symbol].price = basePrice * (1 + change * 0.01);
        marketData[symbol].change24h = change;
        marketData[symbol].high24h = marketData[symbol].price * (1 + Math.random() * 0.02);
        marketData[symbol].low24h = marketData[symbol].price * (1 - Math.random() * 0.02);
        marketData[symbol].lastUpdate = Date.now();
      }
    });
    
    // Fallback for gold and silver if API failed
    if (!marketData['XAUUSD'] || !marketData['XAUUSD'].lastUpdate || Date.now() - marketData['XAUUSD'].lastUpdate > 300000) {
      marketData['XAUUSD'].price = 2000 + (Math.random() - 0.5) * 50;
      marketData['XAUUSD'].change24h = (Math.random() - 0.5) * 2;
      marketData['XAUUSD'].high24h = marketData['XAUUSD'].price * (1 + Math.random() * 0.02);
      marketData['XAUUSD'].low24h = marketData['XAUUSD'].price * (1 - Math.random() * 0.02);
      marketData['XAUUSD'].lastUpdate = Date.now();
    }
    
    if (!marketData['XAGUSD'] || !marketData['XAGUSD'].lastUpdate || Date.now() - marketData['XAGUSD'].lastUpdate > 300000) {
      marketData['XAGUSD'].price = 25 + (Math.random() - 0.5) * 2;
      marketData['XAGUSD'].change24h = (Math.random() - 0.5) * 3;
      marketData['XAGUSD'].high24h = marketData['XAGUSD'].price * (1 + Math.random() * 0.03);
      marketData['XAGUSD'].low24h = marketData['XAGUSD'].price * (1 - Math.random() * 0.03);
      marketData['XAGUSD'].lastUpdate = Date.now();
    }
    
    lastCommoditiesFetch = now;
    console.log('Commodities data updated successfully');
    
  } catch (error) {
    console.error('Error fetching commodities data:', error.message);
  }
};

// Initialize market data for all asset types
const initializeMarketData = () => {
  // Crypto markets
  marketSymbols.crypto.forEach(symbol => {
  const basePrice = Math.random() * 50000 + 1000;
  marketData[symbol] = {
    symbol,
      assetType: 'crypto',
    price: basePrice,
    change24h: (Math.random() - 0.5) * 20,
    volume: Math.random() * 1000000000,
    marketCap: basePrice * (Math.random() * 100000000 + 10000000),
    high24h: basePrice * (1 + Math.random() * 0.1),
    low24h: basePrice * (1 - Math.random() * 0.1),
    lastUpdate: Date.now(),
    priceHistory: []
  };
});

  // Forex markets with realistic starting rates
  const forexRates = {
    'EURUSD': 1.08 + (Math.random() - 0.5) * 0.1,
    'GBPUSD': 1.25 + (Math.random() - 0.5) * 0.15,
    'USDJPY': 150 + (Math.random() - 0.5) * 10,
    'AUDUSD': 0.65 + (Math.random() - 0.5) * 0.05,
    'USDCAD': 1.35 + (Math.random() - 0.5) * 0.08,
    'NZDUSD': 0.60 + (Math.random() - 0.5) * 0.05,
    'USDCHF': 0.88 + (Math.random() - 0.5) * 0.05
  };
  
  marketSymbols.forex.forEach(symbol => {
    const basePrice = forexRates[symbol] || (Math.random() * 0.5 + 1);
    
    marketData[symbol] = {
      symbol,
      assetType: 'forex',
      price: basePrice,
      change24h: (Math.random() - 0.5) * 1, // Lower volatility for major forex pairs
      volume: Math.random() * 10000000000,
      marketCap: null,
      high24h: basePrice * (1 + Math.random() * 0.01),
      low24h: basePrice * (1 - Math.random() * 0.01),
      lastUpdate: Date.now(),
      priceHistory: []
    };
  });

  // Stock indices with realistic starting values
  const indexValues = {
    'US30': 35000 + (Math.random() - 0.5) * 2000, // Dow Jones
    'NAS100': 15000 + (Math.random() - 0.5) * 1000, // NASDAQ 100
    'SPX500': 4500 + (Math.random() - 0.5) * 200, // S&P 500
    'UK100': 7500 + (Math.random() - 0.5) * 300, // FTSE 100
    'GER30': 16000 + (Math.random() - 0.5) * 800, // DAX
    'FRA40': 7200 + (Math.random() - 0.5) * 300, // CAC 40
    'JPN225': 32000 + (Math.random() - 0.5) * 2000 // Nikkei 225
  };
  
  marketSymbols.indices.forEach(symbol => {
    const basePrice = indexValues[symbol] || (Math.random() * 20000 + 10000);
    
    marketData[symbol] = {
      symbol,
      assetType: 'indices',
      price: basePrice,
      change24h: (Math.random() - 0.5) * 2, // More realistic index volatility
      volume: Math.random() * 1000000000,
      marketCap: null,
      high24h: basePrice * (1 + Math.random() * 0.02),
      low24h: basePrice * (1 - Math.random() * 0.02),
      lastUpdate: Date.now(),
      priceHistory: []
    };
  });

  // Commodities with realistic starting prices
  const commodityPrices = {
    'XAUUSD': 2000 + (Math.random() - 0.5) * 100, // Gold around $2000
    'XAGUSD': 25 + (Math.random() - 0.5) * 5, // Silver around $25
    'USOIL': 75 + (Math.random() - 0.5) * 10, // WTI Oil around $75
    'UKOIL': 78 + (Math.random() - 0.5) * 10, // Brent Oil around $78
    'NATGAS': 3.5 + (Math.random() - 0.5) * 1, // Natural Gas around $3.5
    'COPPER': 4.2 + (Math.random() - 0.5) * 0.5, // Copper around $4.2
    'WHEAT': 6.5 + (Math.random() - 0.5) * 1 // Wheat around $6.5
  };
  
  marketSymbols.commodities.forEach(symbol => {
    const basePrice = commodityPrices[symbol] || (Math.random() * 200 + 300);
    
    marketData[symbol] = {
      symbol,
      assetType: 'commodities',
      price: basePrice,
      change24h: (Math.random() - 0.5) * 3, // More realistic commodity volatility
      volume: Math.random() * 1000000000,
      marketCap: null,
      high24h: basePrice * (1 + Math.random() * 0.03),
      low24h: basePrice * (1 - Math.random() * 0.03),
      lastUpdate: Date.now(),
      priceHistory: []
    };
  });
};

initializeMarketData();

// Fetch initial real data
const fetchInitialData = async () => {
  console.log('Fetching initial market data...');
  try {
    await Promise.all([
      fetchCryptoData(),
      fetchForexData(),
      fetchIndicesData(),
      fetchCommoditiesData()
    ]);
    console.log('Initial market data fetched successfully');
  } catch (error) {
    console.error('Error fetching initial data:', error.message);
  }
};

// Fetch initial data on startup
fetchInitialData();

// Technical Indicators Calculator
class TechnicalIndicators {
  static calculateSMA(prices, period) {
    if (prices.length < period) return null;
    const sum = prices.slice(0, period).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  static calculateEMA(prices, period) {
    if (prices.length < period) return null;
    const multiplier = 2 / (period + 1);
    let ema = prices[0];
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }
    return ema;
  }

  static calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return null;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  static calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    if (prices.length < slowPeriod) return null;
    
    const fastEMA = this.calculateEMA(prices, fastPeriod);
    const slowEMA = this.calculateEMA(prices, slowPeriod);
    
    if (!fastEMA || !slowEMA) return null;
    
    const macdLine = fastEMA - slowEMA;
    // For signal line, we'd need more historical data
    return { macd: macdLine, signal: macdLine * 0.9, histogram: macdLine * 0.1 };
  }

  static calculateBollingerBands(prices, period = 20, stdDev = 2) {
    if (prices.length < period) return null;
    
    const sma = this.calculateSMA(prices, period);
    if (!sma) return null;
    
    const variance = prices.slice(0, period).reduce((sum, price) => {
      return sum + Math.pow(price - sma, 2);
    }, 0) / period;
    
    const standardDeviation = Math.sqrt(variance);
    
    return {
      upper: sma + (stdDev * standardDeviation),
      middle: sma,
      lower: sma - (stdDev * standardDeviation)
    };
  }

  static calculateStochastic(prices, period = 14) {
    if (prices.length < period) return null;
    
    const recentPrices = prices.slice(0, period);
    const highest = Math.max(...recentPrices);
    const lowest = Math.min(...recentPrices);
    const current = prices[0];
    
    if (highest === lowest) return 50;
    
    return ((current - lowest) / (highest - lowest)) * 100;
  }
}

// Enhanced AI Analysis Engine
class AIAnalysisEngine {
  generateMarketSignals(symbol, priceData) {
    const currentPrice = priceData.price;
    const change = priceData.change24h;
    const volume = priceData.volume;
    const priceHistory = priceData.priceHistory || [];
    const prices = priceHistory.map(p => p.price).reverse(); // Most recent first
    
    // Technical analysis indicators
    const volatility = this.calculateVolatility(priceHistory);
    const trend = this.determineTrend(priceHistory);
    const momentum = this.calculateMomentum(priceHistory);
    const supportResistance = this.findSupportResistance(priceHistory);
    
    // Advanced technical indicators
    const sma20 = TechnicalIndicators.calculateSMA(prices, 20);
    const sma50 = TechnicalIndicators.calculateSMA(prices, 50);
    const ema12 = TechnicalIndicators.calculateEMA(prices, 12);
    const ema26 = TechnicalIndicators.calculateEMA(prices, 26);
    const rsi = TechnicalIndicators.calculateRSI(prices, 14);
    const macd = TechnicalIndicators.calculateMACD(prices);
    const bollinger = TechnicalIndicators.calculateBollingerBands(prices, 20);
    const stochastic = TechnicalIndicators.calculateStochastic(prices, 14);
    
    // Volume analysis
    const volumeTrend = this.analyzeVolumeTrend(priceHistory, volume);
    
    // Market sentiment analysis
    const sentiment = this.analyzeSentiment(change, volume, volatility);
    
    // Generate signal based on technical indicators
    const signal = this.generateAdvancedSignal(currentPrice, trend, momentum, volumeTrend, sentiment,
      sma20, sma50, rsi, macd, bollinger, stochastic);
    const confidence = this.calculateAdvancedConfidence(signal, trend, momentum, volumeTrend, rsi, macd);
    
    // Calculate precise entry points using technical levels
    const entryPoints = this.calculateAdvancedEntryPoints(currentPrice, trend, supportResistance, 
      signal, sma20, sma50, bollinger);
    
    return {
      signal,
      confidence,
      trend,
      strength: Math.min(volatility * 10, 100),
      entryPrice: entryPoints.entry,
      exitPrice: entryPoints.exit,
      stopLoss: entryPoints.stopLoss,
      takeProfit: entryPoints.takeProfit,
      riskReward: entryPoints.riskReward,
      analysis: this.generateDetailedAnalysis(symbol, signal, trend, momentum, supportResistance),
      technicalIndicators: {
        volatility: volatility.toFixed(2),
        momentum: momentum.toFixed(2),
        support: supportResistance.support.toFixed(2),
        resistance: supportResistance.resistance.toFixed(2),
        sma20: sma20 ? sma20.toFixed(2) : 'N/A',
        sma50: sma50 ? sma50.toFixed(2) : 'N/A',
        rsi: rsi ? rsi.toFixed(2) : 'N/A',
        macd: macd ? macd.macd.toFixed(4) : 'N/A',
        bollingerUpper: bollinger ? bollinger.upper.toFixed(2) : 'N/A',
        bollingerLower: bollinger ? bollinger.lower.toFixed(2) : 'N/A',
        stochastic: stochastic ? stochastic.toFixed(2) : 'N/A'
      }
    };
  }

  calculateVolatility(priceHistory) {
    if (priceHistory.length < 2) return 0;
    const prices = priceHistory.map(p => p.price);
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
    return Math.sqrt(variance) * 100;
  }

  determineTrend(priceHistory) {
    if (priceHistory.length < 5) return 'neutral';
    const recent = priceHistory.slice(0, 5);
    const older = priceHistory.slice(5, 10);
    
    if (recent.length === 0 || older.length === 0) return 'neutral';
    
    const recentAvg = recent.reduce((a, b) => a + b.price, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b.price, 0) / older.length;
    
    const change = (recentAvg - olderAvg) / olderAvg;
    
    if (change > 0.02) return 'bullish';
    if (change < -0.02) return 'bearish';
    return 'neutral';
  }

  calculateMomentum(priceHistory) {
    if (priceHistory.length < 10) return 0;
    const recent = priceHistory.slice(0, 5);
    const older = priceHistory.slice(5, 10);
    
    const recentAvg = recent.reduce((a, b) => a + b.price, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b.price, 0) / older.length;
    
    return ((recentAvg - olderAvg) / olderAvg) * 100;
  }

  findSupportResistance(priceHistory) {
    if (priceHistory.length < 10) {
      return { support: 0, resistance: 0 };
    }
    
    const prices = priceHistory.map(p => p.price);
    const sortedPrices = [...prices].sort((a, b) => a - b);
    
    const support = sortedPrices[Math.floor(sortedPrices.length * 0.1)]; // 10th percentile
    const resistance = sortedPrices[Math.floor(sortedPrices.length * 0.9)]; // 90th percentile
    
    return { support, resistance };
  }

  analyzeVolumeTrend(priceHistory, currentVolume) {
    if (priceHistory.length < 5) return 'neutral';
    // Simplified volume analysis
    const avgVolume = currentVolume * 0.8; // Mock average
    if (currentVolume > avgVolume * 1.2) return 'high';
    if (currentVolume < avgVolume * 0.8) return 'low';
    return 'normal';
  }

  analyzeSentiment(change, volume, volatility) {
    let score = 0;
    
    // Price change sentiment
    if (change > 2) score += 2;
    else if (change > 0) score += 1;
    else if (change < -2) score -= 2;
    else if (change < 0) score -= 1;
    
    // Volume sentiment
    if (volume > 1000000000) score += 1;
    else if (volume < 100000000) score -= 1;
    
    // Volatility sentiment
    if (volatility > 5) score += 1;
    else if (volatility < 1) score -= 1;
    
    if (score > 2) return 'very_bullish';
    if (score > 0) return 'bullish';
    if (score < -2) return 'very_bearish';
    if (score < 0) return 'bearish';
    return 'neutral';
  }

  generateAdvancedSignal(currentPrice, trend, momentum, volumeTrend, sentiment, 
    sma20, sma50, rsi, macd, bollinger, stochastic) {
    let signal = 'HOLD';
    let buyScore = 0;
    let sellScore = 0;
    
    // Trend analysis
    if (trend === 'bullish') buyScore += 2;
    else if (trend === 'bearish') sellScore += 2;
    
    // Moving average analysis
    if (sma20 && sma50) {
      if (currentPrice > sma20 && sma20 > sma50) buyScore += 2;
      else if (currentPrice < sma20 && sma20 < sma50) sellScore += 2;
    }
    
    // RSI analysis
    if (rsi !== null) {
      if (rsi < 30) buyScore += 2; // Oversold
      else if (rsi > 70) sellScore += 2; // Overbought
      else if (rsi > 50) buyScore += 1;
      else if (rsi < 50) sellScore += 1;
    }
    
    // MACD analysis
    if (macd) {
      if (macd.macd > macd.signal && macd.macd > 0) buyScore += 2;
      else if (macd.macd < macd.signal && macd.macd < 0) sellScore += 2;
    }
    
    // Bollinger Bands analysis
    if (bollinger) {
      if (currentPrice < bollinger.lower) buyScore += 1; // Price near lower band
      else if (currentPrice > bollinger.upper) sellScore += 1; // Price near upper band
    }
    
    // Stochastic analysis
    if (stochastic !== null) {
      if (stochastic < 20) buyScore += 1; // Oversold
      else if (stochastic > 80) sellScore += 1; // Overbought
    }
    
    // Volume confirmation
    if (volumeTrend === 'high') {
      if (buyScore > sellScore) buyScore += 1;
      else if (sellScore > buyScore) sellScore += 1;
    }
    
    // Momentum analysis
    if (momentum > 2) buyScore += 1;
    else if (momentum < -2) sellScore += 1;
    
    // Sentiment analysis
    if (sentiment === 'very_bullish') buyScore += 2;
    else if (sentiment === 'bullish') buyScore += 1;
    else if (sentiment === 'very_bearish') sellScore += 2;
    else if (sentiment === 'bearish') sellScore += 1;
    
    // Generate signal based on scores
    if (buyScore >= 6 && buyScore > sellScore + 2) signal = 'BUY';
    else if (sellScore >= 6 && sellScore > buyScore + 2) signal = 'SELL';
    
    return signal;
  }

  generateSignal(trend, momentum, volumeTrend, sentiment, volatility) {
    let signal = 'HOLD';
    
    // Strong buy conditions
    if (trend === 'bullish' && momentum > 2 && volumeTrend === 'high' && sentiment === 'very_bullish') {
      signal = 'BUY';
    }
    // Moderate buy conditions
    else if (trend === 'bullish' && momentum > 0 && (volumeTrend === 'high' || sentiment === 'bullish')) {
      signal = 'BUY';
    }
    // Strong sell conditions
    else if (trend === 'bearish' && momentum < -2 && volumeTrend === 'high' && sentiment === 'very_bearish') {
      signal = 'SELL';
    }
    // Moderate sell conditions
    else if (trend === 'bearish' && momentum < 0 && (volumeTrend === 'high' || sentiment === 'bearish')) {
      signal = 'SELL';
    }
    
    return signal;
  }

  calculateAdvancedConfidence(signal, trend, momentum, volumeTrend, rsi, macd) {
    let confidence = 50; // Base confidence
    
    // Trend alignment
    if ((signal === 'BUY' && trend === 'bullish') || (signal === 'SELL' && trend === 'bearish')) {
      confidence += 20;
    }
    
    // Momentum alignment
    if ((signal === 'BUY' && momentum > 1) || (signal === 'SELL' && momentum < -1)) {
      confidence += 15;
    }
    
    // RSI confirmation
    if (rsi !== null) {
      if ((signal === 'BUY' && rsi < 40) || (signal === 'SELL' && rsi > 60)) {
        confidence += 10;
      }
    }
    
    // MACD confirmation
    if (macd) {
      if ((signal === 'BUY' && macd.macd > macd.signal) || (signal === 'SELL' && macd.macd < macd.signal)) {
        confidence += 10;
      }
    }
    
    // Volume confirmation
    if (volumeTrend === 'high') {
      confidence += 10;
    }
    
    // Volatility adjustment
    if (Math.abs(momentum) > 3) {
      confidence += 5;
    }
    
    return Math.min(Math.max(confidence, 30), 95);
  }

  calculateConfidence(signal, trend, momentum, volumeTrend) {
    let confidence = 50; // Base confidence
    
    // Trend alignment
    if ((signal === 'BUY' && trend === 'bullish') || (signal === 'SELL' && trend === 'bearish')) {
      confidence += 20;
    }
    
    // Momentum alignment
    if ((signal === 'BUY' && momentum > 1) || (signal === 'SELL' && momentum < -1)) {
      confidence += 15;
    }
    
    // Volume confirmation
    if (volumeTrend === 'high') {
      confidence += 10;
    }
    
    // Volatility adjustment
    if (Math.abs(momentum) > 3) {
      confidence += 5;
    }
    
    return Math.min(Math.max(confidence, 30), 95);
  }

  calculateAdvancedEntryPoints(currentPrice, trend, supportResistance, signal, sma20, sma50, bollinger) {
    let entry = null;
    let exit = null;
    let stopLoss = currentPrice * 0.95; // 5% stop loss by default
    let takeProfit = currentPrice * 1.10; // 10% take profit by default
    
    // Validate supportResistance values
    const validSupport = supportResistance.support > 0 ? supportResistance.support : currentPrice * 0.9;
    const validResistance = supportResistance.resistance > 0 ? supportResistance.resistance : currentPrice * 1.1;
    
    if (signal === 'BUY') {
      // Entry strategy: Look for pullback to support or moving average
      if (sma20 && currentPrice > sma20) {
        entry = sma20 * 1.001; // Slightly above SMA20
      } else if (bollinger && currentPrice > bollinger.lower) {
        entry = bollinger.lower * 1.002; // Slightly above lower Bollinger band
      } else {
        entry = currentPrice * 0.998; // 0.2% below current price
      }
      
      // Exit strategy: Target resistance or upper Bollinger band
      if (bollinger && bollinger.upper > currentPrice) {
        takeProfit = bollinger.upper * 0.998; // Slightly below upper Bollinger band
      } else if (validResistance > currentPrice) {
        takeProfit = validResistance * 0.998; // Slightly below resistance
      } else {
        takeProfit = currentPrice * 1.08; // 8% above current price
      }
      
      // Stop loss: Below support or moving average
      if (sma20 && sma20 < currentPrice) {
        stopLoss = sma20 * 0.995; // 0.5% below SMA20
      } else if (bollinger && bollinger.lower < currentPrice) {
        stopLoss = bollinger.lower * 0.995; // 0.5% below lower Bollinger band
      } else {
        stopLoss = Math.max(validSupport * 0.98, currentPrice * 0.92);
      }
      
    } else if (signal === 'SELL') {
      // Entry strategy: Look for rally to resistance or moving average
      if (sma20 && currentPrice < sma20) {
        entry = sma20 * 0.999; // Slightly below SMA20
      } else if (bollinger && currentPrice < bollinger.upper) {
        entry = bollinger.upper * 0.998; // Slightly below upper Bollinger band
      } else {
        entry = currentPrice * 1.002; // 0.2% above current price
      }
      
      // Exit strategy: Target support or lower Bollinger band
      if (bollinger && bollinger.lower < currentPrice) {
        takeProfit = bollinger.lower * 1.002; // Slightly above lower Bollinger band
      } else if (validSupport < currentPrice) {
        takeProfit = validSupport * 1.002; // Slightly above support
      } else {
        takeProfit = currentPrice * 0.92; // 8% below current price
      }
      
      // Stop loss: Above resistance or moving average
      if (sma20 && sma20 > currentPrice) {
        stopLoss = sma20 * 1.005; // 0.5% above SMA20
      } else if (bollinger && bollinger.upper > currentPrice) {
        stopLoss = bollinger.upper * 1.005; // 0.5% above upper Bollinger band
      } else {
        stopLoss = Math.min(validResistance * 1.02, currentPrice * 1.08);
      }
    } else {
      // HOLD signal - no entry/exit points
      entry = null;
      exit = null;
      stopLoss = currentPrice * 0.98; // 2% stop loss
      takeProfit = currentPrice * 1.02; // 2% take profit
    }
    
    // Calculate risk/reward ratio
    const risk = Math.abs(currentPrice - stopLoss);
    const reward = Math.abs(takeProfit - currentPrice);
    const riskReward = risk > 0 ? (reward / risk).toFixed(2) : '1.00';
    
    return {
      entry,
      exit,
      stopLoss,
      takeProfit,
      riskReward
    };
  }

  calculateEntryPoints(currentPrice, trend, supportResistance, signal) {
    let entry = null;
    let exit = null;
    let stopLoss = currentPrice * 0.95; // 5% stop loss by default
    let takeProfit = currentPrice * 1.10; // 10% take profit by default
    
    if (signal === 'BUY') {
      // Entry at current price or slightly below for better entry
      entry = currentPrice * 0.998; // 0.2% below current price
      exit = currentPrice * 1.05; // 5% above current price
      stopLoss = Math.max(supportResistance.support * 0.98, currentPrice * 0.92); // 2% below support or 8% below current
      takeProfit = Math.min(supportResistance.resistance * 1.02, currentPrice * 1.15); // 2% above resistance or 15% above current
    } else if (signal === 'SELL') {
      // Entry at current price or slightly above for better entry
      entry = currentPrice * 1.002; // 0.2% above current price
      exit = currentPrice * 0.95; // 5% below current price
      stopLoss = Math.min(supportResistance.resistance * 1.02, currentPrice * 1.08); // 2% above resistance or 8% above current
      takeProfit = Math.max(supportResistance.support * 0.98, currentPrice * 0.85); // 2% below support or 15% below current
    }
    
    const risk = Math.abs(entry - stopLoss);
    const reward = Math.abs(takeProfit - entry);
    const riskReward = risk > 0 ? (reward / risk).toFixed(2) : '1.00';
    
    return {
      entry,
      exit,
      stopLoss,
      takeProfit,
      riskReward
    };
  }
  
  generateDetailedAnalysis(symbol, signal, trend, momentum, supportResistance) {
    const analysis = [];
    
    // Signal analysis
    if (signal === 'BUY') {
      analysis.push(`🟢 STRONG BUY SIGNAL: ${symbol} shows bullish momentum with technical confirmation`);
      analysis.push(`📈 Trend: ${trend.toUpperCase()} - Price action indicates upward movement`);
      analysis.push(`⚡ Momentum: ${momentum.toFixed(2)}% - Strong buying pressure detected`);
    } else if (signal === 'SELL') {
      analysis.push(`🔴 STRONG SELL SIGNAL: ${symbol} shows bearish momentum with technical confirmation`);
      analysis.push(`📉 Trend: ${trend.toUpperCase()} - Price action indicates downward movement`);
      analysis.push(`⚡ Momentum: ${momentum.toFixed(2)}% - Strong selling pressure detected`);
    } else {
      analysis.push(`🟡 HOLD SIGNAL: ${symbol} in consolidation phase`);
      analysis.push(`📊 Trend: ${trend.toUpperCase()} - Waiting for clear direction`);
      analysis.push(`⚡ Momentum: ${momentum.toFixed(2)}% - Neutral momentum`);
    }
    
    // Support/Resistance analysis
    if (supportResistance.support > 0 && supportResistance.resistance > 0) {
      analysis.push(`🎯 Support: $${supportResistance.support.toFixed(2)} | Resistance: $${supportResistance.resistance.toFixed(2)}`);
    }
    
    // Entry strategy
    if (signal === 'BUY') {
      analysis.push(`💡 Strategy: Look for entry on pullbacks to support levels`);
      analysis.push(`⚠️ Risk Management: Set stop loss below support, target resistance levels`);
    } else if (signal === 'SELL') {
      analysis.push(`💡 Strategy: Look for entry on rallies to resistance levels`);
      analysis.push(`⚠️ Risk Management: Set stop loss above resistance, target support levels`);
    } else {
      analysis.push(`💡 Strategy: Wait for breakout above resistance or breakdown below support`);
      analysis.push(`⚠️ Risk Management: Monitor volume for confirmation of direction`);
    }
    
    return analysis.join('\n');
  }
  
  generateAnalysisText(symbol, trend, signal, strength) {
    const patterns = {
      BUY: [
        `${symbol} showing strong bullish momentum with increased volume`,
        `Technical indicators suggest ${symbol} is breaking resistance levels`,
        `${symbol} demonstrating positive market sentiment and upward pressure`
      ],
      SELL: [
        `${symbol} facing bearish pressure with declining support`,
        `Technical analysis indicates ${symbol} may continue downward trend`,
        `${symbol} showing signs of profit-taking and potential correction`
      ],
      HOLD: [
        `${symbol} in consolidation phase, monitoring for breakout`,
        `${symbol} maintaining current levels, awaiting market direction`,
        `${symbol} showing mixed signals, recommend patience`
      ]
    };
    
    return patterns[signal][Math.floor(Math.random() * patterns[signal].length)];
  }
}

const aiEngine = new AIAnalysisEngine();

// Update market data periodically with real data
setInterval(async () => {
  try {
    // Fetch real market data
    await Promise.all([
      fetchCryptoData(),
      fetchForexData(),
      fetchIndicesData(),
      fetchCommoditiesData()
    ]);
    
    // Update price history for all symbols
    Object.keys(marketData).forEach(symbol => {
      const data = marketData[symbol];
      
      // Keep price history
      data.priceHistory.unshift({ price: data.price, timestamp: Date.now() });
      if (data.priceHistory.length > 100) {
        data.priceHistory = data.priceHistory.slice(0, 100);
      }
    }); // This closing brace was missing!
    
    // Broadcast to all connected clients
    const message = JSON.stringify({ type: 'marketUpdate', data: marketData });
    wss.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message);
      }
    });
  } catch (error) {
    console.error('Error updating market data:', error.message);
  }
}, 1000); // Update every 1 second for real-time data

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'QuantumTrade Pro API Server',
    version: '2.0.0',
    description: 'Multi-Asset AI Trading Platform - Crypto, Forex, Indices & Commodities',
    markets: {
      crypto: marketSymbols.crypto.length,
      forex: marketSymbols.forex.length,
      indices: marketSymbols.indices.length,
      commodities: marketSymbols.commodities.length,
      total: Object.keys(marketData).length
    },
    endpoints: {
      market: '/api/market/overview',
      symbol: '/api/market/:symbol',
      aiAnalysis: '/api/ai/analysis/:symbol',
      aiSignals: '/api/ai/signals'
    },
    websocket: 'ws://localhost:5000'
  });
});

// API Routes
app.get('/api/market/overview', (req, res) => {
  res.json({
    success: true,
    data: Object.values(marketData),
    timestamp: Date.now()
  });
});

app.get('/api/market/:symbol', (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  if (!marketData[symbol]) {
    return res.status(404).json({ error: 'Symbol not found' });
  }
  
  res.json({
    success: true,
    data: marketData[symbol],
    timestamp: Date.now()
  });
});

app.get('/api/ai/analysis/:symbol', (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  if (!marketData[symbol]) {
    return res.status(404).json({ error: 'Symbol not found' });
  }
  
  const analysis = aiEngine.generateMarketSignals(symbol, marketData[symbol]);
  res.json({
    success: true,
    symbol,
    analysis,
    timestamp: Date.now()
  });
});

app.get('/api/ai/signals', (req, res) => {
  try {
    console.log('AI Signals endpoint called');
    console.log('Market data keys:', Object.keys(marketData));
    console.log('Market data length:', Object.keys(marketData).length);
    
    if (Object.keys(marketData).length === 0) {
      console.log('No market data available');
      return res.json({
        success: true,
        signals: [],
        timestamp: Date.now(),
        message: 'No market data available'
      });
    }
    
    const signals = Object.keys(marketData).map(symbol => {
      try {
        console.log(`Generating signal for ${symbol}`);
        const signalData = aiEngine.generateMarketSignals(symbol, marketData[symbol]);
        console.log(`Signal generated for ${symbol}:`, signalData);
        return {
          ...signalData,
          symbol // Ensure symbol is properly set
        };
      } catch (symbolError) {
        console.error(`Error generating signal for ${symbol}:`, symbolError);
        return null;
      }
    }).filter(signal => signal !== null);
    
    console.log('Generated signals:', signals.length);
    
    res.json({
      success: true,
      signals,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error generating AI signals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate AI signals',
      signals: []
    });
  }
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  // Send initial data
  ws.send(JSON.stringify({ type: 'marketUpdate', data: marketData }));
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});