const express = require('express');
const ngrok = require('ngrok');
const EventEmitter = require('events');

const { NGROK_TOKEN, PORT } = require('./globals');

const app = express();
app.use(express.json());

ngrok.authtoken(NGROK_TOKEN);
ngrok
	.connect(PORT || 3000)
	.then((url) => {
		console.log(`Your payload URL is ${url}/hook`);
	})
	.catch(console.error);

app.listen(PORT || 3000, () => {
	console.log(`Listening to port ${PORT || 3000}`);
});

const emitter = new EventEmitter();

module.exports.emitter = emitter;

app.post('/hook', async (req, res) => {
	res.sendStatus(200);
	emitter.emit('hook', req.body);
});
