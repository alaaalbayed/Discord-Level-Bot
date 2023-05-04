const { MessageEmbed } = require('discord.js');
const SQlite = require("better-sqlite3");
const sql = new SQlite('./mainDB.sqlite');


module.exports = {
    name: 'prefix',
    aliases: ['set-prefix','changeprefix'],
    category: "Configuration",
    description: "Set server prefix",
    cooldown: 3,
    async execute(client, message, args) {

        if (!message.member.permissions.has("MANAGE_GUILD")) return message.reply("You do not have permission to use this command!");

        const selectPrefix = sql.prepare("SELECT * FROM prefix WHERE guild = ?").get(message.guild.id);;
        const prefix = selectPrefix.serverprefix

        if (!args.length) {
            let embed = new MessageEmbed()
                .setAuthor({ name: `${client.user.username}`, iconURL: `${client.user.avatarURL({ dynamic: true, size: 512 })}` })
                .setDescription(`**prefix usage**`)
                .addFields({ name: `${prefix}prefix <prefix>`, value: `set new server prefix` })
                .setColor("RANDOM")
                .setTimestamp();
            return message.channel.send({ embeds: [embed] });

        }

        if(args[0] == prefix) 
        {
            return message.reply(`Please provide a new server prefix!`)
        }

        sql.prepare("INSERT OR REPLACE INTO prefix (serverprefix, guild) VALUES (?, ?);").run(args[0], message.guild.id)
        return message.reply(`Server prefix is now \`${args[0]}\``)
    }
}