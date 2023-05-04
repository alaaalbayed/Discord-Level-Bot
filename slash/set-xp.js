const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageEmbed } = require('discord.js');
const SQlite = require('better-sqlite3');
const sql = new SQlite('./mainDB.sqlite');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-xp')
        .setDescription('set xp to specified user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to set xp to')
                .setRequired(true))
        .addIntegerOption(option =>
            option
                .setName('xp')
                .setDescription('The number of xp to set')
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
        const levelArgs = interaction.options.getInteger('xp');

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
            };
        }

        let embed = new MessageEmbed()
            .setTitle(`Success!`)
            .setDescription(`Successfully set ${levelArgs} xp to ${targetUser.toString()}!`)
            .setColor("RANDOM");

        score.xp = levelArgs;
        score.totalXP = levelArgs;
        setScore.run(score);
        interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    },
};