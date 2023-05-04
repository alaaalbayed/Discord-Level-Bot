const { MessageEmbed } = require('discord.js');
const SQlite = require("better-sqlite3");
const sql = new SQlite('./mainDB.sqlite');


module.exports = {
    name: 'channel-levelup',
    aliases: ['setchannel', 'channellevelup','clu'],
    category: "Leveling",
    description: "Set specific channel to send level up message",
    cooldown: 3,
    async execute (client,message, args) {
        const selectPrefix = sql.prepare("SELECT * FROM prefix WHERE guild = ?").get(message.guild.id);;
        const prefix = selectPrefix.serverprefix
        if (!message.member.permissions.has("MANAGE_GUILD")) return message.reply("You do not have permission to use this command!");

        if (!args.length) {
            let embed = new MessageEmbed()
                .setAuthor({ name: `${client.user.username}`, iconURL: `${client.user.avatarURL({ dynamic: true, size: 512 })}` })
                .setDescription(`**channel level up usage**`)
                .addFields({ name: `${prefix}channellevelup Default`, value: `Send message in the channel user leveled up in.` })
                .addFields({ name: `${prefix}channellevelup <#channel>`, value: `Send message in the specific channel.` })
                .setColor("RANDOM")
                .setTimestamp();
            return message.channel.send({ embeds: [embed] });

        }
        let channel = message.guild.channels.cache.get(args[0]) || message.guild.channels.cache.find(c => c.name === args[0].toLowerCase()) || message.mentions.channels.first()

        if(args[0].toLowerCase() == "default"){   
            sql.prepare("INSERT OR REPLACE INTO channel (guild, channel) VALUES (?, ?);").run(message.guild.id, "Default");
            return message.reply(`Level Up Channel has been set to Default Settings`);
        } else if(channel) {
            const permissionFlags = channel.permissionsFor(message.guild.me);
            if(!permissionFlags.has("SEND_MESSAGES") || !permissionFlags.has("VIEW_CHANNEL") )
            {
                return message.reply(`I don't have permission to send message in or view ${channel}!`)
            } else
                sql.prepare("INSERT OR REPLACE INTO channel (guild, channel) VALUES (?, ?);").run(message.guild.id, channel.id);
                return message.reply(`Level Up Channel has been set to ${channel}`);
        } else {
            return message.reply(`Require arguments: \`Default\`, \`Channel ID or Mention Channel\`\nDefault: Send message in the channel user leveled up in.\nChannel ID or Mention Channel: Send message in the specific channel.`);
        }
    }
}
