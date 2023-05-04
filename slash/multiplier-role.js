const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const SQlite = require("better-sqlite3");
const sql = new SQlite('./mainDB.sqlite');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('multiplier-role')
        .setDescription('Multiplier XP for roles')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Multiplier user XP in specific role.')
                .addIntegerOption(option =>
                    option.setName('level')
                        .setDescription('The level to apply the multiplier.')
                        .setRequired(true)
                )
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('The role to apply the multiplier.')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Removes role XP.')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('The role to remove the multiplier from.')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('show')
                .setDescription('Shows all multiplier roles XP.')
        ),
    async execute(interaction) {
        const selectPrefix = sql.prepare("SELECT * FROM prefix WHERE guild = ?").get(interaction.guild.id);
        const prefix = selectPrefix.serverprefix;
        if (!interaction.guild.me.permissions.has("MANAGE_ROLES")) return interaction.reply(`I do not have permission to manage roles!`);
        if (!interaction.member.permissions.has("MANAGE_ROLES") || !interaction.member.permissions.has("MANAGE_GUILD")) return interaction.reply(`You do not have permission to use this command!`);

        const method = interaction.options.getSubcommand();

        const getRole = sql.prepare("SELECT * FROM multiplierXP WHERE guildID = ? AND multiplier = ? AND roleID = ?");
        const setRole = sql.prepare("INSERT OR REPLACE INTO multiplierXP (guildID, multiplier, roleID) VALUES (@guildID, @multiplier, @roleID);");

        if (method === 'add') {
            const level = interaction.options.getInteger('level');
            const role = interaction.options.getRole('role');
            if (isNaN(level) || level < 1) {
                return interaction.reply(`Please provide a number to set.`);
            } else {
                if (!role) {
                    return interaction.reply(`You did not provide a role to set!`);
                } else {
                    let Role = getRole.get(interaction.guild.id, role.id, level)
                    if (!Role) {
                        Role = {
                            guildID: interaction.guild.id,
                            roleID: role.id,
                            multiplier: level
                        }
                        setRole.run(Role)
                        let embed = new MessageEmbed()
                            .setTitle(`Successfully set role!`)
                            .setDescription(`<@&${role.id}> has been set for multiplier roleXP ${level}`)
                            .setColor("RANDOM");
                        return interaction.reply({ embeds: [embed] });
                    }
                    else if (Role) {
                        const deleteRole = sql.prepare(`DELETE FROM multiplierXP WHERE guildID = ? AND multiplier = ? AND roleID = ?`)
                        deleteRole.run(interaction.guild.id, role.id, level);
                        const updateRole = sql.prepare(`INSERT INTO multiplierXP(guildID, multiplier, roleID) VALUES(?,?,?)`)
                        updateRole.run(interaction.guild.id, role.id, level)
                        let embed = new MessageEmbed()
                            .setTitle(`Successfully set multiplier role`)
                            .setDescription(`The role ${role} has been successfully set as the ${level}x multiplier role.`)
                            .setColor("#00ff00")
                        await interaction.reply({ embeds: [embed] ,ephemeral: true});
                    }
                }
            }
        }

        if (method === 'show') {
            const allRoles = sql.prepare(`SELECT * FROM multiplierXP WHERE guildID = ?`).all(interaction.guild.id)
            if (!allRoles) {
                return interaction.reply(`There is no roles yet!`)
            } else {
                let embed = new MessageEmbed()
                    .setTitle(`${interaction.guild.name} multiplier-role`)
                    .setDescription(`\`${prefix}help multiplier-role\` for more information`)
                    .setColor("RANDOM");
                for (const data of allRoles) {
                    let multiplierSet = data.multiplier;
                    let RolesSet = data.roleID;
                    embed.addFields({ name: `\u200b`, value: `**Role <@&${RolesSet}> multiplier X${multiplierSet}**: ` });
                }
                return interaction.reply({ embeds: [embed] ,ephemeral: true});
            }
        }


        if (method === 'remove' || method === 'delete') {
            const roleid = interaction.options.getRole('role');
            const getAllRole = sql.prepare(`SELECT * FROM multiplierXP WHERE guildID = ? AND roleID = ?`)
            const getRole = getAllRole.get(interaction.guild.id, roleid.id)
            if (!getRole) {
                return interaction.reply(`This role not added yet!`);
            } else {
                const deleteLevel = sql.prepare(`DELETE FROM multiplierXP WHERE guildID = ? AND roleID = ?`)
                deleteLevel.run(interaction.guild.id, roleid.id);
                let embed = new MessageEmbed()
                    .setTitle(`Successfully removed role!`)
                    .setDescription(`Role xp <@&${roleid.id}> has been removed.`)
                    .setColor("RANDOM");
                return interaction.reply({ embeds: [embed] ,ephemeral: true});
            }
        }
    }
}

