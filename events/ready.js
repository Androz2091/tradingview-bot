const { apiCall } = require('../kartra/api-call');
const server = require('../util/server');

module.exports = async (bot) => {
	console.log(`${bot.user.username} is online!`);

	server.emitter.on('hook', (data) => apiCall(data));
};
