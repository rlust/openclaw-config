#!/usr/bin/env node

/**
 * Investment Researcher Agent
 * Analyzes stock data and generates insights
 */

const fs = require('fs');

function analyzeStock(ticker, data) {
  const current = data.current;
  const previous = data.previous;
  const change = data.change;
  const changePercent = data.changePercent;
  
  // Determine signal strength
  let signal = 'NEUTRAL';
  let confidence = 0;
  
  if (Math.abs(changePercent) > 3) {
    signal = changePercent > 0 ? 'BUY_SIGNAL' : 'SELL_SIGNAL';
    confidence = Math.min(Math.abs(changePercent) / 5, 1.0);
  } else if (changePercent > 1) {
    signal = 'BULLISH';
    confidence = Math.min(changePercent / 2, 0.8);
  } else if (changePercent < -1) {
    signal = 'BEARISH';
    confidence = Math.min(Math.abs(changePercent) / 2, 0.8);
  }
  
  // 52-week analysis
  const high52 = data.high52;
  const low52 = data.low52;
  let positionIn52w = 0;
  
  if (high52 && low52) {
    positionIn52w = ((current - low52) / (high52 - low52)) * 100;
  }
  
  return {
    ticker,
    signal,
    confidence: Math.round(confidence * 100),
    change,
    changePercent: Math.round(changePercent * 100) / 100,
    current: Math.round(current * 100) / 100,
    positionIn52w: Math.round(positionIn52w),
    volume: data.volume,
    marketCap: data.marketCap
  };
}

function research(scoutData) {
  // console.log('[Researcher] Analyzing stock data...');
  
  const analysis = {
    timestamp: scoutData.timestamp,
    stocks: {},
    summary: {
      bullish: [],
      bearish: [],
      neutral: [],
      alerts: []
    }
  };
  
  for (const [ticker, data] of Object.entries(scoutData.stocks)) {
    const analyzed = analyzeStock(ticker, data);
    analysis.stocks[ticker] = analyzed;
    
    if (analyzed.signal === 'BUY_SIGNAL') {
      analysis.summary.bullish.push({ ticker, reason: `${analyzed.changePercent}% up`, confidence: analyzed.confidence });
      analysis.summary.alerts.push(`🟢 ${ticker}: BUY SIGNAL +${analyzed.changePercent}%`);
    } else if (analyzed.signal === 'SELL_SIGNAL') {
      analysis.summary.bearish.push({ ticker, reason: `${analyzed.changePercent}% down`, confidence: analyzed.confidence });
      analysis.summary.alerts.push(`🔴 ${ticker}: SELL SIGNAL ${analyzed.changePercent}%`);
    } else if (analyzed.signal === 'BULLISH') {
      analysis.summary.bullish.push({ ticker, reason: `Mild uptrend +${analyzed.changePercent}%` });
    } else if (analyzed.signal === 'BEARISH') {
      analysis.summary.bearish.push({ ticker, reason: `Mild downtrend ${analyzed.changePercent}%` });
    } else {
      analysis.summary.neutral.push(ticker);
    }
  }
  
  // Only output JSON for piping
  console.log(JSON.stringify(analysis));
  return analysis;
}

// Read scout data from stdin or file
const scoutData = JSON.parse(fs.readFileSync(0, 'utf-8'));
const analysis = research(scoutData);
// analysis is already output by research() function
