const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const { description } = require('../commands/remove-level');
const sql = new SQLite('./mainDB.sqlite');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Check top 10 users with the most xp and the highest level')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('The type of leaderboard to show')
                .setRequired(true)
                .addChoices({ name: 'Total', value: 'total' })
                .addChoices({ name: 'Daily', value: 'day' })
                .addChoices({ name: 'Weekly', value: 'week' })
                .addChoices({ name: 'Monthly', value: 'month' }))
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('The page of the leaderboard to show')
                .setRequired(false)),
    category: 'Leveling',
    cooldown: 0,
    async execute(interaction) {
        const type = interaction.options.getString('type');
        const page = interaction.options.getInteger('page') || 1;

        // Select data from database
        let top;
        let title;
        let totalPages;
        let query;
        switch (type) {
            case 'total':
                author = {name:`${interaction.client.user.username}`, iconURL: `${interaction.client.user.avatarURL({dynamic: true, size: 512})}`};
                top = sql.prepare('SELECT * FROM levels WHERE guild = ? ORDER BY totalXP DESC;').all(interaction.guild.id);
                title = `${interaction.guild.name} Ranking`;
                query = 'totalXP';
                footer = {text:`Page ${page} / ${Math.ceil(top.length / 10)}`}
                var description = `Top 10 Leaderboard`;
                break;
            case 'day':
                author = {name:`${interaction.client.user.username}`, iconURL: `${interaction.client.user.avatarURL({dynamic: true, size: 512})}`};
                top = sql.prepare('SELECT * FROM levels WHERE guild = ? ORDER BY dailyXP DESC;').all(interaction.guild.id);
                title = `${interaction.guild.name} Ranking`;
                query = 'dailyXP';
                footer = {text:`Page ${page} / ${Math.ceil(top.length / 10)}`}
                var description = `Top 10 Leaderboard in day`;
                break;
            case 'week':
                author = {name:`${interaction.client.user.username}`, iconURL: `${interaction.client.user.avatarURL({dynamic: true, size: 512})}`};
                top = sql.prepare('SELECT * FROM levels WHERE guild = ? ORDER BY weeklyXP DESC;').all(interaction.guild.id);
                title = `${interaction.guild.name} Ranking`;
                query = 'weeklyXP';
                footer = {text:`Page ${page} / ${Math.ceil(top.length / 10)}`}
                var description = `Top 10 Leaderboard in week`;
                break;
            case 'month':
                author = {name:`${interaction.client.user.username}`, iconURL: `${interaction.client.user.avatarURL({dynamic: true, size: 512})}`};
                top = sql.prepare('SELECT * FROM levels WHERE guild = ? ORDER BY monthlyXP DESC;').all(interaction.guild.id);
                title = `${interaction.guild.name} Ranking`;
                query = 'monthlyXP';
                footer = {text:`Page ${page} / ${Math.ceil(top.length / 10)}`}
                var description = `Top 10 Leaderboard in month`;
                break;
            default:
                return interaction.reply({ content: 'Invalid leaderboard type!', ephemeral: true });
        }

        if (top.length < 1) {
            return interaction.reply({ content: 'There are no users in the leaderboard!', ephemeral: true });
        }

        const itemsPerPage = 10;
        totalPages = Math.ceil(top.length / itemsPerPage);

        if (page > totalPages || page < 1) {
            return interaction.reply({ content: `Invalid page number! There are only ${totalPages} pages`, ephemeral: true });
        }

        const embed = new MessageEmbed()
            .setAuthor(author)
            .setTitle(title)
            .setDescription(description)
            .setColor('RANDOM')
            .setFooter(footer)
            .setTimestamp();

        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageData = top.slice(startIndex, endIndex);


        for (let i = 0; i < pageData.length; i++) {
            let user;
            try {
                user = await interaction.client.users.fetch(pageData[i].user);
            } catch (error) {
                user = `<@${pageData[i].user}>`;
            }
            if (interaction.options.getString('type') == "total") {
                embed.addFields({ name: `\u200b`, value: `#**${i + 1}** ${user}\n` + `> **Level**: \`${pageData[i].level}\`\n > **XP**: \`${pageData[i].totalXP}\`` });
            }
            else if (interaction.options.getString('type') == "day") {
                embed.addFields({ name: `\u200b`, value: `#**${i + 1}** ${user}\n` + `> **Level**: \`${pageData[i].level}\`\n > **XP**: \`${pageData[i].dailyXP}\`` });
            }
            else if (interaction.options.getString('type') == "week") {
                embed.addFields({ name: `\u200b`, value: `#**${i + 1}** ${user}\n` + `> **Level**: \`${pageData[i].level}\`\n > **XP**: \`${pageData[i].weeklyXP}\`` });
            }
            else if (interaction.options.getString('type') == "month") {
                embed.addFields({ name: `\u200b`, value: `#**${i + 1}** ${user}\n` + `> **Level**: \`${pageData[i].level}\`\n > **XP**: \`${pageData[i].monthlyXP}\`` });
            }
        }
        interaction.reply({ embeds: [embed] });
    }
}
