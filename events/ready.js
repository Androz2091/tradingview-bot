const globals = require('../util/globals');
const puppeteer = require('puppeteer');
const { apiCall } = require('../kartra/api-call');
const login = require('../trading-view/login');
const addUser = require('../trading-view/addUser');
const removeUser = require('../trading-view/removeUser');

module.exports = async (bot) => {
	console.log(`${bot.user.username} is online!`);

	const server = require('../util/server.js');

	server.emitter.on('hook', apiCall);
};
