const { MessageEmbed } = require('discord.js');
const SQlite = require("better-sqlite3");
const sql = new SQlite('./mainDB.sqlite');


module.exports = {
    name: 'levelupmessage',
    aliases: ['levelup', 'levelmessage', 'level-message', 'lum'],
    category: "Leveling",
    description: "Set custom level up message!",
    cooldown: 3,
    async execute(client, message, args) {
        const selectPrefix = sql.prepare("SELECT * FROM prefix WHERE guild = ?").get(message.guild.id);;
        const prefix = selectPrefix.serverprefix
        if (!message.member.permissions.has("MANAGE_GUILD")) return message.reply("You do not have permission to use this command!");

        if (!args.length) {
            let embed = new MessageEmbed()
                .setAuthor({ name: `${client.user.username}`, iconURL: `${client.user.avatarURL({ dynamic: true, size: 512 })}` })
                .setDescription(`**level up message usage**`)
                .addFields({ name: `${prefix}levelupmessage message`, value: `Example: Congrats {member} You've leveled up to level {level}!` })
                .setColor("RANDOM")
                .setTimestamp();
            return message.channel.send({ embeds: [embed] });

        }

        client.getLevel = sql.prepare("SELECT * FROM levels WHERE user = ? AND guild = ?");
        const level = client.getLevel.get(message.author.id, message.guild.id)
        if (!level) {
            let insertLevel = sql.prepare("INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP) VALUES (?,?,?,?,?,?);");
            insertLevel.run(`${message.author.id}-${message.guild.id}`, message.author.id, message.guild.id, 0, 0, 0)
            return;
        }

        let embed = new MessageEmbed()
            .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
            .setColor("RANDOM")
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .setTimestamp();
        function antonymsLevelUp(string) {
            return string
                .replace(/{member}/i, `${message.member}`)
                .replace(/{xp}/i, `${level.xp}`)
                .replace(/{level}/i, `${level.level}`)
        }
        embed.setDescription(antonymsLevelUp(args.join(' ').toString()));
        let checkIf = sql.prepare("SELECT levelUpMessage FROM settings WHERE guild = ?").get(message.guild.id);
        if (checkIf) {
            sql.prepare(`UPDATE settings SET levelUpMessage = ? WHERE guild = ?`).run(args.join(' ').toString(), message.guild.id);
        } else {
            sql.prepare(`INSERT OR REPLACE INTO settings (guild, levelUpMessage, customXP, customCooldown) VALUES (?,?,?,?)`).run(message.guild.id, args.join(' ').toString(), 16, 1000);
        }

        return message.reply(`Level Up Message has been set!`, { embeds: [embed] });
    }
}