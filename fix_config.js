const fs = require('fs');
const configPath = '/Users/randylust/.openclaw/openclaw.json';
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Add to fallbacks to whitelist it
if (!config.agents.defaults.model.fallbacks.includes("ollama/llama3.2:3b")) {
  config.agents.defaults.model.fallbacks.push("ollama/llama3.2:3b");
}

console.log(JSON.stringify(config, null, 2));
