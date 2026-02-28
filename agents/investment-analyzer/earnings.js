#!/usr/bin/env node

/**
 * Earnings Calendar Module
 * Tracks upcoming earnings reports and recent results
 */

function getUpcomingEarnings() {
  // Mock earnings calendar (would pull from API in production)
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const earnings = {
    'NVDA': { date: '2026-02-26', daysUntil: 1, estimate: 0.92, priceTarget: 210 },
    'PLTR': { date: '2026-03-15', daysUntil: 18, estimate: 0.08, priceTarget: 140 },
    'NET': { date: '2026-03-10', daysUntil: 13, estimate: 0.28, priceTarget: 180 },
    'MRVL': { date: '2026-02-28', daysUntil: 3, estimate: 0.65, priceTarget: 85 },
    'ANET': null,
    'VRT': null
  };
  
  return earnings;
}

function getRecentEarnings() {
  // Recent earnings results
  const recent = {
    'NVDA': { 
      date: '2026-02-18',
      eps: 0.91,
      estimate: 0.88,
      surprise: 3.4,
      beat: true
    },
    'PLTR': {
      date: '2025-12-10',
      eps: 0.11,
      estimate: 0.10,
      surprise: 10.0,
      beat: true
    }
  };
  
  return recent;
}

function earningsImpact(ticker, stockData) {
  const earnings = getUpcomingEarnings()[ticker];
  
  if (!earnings) return null;
  
  const daysUntil = earnings.daysUntil;
  const current = stockData.current;
  const target = earnings.priceTarget;
  const upside = ((target - current) / current * 100).toFixed(2);
  
  return {
    ticker,
    earningsDate: earnings.date,
    daysUntil,
    estimate: earnings.estimate,
    priceTarget: target,
    currentPrice: current,
    upside: parseFloat(upside),
    urgency: daysUntil <= 3 ? 'HIGH' : daysUntil <= 7 ? 'MEDIUM' : 'LOW'
  };
}

function formatEarnings(earningsData) {
  if (!earningsData) return null;
  
  const urgencyEmoji = earningsData.urgency === 'HIGH' ? '🔴' : earningsData.urgency === 'MEDIUM' ? '🟡' : '🟢';
  
  return `${urgencyEmoji} **${earningsData.ticker} Earnings**
  Date: ${earningsData.earningsDate} (${earningsData.daysUntil} days)
  Estimate EPS: $${earningsData.estimate}
  Price Target: $${earningsData.priceTarget} (${earningsData.upside > 0 ? '+' : ''}${earningsData.upside}% upside)
`;
}

module.exports = {
  getUpcomingEarnings,
  getRecentEarnings,
  earningsImpact,
  formatEarnings
};
