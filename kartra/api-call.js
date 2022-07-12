const { MessageEmbed } = require('discord.js');
const {bot} = require('..');
const { codes, members } = require('./redeem');
const globals = require('../util/globals');
const { add } = require('../trading-view/addUser');
const { remove } = require('../trading-view/removeUser');
const axios = require('axios').default;

async function apiCall(data) {
	const name = `${data.lead.first_name} ${data.lead.last_name}`;
	const email = data.lead.email;

	const guild = await bot.guilds.fetch(globals.DISCORD_GUILD);
	const logChannel = await guild.channels.fetch(globals.DISCORD_LOG_CHANNEL);

	if (data.action === 'membership_granted') {
		const newCode = codeGen();
		codes.push({
			email,
			name,
			code: newCode,
		});

		logChannel.send({
			embeds: [
				new MessageEmbed()
					.setTitle('New Acccess Available From Order')
					.addFields(
						{ name: 'Buyer', value: name },
						{ name: 'Email', value: email }
					)
					.setColor('GREEN'),
			],
		});

		const previousEmails = bot.db.get('emails') ?? [];
		if (!previousEmails.includes(email)) {
			bot.db.set(`emails`, [...previousEmails, email]);
		}

	} else if (data.action === 'membership_revoked') {
		const memberId = bot.db.all().find((entry) => entry.value === email)?.key?.split('_')[1];
		const tradingViewUsername = bot.db.all().find((entry) => entry.key === `tradingview_${memberId}`)?.value;


		if (member?.id) {

			const member = await guild.members.fetch(memberId);

			logChannel.send({
				embeds: [
					new MessageEmbed()
						.setTitle('Subscription Cancelled')
						.addFields(
							{
								name: 'Member',
								value: `${member.user.tag} \`(${member.id})\``,
							},
							{ name: 'Buyer', value: name },
							{ name: 'Email', value: email }
						)
						.setColor('PURPLE'),
				],
			});

			member.roles.remove(globals.DISCORD_MEMBER_ROLE);

			members.remove((m) => m.email == email);
		} else {
			await logChannel.send({
				embeds: [
					new MessageEmbed()
						.setTitle('Subscription Cancelled')
						.addFields(
							{ name: 'Member', value: 'Unknown' },
							{ name: 'Buyer', value: name },
							{ name: 'Email', value: email }
						)
						.setColor('RED'),
				],
			});
		}

		if (tradingViewUsername) {
			
			await remove(tradingViewUsername)
				.then(() => {
					logChannel.send({
						embeds: [
							new MessageEmbed()
								.setTitle('Member Removed From Trading View')
								.setFields(
									{
										name: 'Trading View Username',
										value: tradingViewUsername,
									},
									{ name: 'Buyer', value: name },
									{ name: 'Email', value: email }
								)
								.setColor('PURPLE'),
						],
					});
				})
				.catch(() => {
					logChannel.send({
						embeds: [
							new MessageEmbed()
								.setTitle('Failed To Remove Member From Trading View')
								.setFields(
									{
										name: 'Trading View Username (invalid)',
										value: tradingViewUsername ?? 'Unknown',
									},
									{ name: 'Buyer', value: name },
									{ name: 'Email', value: email }
								)
								.setColor('RED'),
						],
					});
				});

		}
		
	}
}

module.exports.apiCall = apiCall;
