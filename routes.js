const fs = require('fs');
const path = require('path');
const url = require('url');

const Manager = require('./manager');
const Storage = require('./storage');
const getRoomItemHTML = require('./rooms-list-template');
const getMessageItemHTML = require('./messages-list-template');

const manager = new Manager();
const storage = new Storage();

const responses = [];

function getQuery(req) {
	return url.parse(req.url, true).query;
}

function createHTML(template, context) {
	let HTML = template.toString();
	for (key in context) {
		if (context.hasOwnProperty(key)) {
			const re = new RegExp(`<!---[ ]*${key}[ ]*--->`, 'gi');
			HTML = HTML.replace(re, context[key]);
		}
	}
	return HTML;
}

function broadcast(roomId) {
	const roomUsers = storage.getRoomUsers(roomId);
	responses.filter(res => roomUsers.includes(res.user.id)).forEach(res => {
		const messages = storage.getLastMessages(roomId, res.lastDate).map(msg => {
			msg = {...msg};
			msg['author'] = storage.findUserById(msg.author);
			return getMessageItemHTML(msg);
		});
		res.end(JSON.stringify(messages));
	});
}

module.exports = {
	root: function rootPath(req, res) {
		const query = getQuery(req);
		res.writeHead(200, {'Content-type': 'text/html; charset=UTF-8'});
		fs.readFile(path.join(__dirname, 'templates/index.html'), (err, data) => {
			if (err) throw err;
			const rooms = storage.getRooms();
			let roomsHTML = '';
			rooms.forEach(room => roomsHTML += getRoomItemHTML(room));
			let context = {
				'rooms': roomsHTML,
				'username': req.user.username || ''
			};
			const html = createHTML(data, context);
			storage.removeUserFromRoom(req.user.id);
			res.end(html);
		});
	},
	chat: function chatPath(req, res) {
		const query = getQuery(req);
		res.id = query.id;
		if (res.id < storage.messages.length) {
			return res.end(JSON.stringify(storage.messages.slice(res.id)));
		}
		storage.addResponse(res);
		let finished = false;
		res.on('close', function() {
			if (!finished) storage.removeResponse(res);
		});
		res.on('finish', function() {
			finished = true;
			storage.removeResponse(res);
		});
	},
	polling: function(req, res) {
		const query = getQuery(req);
		const roomId = query.id;
		const lastDate = query.last || 0;
		const messages = storage.getLastMessages(roomId, lastDate).map(msg => {
			msg = {...msg};
			msg['author'] = storage.findUserById(msg.author);	
			return getMessageItemHTML(msg);
		});
		if (messages.length) {
			res.end(JSON.stringify(messages));
		} else {
			res.lastDate = lastDate;
			res.on('close', () => {
				const index = responses.indexOf(res);
				if (index > -1) responses.splice(index, 1);
			});
			res.on('finish', () => {
				const index = responses.indexOf(res);
				if (index > -1) responses.splice(index, 1);
			});
			res.user = req.user;
			responses.push(res);
		}
	},
	'new-room': function newRoomPath(req, res) {
		let title, author, messages, password;
		if (!req.user.username) {
			res.statusCode = 403;
			return res.end('You must have your username');
		}
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
			const room = manager.getRoomById(id);
			if (!room) {
				res.statusCode = 404;
				return res.end('Room not found');
			}
			res.writeHead(200, {'Content-type': 'text/html; charset=UTF-8'});
			if (room.password && room.password !== password) {
				res.statusCode = 403;
				return res.end('You password is not correct');
			}
			fs.readFile(path.join(__dirname, 'templates/room.html'), (err, data) => {
				if (err) throw err;
				let title = '';
				if (room) title = room.title;
				const messages = storage.getMessages(id);
				let messagesHTML = '';
				messages.forEach(message => {
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
				storage.removeUserFromRoom(req.user.id);
				storage.addUserInRoom(id, req.user.id);
				res.end(html);
			});
		} else {
			const id = req.pathArray[0];
			const room = manager.getRoomById(id);
			if (room.password) return res.end('Private room');
			fs.readFile(path.join(__dirname, 'templates/room.html'), (err, data) => {
				if (err) throw err;
				let title = '';
				if (room) title = room.title;
				const messages = storage.getMessages(id);
				let messagesHTML = '';
				messages.forEach(message => {
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
				storage.removeUserFromRoom(req.user.id);
				storage.addUserInRoom(id, req.user.id);
				res.end(html);
			});
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
		const message = req.body.message.trim();
		const roomId = req.body.room;
		manager.newMessage(message, req.user.id, roomId);
		res.end();
		broadcast(roomId);
	},
	'get-secret': function getSecret(req, res) {
		if (req.user) {
			const secret = req.user.secret;
			res.end(secret);
		} else {
			res.statusCode = 403;
			res.end();
		}
	},
	'change-session': function changeSession(req, res) {
		const secret = req.body.secret;
		const user = storage.getUserBySecret(secret);
		if (user) {
			req.user = user;
			const session = storage.getSessionByUser(user.id);
			res.setHeader('Set-Cookie', [`sid=${session.id}; HttpOnly; Expires=${new Date(Date.now() + 2592000000)}`]);
		}
		res.writeHead(301, {Location: '/'});
		res.end();
	},
	static: function staticPath(req, res) {
		const parsedUrl = url.parse(req.url, false);
		const nestedPathName = parsedUrl.pathname;
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
				res.writeHead(200, {'Content-type': 'text/javascript; charset=UTF-8'});
				res.end(data);
			});
		} else if (CSS_REGEX.test(nestedPathName)) {
			fs.readFile(path.join(__dirname, 'static', 'styles', FILENAME_REGEX), (err, data) => {
				res.writeHead(200, {'Content-type': 'text/css; charset=UTF-8'});
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
