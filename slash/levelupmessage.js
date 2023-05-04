const { Client, Intents, MessageEmbed } = require('discord.js');
const SQlite = require('better-sqlite3');
const sql = new SQlite('./mainDB.sqlite');
const { SlashCommandBuilder } = require('@discordjs/builders');

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('levelupmessage')
        .setDescription('Set custom level up message!')
        .addStringOption(option => 
            option.setName('message')
                .setDescription('The custom level up message.')
                .setRequired(true)
        ),
    async execute(interaction) {
        if (!interaction.member.permissions.has('MANAGE_GUILD')) {
            return interaction.reply({
                content: 'You do not have permission to use this command!',
                ephemeral: true
            });
        }

        const message = interaction.options.getString('message');
        if (!message) {
            return interaction.reply({
                content: `Please provide a level up message!\n Example: \`Congrats {member} You've leveled up to level {level}!\``,
                ephemeral: true
            });
        }

        client.getLevel = sql.prepare('SELECT * FROM levels WHERE user = ? AND guild = ?');
        const level = client.getLevel.get(interaction.user.id, interaction.guild.id);
        if (!level) {
            let insertLevel = sql.prepare('INSERT OR REPLACE INTO levels (id, user, guild, xp, level, totalXP) VALUES (?,?,?,?,?,?);');
            insertLevel.run(`${interaction.user.id}-${interaction.guild.id}`, interaction.user.id, interaction.guild.id, 0, 0, 0);
            return interaction.reply({
                content: 'Level Up Message has been set!',
                ephemeral: true
            });
        }

        function antonymsLevelUp(string) {
            return string
                .replace(/{member}/i, `${interaction.member}`)
                .replace(/{xp}/i, `${level.xp}`)
                .replace(/{level}/i, `${level.level}`);
        }

        const embed = new MessageEmbed()
            .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true }))
            .setColor('RANDOM')
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setDescription(antonymsLevelUp(message));

        const checkIf = sql.prepare('SELECT levelUpMessage FROM settings WHERE guild = ?').get(interaction.guild.id);
        if (checkIf) {
            sql.prepare('UPDATE settings SET levelUpMessage = ? WHERE guild = ?').run(message, interaction.guild.id);
        } else {
            sql.prepare('INSERT OR REPLACE INTO settings (guild, levelUpMessage, customXP, customCooldown) VALUES (?,?,?,?)').run(interaction.guild.id, message, 16, 1000);
        }

        return interaction.reply({
            content: 'Level Up Message has been set!',
            embeds: [embed],
            ephemeral: true
        });
    }
};
