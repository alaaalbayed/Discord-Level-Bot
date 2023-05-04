const { MessageEmbed } = require('discord.js');
const SQlite = require("better-sqlite3");
const sql = new SQlite('./mainDB.sqlite');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('prefix')
        .setDescription('Set server prefix')
        .addStringOption(option => option.setName('new').setDescription('The new server prefix').setRequired(false)),
    async execute(interaction) {
        const memberPermissions = interaction.member.permissions;
        const guildId = interaction.guild.id;
        const selectPrefix = sql.prepare("SELECT * FROM prefix WHERE guild = ?").get(guildId);
        const prefix = selectPrefix.serverprefix;

        if (!memberPermissions.has(Permissions.FLAGS.MANAGE_GUILD)) {
            return interaction.reply('You do not have permission to use this command!');
        }

        const newPrefix = interaction.options.getString('new');

        if (newPrefix === prefix) {
            return interaction.reply({ content: `Please provide a new server prefix!`, ephemeral: true });
        }

        sql.prepare("INSERT OR REPLACE INTO prefix (serverprefix, guild) VALUES (?, ?);").run(newPrefix, guildId);
        return interaction.reply({ content:`Server prefix is now \`${newPrefix}\``, ephemeral: true });
    },
};
