#!/usr/bin/env node

/**
 * Investment Scout Agent
 * Monitors AI sector stocks for data collection
 */

const https = require('https');

const STOCKS = ['NVDA', 'VRT', 'ANET', 'PLTR', 'MRVL', 'NET'];

function fetchYahooFinance(ticker) {
  return new Promise((resolve, reject) => {
    // Using alternative endpoint that's more stable
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1y`;
    
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const chart = json.chart.result[0];
          const quote = chart.meta;
          const prices = chart.indicators.quote[0];
          
          const current = quote.regularMarketPrice;
          const close = prices.close[prices.close.length - 1];
          const previousClose = prices.close[prices.close.length - 2] || close;
          const change = current - previousClose;
          const changePercent = (change / previousClose) * 100;
          
          resolve({
            ticker,
            current: current,
            previous: previousClose,
            high52: Math.max(...prices.high.filter(Boolean)),
            low52: Math.min(...prices.low.filter(Boolean)),
            volume: prices.volume[prices.volume.length - 1] || 0,
            marketCap: quote.marketCap || 0,
            change: change,
            changePercent: changePercent,
            timestamp: new Date().toISOString()
          });
        } catch (e) {
          console.error(`[Scout] Parse error for ${ticker}:`, e.message);
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function scout() {
  const logOutput = (msg) => { /* suppressed in production */ };
  logOutput(`[Scout] Starting market data collection at ${new Date().toISOString()}`);
  
  const data = {
    timestamp: new Date().toISOString(),
    stocks: {},
    errors: []
  };
  
  for (const ticker of STOCKS) {
    try {
      logOutput(`[Scout] Fetching ${ticker}...`);
      const quote = await fetchYahooFinance(ticker);
      data.stocks[ticker] = quote;
      // Rate limit: 500ms between requests
      await new Promise(r => setTimeout(r, 500));
    } catch (e) {
      logOutput(`[Scout] Error fetching ${ticker}:`, e.message);
      data.errors.push({ ticker, error: e.message });
    }
  }
  
  logOutput('[Scout] Data collection complete');
  // Output only JSON to stdout for piping
  console.log(JSON.stringify(data));
  return data;
}

scout().catch(e => {
  console.error('[Scout] Fatal error:', e);
  process.exit(1);
});
