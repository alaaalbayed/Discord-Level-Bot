// Importing Packages
require("dotenv").config();
const { Client, Intents, Collection, MessageEmbed } = require('discord.js');
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9")
const SQLite = require("better-sqlite3")
const cron = require("node-cron");
const sql = new SQLite('./mainDB.sqlite')
const fs = require("fs")

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES
  ]
})

client.commands = new Collection();
const cooldowns = new Collection();
const talkedRecently = new Set();

// Token, Prefix, and Owner ID
const config = require("./config.json");
const { log } = require("console");

// Events
client.login(config.token)

client.on("ready", () => {
  // Check if the table "points" exists.
  const levelTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'levels';").get();
  if (!levelTable['count(*)']) {
    sql.prepare("CREATE TABLE levels (id TEXT PRIMARY KEY, user TEXT, guild TEXT, xp INTEGER, level INTEGER, totalXP INTEGER, dailyXP INTEGER, weeklyXP INTEGER, monthlyXP INTEGER);").run();
  }

  client.getLevel = sql.prepare("SELECT * FROM levels WHERE user = ? AND guild = ?");
  client.setLevel = sql.prepare("INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP, dailyXP, weeklyXP, monthlyXP) VALUES (@id, @user, @guild, @xp, @level, @totalXP, @dailyXP, @weeklyXP, @monthlyXP);");

  // Role table for levels
  const roleTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'roles';").get();
  if (!roleTable['count(*)']) {
    sql.prepare("CREATE TABLE roles (guildID TEXT, roleID TEXT, level INTEGER);").run();
  }

  // Prefix table
  const prefixTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'prefix';").get();
  if (!prefixTable['count(*)']) {
    sql.prepare("CREATE TABLE prefix (serverprefix TEXT, guild TEXT PRIMARY KEY);").run();
  }

  // Blacklist table
  const blacklistTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'blacklistTable';").get();
  if (!blacklistTable['count(*)']) {
    sql.prepare("CREATE TABLE blacklistTable (guild TEXT, typeId TEXT, type TEXT, id TEXT PRIMARY KEY);").run();
  }

  // Settings table
  const settingsTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'settings';").get();
  if (!settingsTable['count(*)']) {
    sql.prepare("CREATE TABLE settings (guild TEXT PRIMARY KEY, levelUpMessage TEXT, customXP INTEGER, customCooldown INTEGER);").run();
  }

  const channelTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'channel';").get();
  if (!channelTable['count(*)']) {
    sql.prepare("CREATE TABLE channel (guild TEXT PRIMARY KEY, channel TEXT);").run();
  }


  // RankCard table (WORK IN PROGRESS, STILL IN THE WORKS)
  const rankCardTable = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'rankCardTable';").get();
  if (!rankCardTable['count(*)']) {
    sql.prepare("CREATE TABLE rankCardTable (id TEXT PRIMARY KEY, user TEXT, guild TEXT, textColor TEXT, barColor TEXT, backgroundColor TEXT);").run();
  }

  console.log(`Logged in as ${client.user.username}`)
});

// Command Handler
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith("js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

//Slash Command Handler
const commandFiles2 = fs.readdirSync("./slash").filter(file => file.endsWith("js"));
const commands = [];
client.commands2 = new Collection();

for (const file of commandFiles2) {
  const command = require(`./slash/${file}`);
  commands.push(command.data.toJSON());
  client.commands2.set(command.data.name, command);
}

client.once("ready", () => {
  client.user.setActivity(`/help`, { type: "PLAYING" })

  const CLIINT_ID = client.user.id;
  const rest = new REST({
    version: "9"
  }).setToken(config.token);

  (async () => {
    try {
      if (config.token === "production") {
        await rest.put(Routes.applicationCommands(CLIINT_ID), {
          body: commands
        });
        console.log("sus reg command globally")
      } else {
        await rest.put(Routes.applicationCommands(CLIINT_ID), {
          body: commands
        });
        console.log("sus reg command locally")
      }
    } catch (err) {
      if (err) console.error(err);
    }
  })();
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands2.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    if (err) console.error(err);

    await interaction.reply({
      content: "an error",
      emphemeral: true
    });
  }
});



client.on('voiceStateUpdate', (oldState, newState) => {
  const member = newState.member;
  const oldChannel = oldState.channel;
  const newChannel = newState.channel;

  // Voice channel XP
  if (newChannel && !oldChannel) {
    cron.schedule('* * * * *', () => {
      let blacklist = sql.prepare(`SELECT id FROM blacklistTable WHERE id = ?`);
      if (blacklist.get(`${member.guild.id}-${member.user.id}`)) return;

      let customSettings = sql.prepare("SELECT * FROM settings WHERE guild = ?").get(member.guild.id);
      getXpfromDB = customSettings.customXP;
      client.getScore = sql.prepare("SELECT * FROM levels WHERE user = ? AND guild = ?");
      client.setScore = sql.prepare("INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP, dailyXP, weeklyXP, monthlyXP) VALUES (@id, @user, @guild, @xp, @level, @totalXP, @dailyXP, @weeklyXP, @monthlyXP);");

      let score = client.getScore.get(member.user.id, member.guild.id);
      if (!score) {
        score = {
          id: `${member.guild.id}-${member.user.id}`,
          user: member.user.id,
          guild: member.guild.id,
          xp: 0,
          level: 0,
          totalXP: 0,
          dailyXP: 0,
          weeklyXP: 0,
          monthlyXP: 0
        }
      }

      const generatedXp = Math.floor(Math.random() * getXpfromDB); // change xp value
      score.xp += generatedXp
      score.totalXP += generatedXp
      score.dailyXP += generatedXp
      score.weeklyXP += generatedXp
      score.monthlyXP += generatedXp
      client.setScore.run(score)

    });
  }
});

// when user leave reset thier levels
client.on('guildMemberRemove', async member => {

  client.getScore = sql.prepare("SELECT * FROM levels WHERE user = ? AND guild = ?");
  client.setScore = sql.prepare("INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP, dailyXP, weeklyXP, monthlyXP) VALUES (@id, @user, @guild, @xp, @level, @totalXP, @dailyXP, @weeklyXP, @monthlyXP);");

  let score = client.getScore.get(member.id, member.guild.id);

  score = {
    id: `${member.id}-${member.guild.id}`,
    user: member.id,
    guild: member.guild.id,
    xp: 0,
    level: 0,
    totalXP: 0,
    dailyXP: 0,
    weeklyXP: 0,
    monthlyXP: 0
  }

  client.setScore.run(score)
});

// Message Events
client.on("messageCreate", (message) => {
  cron.schedule('0 21 * * *', () => {
    sql.prepare("UPDATE levels SET dailyXP = ?").run(0);

  });

  cron.schedule('0 21 * * 6', () => {
    sql.prepare("UPDATE levels SET weeklyXP = ?").run(0);
  });

  cron.schedule('0 21 1 * *', () => {
    sql.prepare("UPDATE levels SET monthlyXP = ?").run(0);
  });

  if (message.author.bot) return;
  if (!message.guild) return;


  let card = sql.prepare("SELECT * FROM rankCardTable WHERE user = ? AND guild = ?");
  if (!card.get(message.author.id, message.guild.id)) {
    sql.prepare("INSERT OR REPLACE INTO rankCardTable (id, user, guild, textColor, barColor, backgroundColor) VALUES (?, ?, ?, ?, ?, ?);").run(`${message.author.id}-${message.guild.id}`, message.author.id, message.guild.id, "#beb1b1", "#838383", "#36393f");
  }

  const currentPrefix = sql.prepare("SELECT * FROM prefix WHERE guild = ?").get(message.guild.id);
  const Prefix = config.prefix;
  var getPrefix;
  if (!currentPrefix) {
    sql.prepare("INSERT OR REPLACE INTO prefix (serverprefix, guild) VALUES (?,?);").run(Prefix, message.guild.id)
    getPrefix = Prefix.toString();
  } else {
    getPrefix = currentPrefix.serverprefix.toString();
  }

  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(getPrefix)})\\s*`);
  if (!prefixRegex.test(message.content)) return;

  const [, matchedPrefix] = message.content.match(prefixRegex);

  const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command =
    client.commands.get(commandName) ||
    client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 1) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(
        `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`
      );
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    command.execute(client,message, args);
  } catch (error) {
    console.error(error);
    message.reply("There was an error executing that command.").catch(console.error);
  }
});

// XP Messages 

client.on("messageCreate", message => {
  if (message.author.bot) return;
  if (!message.guild) return;
  let blacklist = sql.prepare(`SELECT id FROM blacklistTable WHERE id = ?`);
  if (blacklist.get(`${message.guild.id}-${message.author.id}`) || blacklist.get(`${message.guild.id}-${message.channel.id}`)) return;

  // get level and set level
  const level = client.getLevel.get(message.author.id, message.guild.id)

  if (!level) {
    let insertLevel = sql.prepare("INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP) VALUES (?,?,?,?,?,?);");
    insertLevel.run(`${message.author.id}-${message.guild.id}`, message.author.id, message.guild.id, 0, 0, 0)
    return;
  }

  let customSettings = sql.prepare("SELECT * FROM settings WHERE guild = ?").get(message.guild.id);
  let channelLevel = sql.prepare("SELECT * FROM channel WHERE guild = ?").get(message.guild.id);
  let multiplier = sql.prepare("SELECT * FROM multiplierXP WHERE guildID = ?").get(message.guild.id);
  let multiplierChannel = sql.prepare("SELECT * FROM multiplierChannelXP WHERE guildID = ?").get(message.guild.id);

  const lvl = level.level;

  let getXpfromDB;
  let getCooldownfromDB;

  if (!customSettings) {
    getXpfromDB = 16; // Default
    getCooldownfromDB = 1000;
  } else {
    getXpfromDB = customSettings.customXP;
    getCooldownfromDB = customSettings.customCooldown;
  }

  // xp system
  const generatedXp = Math.floor(Math.random() * getXpfromDB);
  const nextXP = level.level * 2 * 250 + 250

  if (talkedRecently.has(message.author.id)) {
    return;
  } else { // cooldown is 10 seconds
    level.xp += generatedXp;
    level.totalXP += generatedXp;
    level.dailyXP += generatedXp;
    level.weeklyXP += generatedXp;
    level.monthlyXP += generatedXp;

    if (!multiplier) {

    }

    else {
      const guildMember = message.guild.members.cache.find(member => member.id === message.author.id);
      const multiplier2 = sql.prepare("SELECT * FROM multiplierXP WHERE guildID = ?").all(message.guild.id);
      for (const data of multiplier2) {
        let multiplierSet = data.multiplier;
        let RoleSet = data.roleID;

        if (guildMember.roles.cache.some(r => r.id === RoleSet)) {
          getXpfromDB = customSettings.customXP * multiplierSet;
          getCooldownfromDB = customSettings.customCooldown;

          const generatedXp = Math.floor(Math.random() * getXpfromDB);

          if (talkedRecently.has(message.author.id)) {
            return;
          } else { // cooldown is 10 seconds
            level.xp += generatedXp;
            level.totalXP += generatedXp;
            level.dailyXP += generatedXp;
            level.weeklyXP += generatedXp;
            level.monthlyXP += generatedXp;

          }
        }
      }
    }

    if (!multiplierChannel) {

    }

    else {

      if (multiplierChannel) {
        if (message.channel.id === multiplierChannel.channelID) {
          getXpfromDB = customSettings.customXP * multiplierChannel.multiplier;
          getCooldownfromDB = customSettings.customCooldown;

          const generatedXp = Math.floor(Math.random() * getXpfromDB);

          if (talkedRecently.has(message.author.id)) {
            return;
          } else { // cooldown is 10 seconds
            level.xp += generatedXp;
            level.totalXP += generatedXp;
            level.dailyXP += generatedXp;
            level.weeklyXP += generatedXp;
            level.monthlyXP += generatedXp;

          }
        }
      }
    }

    //Handel xp < 0
    if (level.totalXP < 0) {
      level.totalXP = 0;
    }

    if (level.xp < 0) {
      level.xp = 0;
    }

    if (level.dailyXP < 0) {
      level.dailyXP = 0;
    }

    if (level.weeklyXP < 0) {
      level.weeklyXP = 0;
    }

    if (level.monthlyXP < 0) {
      level.monthlyXP = 0;
    }

    // level up!
    if (level.xp >= nextXP) {
      level.xp -= nextXP;
      level.level += 1;

      let levelUpMsg;
      let embed = new MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
        .setColor("RANDOM")
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      if (!customSettings) {
        embed.setDescription(`**Congratulations** ${message.author}! You have now leveled up to **level ${level.level}**`);
        levelUpMsg = `**Congratulations** ${message.author}! You have now leveled up to **level ${level.level}**`;
      } else {
        function antonymsLevelUp(string) {
          return string
            .replace(/{member}/i, `${message.member}`)
            .replace(/{xp}/i, `${level.xp}`)
            .replace(/{level}/i, `${level.level}`)
        }
        embed.setDescription(antonymsLevelUp(customSettings.levelUpMessage.toString()));
        levelUpMsg = antonymsLevelUp(customSettings.levelUpMessage.toString());
      }
      // using try catch if bot have perms to send EMBED_LINKS      
      try {
        if (!channelLevel || channelLevel.channel == "Default") {
          message.channel.send({ embeds: [embed] });
        } else {
          let channel = message.guild.channels.cache.get(channelLevel.channel)
          const permissionFlags = channel.permissionsFor(message.guild.me);
          if (!permissionFlags.has("SEND_MESSAGES") || !permissionFlags.has("VIEW_CHANNEL")) return;
          channel.send({ embeds: [embed] });
        }
      } catch (err) {
        if (!channelLevel || channelLevel.channel == "Default") {
          message.channel.send(levelUpMsg);
        } else {
          let channel = message.guild.channels.cache.get(channelLevel.channel)
          const permissionFlags = channel.permissionsFor(message.guild.me);
          if (!permissionFlags.has("SEND_MESSAGES") || !permissionFlags.has("VIEW_CHANNEL")) return;
          channel.send(levelUpMsg);
        }
      }
    };
    client.setLevel.run(level);
    // add cooldown to user
    talkedRecently.add(message.author.id);
    setTimeout(() => {
      talkedRecently.delete(message.author.id)
    }, getCooldownfromDB)
  }
  // level up, time to add level roles
  const member = message.member;
  let Roles = sql.prepare("SELECT * FROM roles WHERE guildID = ? AND level = ?")

  let roles = Roles.get(message.guild.id, lvl)
  if (!roles) return;
  if (lvl >= roles.level) {
    if (roles) {
      if (member.roles.cache.get(roles.roleID)) {
        return;
      }
      if (!message.guild.me.hasPermission("MANAGE_ROLES")) {
        return
      }
      member.roles.add(roles.roleID);
    }
  }
})