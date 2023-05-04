const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const SQlite = require("better-sqlite3");
const sql = new SQlite('./mainDB.sqlite');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blacklist')
        .setDescription('Blacklist user/channel from leveling up/gaining XP')
        .addSubcommand(subcommand =>
            subcommand
                .setName('user')
                .setDescription('Blacklist a specific user')
                .addUserOption(option => option.setName('user').setDescription('The user to blacklist').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('channel')
                .setDescription('Blacklist a specific channel')
                .addChannelOption(option => option.setName('channel').setDescription('The channel to blacklist').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a user/channel from the blacklist')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('The type of blacklist (User/Channel).')
                        .setRequired(true)
                        .addChoices({ name: 'User', value: 'user' })
                        .addChoices({ name: 'Channel', value: 'channel' })
                )
                .addUserOption((option) =>
                    option.setName('user').setDescription('The user to remove from the blacklist.')
                )
                .addChannelOption((option) =>
                    option.setName('channel').setDescription('The channel to remove from the blacklist.')
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all blocked users/channels.')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('The type of blacklist (User/Channel).')
                        .setRequired(true)
                        .addChoices({ name: 'User', value: 'user' })
                        .addChoices({ name: 'Channel', value: 'channel' })
                )
                .addIntegerOption(option =>
                    option.setName('page')
                        .setDescription('The page of results to view.')
                )
        )
        .setDefaultPermission(false),

    async execute(interaction) {

        if (!interaction.member.permissions.has('MANAGE_GUILD')) {
            return interaction.reply({
                content: 'You do not have permission to use this command!',
                ephemeral: true
            });
        }
        const guildId = interaction.guildId;
        const guild = interaction.guild;
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === 'list') {
            const type = interaction.options.getString('type');
            const page = interaction.options.getInteger('page') ?? 1;
            const typeText = type === 'user' ? 'User' : 'Channel';
            const query = `SELECT * FROM blacklistTable WHERE guild = ? AND type = '${typeText}' ORDER BY id LIMIT 10 OFFSET ${(page - 1) * 10}`;
            const Lists = sql.prepare(query).all(guildId);
            if (!Lists.length) {
                return interaction.reply({ content: 'There are no users/channels on the blacklist!', ephemeral: true });
            }

            const embed = new MessageEmbed()
                .setTitle(`${guild.name} ${typeText} Blacklist`)
                .setDescription(`\`help blacklist\` for more information`)
                .setColor('RANDOM');

            for (const data of Lists) {
                const { type, typeId } = data;
                const name = type === 'User' ? `<@${typeId}>` : `<#${typeId}>`;
                embed.addFields({ name: '\u200B', value: `**${type}**: ${name}` });
            }

            return interaction.reply({ embeds: [embed] });
        }

        if (interaction.options.getSubcommand() === 'user') {
            const user = interaction.options.getUser('user');
            const ifExists = sql.prepare(`SELECT id FROM blacklistTable WHERE id = ?`).get(`${interaction.guild.id}-${user.id}`);

            if (ifExists) {
                return interaction.reply({ content: `This user is already blacklisted!`, ephemeral: true });
            } else {
                sql.prepare("INSERT OR REPLACE INTO blacklistTable (guild, typeId, type, id) VALUES (?, ?, ?, ?);").run(interaction.guild.id, user.id, "User", `${interaction.guild.id}-${user.id}`);
                return interaction.reply({ content: `User ${user} has been blacklisted!`, ephemeral: true });
            }
        }

        if (interaction.options.getSubcommand() === 'channel') {
            const channel = interaction.options.getChannel('channel');
            const ifExists = sql.prepare(`SELECT id FROM blacklistTable WHERE id = ?`).get(`${interaction.guild.id}-${channel.id}`);

            if (ifExists) {
                return interaction.reply({ content: `This channel is already blacklisted!`, ephemeral: true });
            } else {
                sql.prepare("INSERT OR REPLACE INTO blacklistTable (guild, typeId, type, id) VALUES (?, ?, ?, ?);").run(interaction.guild.id, channel.id, "Channel", `${interaction.guild.id}-${channel.id}`);
                return interaction.reply({ content: `Channel ${channel} has been blacklisted!`, ephemeral: true });
            }
        }

        if (interaction.options.getSubcommand() === 'remove') {
            const user = interaction.options.getUser('user');
            const ifExists = sql.prepare(`SELECT id FROM blacklistTable WHERE id = ?`);
            if (user) {
                if (!ifExists.get(`${interaction.guild.id}-${user.id}`))
                    return interaction.reply(`This user is not blacklisted!`);
                else
                    sql.prepare("DELETE FROM blacklistTable WHERE id = ?").run(`${interaction.guild.id}-${user.id}`);
                return interaction.reply({
                    content: `Successfully removed <@${user.id}> from blacklist`,
                    ephemeral: true
                });
            }
            else {
                const channel = interaction.options.getChannel('channel');
                const ifExists = sql.prepare(`SELECT id FROM blacklistTable WHERE id = ?`);
                if (!ifExists.get(`${interaction.guild.id}-${channel.id}`))
                    return interaction.reply(`This channel is not blacklisted!`);
                else
                    sql.prepare("DELETE FROM blacklistTable WHERE id = ?").run(`${interaction.guild.id}-${channel.id}`);
                return interaction.reply({
                    content: `Successfully removed <#${channel.id}> from blacklist`,
                    ephemeral: true
                });
            }
        }
    }
}

