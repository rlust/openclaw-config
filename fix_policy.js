const fs = require('fs');
const configPath = '/Users/randylust/.openclaw/openclaw.json';
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Switch to pairing mode to detect the group
config.channels.telegram.groupPolicy = "pairing";

console.log(JSON.stringify(config, null, 2));
