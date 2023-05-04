const { MessageEmbed } = require('discord.js');
const SQlite = require("better-sqlite3");
const sql = new SQlite('./mainDB.sqlite');


module.exports = {
    name: 'multiplier-role',
    aliases: ['multiplierrole'],
    category: "Leveling",
    description: "multiplier xp for roles",
    cooldown: 3,
    async execute(client, message, args) {
        const selectPrefix = sql.prepare("SELECT * FROM prefix WHERE guild = ?").get(message.guild.id);;
        const prefix = selectPrefix.serverprefix
        if (!message.guild.me.permissions.has("MANAGE_ROLES")) return message.reply(`I do not have permission to manage roles!`);
        if (!message.member.permissions.has("MANAGE_ROLES") || !message.member.permissions.has("MANAGE_GUILD")) return message.reply(`You do not have permission to use this command!`);


        if (!args.length) {
            let embed = new MessageEmbed()
                .setAuthor({ name: `${client.user.username}`, iconURL: `${client.user.avatarURL({ dynamic: true, size: 512 })}` })
                .setTitle(`multiplier role usage`)
                .setDescription(`double xp to role or channel`)
                .addFields({ name: `${prefix}multiplierRole add <level> <@role>`, value: `multiplier user xp in specific role.` })
                .addFields({ name: `${prefix}multiplierRole remove <@role>`, value: `removes role xp` })
                .addFields({ name: `${prefix}multiplierRole show`, value: `Shows all multiplier roles xp` })
                .setColor("RANDOM")
                .setTimestamp();

            return message.channel.send({ embeds: [embed] });
        }
        const method = args[0]
        const multiplierNum = parseInt(args[1])
        const roleName = args.join(' ');
        const roleIndex1 = roleName.indexOf('<');
        const roleIndex2 = roleName.indexOf('>');
        const roleidsub = roleName.substring(roleIndex1, roleIndex2 + 1)
        const roleid = roleidsub.replace(/[^\w\s]/gi, '')

        client.getRole = sql.prepare("SELECT * FROM multiplierXP WHERE guildID = ? AND multiplier = ? AND roleID = ?");
        client.setRole = sql.prepare("INSERT OR REPLACE INTO multiplierXP (guildID, multiplier, roleID) VALUES (@guildID, @multiplier, @roleID);");

        if (method.toLowerCase() === 'add') {
            if (isNaN(multiplierNum) && !multiplierNum || multiplierNum < 1) {
                return message.reply(`Please provide a number to set.`);
            } else {
                if (!args[2]) {
                    return message.reply(`You did not provide a role to set!`);
                } else {
                    let Role = client.getRole.get(message.guild.id, roleid, multiplierNum)
                    if (!Role) {
                        Role = {
                            guildID: message.guild.id,
                            roleID: roleid,
                            multiplier: multiplierNum
                        }
                        client.setRole.run(Role)
                        let embed = new MessageEmbed()
                            .setTitle(`Successfully set role!`)
                            .setDescription(`<@&${roleid}> has been set for multiplier roleXP ${multiplierNum}`)
                            .setColor("RANDOM");
                        return message.channel.send({ embeds: [embed] });
                    }
                    else if (Role) {

                        client.deleteRole = sql.prepare(`DELETE FROM multiplierXP WHERE guildID = ? AND multiplier = ? AND roleID = ?`)
                        client.deleteRole.run(message.guild.id, roleid, multiplierNum);
                        client.updateRole = sql.prepare(`INSERT INTO multiplierXP(guildID, multiplier, roleID) VALUES(?,?,?)`)
                        client.updateRole.run(message.guild.id, roleid, multiplierNum)
                        let embed = new MessageEmbed()
                            .setTitle(`Successfully set multiplier roleXP!`)
                            .setDescription(`<@&${roleid}> has been updated for multiplier roleXP ${multiplierNum}`)
                            .setColor("RANDOM");
                        return message.channel.send({ embeds: [embed] });
                    }

                }
            }
        }


        if (method.toLowerCase() === 'show') {
            const allRoles = sql.prepare(`SELECT * FROM multiplierXP WHERE guildID = ?`).all(message.guild.id)
            console.log(allRoles)
            if (!allRoles) {
                return message.reply(`There is no roles yet!`)
            } else {
                let embed = new MessageEmbed()
                    .setTitle(`${message.guild.name} multiplier-role`)
                    .setDescription(`\`${prefix}help multiplier-role\` for more information`)
                    .setColor("RANDOM");
                for (const data of allRoles) {
                    let multiplierSet = data.multiplier;
                    let RolesSet = data.roleID;
                    embed.addFields({ name: `\u200b`, value: `**Role <@&${RolesSet}> multiplier X${multiplierSet}**: ` });
                }
                return message.channel.send({ embeds: [embed] });
            }
        }


        if (method.toLowerCase() === 'remove' || method === 'delete') {
            const roleName = args.join(' ');
            const roleIndex1 = roleName.indexOf('<');
            const roleIndex2 = roleName.indexOf('>');
            const roleidsub = roleName.substring(roleIndex1, roleIndex2 + 1)
            const roleid = roleidsub.replace(/[^\w\s]/gi, '')
            client.getAllRole = sql.prepare(`SELECT * FROM multiplierXP WHERE guildID = ? AND roleID = ?`)
            const getRole = client.getAllRole.get(message.guild.id, roleid)
            if (!args[1]) {
                return message.reply(`Please mention a role to remove.`);
            } else {
                if (!getRole) {
                    return message.reply(`This role not added yet!`);
                } else {
                    client.deleteLevel = sql.prepare(`DELETE FROM multiplierXP WHERE guildID = ? AND roleID = ?`)
                    client.deleteLevel.run(message.guild.id, roleid);
                    let embed = new MessageEmbed()
                        .setTitle(`Successfully removed role!`)
                        .setDescription(`Role xp <@&${roleid}> has been removed.`)
                        .setColor("RANDOM");
                    return message.channel.send({ embeds: [embed] });
                }
            }
        }
    }
}