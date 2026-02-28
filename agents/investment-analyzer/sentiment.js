#!/usr/bin/env node

/**
 * Sentiment Analysis Module
 * Analyzes news sentiment for stocks (requires external API or keyword-based)
 */

const https = require('https');

// Simple keyword-based sentiment (when API unavailable)
function keywordSentiment(text) {
  const bullishWords = ['surge', 'rally', 'gain', 'beat', 'upgrade', 'momentum', 'bullish', 'strong', 'growth', 'profit'];
  const bearishWords = ['plunge', 'crash', 'loss', 'miss', 'downgrade', 'decline', 'bearish', 'weak', 'loss', 'cut'];
  
  const textLower = text.toLowerCase();
  
  let bullishScore = 0;
  let bearishScore = 0;
  
  bullishWords.forEach(word => {
    const count = (textLower.match(new RegExp(word, 'g')) || []).length;
    bullishScore += count;
  });
  
  bearishWords.forEach(word => {
    const count = (textLower.match(new RegExp(word, 'g')) || []).length;
    bearishScore += count;
  });
  
  const total = bullishScore + bearishScore;
  if (total === 0) return 0; // Neutral
  
  return (bullishScore - bearishScore) / total;
}

// Fetch sentiment from NewsAPI
function fetchNewsSentiment(ticker) {
  return new Promise((resolve) => {
    // Mock sentiment data for now (requires NewsAPI key)
    const mockSentiments = {
      'NVDA': { sentiment: 0.65, articles: 12, score: 'BULLISH' },
      'VRT': { sentiment: 0.58, articles: 5, score: 'MODERATELY_BULLISH' },
      'ANET': { sentiment: 0.72, articles: 8, score: 'BULLISH' },
      'PLTR': { sentiment: 0.45, articles: 15, score: 'NEUTRAL' },
      'MRVL': { sentiment: 0.62, articles: 6, score: 'BULLISH' },
      'NET': { sentiment: 0.78, articles: 10, score: 'STRONGLY_BULLISH' }
    };
    
    resolve(mockSentiments[ticker] || { sentiment: 0, articles: 0, score: 'UNKNOWN' });
  });
}

function sentimentEmoji(sentiment) {
  if (sentiment > 0.7) return '🟢';
  if (sentiment > 0.4) return '🟡';
  if (sentiment > 0.1) return '🟠';
  if (sentiment > -0.4) return '🔴';
  return '⚫';
}

function sentimentText(sentiment) {
  if (sentiment > 0.7) return 'STRONGLY BULLISH';
  if (sentiment > 0.4) return 'BULLISH';
  if (sentiment > 0.1) return 'SLIGHTLY BULLISH';
  if (sentiment > -0.4) return 'SLIGHTLY BEARISH';
  if (sentiment > -0.7) return 'BEARISH';
  return 'STRONGLY BEARISH';
}

module.exports = {
  keywordSentiment,
  fetchNewsSentiment,
  sentimentEmoji,
  sentimentText
};
