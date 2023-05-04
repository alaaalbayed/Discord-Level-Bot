const { MessageEmbed, Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const SQlite = require("better-sqlite3");
const sql = new SQlite('./mainDB.sqlite');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role-level')
        .setDescription('Rewards role when user leveled up to a certain level')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Adds a role for a certain level')
                .addStringOption(option =>
                    option.setName('role')
                        .setDescription('The role to add')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('level')
                        .setDescription('The level to add the role to')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('show')
                .setDescription('Displays all roles and their levels'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Removes a role from a certain level')
                .addIntegerOption(option =>
                    option.setName('level')
                        .setDescription('The level to remove the role from')
                        .setRequired(true))),
    async execute(interaction) {
        const selectPrefix = sql.prepare("SELECT * FROM prefix WHERE guild = ?").get(interaction.guild.id);
        const prefix = selectPrefix.serverprefix;
        if (!interaction.guild.me.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) return interaction.reply({ content: `I do not have permission to manage roles!`, ephemeral: true });
        if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES) || !interaction.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) return interaction.reply({ content: `You do not have permission to use this command!`, ephemeral: true });

        const method = interaction.options.getSubcommand();

        const getRole = sql.prepare("SELECT * FROM roles WHERE guildID = ? AND roleID = ? AND level = ?");
        const setRole = sql.prepare("INSERT OR REPLACE INTO roles (guildID, roleID, level) VALUES (@guildID, @roleID, @level);");

        if (method === 'add') {
            const role = interaction.options.getString('role');
            const levelArgs = interaction.options.getInteger('level');
    
            const guildRoles = interaction.guild.roles.cache;
            const targetRole = guildRoles.find(r => r.name === role || r.id === role.replace(/[^\w\s]/gi, ''));
            if (isNaN(levelArgs) || levelArgs < 1) {
                return interaction.reply({ content: `Please provide a valid level to set.`, ephemeral: true });
            } else if (!targetRole) {
                return interaction.reply({ content: `You did not provide a role to set!`, ephemeral: true });
            } else {
                let Role = getRole.get(interaction.guild.id, targetRole.id, levelArgs);
                if (!Role) {
                    Role = {
                        guildID: interaction.guild.id,
                        roleID: targetRole.id,
                        level: levelArgs
                    };
                    setRole.run(Role);
                    const embed = new MessageEmbed()
                        .setTitle(`Successfully set role!`)
                        .setDescription(`${targetRole} has been set for level ${levelArgs}`)
                        .setColor("RANDOM");
                    return interaction.reply({ embeds: [embed], ephemeral: true });
                } else if (Role) {
                    // Update existing role
                    client.deleteLevel = sql.prepare(`DELETE FROM roles WHERE guildID = ? AND roleID = ? AND level = ?`)
                    client.deleteLevel.run(interaction.guild.id, targetRole.id, levelArgs);
                    client.updateLevel = sql.prepare(`INSERT OR REPLACE roles(guildID, roleID, level) VALUES(?,?,?)`)
                    client.updateLevel.run(interaction.guild.id, targetRole.id, levelArgs)
                    const embed = new MessageEmbed()
                        .setTitle(`Successfully updated role!`)
                        .setDescription(`${targetRole} has been updated for level ${levelArgs}`)
                        .setColor("RANDOM");
                    return interaction.reply({ embeds: [embed], ephemeral: true });
                }
            }
        }

        if (method === 'show') {
            const allRoles = sql.prepare(`SELECT * FROM roles WHERE guildID = ?`).all(interaction.guild.id)
            if (!allRoles.length) {
                const embed = new MessageEmbed()
                    .setTitle(`${interaction.guild.name} Roles Level`)
                    .setDescription(`No roles have been set yet.`)
                    .setColor("RANDOM");
                return interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                const embed = new MessageEmbed()
                    .setTitle(`${interaction.guild.name} Roles Level`)
                    .setDescription(`view all role level`)
                    .setColor("RANDOM");
                for (const data of allRoles) {
                    const levelSet = data.level;
                    const roleSet = data.roleID;
                    if (roleSet) {
                        embed.addFields({ name: `\u200b`, value: `**Level ${levelSet}**: <@&${roleSet}>` });
                    }
                }
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }

        if (method === 'remove') {
            const levelArgs = interaction.options.getInteger('level');
            const getLevel = sql.prepare(`SELECT * FROM roles WHERE guildID = ? AND level = ?`)
            const levels = getLevel.get(interaction.guild.id, levelArgs)
            if(isNaN(levelArgs) && !levelArgs || levelArgs < 1) {
                return interaction.reply({content:`Please provide a level to remove.`,ephemeral: true});
            } else {
                if(!levels) {
                    return interaction.reply({content:`That isn't a valid level!`,ephemeral: true});
                } else {
                    const deleteLevel = sql.prepare(`DELETE FROM roles WHERE guildID = ? AND level = ?`)
                    deleteLevel.run(interaction.guild.id, levelArgs);
                    let embed = new MessageEmbed()
                    .setTitle(`Successfully removed role!`)
                    .setDescription(`Role rewards for level ${levelArgs} has been removed.`)
                    .setColor("RANDOM");
                     return interaction.reply({ embeds: [embed] ,ephemeral: true});
                }
            }
        }
    }
}
