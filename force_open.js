const fs = require('fs');
const configPath = '/Users/randylust/.openclaw/openclaw.json';
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// FORCE OPEN
if (!config.channels) config.channels = {};
if (!config.channels.telegram) config.channels.telegram = {};

config.channels.telegram.groupPolicy = "open";
config.channels.telegram.groupAllowFrom = ["*"]; // Allow all groups

// Also ensure we don't have conflicting DM policies just in case
config.channels.telegram.dmPolicy = "pairing"; 

console.log(JSON.stringify(config, null, 2));
