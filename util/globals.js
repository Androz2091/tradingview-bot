let config;
try {
	config = require('../config.json');
} catch {
	config = null;
}

module.exports = config ? config : process.env;
