const fs = require('fs');
const configPath = '/Users/randylust/.openclaw/openclaw.json';
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Switch to 'all' to allow public groups temporarily
config.channels.telegram.groupPolicy = "all";

console.log(JSON.stringify(config, null, 2));
