const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require("discord.js");
const config = require("../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Display Help Commands'),
  async execute(interaction) {
    const prefix = config.prefix
    if (!interaction.guild.me.permissions.has(Permissions.FLAGS.EMBED_LINKS)) return interaction.reply('Missing Permission: EMBED_LINKS');

    const { commands } = interaction.client;

    const commandName = interaction.options.getString('command');
    if (!commandName) {
      const help = new MessageEmbed()
        .setAuthor({ name: `${interaction.client.user.username}`, iconURL: `${interaction.client.user.avatarURL({ dynamic: true, size: 512 })}` })
        .setColor("RANDOM")
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

      return interaction.reply({ embeds: [help], ephemeral: true });
    }
  }
}
