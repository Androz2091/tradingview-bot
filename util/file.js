const {
	readFileSync,
	writeFileSync,
	createWriteStream,
	unlink,
	existsSync,
} = require('fs');
const { get } = require('https');
const bot = require('../index');

class JSONDatabase {
	constructor(path) {
		this.path = path;
	}
	read() {
		return JSON.parse(readFileSync(this.path));
	}
	write(data) {
		writeFileSync(this.path, JSON.stringify(data, null, 4));
		return this.read();
	}
}
class JSONArray extends JSONDatabase {
	constructor(path, readOnly = false) {
		super(path);
		if (readOnly) {
			this.write = () => {
				throw new Error(`This JSONArray of ${this.path} is readonly.`);
			};
			if (!existsSync(path)) {
				throw new Error(
					`This JSONArray of ${this.path} is readonly yet is not found`
				);
			}
		}
		if (!existsSync(path)) {
			writeFileSync(path, '[]');
		}
		return this;
	}
	at(index) {
		return this.read()[index];
	}
	concat(other) {
		return this.write(this.read().concat(other));
	}
	entries() {
		return Array.entries(this.read());
	}
	every(condition) {
		return this.read().every(condition);
	}
	filter(condition) {
		return this.read().filter(condition);
	}
	find(condition) {
		return this.read().find(condition);
	}
	findIndex(condition) {
		return this.read().findIndex(condition);
	}
	flat() {
		return this.read().flat();
	}
	forEach(callbackfn) {
		return this.read().forEach(callbackfn);
	}
	includes(element) {
		return this.read().includes(element);
	}
	indexOf(element) {
		return this.read().indexOf(element);
	}
	join(seperator) {
		return this.read().join(seperator);
	}
	keys() {
		return this.read().keys;
	}
	lastIndexOf(element) {
		return this.read().lastIndexOf(element);
	}
	map(callback) {
		return this.read().map(callback);
	}
	pop(write = true) {
		const _ = this.read();
		_.pop();
		if (write) {
			this.write(_);
		}
		return _;
	}
	push(element, write = true) {
		const _ = this.read();
		_.push(element);
		if (write) {
			this.write(_);
		}
		return _;
	}
	remove(condition, write = true) {
		const _ = this.read();
		_.splice(_.findIndex(condition), 1);
		if (write) {
			this.write(_);
		}
		return _;
	}
	removeAll(condition, write = true) {
		const _ = this.read();
		while (_.findIndex(condition) != -1) {
			_.splice(_.findIndex(condition), 1);
		}
		if (write) {
			this.write(_);
		}
		return _;
	}
	reduce(callback, initialValue = null) {
		return this.read().reduce(callback, initialValue);
	}
	reduceRight(callback, initialValue = null) {
		return this.read().reduceRight(callback, initialValue);
	}
	reverse(write = true) {
		const _ = this.read().reverse();
		if (write) {
			this.write(_);
		}
		return _;
	}
	shift(write = true) {
		const _ = this.read().shift();
		if (write) {
			this.write(_);
		}
		return _;
	}
	slice(start = undefined, end = undefined, write = true) {
		const _ = this.read().slice(start, end);
		if (write) {
			this.write(_);
		}
		return _;
	}
	some(condition) {
		return this.read().some(condition);
	}
	sort(compareFunction, write = true) {
		const _ = this.read().sort(compareFunction);
		if (write) {
			this.write(_);
		}
		return _;
	}
	splice(...args) {
		return this.read().splice(...args);
	}
	toString() {
		return this.read().toString();
	}
	unshift(items, write = true) {
		const _ = this.read();
		_.unshift(...items);
		if (write) {
			this.write(_);
		}
		return _;
	}
	values() {
		return this.read().values();
	}
}
class JSONMap extends JSONDatabase {
	constructor(path, readOnly = false) {
		super(path);
		if (readOnly) {
			this.write = () => {
				throw new Error(`This JSONMap of ${this.path} is readonly.`);
			};
			if (!existsSync(path)) {
				throw new Error(
					`This JSONMap of ${this.path} is readonly yet is not found`
				);
			}
		}
		if (!existsSync(path)) {
			writeFileSync(path, '{}');
		}
		return this;
	}
	set(key, value) {
		const _ = this.read();
		_[key] = value;
		return this.write(_);
	}
	unset(key) {
		const _ = this.read();
		delete _[key];
		return this.write(_);
	}
	get(key) {
		return this.read()[key];
	}
	getKey(value) {
		return Object.keys(this.read()).find((key) => this.read()[key] === value);
	}
	increment(key, amount) {
		if (!(key in this.read())) {
			this.set(key, 0);
		}
		if (isNaN(this.read()[key])) {
			throw new Error('Not a number');
		}
		this.set(key, this.get(key) + amount);
	}
	keys() {
		return Object.keys(this.read());
	}
	values() {
		return Object.values(this.read());
	}
	entries() {
		return Object.entries(this.read());
	}
}

class JSONScheduler extends JSONArray {
	constructor(eventHandler, path = 'schedule.json') {
		super(path);
		this.eventHandler = eventHandler;
		bot.on('ready', async () => {
			await new Promise((_) => setTimeout(_, 1000));
			this.checkEvents();
			setInterval(() => this.checkEvents(), 60 * 1000);
		});
	}
	checkEvents() {
		this.filter(
			(event) => Date.now() >= new Date(event.date).getTime()
		).forEach((event) => {
			this.eventHandler(bot, ...event.args);
		});
		this.removeAll((event) => Date.now() >= new Date(event.date).getTime());
	}
	schedule(date, ...args) {
		this.push({
			date,
			args,
		});
	}
}

class TXTDatabase {
	constructor(path, schema) {
		this.path = path;
		this.parts = schema
			.split(/(?<!\\)[{}]/g)
			.map((part, index) => {
				const result = {};
				// If it is in {}s, aka a variable
				if (index % 2 == 1) {
					// If it is an array
					if (/\[.*\]/g.test(part)) {
						result.type = 'array';
						result.value = part.replace(/(?<!\\)\[.*(?<!\\)\]/g, '');
						result.delimeter = part.match(/(?<!\\)(?<=\[).*(?<!\\)(?=\])/g)[0];
					} else {
						result.type = 'variable';
						result.value = part;
					}
				} else {
					result.type = 'delimiter';
					result.value = part;
				}

				return result;
			})
			.filter((part) => !!part.value);
	}

	getArray() {
		const lines = readFileSync(this.path, 'utf-8')
			.split(/\n|\r\n/g)
			.filter(Boolean);
		return lines.map((line) => {
			const results = {};

			this.parts.forEach((part, index) => {
				if (part.type == 'delimiter') {
					if (!line.startsWith(part.value)) {
						throw new Error(
							`Delimiter "${part.value}" not found in line ${index} in "${this.path}".`
						);
					}
					line = line.slice(part.value.length);
				} else if (part.type == 'variable') {
					results[part.value] = line.split(
						this.parts.slice(index).find((p) => p.type == 'delimiter')?.value ||
							/$/
					)[0];
					line = line.slice(
						line.indexOf(
							this.parts.slice(index).find((p) => p.type == 'delimiter')?.value
						)
					);
				} else if (part.type == 'array') {
					results[part.value] = line
						.split(
							this.parts.slice(index).find((p) => p.type == 'delimiter')
								?.value || /$/
						)[0]
						.split(part.delimeter);
					line = line.slice(
						line.indexOf(
							this.parts.slice(index).find((p) => p.type == 'delimiter')
						)
					);
				}
			});

			return results;
		});
	}

	getObject(keyName = this.parts.find((p) => p.type == 'variable').value) {
		if (!this.parts.some((p) => p.type == 'variable' && p.value == keyName)) {
			throw new Error(`Key name "${keyName}" not found.`);
		}
		const result = {};
		this.getArray().forEach((element) => {
			const key = element[keyName];
			delete element[keyName];
			result[key] = { ...element };
		});

		return result;
	}
}
async function download(url, dest = url.split('/').pop()) {
	return new Promise((res, rej) => {
		let file = createWriteStream(dest);
		get(url, function (response) {
			response.pipe(file);
			file.on('finish', function () {
				res(file.path);
			});
		}).on('error', function (err) {
			unlink(dest);
			rej(err);
		});
	});
}

module.exports = {
	JSONArray,
	JSONMap,
	JSONScheduler,
	TXTDatabase,
	download,
};
