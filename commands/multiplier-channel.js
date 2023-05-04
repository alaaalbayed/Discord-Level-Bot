const { MessageEmbed } = require('discord.js');
const SQlite = require("better-sqlite3");
const sql = new SQlite('./mainDB.sqlite');


module.exports = {
    name: 'multiplier-channel',
    aliases: ['multiplierchannel'],
    category: "Leveling",
    description: "multiplier xp for channel",
    cooldown: 3,
    async execute(client, message, args) {
        const selectPrefix = sql.prepare("SELECT * FROM prefix WHERE guild = ?").get(message.guild.id);;
        const prefix = selectPrefix.serverprefix

        if (!message.guild.me.permissions.has("MANAGE_ROLES")) return message.reply(`I do not have permission to manage roles!`);
        if (!message.member.permissions.has("MANAGE_ROLES") || !message.member.permissions.has("MANAGE_GUILD")) return message.reply(`You do not have permission to use this command!`);

        if (!args.length) {
            let embed = new MessageEmbed()
                .setAuthor({ name: `${client.user.username}`, iconURL: `${client.user.avatarURL({ dynamic: true, size: 512 })}` })
                .setTitle(`multiplier channel usage`)
                .setDescription(`multiplier xp to channel`)
                .addFields({ name: `${prefix}multiplierchannel add <level> <#channel>`, value: `multiplier user xp in specific channel. ` })
                .addFields({ name: `${prefix}multiplierchannel remove <#channel>`, value: `Removes the channel from gaing double xp` })
                .addFields({ name: `${prefix}multiplierchannel show`, value: `Shows all multiplier channel xp.` })
                .setColor("RANDOM")
                .setTimestamp();

            return message.channel.send({ embeds: [embed] });
        }
        const method = args[0]
        const multiplierNum = parseInt(args[1])
        const channelName = args.join(' ');
        const channelIndex1 = channelName.indexOf('<');
        const channelIndex2 = channelName.indexOf('>');
        const channelidsub = channelName.substring(channelIndex1, channelIndex2 + 1)
        const channelid = channelidsub.replace(/[^\w\s]/gi, '')
        client.getChannel = sql.prepare("SELECT * FROM multiplierChannelXP WHERE guildID = ? AND multiplier = ? AND channelID = ?");
        client.setChannel = sql.prepare("INSERT OR REPLACE INTO multiplierChannelXP (guildID, multiplier, channelID) VALUES (@guildID, @multiplier, @channelID);");

        if (method.toLowerCase() === 'add') {
            if (isNaN(multiplierNum) && !multiplierNum || multiplierNum < 1) {
                return message.reply(`Please provide a number to set.`);
            } else {
                if (!args[2]) {
                    return message.reply(`You did not provide a channel to set!`);
                } else {
                    let Channel = client.getChannel.get(message.guild.id, channelid, multiplierNum)
                    if (!Channel) {
                        Channel = {
                            guildID: message.guild.id,
                            channelID: channelid,
                            multiplier: multiplierNum
                        }
                        client.setChannel.run(Channel)
                        let embed = new MessageEmbed()
                            .setTitle(`Successfully set channel!`)
                            .setDescription(`<#${channelid}> has been set for multiplier ChannelXP ${multiplierNum}`)
                            .setColor("RANDOM");
                        return message.channel.send({ embeds: [embed] });
                    }
                    else if (Channel) {

                        client.deleteChannel = sql.prepare(`DELETE FROM multiplierChannelXP WHERE guildID = ? AND multiplier = ? AND channelID = ?`)
                        client.deleteChannel.run(message.guild.id, channelid, multiplierNum);
                        client.updateChannel = sql.prepare(`INSERT INTO multiplierChannelXP(guildID, multiplier, channelID) VALUES(?,?,?)`)
                        client.updateChannel.run(message.guild.id, channelid, multiplierNum)
                        let embed = new MessageEmbed()
                            .setTitle(`Successfully set multiplier channelXP!`)
                            .setDescription(`<#${channelid}> has been updated for multiplier roleXP ${multiplierNum}`)
                            .setColor("RANDOM");
                        return message.channel.send({ embeds: [embed] });
                    }

                }
            }
        }


        if (method.toLowerCase() === 'show') {
            const allChannels = sql.prepare(`SELECT * FROM multiplierChannelXP WHERE guildID = ?`).all(message.guild.id)
            if (!allChannels) {
                return message.reply(`There is no channel yet!`)
            } else {
                let embed = new MessageEmbed()
                    .setTitle(`${message.guild.name} multiplier-channel`)
                    .setDescription(`\`${prefix}help multiplier-channel\` for more information`)
                    .setColor("RANDOM");
                for (const data of allChannels) {
                    let multiplierSet = data.multiplier;
                    let ChannelSet = data.channelID;
                    embed.addFields({ name: `\u200b`, value: `**channel <#${ChannelSet}> multiplier X${multiplierSet}**: ` });
                }
                return message.channel.send({ embeds: [embed] });
            }
        }


        if (method.toLowerCase() === 'remove' || method === 'delete') {
            const channelName = args.join(' ');
            const channelIndex1 = channelName.indexOf('<');
            const channelIndex2 = channelName.indexOf('>');
            const channelidsub = channelName.substring(channelIndex1, channelIndex2 + 1)
            const channelid = channelidsub.replace(/[^\w\s]/gi, '')
            client.getAllChnnael = sql.prepare(`SELECT * FROM multiplierChannelXP WHERE guildID = ? AND channelID = ?`)
            const getChnnael = client.getAllChnnael.get(message.guild.id, channelid)
            if (!args[1]) {
                return message.reply(`Please tag a channel to remove.`);
            } else {
                if (!getChnnael) {
                    return message.reply(`This channel not added yet!`);
                } else {
                    client.deleteChannel = sql.prepare(`DELETE FROM multiplierChannelXP WHERE guildID = ? AND channelID = ?`)
                    client.deleteChannel.run(message.guild.id, channelid);
                    let embed = new MessageEmbed()
                        .setTitle(`Successfully removed Channel!`)
                        .setDescription(`Channel xp <#${channelid}> has been removed.`)
                        .setColor("RANDOM");
                    return message.channel.send({ embeds: [embed] });
                }
            }
        }
    }
}