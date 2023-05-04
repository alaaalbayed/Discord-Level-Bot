const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const SQlite = require("better-sqlite3");
const sql = new SQlite('./mainDB.sqlite');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('multiplier-channel')
        .setDescription('Multiplier XP for channel')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Multiplier user XP in specific channel.')
                .addIntegerOption(option =>
                    option.setName('level')
                        .setDescription('The level to apply the multiplier.')
                        .setRequired(true)
                )
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel to apply the multiplier.')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Removes channel XP.')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel to remove the multiplier from.')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('show')
                .setDescription('Shows all multiplier channel XP.')
        ),
    async execute(interaction) {
        const selectPrefix = sql.prepare("SELECT * FROM prefix WHERE guild = ?").get(interaction.guild.id);
        const prefix = selectPrefix.serverprefix;
        if (!interaction.guild.me.permissions.has("MANAGE_ROLES")) return interaction.reply(`I do not have permission to manage roles!`);
        if (!interaction.member.permissions.has("MANAGE_ROLES") || !interaction.member.permissions.has("MANAGE_GUILD")) return interaction.reply(`You do not have permission to use this command!`);

        const method = interaction.options.getSubcommand();

        const getChannel = sql.prepare("SELECT * FROM multiplierChannelXP WHERE guildID = ? AND multiplier = ? AND channelID = ?");
        const setChannel = sql.prepare("INSERT OR REPLACE INTO multiplierChannelXP (guildID, multiplier, channelID) VALUES (@guildID, @multiplier, @channelID);");

        if (method === 'add') {
            const level = interaction.options.getInteger('level');
            const channel = interaction.options.getChannel('channel');
            if (isNaN(level) || level < 1) {
                return interaction.reply(`Please provide a number to set.`);
            } else {
                if (!channel) {
                    return interaction.reply(`You did not provide a channel to set!`);
                } else {
                    let Channel = getChannel.get(interaction.guild.id, channel.id, level)
                    if (!Channel) {
                        Channel = {
                            guildID: interaction.guild.id,
                            channelID: channel.id,
                            multiplier: level
                        }
                        setChannel.run(Channel)
                        let embed = new MessageEmbed()
                            .setTitle(`Successfully set Channel!`)
                            .setDescription(`<#${channel.id}> has been set for multiplier channelXp ${level}`)
                            .setColor("RANDOM");
                        return interaction.reply({ embeds: [embed] });
                    }
                    else if (Channel) {
                        const deleteChannel = sql.prepare(`DELETE FROM multiplierChannelXP WHERE guildID = ? AND multiplier = ? AND channelID = ?`)
                        deleteChannel.run(interaction.guild.id, channel.id, level);
                        const updateChannel = sql.prepare(`INSERT INTO multiplierChannelXP(guildID, multiplier, channelID) VALUES(?,?,?)`)
                        updateChannel.run(interaction.guild.id, channel.id, level)
                        let embed = new MessageEmbed()
                            .setTitle(`Successfully set multiplier channel`)
                            .setDescription(`The channel ${Channel} has been successfully set as the ${level}X multiplier channel.`)
                            .setColor("#00ff00")
                        await interaction.reply({ embeds: [embed] ,ephemeral: true});
                    }
                }
            }
        }

        if (method === 'show') {
            const allChannels = sql.prepare(`SELECT * FROM multiplierChannelXP WHERE guildID = ?`).all(interaction.guild.id)
            if (!allChannels) {
                return message.reply(`There is no channel yet!`)
            } else {
                let embed = new MessageEmbed()
                    .setTitle(`${interaction.guild.name} multiplier-channel`)
                    .setDescription(`\`${prefix}help multiplier-channel\` for more information`)
                    .setColor("RANDOM");
                for (const data of allChannels) {
                    let multiplierSet = data.multiplier;
                    let ChannelSet = data.channelID;
                    embed.addFields({ name: `\u200b`, value: `**channel <#${ChannelSet}> multiplier X${multiplierSet}**: ` });
                }
                return interaction.reply({ embeds: [embed] ,ephemeral: true});
            }
        }


        if (method === 'remove' || method === 'delete') {
            const channelid = interaction.options.getChannel('channel');
            const getAllChannel = sql.prepare(`SELECT * FROM multiplierChannelXP WHERE guildID = ? AND channelID = ?`)
            const getChannel= getAllChannel.get(interaction.guild.id, channelid.id)
            if (!getChannel) {
                return interaction.reply(`This channel not added yet!`);
            } else {
                const deleteLevel = sql.prepare(`DELETE FROM multiplierChannelXP WHERE guildID = ? AND channelID = ?`)
                deleteLevel.run(interaction.guild.id, channelid.id);
                let embed = new MessageEmbed()
                    .setTitle(`Successfully removed the channel!`)
                    .setDescription(`channel xp <#${channelid.id}> has been removed.`)
                    .setColor("RANDOM");
                return interaction.reply({ embeds: [embed] ,ephemeral: true});
            }
        }
    }
}

