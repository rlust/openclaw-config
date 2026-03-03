/**
 * Home Assistant Entity Discovery
 * Queries HA REST API to find all available entities
 * Useful for: finding entity IDs, understanding available sensors
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load credentials
function loadHACredentials() {
  try {
    const credPath = path.join(process.env.HOME, '.openclaw/workspace/.credentials');
    const content = fs.readFileSync(credPath, 'utf-8');
    
    const aspireMatch = content.match(/## Home Assistant \(Aspire RV\)([\s\S]*?)## /);
    const newarkMatch = content.match(/## Home Assistant \(Newark Home\)([\s\S]*?)## /);
    
    const aspireUrl = aspireMatch?.[1].match(/URL: (.*)/)?.[1]?.trim();
    const aspireToken = aspireMatch?.[1].match(/token: (.*)/)?.[1]?.trim();
    const newarkUrl = newarkMatch?.[1].match(/URL: (.*)/)?.[1]?.trim();
    const newarkToken = newarkMatch?.[1].match(/token: (.*)/)?.[1]?.trim();
    
    return {
      aspire: { url: aspireUrl, token: aspireToken },
      newark: { url: newarkUrl, token: newarkToken }
    };
  } catch (err) {
    console.error('Error loading credentials:', err.message);
    process.exit(1);
  }
}

// Fetch from Home Assistant
function fetchHA(url, token, endpoint) {
  return new Promise((resolve) => {
    if (!token) {
      console.warn('No token provided');
      resolve(null);
      return;
    }

    const fullUrl = new URL(endpoint, url);
    const protocol = fullUrl.protocol === 'https:' ? https : http;
    
    const options = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    protocol.get(fullUrl, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          console.error('Parse error:', e.message);
          resolve(null);
        }
      });
    }).on('error', (err) => {
      console.warn(`Fetch error: ${err.message}`);
      resolve(null);
    });
  });
}

// Discover entities
async function discoverEntities(instance, creds) {
  console.log(`\n🔍 Discovering entities on ${instance}...`);
  
  const entities = await fetchHA(creds.url, creds.token, '/api/states');
  
  if (!entities || !Array.isArray(entities)) {
    console.error('Failed to fetch entities');
    return;
  }

  // Filter by relevance
  const relevant = entities.filter(e => {
    const id = e.entity_id.toLowerCase();
    return id.includes('temp') || 
           id.includes('battery') || 
           id.includes('water') || 
           id.includes('waste') || 
           id.includes('climate') || 
           id.includes('ac') ||
           id.includes('power') ||
           id.includes('voltage') ||
           id.includes('tank');
  });

  if (relevant.length === 0) {
    console.log('No relevant entities found');
    return;
  }

  console.log(`\n📊 Found ${relevant.length} relevant entities:\n`);
  
  relevant.forEach(e => {
    const value = e.state;
    const friendly = e.attributes?.friendly_name || e.entity_id;
    const unit = e.attributes?.unit_of_measurement || '';
    
    console.log(`✓ ${e.entity_id}`);
    console.log(`  Name: ${friendly}`);
    console.log(`  State: ${value} ${unit}`);
    console.log('');
  });

  return relevant;
}

// Main
async function main() {
  const creds = loadHACredentials();

  console.log('🏠 Home Assistant Entity Discovery\n');
  console.log('=' .repeat(50));

  // Discover Newark
  if (creds.newark.token) {
    await discoverEntities('Newark Home', creds.newark);
  }

  // Discover Aspire
  if (creds.aspire.token) {
    await discoverEntities('Aspire RV', creds.aspire);
  }

  console.log('=' .repeat(50));
  console.log('\n✅ Discovery complete!\n');
}

main().catch(console.error);
