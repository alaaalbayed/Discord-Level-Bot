const { MessageEmbed } = require('discord.js');
const SQlite = require("better-sqlite3");
const sql = new SQlite('./mainDB.sqlite');

module.exports = {
    name: 'remove-xp',
    aliases: ['removexp'],
    category: "Leveling",
    description: "Remove or decrease exp to specified user",
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
                .setDescription(`**remove xp usage**`)
                .addFields({ name: `${prefix}removexp total <xp> <@user>`, value: `remove total xp` })
                .addFields({ name: `${prefix}removexp daily <xp> <@user>`, value: `remove daily xp` })
                .addFields({ name: `${prefix}removexp weekly <xp> <@user>`, value: `remove weekly xp` })
                .addFields({ name: `${prefix}removexp monthly <xp> <@user>`, value: `remove monthly xp` })
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
                    let score = client.getScore.get(user.id, message.guild.id);
                    if (score.totalXP - expArgs < 1) {
                        return message.reply(`You cannot remove xp from this user!`)
                    }
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
                            .setDescription(`Successfully removed ${expArgs} xp for ${user.toString()}!`)
                            .setColor("RANDOM");
                        score.totalXP -= expArgs
                        score.xp -= expArgs

                        if (expArgs > score.xp) {
                            score.level -= 1;
                            score.xp = score.level * 2 * 250 + 250
                            score.xp -= expArgs
                        }

                        client.setScore.run(score)
                        return message.channel.send({ embeds: [embed] })
                    }
                }

                if (method.toLowerCase() === 'daily') {
                    let score = client.getScore.get(user.id, message.guild.id);
                    if (score.dailyXP - expArgs < 1) return message.reply(`You cannot remove dailyXP from this user!`)

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
                            .setDescription(`Successfully removed ${expArgs} xp for ${user.toString()}!`)
                            .setColor("RANDOM");

                        score.dailyXP -= expArgs;

                        if (expArgs > score.dailyXP) {
                            score.dailyXP = 0
                        }

                        client.setScore.run(score)
                        return message.channel.send({ embeds: [embed] })
                    }
                }

                if (method.toLowerCase() === 'weekly') {
                    let score = client.getScore.get(user.id, message.guild.id);
                    if (score.weeklyXP - expArgs < 1) return message.reply(`You cannot remove weeklyXP from this user!`)

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
                            .setDescription(`Successfully removed ${expArgs} xp for ${user.toString()}!`)
                            .setColor("RANDOM");

                        score.weeklyXP -= expArgs;

                        if (expArgs > score.weeklyXP) {
                            score.weeklyXP = 0
                        }
                        
                        client.setScore.run(score)
                        return message.channel.send({ embeds: [embed] })
                    }
                }

                if (method.toLowerCase() === 'monthly') {
                    let score = client.getScore.get(user.id, message.guild.id);
                    if (score.monthlyXP - expArgs < 1) return message.reply(`You cannot remove monthlyXP from this user!`)

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
                            .setDescription(`Successfully removed ${expArgs} xp for ${user.toString()}!`)
                            .setColor("RANDOM");

                        score.monthlyXP -= expArgs;

                        if (expArgs > score.monthlyXP) {
                            score.monthlyXP = 0
                        }
                        
                        client.setScore.run(score)
                        return message.channel.send({ embeds: [embed] })
                    }
                }
            }
        }
    }
}