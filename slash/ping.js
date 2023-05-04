const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Return a ping!'),
    async execute(interaction) {
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true ,ephemeral: true});
        await interaction.editReply({content:`:sparkling_heart: Heartbeat: ${interaction.client.ws.ping}ms.\n🏓Latency: : ${sent.createdTimestamp - interaction.createdTimestamp}ms`,ephemeral: true});
    },
};