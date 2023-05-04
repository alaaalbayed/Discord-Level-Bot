module.exports = {
    name: 'ping',
    aliases: ['test'],
    category: "Configuration",
    description: "Return a ping!",
    cooldown: 3,
    async execute(client, message, args) {
        message.reply('Pinging...').then(sent => {
            sent.edit(`:sparkling_heart: Heartbeat: ${message.client.ws.ping}ms.\n🏓Latency: ${sent.createdTimestamp - message.createdTimestamp}ms`);
          }).catch(console.error);
    }
}