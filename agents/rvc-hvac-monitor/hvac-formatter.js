#!/usr/bin/env node

/**
 * RV-C HVAC Status Formatter
 * Converts JSON HVAC state to Discord message format
 */

const fs = require('fs');

function formatHvacStatus(statusJson) {
  try {
    const status = JSON.parse(statusJson);
    
    if (status.error) {
      return `❌ **HVAC Error**\n${status.error}`;
    }
    
    const hvac = status.hvac || {};
    const zones = status.zones || {};
    
    // Status indicator
    let statusIcon = '✅';
    if (status.status === 'offline' || !hvac.mode) {
      statusIcon = '❌';
    }
    
    // Mode emoji
    const modeEmoji = {
      'heat': '🔥',
      'cool': '❄️',
      'auto': '🔄',
      'off': '⊘'
    };
    
    const emoji = modeEmoji[hvac.mode] || '❓';
    
    // Temperature difference
    const diff = hvac.current_temp - hvac.target_temp;
    let diffStr = '';
    if (Math.abs(diff) > 0.5) {
      diffStr = diff > 0 ? `(${diff.toFixed(1)}° above target)` : `(${Math.abs(diff).toFixed(1)}° below target)`;
    }
    
    let message = `${statusIcon} **RV-C HVAC Status**\n\n`;
    message += `**Main System**\n`;
    message += `Mode: ${emoji} ${hvac.mode.toUpperCase()}\n`;
    message += `Current: ${hvac.current_temp}°F | Target: ${hvac.target_temp}°F ${diffStr}\n`;
    message += `Fan: ${hvac.fan_mode || 'unknown'}\n\n`;
    
    message += `**Zone Temperatures** (Aspire RV)\n`;
    message += `🌡️ Outside: ${zones.outside || 'N/A'}°F\n`;
    message += `🏠 Coach: ${zones.coach || 'N/A'}°F\n`;
    message += `❄️ AC Mid: ${zones.ac_mid || 'N/A'}\n\n`;
    
    message += `**System Status**: ${status.status === 'online' ? '✅ Online' : '❌ Offline'}\n`;
    message += `**Last Update**: ${new Date(status.timestamp).toLocaleString('en-US', { timeZone: 'America/New_York' })} ET\n\n`;
    
    message += `Commands: \`/hvac set-temp 72\` | \`/hvac set-mode heat\` | \`/hvac test\``;
    
    return message;
  } catch (e) {
    return `❌ **Error parsing HVAC status**\n\`\`\`${e.message}\`\`\``;
  }
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
  const formatted = formatHvacStatus(input);
  console.log(formatted);
});
