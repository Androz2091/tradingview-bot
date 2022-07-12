const { MessageEmbed } = require('discord.js');
const {bot, db} = require('..');
const globals = require('../util/globals');
const { JSONArray } = require('../util/file');
const { add } = require('../trading-view/addUser');

const waitingForUsernames = new Map();

module.exports.redeem = async (msg) => {

	const reply = (content) => msg.channel.send(`${msg.author}, ${content}`);

	await msg.delete();

	if (waitingForUsernames.has(msg.author.id)) {
	
		const email = waitingForUsernames.get(msg.author.id);
		const tradingViewUsername = msg.content;
		const data = await add(tradingViewUsername);
		console.log(data)
		if (data.status !== 'ok' || data.code === 'username_recip_not_found') {
			reply('Invalid Tradeview username. Please try again.');
		} else {

			const guild = await bot.guilds.fetch(globals.DISCORD_GUILD);
			const logChannel = await guild.channels.fetch(globals.DISCORD_LOG_CHANNEL);

			logChannel.send({
				embeds: [
					new MessageEmbed()
						.setTitle('Access Redeemed')
						.addFields(
							{
								name: 'User',
								value: `${msg.member.user.tag} \`(${msg.member.id})\``,
							},
							{ name: 'Email', value: email }
						)
						.setColor('AQUA'),
				],
			});

			logChannel.send({
				embeds: [
					new MessageEmbed()
						.setTitle('New Member Added To Trading View')
						.setFields(
							{ name: 'Trading View Username', value: tradingViewUsername },
							{ name: 'Email', value: email }
						)
						.setColor('GREEN'),
				],
			});

			db.set(`tradingview_${msg.author.id}`, tradingViewUsername);

			await msg.member.roles.add(globals.DISCORD_MEMBER_ROLE);
			await msg.reply(
				'Access successfully redeemed!' +
					' You can now access the script on trading view here: ' +
					'<https://www.tradingview.com/script/7DeN8MqF-CWG-ALGO-V-1-TrendSetter/>'
			);

			waitingForUsernames.delete(msg.author.id);

		}
		
	}

	if (!(db.get('emails') || []).includes(msg.content)) {
		return reply('invalid email address.');
	}

	const previousUserId = db.all().some((entry) => entry.value === msg.content);
	if (previousUserId && previousUserId !== msg.author.id) {
		return reply('this email is already linked to another Discord account.');
	}

	const email = msg.content;
	db.set(`email_${msg.author.id}`, email);

	await reply('Perfect! Please enter your Trading View username below.');
	waitingForUsernames.set(msg.author.id, email);
	

};
