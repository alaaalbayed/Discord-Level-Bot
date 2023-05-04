const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const SQlite = require("better-sqlite3");
const sql = new SQlite('./mainDB.sqlite');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add-xp')
        .setDescription('add or increase xp to specifie user')
        .addStringOption(option =>
            option.setName('method')
                .setDescription('The XP method you want to use')
                .setRequired(true)
                .addChoices({ name: 'Total', value: 'total' })
                .addChoices({ name: 'Daily', value: 'daily' })
                .addChoices({ name: 'Weekly', value: 'weekly' })
                .addChoices({ name: 'Monthly', value: 'monthly' }))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user you want to add XP to')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('The amount of XP you want to add')
                .setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getMember('user');
        const method = interaction.options.getString('method');
        const expArgs = interaction.options.getInteger('amount');

        if (!interaction.member.permissions.has("MANAGE_GUILD"))
            return interaction.reply({ content: "You do not have permission to use this command!", ephemeral: true });

        const getScore = sql.prepare("SELECT * FROM levels WHERE user = ? AND guild = ?");
        const setScore = sql.prepare("INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP, dailyXP, weeklyXP, monthlyXP) VALUES (@id, @user, @guild, @xp, @level, @totalXP, @dailyXP, @weeklyXP, @monthlyXP);");

        if (method.toLowerCase() === 'total') {
            if (isNaN(expArgs) || expArgs < 1) {
                return interaction.reply({ content: `Please provide a valid number!`, ephemeral: true })
            } else {
                let score = getScore.get(user.id, interaction.guild.id);
                if (!score) {
                    score = {
                        id: `${interaction.guild.id}-${user.id}`,
                        user: user.id,
                        guild: interaction.guild.id,
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
                setScore.run(score)
                return interaction.reply({ embeds: [embed] ,ephemeral: true});
            }
        }

        if (method.toLowerCase() === 'daily') {
            if (isNaN(expArgs) || expArgs < 1) {
                return interaction.reply({ content: `Please provide a valid number!`, ephemeral: true })
            } else {
                let score = getScore.get(user.id, interaction.guild.id);
                if (!score) {
                    score = {
                        id: `${interaction.guild.id}-${user.id}`,
                        user: user.id,
                        guild: interaction.guild.id,
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
                setScore.run(score)
                return interaction.reply({ embeds: [embed] ,ephemeral: true});
            }
        }

        if (method.toLowerCase() === 'weekly') {
            if (isNaN(expArgs) || expArgs < 1) {
                return interaction.reply({ content: `Please provide a valid number!`, ephemeral: true })
            } else {
                let score = getScore.get(user.id, interaction.guild.id);
                if (!score) {
                    score = {
                        id: `${interaction.guild.id}-${user.id}`,
                        user: user.id,
                        guild: interaction.guild.id,
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
                setScore.run(score)
                return interaction.reply({ embeds: [embed] ,ephemeral: true});
            }
        }
        if (method.toLowerCase() === 'monthly') {
            if (isNaN(expArgs) || expArgs < 1) {
                return interaction.reply({ content: `Please provide a valid number!`, ephemeral: true })
            } else {
                let score = getScore.get(user.id, interaction.guild.id);
                if (!score) {
                    score = {
                        id: `${interaction.guild.id}-${user.id}`,
                        user: user.id,
                        guild: interaction.guild.id,
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
                setScore.run(score)
                return interaction.reply({ embeds: [embed] ,ephemeral: true});
            }
        }
    }
}    
