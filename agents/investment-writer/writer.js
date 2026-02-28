#!/usr/bin/env node

/**
 * Investment Writer Agent
 * Formats analysis into Discord-friendly output
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
  
  // Alerts Section
  if (analysis.summary.alerts.length > 0) {
    message += `**⚠️ ALERTS**\n`;
    analysis.summary.alerts.forEach(alert => {
      message += `${alert}\n`;
    });
    message += '\n';
  }
  
  // Stock Breakdown
  message += `**AI Sector Stocks**\n`;
  message += `\`\`\`\n`;
  message += `Ticker   | Price   | Change  | 52w Pos\n`;
  message += `---------|---------|---------|--------\n`;
  
  for (const [ticker, data] of Object.entries(analysis.stocks)) {
    const arrow = data.change > 0 ? '📈' : data.change < 0 ? '📉' : '➡️';
    const sign = data.changePercent > 0 ? '+' : '';
    message += `${ticker.padEnd(8)}| $${String(data.current).padEnd(7)}| ${arrow} ${sign}${data.changePercent}%  | ${data.positionIn52w}%\n`;
  }
  message += `\`\`\`\n`;
  
  // Summary
  const bullishCount = analysis.summary.bullish.length;
  const bearishCount = analysis.summary.bearish.length;
  const neutralCount = analysis.summary.neutral.length;
  
  message += `\n**Summary**\n`;
  message += `🟢 Bullish: ${bullishCount} | 🔴 Bearish: ${bearishCount} | ⚫ Neutral: ${neutralCount}\n`;
  
  if (bullishCount > 0) {
    message += `\n**Bullish Picks:**\n`;
    analysis.summary.bullish.slice(0, 3).forEach(item => {
      message += `• ${item.ticker}: ${item.reason}\n`;
    });
  }
  
  if (bearishCount > 0) {
    message += `\n**Bearish Picks:**\n`;
    analysis.summary.bearish.slice(0, 3).forEach(item => {
      message += `• ${item.ticker}: ${item.reason}\n`;
    });
  }
  
  message += `\n---\n*Not financial advice. For informational purposes only.*`;
  
  return message;
}

// Read analysis from stdin
const analysis = JSON.parse(fs.readFileSync(0, 'utf-8'));
const message = formatDiscordMessage(analysis);

// Output message directly (no logs)
console.log(message);
