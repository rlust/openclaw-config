#!/usr/bin/env node

/**
 * Portfolio Impact Module
 * Analyzes how stock movements affect overall portfolio
 */

// Mock portfolio (would load from real portfolio data)
function getPortfolio() {
  return {
    'NVDA': { shares: 100, avgCost: 180, weight: 0.25 },
    'PLTR': { shares: 250, avgCost: 130, weight: 0.18 },
    'NET': { shares: 75, avgCost: 160, weight: 0.12 },
    'MRVL': { shares: 150, avgCost: 75, weight: 0.10 },
    'ANET': { shares: 50, avgCost: 125, weight: 0.08 },
    'VRT': { shares: 40, avgCost: 250, weight: 0.07 }
  };
}

function calculatePortfolioImpact(stockData) {
  const portfolio = getPortfolio();
  const position = portfolio[stockData.ticker];
  
  if (!position) return null;
  
  const currentValue = position.shares * stockData.current;
  const costBasis = position.shares * position.avgCost;
  const gain = currentValue - costBasis;
  const gainPercent = (gain / costBasis * 100).toFixed(2);
  
  const portfolioPercent = (position.weight * 100).toFixed(1);
  const portfolioImpact = (stockData.changePercent * position.weight).toFixed(3);
  
  return {
    ticker: stockData.ticker,
    shares: position.shares,
    avgCost: position.avgCost,
    currentPrice: stockData.current,
    currentValue: currentValue.toFixed(2),
    costBasis: costBasis.toFixed(2),
    gain: gain.toFixed(2),
    gainPercent: parseFloat(gainPercent),
    portfolioWeight: parseFloat(portfolioPercent),
    todayImpact: parseFloat(portfolioImpact),
    status: gainPercent > 0 ? '✅ UP' : gainPercent < 0 ? '❌ DOWN' : '➡️ FLAT'
  };
}

function calculateTotalPortfolioImpact(allStocks) {
  let totalDayImpact = 0;
  
  const impacts = allStocks.map(stock => {
    const impact = calculatePortfolioImpact(stock);
    if (impact) {
      totalDayImpact += parseFloat(impact.todayImpact);
    }
    return impact;
  }).filter(Boolean);
  
  return {
    positions: impacts,
    totalDayImpact: totalDayImpact.toFixed(3),
    dayImpactPercent: parseFloat(totalDayImpact),
    totalValue: impacts.reduce((sum, p) => sum + parseFloat(p.currentValue), 0).toFixed(2),
    totalGain: impacts.reduce((sum, p) => sum + parseFloat(p.gain), 0).toFixed(2),
    direction: totalDayImpact > 0 ? '📈 UP' : totalDayImpact < 0 ? '📉 DOWN' : '➡️ FLAT'
  };
}

function formatPortfolioSummary(impact) {
  if (!impact) return '';
  
  let summary = `\n💼 **Portfolio Impact**\n`;
  summary += `Total Value: $${impact.totalValue}\n`;
  summary += `Total Gain: $${impact.totalGain}\n`;
  summary += `Today: ${impact.direction} ${impact.dayImpactPercent > 0 ? '+' : ''}${impact.dayImpactPercent}%\n\n`;
  
  summary += `**Top Movers:**\n`;
  impact.positions.slice(0, 3).forEach(pos => {
    summary += `• ${pos.ticker}: ${pos.status} ${pos.gainPercent > 0 ? '+' : ''}${pos.gainPercent}% | $${pos.currentValue}\n`;
  });
  
  return summary;
}

module.exports = {
  getPortfolio,
  calculatePortfolioImpact,
  calculateTotalPortfolioImpact,
  formatPortfolioSummary
};
