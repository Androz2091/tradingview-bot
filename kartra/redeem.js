const { MessageEmbed } = require('discord.js');
const {bot, db} = require('..');
const globals = require('../util/globals');
const { JSONArray } = require('../util/file');
const { add } = require('../trading-view/addUser');

module.exports.redeem = async (msg) => {
	await msg.delete();

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

	try {
		await msg.author.send('Please enter your Trading View username below.');
	} catch {
		return await msg.channel.send(
			`${msg.member} please enable your DMs and try again.`
		);
	}
	let tradingViewUsername;
	while (1) {
		try {
			tradingViewUsername = (
				await msg.author.dmChannel.awaitMessages({
					filter: (response) => response.author.id == msg.author.id,
					max: 1,
					time: 30 * 60 * 1000,
					errors: ['time'],
				})
			)?.first()?.content;
		} catch {
			return msg.author.send(
				'Access redemtion failed as no trading view username has been provided in time. Please try redeem the access again.'
			);
		}
		try {
			await add(tradingViewUsername);
			break;
		} catch {
			msg.author.send('Invalid username. Please try again.');
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

};
