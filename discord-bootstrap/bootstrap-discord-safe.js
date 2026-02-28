require("dotenv").config();
const { Client, GatewayIntentBits, PermissionsBitField, ChannelType } = require("discord.js");

const CONFIG = {
  guildId: process.env.GUILD_ID,
  ownerUserId: process.env.OWNER_USER_ID || null,
  createRoles: ["Ops Team", "Project Core", "Contributors"],
  suffix: "-new",
  categories: {
    "Agent Direct Lines": ["henry", "violet", "quill", "pixel", "echo", "charlie", "charlie-logs"],
    "Projects": ["agent-dashboard", "skool-ai-extension", "agent-org-infra", "micro-saas-factory", "content"],
    "Ops": ["announcements", "runbook", "incidents"],
    "Logs": ["agent-events", "system-alerts", "audit-trail"],
  },
};

function mustEnv() {
  const missing = ["BOT_TOKEN", "GUILD_ID"].filter((k) => !process.env[k]);
  if (missing.length) throw new Error(`Missing env: ${missing.join(", ")}`);
}

async function ensureRole(guild, name) {
  let role = guild.roles.cache.find((r) => r.name === name);
  if (!role) role = await guild.roles.create({ name, mentionable: true, reason: "safe bootstrap" });
  return role;
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once("ready", async () => {
  try {
    mustEnv();
    const guild = await client.guilds.fetch(CONFIG.guildId);
    await guild.roles.fetch();
    await guild.channels.fetch();

    const me = await guild.members.fetchMe();
    const botRoleId = me.roles.botRole?.id || me.roles.highest.id;
    const everyoneId = guild.roles.everyone.id;

    if (!CONFIG.ownerUserId) {
      const owner = await guild.fetchOwner();
      CONFIG.ownerUserId = owner.id;
    }

    const roles = {};
    for (const name of CONFIG.createRoles) roles[name] = await ensureRole(guild, name);

    for (const [catBase, channels] of Object.entries(CONFIG.categories)) {
      const catName = `${catBase}${CONFIG.suffix}`;
      const category = await guild.channels.create({
        name: catName,
        type: ChannelType.GuildCategory,
        permissionOverwrites: [
          { id: everyoneId, deny: [PermissionsBitField.Flags.ViewChannel] },
          { id: CONFIG.ownerUserId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ManageMessages] },
          { id: botRoleId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ManageMessages] },
        ],
      });

      for (const ch of channels) {
        let overwrites;
        if (catBase === "Agent Direct Lines") {
          overwrites = [
            { id: everyoneId, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: CONFIG.ownerUserId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
            { id: botRoleId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.ManageMessages] },
          ];
        } else if (catBase === "Projects") {
          overwrites = [
            { id: everyoneId, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: CONFIG.ownerUserId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
            { id: roles["Project Core"].id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
            { id: roles["Contributors"].id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
            { id: botRoleId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
          ];
        } else if (catBase === "Ops") {
          overwrites = [
            { id: everyoneId, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: CONFIG.ownerUserId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
            { id: roles["Ops Team"].id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
            { id: botRoleId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
          ];
        } else {
          overwrites = [
            { id: everyoneId, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: CONFIG.ownerUserId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory] },
            { id: roles["Ops Team"].id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory], deny: [PermissionsBitField.Flags.SendMessages] },
            { id: botRoleId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
          ];
        }

        await guild.channels.create({
          name: ch,
          type: ChannelType.GuildText,
          parent: category.id,
          permissionOverwrites: overwrites,
        });
      }
    }

    console.log("✅ Safe mode complete: created parallel category set with suffix", CONFIG.suffix);
  } catch (e) {
    console.error("❌ Safe mode error:", e);
    process.exitCode = 1;
  } finally {
    client.destroy();
  }
});

client.login(process.env.BOT_TOKEN);
