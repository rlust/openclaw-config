#!/usr/bin/env node

/**
 * Enhanced Investment Researcher
 * Integrates technical analysis, sentiment, earnings, and portfolio impact
 */

const fs = require('fs');
const technical = require('./technical');
const sentiment = require('./sentiment');
const earnings = require('./earnings');
const portfolio = require('./portfolio');

function analyzeStock(ticker, data) {
  // Base analysis
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
  
  // Enhanced: Sentiment (mock data)
  const sentimentData = {
    score: Math.random() * 2 - 1, // -1 to 1
    label: signal === 'BUY_SIGNAL' ? 'BULLISH' : signal === 'SELL_SIGNAL' ? 'BEARISH' : 'NEUTRAL',
    articles: Math.floor(Math.random() * 20)
  };
  
  // Enhanced: Earnings impact
  const earningsData = earnings.earningsImpact(ticker, { current, changePercent });
  
  // Enhanced: Portfolio impact
  const portfolioData = portfolio.calculatePortfolioImpact({
    ticker,
    current,
    changePercent,
    change
  });
  
  return {
    ticker,
    signal,
    confidence: Math.round(confidence * 100),
    change,
    changePercent: Math.round(changePercent * 100) / 100,
    current: Math.round(current * 100) / 100,
    positionIn52w: Math.round(positionIn52w),
    volume: data.volume,
    // Enhanced fields
    sentiment: sentimentData,
    earnings: earningsData,
    portfolio: portfolioData
  };
}

function research(scoutData) {
  const analysis = {
    timestamp: scoutData.timestamp,
    stocks: {},
    summary: {
      bullish: [],
      bearish: [],
      neutral: [],
      alerts: [],
      earningsSoon: [],
      sentimentShift: []
    },
    portfolio: null
  };
  
  const allStocks = [];
  
  for (const [ticker, data] of Object.entries(scoutData.stocks)) {
    const analyzed = analyzeStock(ticker, data);
    analysis.stocks[ticker] = analyzed;
    allStocks.push({
      ticker,
      current: data.current,
      changePercent: data.changePercent
    });
    
    // Categorize
    if (analyzed.signal === 'BUY_SIGNAL') {
      analysis.summary.bullish.push({ 
        ticker, 
        reason: `${analyzed.changePercent}% up`, 
        confidence: analyzed.confidence,
        sentiment: analyzed.sentiment.label
      });
      analysis.summary.alerts.push(`🟢 ${ticker}: BUY SIGNAL +${analyzed.changePercent}%`);
    } else if (analyzed.signal === 'SELL_SIGNAL') {
      analysis.summary.bearish.push({ 
        ticker, 
        reason: `${analyzed.changePercent}% down`, 
        confidence: analyzed.confidence,
        sentiment: analyzed.sentiment.label
      });
      analysis.summary.alerts.push(`🔴 ${ticker}: SELL SIGNAL ${analyzed.changePercent}%`);
    } else if (analyzed.signal === 'BULLISH') {
      analysis.summary.bullish.push({ 
        ticker, 
        reason: `Mild uptrend +${analyzed.changePercent}%`,
        sentiment: analyzed.sentiment.label
      });
    } else if (analyzed.signal === 'BEARISH') {
      analysis.summary.bearish.push({ 
        ticker, 
        reason: `Mild downtrend ${analyzed.changePercent}%`,
        sentiment: analyzed.sentiment.label
      });
    } else {
      analysis.summary.neutral.push(ticker);
    }
    
    // Earnings alerts
    if (analyzed.earnings && analyzed.earnings.daysUntil <= 7) {
      analysis.summary.earningsSoon.push({
        ticker,
        date: analyzed.earnings.earningsDate,
        daysUntil: analyzed.earnings.daysUntil
      });
    }
    
    // Sentiment shifts
    if (Math.abs(analyzed.changePercent) > 2 && analyzed.sentiment.label !== analyzed.signal) {
      analysis.summary.sentimentShift.push({
        ticker,
        price_action: analyzed.signal,
        sentiment: analyzed.sentiment.label
      });
    }
  }
  
  // Portfolio impact
  analysis.portfolio = portfolio.calculateTotalPortfolioImpact(allStocks.map(s => ({
    ticker: s.ticker,
    current: s.current,
    changePercent: s.changePercent
  })));
  
  console.log(JSON.stringify(analysis));
  return analysis;
}

// Read scout data from stdin
const scoutData = JSON.parse(fs.readFileSync(0, 'utf-8'));
research(scoutData);
