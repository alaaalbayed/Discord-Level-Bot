const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageEmbed } = require('discord.js');
const SQlite = require('better-sqlite3');
const sql = new SQlite('./mainDB.sqlite');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-xp')
        .setDescription('remove xp from specified user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to remove xp to')
                .setRequired(true))
        .addIntegerOption(option =>
            option
                .setName('xp')
                .setDescription('The number of xp to remove')
                .setRequired(true)),
    async execute(interaction) {
        const { guild, user } = interaction;
        const member = guild.members.cache.get(user.id);

        if (!member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) {
            return interaction.reply({
                content: 'You do not have permission to use this command!',
                ephemeral: true
            });
        }

        const targetUser = interaction.options.getMember('user');
        const xpArgs = interaction.options.getInteger('xp');

        const getScore = sql.prepare('SELECT * FROM levels WHERE user = ? AND guild = ?');
        const setScore = sql.prepare(`
      INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP, dailyXP, weeklyXP, monthlyXP) 
      VALUES (@id, @user, @guild, @xp, @level, @totalXP, @dailyXP, @weeklyXP, @monthlyXP)
    `);

        if (!targetUser) {
            return interaction.reply({
                content: 'Please mention a user!',
                ephemeral: true
            });
        }

        if (isNaN(xpArgs) || xpArgs < 1) {
            return interaction.reply({
                content: 'Please provide a valid number!',
                ephemeral: true
            });
        }

        let score = getScore.get(targetUser.id, guild.id);
        if (!score) {
            score = {
                id: `${guild.id}-${targetUser.id}`,
                user: targetUser.id,
                guild: guild.id,
                xp: 0,
                level: 0,
                totalXP: 0,
                dailyXP: 0,
                weeklyXP: 0,
                monthlyXP: 0
            };
        }

        if (score.xp - xpArgs < 1) {
            return interaction.reply({content:`You cannot remove xp from this user!`,ephemeral: true})
        }
        
        const newTotalXP = xpArgs - 1
        let embed = new MessageEmbed()
            .setTitle(`Success!`)
            .setDescription(`Successfully remove ${xpArgs} level to ${targetUser.toString()}!`)
            .setColor("RANDOM");

        score.xp -= xpArgs;
        score.totalXP -= newTotalXP;
        score.dailyXP -= newTotalXP;
        score.weeklyXP -= newTotalXP;
        score.monthlyXP -= newTotalXP;
        setScore.run(score);

        interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    },
};