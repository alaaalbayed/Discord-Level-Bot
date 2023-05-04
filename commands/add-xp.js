const { MessageEmbed } = require('discord.js');
const SQlite = require("better-sqlite3");
const sql = new SQlite('./mainDB.sqlite');

module.exports = {
    name: 'add-xp',
    aliases: ['addxp'],
    category: "Leveling",
    description: "add or increase xp to specifie user",
    cooldown: 3,
    async execute(client,message, args) {
        const selectPrefix = sql.prepare("SELECT * FROM prefix WHERE guild = ?").get(message.guild.id);;
        const prefix = selectPrefix.serverprefix
        let userArray = message.content.split(" ");
        let userArgs = userArray.slice(1);
        let user = message.mentions.members.first() || message.guild.members.cache.get(userArgs[0]) || message.guild.members.cache.find(x => x.user.username.toLowerCase() === userArgs.slice(0).join(" ") || x.user.username === userArgs[0])

        if (!message.member.permissions.has("MANAGE_GUILD")) return message.reply("You do not have permission to use this command!");

        const expArgs = parseInt(args[1])

        client.getScore = sql.prepare("SELECT * FROM levels WHERE user = ? AND guild = ?");
        client.setScore = sql.prepare("INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP, dailyXP, weeklyXP, monthlyXP) VALUES (@id, @user, @guild, @xp, @level, @totalXP, @dailyXP, @weeklyXP, @monthlyXP);");
        if (!args.length) {
            let embed = new MessageEmbed()
                .setAuthor({name:`${client.user.username}`, iconURL: `${client.user.avatarURL({dynamic: true, size: 512})}`})
                .setDescription(`**add xp usage**`)
                .addFields({ name: `${prefix}addxp total <xp> <@user>`, value: `add total xp` })
                .addFields({ name: `${prefix}addxp daily <xp> <@user>`, value: `add daily xp` })
                .addFields({ name: `${prefix}addxp weekly <xp> <@user>`, value: `add weekly xp` })
                .addFields({ name: `${prefix}addxp monthly <xp> <@user>`, value: `add monthly xp` })
                .setColor("RANDOM")
                .setTimestamp();
            return message.channel.send({ embeds: [embed] });
            
        }

        if (!user) {
            return message.reply(`Please mention an user!`)
        } else {
            if (isNaN(expArgs) || expArgs < 1) {
                return message.reply(`Please provide a valid number!`)
            } else {
                const method = args[0]
                if (method.toLowerCase() === 'total') {
                    if (isNaN(expArgs) || expArgs < 1) {
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
                        let embed = new MessageEmbed()
                            .setTitle(`Success!`)
                            .setDescription(`Successfully add ${expArgs} total xp for ${user.toString()}!`)
                            .setColor("RANDOM");
                        score.totalXP += expArgs
                        score.xp += expArgs
                        client.setScore.run(score)
                        return message.channel.send({ embeds: [embed] })
                    }
                }

                if (method.toLowerCase() === 'daily') {
                    if (isNaN(expArgs) || expArgs < 1) {
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
                        let embed = new MessageEmbed()
                            .setTitle(`Success!`)
                            .setDescription(`Successfully added ${expArgs} daily xp for ${user.toString()}!`)
                            .setColor("RANDOM");

                        score.dailyXP += expArgs;
                        client.setScore.run(score)
                        return message.channel.send({ embeds: [embed] })
                    }
                }

                if (method.toLowerCase() === 'weekly') {
                    if (isNaN(expArgs) || expArgs < 1) {
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
                        let embed = new MessageEmbed()
                            .setTitle(`Success!`)
                            .setDescription(`Successfully added ${expArgs} weekly xp for ${user.toString()}!`)
                            .setColor("RANDOM");

                        score.weeklyXP += expArgs;              
                        client.setScore.run(score)
                        return message.channel.send({ embeds: [embed] })
                    }
                }

                if (method.toLowerCase() === 'monthly') {
                    if (isNaN(expArgs) || expArgs < 1) {
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
                        let embed = new MessageEmbed()
                            .setTitle(`Success!`)
                            .setDescription(`Successfully added ${expArgs} monthly xp for ${user.toString()}!`)
                            .setColor("RANDOM");

                        score.monthlyXP += expArgs;            
                        client.setScore.run(score)
                        return message.channel.send({ embeds: [embed] })
                    }
                }
            }
        }
    }
}