#!/usr/bin/env node

/**
 * Technical Analysis Module
 * Calculates RSI, MACD, Moving Averages from price data
 */

function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) return null;
  
  let gains = 0, losses = 0;
  
  // Calculate average gains and losses
  for (let i = 1; i <= period; i++) {
    const diff = prices[prices.length - i] - prices[prices.length - i - 1];
    if (diff > 0) gains += diff;
    else losses += Math.abs(diff);
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  
  return Math.round(rsi);
}

function calculateMACD(prices) {
  if (prices.length < 26) return null;
  
  // EMA 12 and EMA 26
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macdLine = ema12 - ema26;
  
  // Signal line (EMA 9 of MACD)
  const macdValues = [];
  for (let i = 26; i < prices.length; i++) {
    const e12 = calculateEMA(prices.slice(0, i + 1), 12);
    const e26 = calculateEMA(prices.slice(0, i + 1), 26);
    macdValues.push(e12 - e26);
  }
  
  const signalLine = calculateEMA(macdValues, 9);
  const histogram = macdLine - signalLine;
  
  return {
    macd: Math.round(macdLine * 100) / 100,
    signal: Math.round(signalLine * 100) / 100,
    histogram: Math.round(histogram * 100) / 100
  };
}

function calculateEMA(prices, period) {
  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b) / period;
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
  }
  
  return ema;
}

function calculateMovingAverages(prices) {
  const ma20 = calculateSMA(prices, 20);
  const ma50 = calculateSMA(prices, 50);
  const ma200 = calculateSMA(prices, 200);
  
  return {
    ma20: Math.round(ma20 * 100) / 100,
    ma50: Math.round(ma50 * 100) / 100,
    ma200: Math.round(ma200 * 100) / 100
  };
}

function calculateSMA(prices, period) {
  const relevant = prices.slice(-period);
  return relevant.reduce((a, b) => a + b) / relevant.length;
}

function analyzeSignals(current, rsi, macd, ma20, ma50) {
  const signals = [];
  
  // RSI signals
  if (rsi > 70) {
    signals.push({ indicator: 'RSI', signal: 'OVERBOUGHT', strength: rsi - 70 });
  } else if (rsi < 30) {
    signals.push({ indicator: 'RSI', signal: 'OVERSOLD', strength: 30 - rsi });
  }
  
  // MACD signals
  if (macd && macd.histogram > 0) {
    signals.push({ indicator: 'MACD', signal: 'BULLISH_CROSSOVER', strength: macd.histogram });
  } else if (macd && macd.histogram < 0) {
    signals.push({ indicator: 'MACD', signal: 'BEARISH_CROSSOVER', strength: Math.abs(macd.histogram) });
  }
  
  // Moving average signals
  if (ma20 && ma50 && current > ma20 && ma20 > ma50) {
    signals.push({ indicator: 'MA', signal: 'UPTREND_CONFIRMED', strength: (current - ma50) / ma50 });
  } else if (ma20 && ma50 && current < ma20 && ma20 < ma50) {
    signals.push({ indicator: 'MA', signal: 'DOWNTREND_CONFIRMED', strength: (ma50 - current) / ma50 });
  }
  
  return signals;
}

module.exports = {
  calculateRSI,
  calculateMACD,
  calculateMovingAverages,
  analyzeSignals
};
