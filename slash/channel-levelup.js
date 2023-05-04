const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');
const SQlite = require('better-sqlite3');
const sql = new SQlite('./mainDB.sqlite');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('channel-levelup')
        .setDescription('Set specific channel to send level up message')
        .addStringOption(option =>
            option.setName('type')
            .setDescription('Choose the type of channel')
            .setRequired(true)
            .addChoices({name:'Default', value:'default'})
            .addChoices({name:'Tag Channel', value:'tagchannel'})
        )
        .addChannelOption(option =>
            option.setName('channel')
            .setDescription('Select the channel to send level up messages')
            .setRequired(false)
        ),
    async execute(interaction) {
        if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD))
            return interaction.reply({
                content: 'You do not have permission to use this command!',
                ephemeral: true
            });

        const type = interaction.options.getString('type');
        const channelOption = interaction.options.getChannel('channel');

        if (type === 'default') {
            sql.prepare('INSERT OR REPLACE INTO channel (guild, channel) VALUES (?, ?);').run(
                interaction.guildId,
                'Default'
            );
            return interaction.reply({
                content: 'Level Up Channel has been set to Default Settings',
                ephemeral: true
            });
        } else if (type === 'tagchannel' && channelOption) {
            const permissionFlags = channelOption.permissionsFor(interaction.guild.me);

            if (!permissionFlags.has(Permissions.FLAGS.SEND_MESSAGES) || !permissionFlags.has(Permissions.FLAGS.VIEW_CHANNEL)) {
                return interaction.reply({
                    content: `I don't have permission to send message in or view ${channelOption}!`,
                    ephemeral: true
                });
            } else {
                sql.prepare('INSERT OR REPLACE INTO channel (guild, channel) VALUES (?, ?);').run(
                    interaction.guildId,
                    channelOption.id
                );
                return interaction.reply({
                    content: `Level Up Channel has been set to ${channelOption}`,
                    ephemeral: true
                });
            }
        } else {
            return interaction.reply({
                content: 'Invalid type or missing channel option.',
                ephemeral: true
            });
        }
    },
};
