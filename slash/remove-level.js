const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageEmbed } = require('discord.js');
const SQlite = require('better-sqlite3');
const sql = new SQlite('./mainDB.sqlite');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-level')
        .setDescription('remove level from specified user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to remove levels to')
                .setRequired(true))
        .addIntegerOption(option =>
            option
                .setName('levels')
                .setDescription('The number of levels to remove')
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
        const levelArgs = interaction.options.getInteger('levels');

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

        if (isNaN(levelArgs) || levelArgs < 1) {
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

        if (score.level - levelArgs < 1) {
            return interaction.reply({content:`You cannot remove levels from this user!`,ephemeral: true})
        }
        
        const newTotalXP = levelArgs
        let embed = new MessageEmbed()
            .setTitle(`Success!`)
            .setDescription(`Successfully remove ${levelArgs} level to ${targetUser.toString()}!`)
            .setColor("RANDOM");

        score.level -= levelArgs;
        score.totalXP -= newTotalXP * 2 * 250 + 250;
        score.dailyXP -= newTotalXP * 2 * 250 + 250;
        score.weeklyXP -= newTotalXP * 2 * 250 + 250;
        score.monthlyXP -= newTotalXP * 2 * 250 + 250;
        setScore.run(score);

        interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    },
};