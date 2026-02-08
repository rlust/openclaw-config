const fs = require('fs');
const configPath = '/Users/randylust/.openclaw/openclaw.json';
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Correct value is 'open'
config.channels.telegram.groupPolicy = "open";

console.log(JSON.stringify(config, null, 2));
