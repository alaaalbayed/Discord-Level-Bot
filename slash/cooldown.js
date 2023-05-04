const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const SQlite = require("better-sqlite3");
const sql = new SQlite('./mainDB.sqlite');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cooldown')
        .setDescription('Set custom XP and Cooldown')
        .addIntegerOption(option => option.setName('xp').setDescription('The amount of XP to set').setRequired(true))
        .addIntegerOption(option => option.setName('cooldown').setDescription('The amount of cooldown in seconds to set').setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has('MANAGE_GUILD')) {
            return await interaction.reply('You do not have permission to use this command!');
        }
        
        const xp = interaction.options.getInteger('xp');
        const cooldown = interaction.options.getInteger('cooldown');

        if (isNaN(xp) || isNaN(cooldown)) {
            return await interaction.reply('Please provide a valid argument! `/cooldown xp (seconds)`');
        }
        
        if (xp < 0) {
            return await interaction.reply('XP cannot be less than 0 XP!');
        }

        if (cooldown < 0) {
            return await interaction.reply('Cooldown cannot be less than 0 seconds!');
        }

        const checkIf = sql.prepare('SELECT levelUpMessage FROM settings WHERE guild = ?').get(interaction.guild.id);
        if (checkIf) {
            sql.prepare('UPDATE settings SET customXP = ? WHERE guild = ?').run(xp, interaction.guild.id);
            sql.prepare('UPDATE settings SET customCooldown = ? WHERE guild = ?').run(cooldown * 1000, interaction.guild.id);
        } else {
            sql.prepare('INSERT OR REPLACE INTO settings (guild, levelUpMessage, customXP, customCooldown) VALUES (?,?,?,?)').run(interaction.guild.id, '**Congratulations** {member}! You have now leveled up to **level {level}**', xp, cooldown * 1000);
        }
        
        return await interaction.reply({content:`Users will now gain 1XP - ${xp}XP/${cooldown}s`,ephemeral: true});
    },
};
