#!/usr/bin/env node

/**
 * Enhanced Investment Writer
 * Formats rich analysis (technical, sentiment, earnings, portfolio) for Discord
 */

const fs = require('fs');

function formatDiscordMessage(analysis) {
  const time = new Date(analysis.timestamp).toLocaleString('en-US', { 
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  
  let message = `📊 **Market Close Report** — ${time} ET\n\n`;
  
  // ALERTS SECTION (High Priority)
  if (analysis.summary.alerts.length > 0) {
    message += `**⚠️ CRITICAL ALERTS**\n`;
    analysis.summary.alerts.forEach(alert => {
      message += `${alert}\n`;
    });
    message += '\n';
  }
  
  // EARNINGS SECTION
  if (analysis.summary.earningsSoon.length > 0) {
    message += `**🔔 EARNINGS THIS WEEK**\n`;
    analysis.summary.earningsSoon.forEach(e => {
      message += `• ${e.ticker}: ${e.date} (${e.daysUntil}d away)\n`;
    });
    message += '\n';
  }
  
  // PORTFOLIO IMPACT SECTION
  if (analysis.portfolio) {
    message += `**💼 Portfolio Impact**\n`;
    message += `Today: ${analysis.portfolio.direction} ${analysis.portfolio.dayImpactPercent > 0 ? '+' : ''}${analysis.portfolio.dayImpactPercent}%\n`;
    message += `Total Value: $${analysis.portfolio.totalValue}\n`;
    message += `Total Gain: $${analysis.portfolio.totalGain}\n\n`;
  }
  
  // SENTIMENT SECTION
  const sentimentStocks = Object.entries(analysis.stocks)
    .filter(([_, s]) => s.sentiment && s.sentiment.articles > 0)
    .slice(0, 3);
  
  if (sentimentStocks.length > 0) {
    message += `**📰 News Sentiment**\n`;
    sentimentStocks.forEach(([ticker, stock]) => {
      const sentiment = stock.sentiment;
      const emoji = sentiment.label === 'BULLISH' ? '🟢' : sentiment.label === 'BEARISH' ? '🔴' : '🟡';
      message += `${emoji} ${ticker}: ${sentiment.label} (${sentiment.articles} articles)\n`;
    });
    message += '\n';
  }
  
  // MAIN STOCK TABLE
  message += `**AI Sector Stocks**\n`;
  message += `\`\`\`\n`;
  message += `Ticker | Price   | Change  | 52w Pos\n`;
  message += `-------|---------|---------|--------\n`;
  
  for (const [ticker, data] of Object.entries(analysis.stocks)) {
    const arrow = data.change > 0 ? '📈' : data.change < 0 ? '📉' : '➡️';
    const sign = data.changePercent > 0 ? '+' : '';
    message += `${ticker.padEnd(6)}| $${String(data.current).padEnd(7)}| ${arrow} ${sign}${data.changePercent}%  | ${data.positionIn52w}%\n`;
  }
  message += `\`\`\`\n\n`;
  
  // SUMMARY COUNTS
  const bullishCount = analysis.summary.bullish.length;
  const bearishCount = analysis.summary.bearish.length;
  const neutralCount = analysis.summary.neutral.length;
  
  message += `**Summary**\n`;
  message += `🟢 Bullish: ${bullishCount} | 🔴 Bearish: ${bearishCount} | ⚫ Neutral: ${neutralCount}\n\n`;
  
  // TOP PICKS (WITH SENTIMENT)
  if (bullishCount > 0) {
    message += `**Top Bullish Picks:**\n`;
    analysis.summary.bullish.slice(0, 3).forEach(item => {
      const sentiment = item.sentiment ? ` [${item.sentiment}]` : '';
      const conf = item.confidence ? ` (${item.confidence}% confidence)` : '';
      message += `• ${item.ticker}: ${item.reason}${sentiment}${conf}\n`;
    });
    message += '\n';
  }
  
  if (bearishCount > 0) {
    message += `**Top Bearish Picks:**\n`;
    analysis.summary.bearish.slice(0, 3).forEach(item => {
      const sentiment = item.sentiment ? ` [${item.sentiment}]` : '';
      const conf = item.confidence ? ` (${item.confidence}% confidence)` : '';
      message += `• ${item.ticker}: ${item.reason}${sentiment}${conf}\n`;
    });
    message += '\n';
  }
  
  // SENTIMENT SHIFTS (Divergences)
  if (analysis.summary.sentimentShift.length > 0) {
    message += `**⚡ Sentiment Divergences** (Price vs News)\n`;
    analysis.summary.sentimentShift.forEach(item => {
      message += `• ${item.ticker}: Price ${item.price_action} | News ${item.sentiment}\n`;
    });
    message += '\n';
  }
  
  message += `---\n`;
  message += `*Technical analysis for informational purposes. Not financial advice.*\n`;
  message += `*Last Updated: ${time} ET*`;
  
  return message;
}

// Read from stdin
let input = '';
process.stdin.setEncoding('utf8');

process.stdin.on('readable', () => {
  let chunk;
  while ((chunk = process.stdin.read()) !== null) {
    input += chunk;
  }
});

process.stdin.on('end', () => {
  const analysis = JSON.parse(input);
  const message = formatDiscordMessage(analysis);
  console.log(message);
});
