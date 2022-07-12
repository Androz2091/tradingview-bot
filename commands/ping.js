const { MessageEmbed } = require('discord.js');

module.exports = {
	command: 'ping',
	aliases: ['p'],
	dm: false,
	permissions: (member) => {
		return true;
	},
	async execute(bot, msg, args) {
		const pinging = await msg.channel.send('🏓 Pinging...');

		const embed = new MessageEmbed()
			.setColor('#3B88C3')
			.setTitle('🏓 Pong!')
			.setDescription(
				`Bot Latency is **${Math.floor(
					pinging.createdTimestamp - msg.createdTimestamp
				)} ms** \nAPI Latency is **${Math.round(bot.ws.ping)} ms**`
			);

		pinging.delete();
		await msg.channel.send({ embeds: embed });
	},
};
