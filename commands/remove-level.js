const { MessageEmbed } = require('discord.js');
const SQlite = require("better-sqlite3");
const sql = new SQlite('./mainDB.sqlite');

module.exports = {
    name: 'remove-level',
    aliases: ['removelevel'],
    category: "Leveling",
    description: "Remove or decrease level to specified user",
    cooldown: 3,
    async execute(client,message, args) {
        const selectPrefix = sql.prepare("SELECT * FROM prefix WHERE guild = ?").get(message.guild.id);;
        const prefix = selectPrefix.serverprefix

        if (!args.length) {
            let embed = new MessageEmbed()
                .setAuthor({name:`${client.user.username}`, iconURL: `${client.user.avatarURL({dynamic: true, size: 512})}`})
                .setDescription(`**remove level usage**`)
                .addFields({ name: `${prefix}remove-level <@user> <number> `, value: `remove level from specific` })
                .setColor("RANDOM")
                .setTimestamp();
            return message.channel.send({ embeds: [embed] });
            
        }
        
        let userArray = message.content.split(" ");
        let userArgs = userArray.slice(1);
        let user = message.mentions.members.first() || message.guild.members.cache.get(userArgs[0]) || message.guild.members.cache.find(x => x.user.username.toLowerCase() === userArgs.slice(0).join(" ") || x.user.username === userArgs[0])

        if (!message.member.permissions.has("MANAGE_GUILD")) return message.reply("You do not have permission to use this command!");

        const levelArgs = parseInt(args[1])

        client.getScore = sql.prepare("SELECT * FROM levels WHERE user = ? AND guild = ?");
        client.setScore = sql.prepare("INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP, dailyXP, weeklyXP, monthlyXP) VALUES (@id, @user, @guild, @xp, @level, @totalXP, @dailyXP, @weeklyXP, @monthlyXP);");
        if (!user) {
            return message.reply(`Please mention an user!`)
        } else {
            if (isNaN(levelArgs) || levelArgs < 1) {
                return message.reply(`Please provide a valid number!`)
            } else {
                let score = client.getScore.get(user.id, message.guild.id);
                if (!score) {
                    score = {
                        id: `${message.guild.id}-${user.id}`,
                        user: user.id,
                        guild: message.guild.id,
                        xp: 0,
                        level: 0,
                        totalXP: 0,
                        dailyXP: 0,
                        weeklyXP: 0,
                        monthlyXP: 0
                    }
                }
                if (score.level - levelArgs < 1) {
                    return message.reply(`You cannot remove levels from this user!`)
                }


                const newTotalXP = levelArgs
                let embed = new MessageEmbed()
                    .setTitle(`Success!`)
                    .setDescription(`Successfully remove ${levelArgs} level from ${user.toString()}!`)
                    .setColor("RANDOM");

                score.level -= levelArgs
                score.totalXP -= newTotalXP * 2 * 250 + 250
                score.dailyXP -= newTotalXP * 2 * 250 + 250
                score.weeklyXP -= newTotalXP * 2 * 250 + 250
                score.monthlyXP -= newTotalXP * 2 * 250 + 250
                client.setScore.run(score)
                return message.channel.send({ embeds: [embed] })
            }
        }
    }
}