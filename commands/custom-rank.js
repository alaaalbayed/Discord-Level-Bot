const { MessageEmbed } = require('discord.js');
const SQLite = require("better-sqlite3");
const sql = new SQLite('./mainDB.sqlite')

module.exports = {
    name: 'custom-rank',
    aliases: ['customrank', 'rankcard','cr'],
    description: "Customize rank card color such as; Progress, Background and Text.",
    cooldown: 3,
    category: "Leveling",
    async execute (client, message, args) {
        const selectPrefix = sql.prepare("SELECT * FROM prefix WHERE guild = ?").get(message.guild.id);;
        const prefix = selectPrefix.serverprefix
        let method = args[0];
        let color = args[1];

        if(!method)
        {
            let embed = new MessageEmbed()
                .setAuthor({ name: `${client.user.username}`, iconURL: `${client.user.avatarURL({ dynamic: true, size: 512 })}` })
                .setDescription(`**custom rank usage**`)
                .addFields({ name: `${prefix}customrank bar <colorName>/<colorHex>`, value: `chnage bar color` })
                .addFields({ name: `${prefix}customrank text <colorName>/<colorHex>`, value: `chnage text color` })
                .addFields({ name: `${prefix}customrank background <colorName>/<colorHex>`, value: `chnage background color` })
                .setColor("RANDOM")
                .setTimestamp();
            return message.channel.send({ embeds: [embed] });
        }
        if(method.toLowerCase() == "progressbar" || method.toLowerCase() == "bar" || method.toLowerCase() == "progressbarcolor")
        {
            if(!color)
            {
                return message.reply("Please provide a valid color!");
            }

            sql.prepare("UPDATE rankCardTable SET barColor = ? WHERE id = ?;").run(color, `${message.author.id}-${message.guild.id}`);

            return message.reply("Successfully updated color.")
        } else if(method.toLowerCase() == "text" || method.toLowerCase() == "textcolor")
        {
            if(!color)
            {
                return message.reply("Please provide a valid color!");
            }

            sql.prepare("UPDATE rankCardTable SET textColor = ? WHERE id = ?;").run(color, `${message.author.id}-${message.guild.id}`);

            return message.reply("Successfully updated color.")
        } else if(method.toLowerCase() == "background" || method.toLowerCase() == "backgroundcolor")
        {
            if(!color)
            {
                return message.reply("Please provide a valid color!");
            }

            sql.prepare("UPDATE rankCardTable SET backgroundColor = ? WHERE id = ?;").run(color, `${message.author.id}-${message.guild.id}`);

            return message.reply("Successfully updated color.")
        }
        
    }
}