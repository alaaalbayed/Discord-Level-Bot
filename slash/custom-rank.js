const { SlashCommandBuilder } = require('@discordjs/builders');
const SQLite = require("better-sqlite3");
const sql = new SQLite('./mainDB.sqlite');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('custom-rank')
        .setDescription('Customize rank card color such as; Progress, Background and Text.')
        .addStringOption(option =>
            option.setName('method')
                .setDescription('The option to change color.')
                .setRequired(true)
                .addChoices({name:'Progress Bar', value:'progressbar'})
                .addChoices({name:'Text', value:'text'})
                .addChoices({name:'Background', value:'background'})
        )
        .addStringOption(option =>
            option.setName('color')
                .setDescription('The color to apply (can be hex code or a name of color).')
                .setRequired(true)
        ),
    category: 'Leveling',
    cooldown: 3,
    async execute(interaction) {
        const method = interaction.options.getString('method');
        const color = interaction.options.getString('color');


        const rankCardId = `${interaction.user.id}-${interaction.guild.id}`;
        if (method.toLowerCase() === 'progressbar') {
            sql.prepare("UPDATE rankCardTable SET barColor = ? WHERE id = ?;").run(color, rankCardId);
            return interaction.reply({
                content: 'Successfully updated progress bar color.',
                ephemeral: true
            });
        } else if (method.toLowerCase() === 'text') {
            sql.prepare("UPDATE rankCardTable SET textColor = ? WHERE id = ?;").run(color, rankCardId);
            return interaction.reply({
                content: 'Successfully updated text color.',
                ephemeral: true
            });
        } else if (method.toLowerCase() === 'background') {
            sql.prepare("UPDATE rankCardTable SET backgroundColor = ? WHERE id = ?;").run(color, rankCardId);
            return interaction.reply({
                content: 'Successfully updated background color.',
                ephemeral: true
            });
        }
    },
};
