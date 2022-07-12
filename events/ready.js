const { apiCall } = require('../kartra/api-call');

module.exports = async (bot) => {
	console.log(`${bot.user.username} is online!`);

	const server = require('../util/server.js');

	server.emitter.on('hook', apiCall);
};
