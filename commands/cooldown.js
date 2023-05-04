const { MessageEmbed } = require('discord.js');
const SQlite = require("better-sqlite3");
const sql = new SQlite('./mainDB.sqlite');

module.exports = {
    name: 'cooldown',
    aliases: ['cooldown', 'cd'],
    category: "Leveling",
    description: "Set custom XP and Cooldown",
    cooldown: 3,
    async execute(client, message, args) {
        const selectPrefix = sql.prepare("SELECT * FROM prefix WHERE guild = ?").get(message.guild.id);;
        const prefix = selectPrefix.serverprefix
        if (!message.member.permissions.has("MANAGE_GUILD")) return message.reply("You do not have permission to use this command!");

        if (!args.length) {
            let embed = new MessageEmbed()
                .setAuthor({ name: `${client.user.username}`, iconURL: `${client.user.avatarURL({ dynamic: true, size: 512 })}` })
                .setDescription(`**channel level up usage**`)
                .addFields({ name: `${prefix}cd <xp> <seconds>`, value: `Set custom XP and Cooldown` })
                .setColor("RANDOM")
                .setTimestamp();
            return message.channel.send({ embeds: [embed] });

        }

        if (isNaN(args[0]) || isNaN(args[1]))
            return message.reply(`Please provide a vaild argument! \`cooldown (xp) (seconds)\``);

        if (parseInt(args[0]) < 0)
            return message.reply(`XP cannot be less than 0 XP!`);

        if (parseInt(args[1]) < 0)
            return message.reply(`Cooldown cannot be less than 0 seconds!`);

        let checkIf = sql.prepare("SELECT levelUpMessage FROM settings WHERE guild = ?").get(message.guild.id);
        if (checkIf) {
            sql.prepare(`UPDATE settings SET customXP = ? WHERE guild = ?`).run(parseInt(args[0]), message.guild.id);
            sql.prepare(`UPDATE settings SET customCooldown = ? WHERE guild = ?`).run(parseInt(args[1]) * 1000, message.guild.id);
        } else {
            sql.prepare(`INSERT OR REPLACE INTO settings (guild, levelUpMessage, customXP, customCooldown) VALUES (?,?,?,?)`).run(message.guild.id, `**Congratulations** {member}! You have now leveled up to **level {level}**`, parseInt(args[0]), parseInt(args[1]) * 1000);
        }

        return message.reply(`User from now will gain 1XP - ${parseInt(args[0])}XP/${parseInt(args[1])}s`);
    }
}