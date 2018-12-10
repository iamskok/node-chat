const Manager = require('./manager');
const manager = new Manager();
const Storage = require('./storage');
const storage = new Storage();
const getRoomItemHTML = require('./rooms-list-template');
const getMessageItemHTML = require('./messages-list-template');

const fs = require('fs');
const path = require('path');
const url = require('url');

const responses = [];

function getQuery(req) {
	const parsedUrl = url.parse(req.url, true);
	const query = parsedUrl.query;

	return query;
}

function createHTML(template, context) {
	let HTML = template.toString();
	console.log('BEFORE', HTML);
	for (key in context) {
		console.log('context.hasOwnProperty(key)', context.hasOwnProperty(key));
		if (context.hasOwnProperty(key)) {
			// Avoid spacing symbols
			// `\s*` doesn't work in this case
			const re = new RegExp(`<!---[ ]*${key}[ ]*--->`, 'gi');
			HTML = HTML.replace(re, context[key]);
			console.log('key', key);
			console.log('context[key]', context[key]);
		}
	}
	console.log('AFTER', HTML);
	return HTML;
}

function broadcast(roomId) {
	console.log('broadcast 1', roomId, responses.length);
	responses.forEach(res => {
		console.log('broadcast 2', res.lastDate);
		const messages = storage.getLastMessages(roomId, res.lastDate).map(msg => {
			console.log('broadcast 3', roomId);
			// console.log('broadcast - User ID:', msg.author);
			msg = {...msg};
			msg['author'] = storage.findUserById(msg.author);
			console.log('Polling from server:', getMessageItemHTML(msg));
			return getMessageItemHTML(msg);
		});
		console.log('broadcast 4', messages);
		res.end(JSON.stringify(messages));
	});
	responses.length = 0;
}

module.exports = {
	root: function rootPath(req, res) {
		const query = getQuery(req);
		// console.log('USER ====', req.user);
		res.writeHead(200, {'Content-type': 'text/html; charset=UTF-8'});

		fs.readFile(path.join(__dirname, 'templates/index.html'), (err, data) => {
			if (err) throw err;
			const rooms = storage.getRooms();
			let roomsHTML = '';
			rooms.forEach(room => {
				roomsHTML += getRoomItemHTML(room);
			});

			let context = {
				'rooms': roomsHTML,
				'username': req.user.username || ''
			};
			const html = createHTML(data, context);
			res.end(html);
		});
	},
	chat: function chatPath(req, res) {
		const query = getQuery(req);
		res.id = query.id;
		// Check if user got all the messages
		if (res.id < storage.messages.length) {
			return res.end(JSON.stringify(storage.messages.slice(res.id)));
		}

		storage.addResponse(res);

		let finished = false;
		res.on('close', function() {
			if (!finished) {
				storage.removeResponse(res);
			}
		});
		res.on('finish', function() {
			finished = true;
			storage.removeResponse(res);
		});
	},
	polling: function(req, res) {
		console.log('start polling');
		const query = getQuery(req);
		const roomId = query.id;
		const lastDate = query.last || 0;
		console.log('QUERY', query);
		console.log('lastDate', lastDate);
		const messages = storage.getLastMessages(roomId, lastDate).map(msg => {
			console.log('polling - User ID:', msg.author);
			msg = {...msg};
			msg['author'] = storage.findUserById(msg.author);	
			return getMessageItemHTML(msg);
		});
		if (messages.length) {
			console.log('finish polling');
			res.end(JSON.stringify(messages));
		} else {
			console.log('Polling - routes lastDate:::', lastDate, typeof lastDate);
			res.lastDate = lastDate;
			responses.push(res);
		}
		console.log('MESSAGES', messages);
	},
	'new-room': function newRoomPath(req, res) {
		if (!req.user.username) {
			res.statusCode = 403;
			return res.end('You must have your username!');
		}
		let title, author, messages, password;
		if (req.method === 'POST') {
			title = req.body.roomname;
			author = req.user.id;
			messages = [];
			password = req.body.password || null;
			res.writeHead(200, {'Content-type': 'text/html; charset=UTF-8'});
			const room = manager.newRoom(title, author, messages, password);
			return res.end(getRoomItemHTML(room));
		} else {
			res.statusCode = 405;
			res.end('Method is not allowed');
		}
	},
	room: function roomPath(req, res) {
		if (req.method === 'POST') {
			const id = req.body.id;
			const password = req.body.password;

			res.writeHead(200, {'Content-type': 'text/html; charset=UTF-8'});
			const room = manager.getRoomById(id);
			console.log('id', id);
			console.log('password', password);
			console.log('room', room);
			if (room.password && room.password !== password) {
				res.statusCode = 403;
				return res.end('You password is not correct!');
			}

			fs.readFile(path.join(__dirname, 'templates/room.html'), (err, data) => {
				if (err) throw err;

				let title = '';
				if (room) {
					title = room.title;
				}

				const messages = storage.getMessages(id);
				let messagesHTML = '';
				messages.forEach(message => {
					console.log('MESSAGE:', message);
					message = {...message};
					message['author'] = storage.findUserById(message.author)
					messagesHTML += getMessageItemHTML(message);
				});

				let context = {
					'username': req.user.username,
					'room-title': title,
					'room-id': id,
					'messages': messagesHTML
				};
				const html = createHTML(data, context);
				console.log('HTML from POST', html);
				console.log('USERS:', storage.users);
				res.end(html);
			});
		} else {
			const id = req.pathArray[0];
			const room = manager.getRoomById(id);
			if (room.password) {
				return res.end('Private room');
			}
			fs.readFile(path.join(__dirname, 'templates/room.html'), (err, data) => {
				if (err) throw err;

				let title = '';
				if (room) {
					title = room.title;
				}

				const messages = storage.getMessages(id);
				let messagesHTML = '';
				messages.forEach(message => {
					console.log('MESSAGE:', message);
					message = {...message};
					message['author'] = storage.findUserById(message.author);
					messagesHTML += getMessageItemHTML(message);
				});

				let context = {
					'username': req.user.username,
					'room-title': title,
					'room-id': id,
					'messages': messagesHTML
				};
				const html = createHTML(data, context);
				console.log('HTML from GET', html);
				res.end(html);
			});

			// res.statusCode = 405;
			// res.end('Method is not allowed');
		}
	},
	username: function (req, res) {
		if (req.method === 'POST') {
			const username = req.body.username.trim();
			if (!username) {
				res.statusCode = 400;
				res.end('Bad request');
			}
			req.user = storage.changeUser(req.user.id, username);
			res.end();
		} else {
			res.statusCode = 405;
			return res.end('Method not allowed');
		}
	},
	'send-message': function sendPath(req, res) {
		// const query = getQuery(req);
		// manager.newMessage(query.userId, query.message, query.roomId);
		// res.end();
		const message = req.body.message.trim();
		const roomId = req.body.room;
		// const message = (req.body.message || '').trim();
		// manager.newMessage(req.user.id, message, req.body.room);
		console.log('message', message);
		console.log('room:', req.body.room);
		manager.newMessage(message, req.user.id, roomId);
		res.end();
		broadcast(roomId);
	},
	static: function staticPath(req, res) {
		const parsedUrl = url.parse(req.url, false);
		const nestedPathName = parsedUrl.pathname;
		const pathName = nestedPathName.replace(/\//g, '');
		const query = getQuery(req);

		const IMG_REGEX = new RegExp('\/images\/.*\.(gif|jpg|jpe?g|tiff|png|webp)$', 'ig');
		const CSS_REGEX = new RegExp('\/styles\/.*\.css$', 'ig');
		const JS_REGEX = new RegExp('\/scripts\/.*\.js$', 'ig');
		const FILENAME_REGEX = nestedPathName.match(/(?:[a-zA-Z0-9-]+.\w+)$/)[0];

		if (IMG_REGEX.test(nestedPathName)) {
			fs.readFile(path.join(__dirname, 'static', 'images', FILENAME_REGEX), (err, data) => {
				const imgFormat = nestedPathName.split('.');
				res.writeHead(200, {
					'Content-type': `image/${imgFormat[imgFormat.length - 1]}; charset=UTF-8`
				});
				res.end(data);
			});
		} else if (JS_REGEX.test(nestedPathName)) {
			fs.readFile(path.join(__dirname, 'static', 'scripts', FILENAME_REGEX), (err, data) => {
				res.writeHead(200, {
					'Content-type': 'text/javascript; charset=UTF-8'
				});
				res.end(data);
			});
		} else if (CSS_REGEX.test(nestedPathName)) {
			fs.readFile(path.join(__dirname, 'static', 'styles', FILENAME_REGEX), (err, data) => {
				res.writeHead(200, {
					'Content-type': 'text/css; charset=UTF-8'
				});
				res.end(data);
			});
		} else {
			res.statusCode = 404;
			res.end('Incorrect `/static/` path');
		}
	},
	notFound: function notFoundPath(req, res) {
		res.statusCode = 404;
	}
};
