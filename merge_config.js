const fs = require('fs');
const configPath = '/Users/randylust/.openclaw/openclaw.json';
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Add Ollama Provider
config.models.providers.ollama = {
  "baseUrl": "http://127.0.0.1:11434/v1",
  "api": "openai-completions",
  "apiKey": "ollama",
  "models": [
    {
      "id": "llama3.2:3b",
      "name": "Llama 3.2 3B",
      "contextWindow": 128000,
      "maxTokens": 4096
    }
  ]
};

// Update Heartbeat
if (!config.agents.defaults.heartbeat) config.agents.defaults.heartbeat = {};
config.agents.defaults.heartbeat.model = "ollama/llama3.2:3b";

console.log(JSON.stringify(config, null, 2));
