const { MessageEmbed } = require('discord.js');
const {bot, db} = require('..');
const globals = require('../util/globals');
const { JSONArray } = require('../util/file');
const { add } = require('../trading-view/addUser');

const waitingForUsernames = new Set();

module.exports.redeem = async (msg) => {
	await msg.delete();

	if (waitingForUsernames.has(msg.author.id)) {
	
		let tradingViewUsername = msg.content;
		while (1) {
			try {
				await add(tradingViewUsername);
				break;
			} catch (e) {
				console.error(e);
				msg.author.send('Invalid Tradeview username. Please try again.');
			}
		}
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
		await msg.author.send(
			'Access successfully redeemed!' +
				' You can now access the script on trading view here: ' +
				'<https://www.tradingview.com/script/7DeN8MqF-CWG-ALGO-V-1-TrendSetter/>'
		);

		waitingForUsernames.delete(msg.author.id);
		
	}

	const reply = (content) => msg.channel.send(`${msg.author}, ${content}`);

	if (!(db.get('emails') || []).includes(msg.content)) {
		return reply('invalid email address.');
	}

	const previousUserId = db.all().some((entry) => entry.value === msg.content);
	if (previousUserId && previousUserId !== msg.author.id) {
		return reply('this email is already linked to another Discord account.');
	}

	const email = msg.content;
	db.set(`email_${msg.author.id}`, email);

	const guild = await bot.guilds.fetch(globals.DISCORD_GUILD);
	const logChannel = await guild.channels.fetch(globals.DISCORD_LOG_CHANNEL);

	await msg.reply('Perfect! Please enter your Trading View username below.');
	waitingForUsernames.add(msg.author.id);
	

};
