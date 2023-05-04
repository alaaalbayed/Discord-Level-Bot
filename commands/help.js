const { MessageEmbed, Permissions } = require("discord.js");
const SQLite = require("better-sqlite3");
const sql = new SQLite('./mainDB.sqlite')

module.exports = {
  name: "help",
  aliases: ["h"],
  category: "Utility",
  cooldown: 3,
  description: "Display Help Commands",
  async execute(client, message, args) {
    const selectPrefix = sql.prepare("SELECT * FROM prefix WHERE guild = ?").get(message.guild.id);;
    const prefix = selectPrefix.serverprefix
    if (!message.guild.me.permissions.has(Permissions.FLAGS.EMBED_LINKS)) return message.reply('Missing Permission: EMBED_LINKS');

    const { commands } = message.client;

    if (!args.length) {

      let help = new MessageEmbed()
        .setColor("RANDOM")
        .setAuthor({name:`${client.user.username}`, iconURL: `${client.user.avatarURL({dynamic: true, size: 512})}`})
        .setDescription(`**Help Menu**`)
        .addFields(
          { name: `General Commands (3)`, value: `\`${prefix}rank\`, \`${prefix}leaderboard\`, \`${prefix}ping\`` },
        )
        .addFields(
          { name: `Admin Command (8)`, value: `\`${prefix}add-level\`, \`${prefix}add-xp\`, \`${prefix}set-level\`, \`${prefix}set-xp\`, \`${prefix}remove-level\`\n \`${prefix}remove-xp\`, \`${prefix}role-level\`, \`${prefix}blacklist\`` },
        )
        .addFields(
          { name: `Configuration Command (7)`, value: `\`${prefix}set-prefix\`, \`${prefix}custom-rank\`, \`${prefix}channel-levelup\`, \`${prefix}levelupmessage\`,\n \`${prefix}cooldown\`, \`${prefix}multiplier-channel\`, \`${prefix}multiplier-role\`` },
        )
        .setTimestamp()

      return message.channel.send({ embeds: [help] });

    }

    const name = args[0].toLowerCase();
    const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name))

    if (!command) {
      return message.channel.send('That\'s not a valid command!');
    }

    let embed = new MessageEmbed()
    embed.setTitle(command.name.slice(0, 1) + command.name.slice(1));
    embed.setColor("RANDOM");
    embed.setFooter({text:"<> is mandatory, [] is optional"});
    embed.setDescription([
      `**Command Name**: ${command.name}`,
      `**Description**: ${command.description ? command.description : "None"}`,
      `**Category**: ${command.category ? command.category : "General" || "Misc"}`,
      `**Aliases**: ${command.aliases ? command.aliases.join(", ") : "None"}`,
      `**Cooldown**: ${command.cooldown ? command.cooldown : "None"}`
    ].join("\n"));

    message.channel.send({ embeds: [embed] });
  }
};