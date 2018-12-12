const fs = require('fs');
const path = require('path');
const User = require('./user');
const Message = require('./message');
const Room = require('./room');

const SESSIONS_FILE_PATH = path.join(__dirname, 'sessions.json');
const USERS_FILE_PATH = path.join(__dirname, 'users.json');
const MESSAGES_FILE_PATH = path.join(__dirname, 'messages.json');
const ROOMS_FILE_PATH = path.join(__dirname, 'rooms.json');

let sessions = [];
let users = [];
let messages = [];
let rooms = [];

module.exports = class Loader {
	static loadMessages(data) {
		return new Promise((resolve, reject) => {
			fs.readFile(MESSAGES_FILE_PATH, (err, data) => {
				if (err) {
					if (err.code === 'ENONENT') {
						return resolve([]);
					} else {
						return reject(err);
					}
				}
				messages.length = 0;
				const rawMessages = JSON.parse(data);
				rawMessages.forEach(message => {
					messages.push(new Message(message.author, message.content, message.room, message.date, message.id));
				})
				resolve([...messages]);
			});
		});
	}

	static writeMessages(data) {
		fs.writeFile(MESSAGES_FILE_PATH, JSON.stringify(data), (err) => {
			if (err) {
				console.error('writeMessages:', err);
			}
		});
	}

	static addMessage(data) {
		messages.push(data);
		this.writeMessages(messages);
	}

	static loadRooms(data) {
		return new Promise((resolve, reject) => {
			fs.readFile(ROOMS_FILE_PATH, (err, data) => {
				if (err) {
					if (err.code === 'ENONENT') {
						return resolve([]);
					} else {
						return reject(err);
					}
				}
				rooms.length = 0;
				const rawRooms = JSON.parse(data);
				rawRooms.forEach(room => {
					rooms.push(new Room(room.id, room.title, room.author, room.messages, room.password, room.created));
				})
				resolve([...rooms]);
			});
		});
	}

	static writeRooms(data) {
		fs.writeFile(ROOMS_FILE_PATH, JSON.stringify(data), (err) => {
			if (err) {
				console.error('writeRooms:', err);
			}
		});
	}

	static addRoom(data) {
		rooms.push(data);
		this.writeRooms(rooms);
	}

	static loadSessions(data) {
		return new Promise((resolve, reject) => {
			fs.readFile(SESSIONS_FILE_PATH, (err, data) => {
				if (err) {
					if (err.code === 'ENOENT') {
						return resolve([]);
					} else {
						return reject(err);
					}

				}
				sessions = JSON.parse(data);
				resolve([...sessions]);
			});
		});
	}

	static writeSessions(data) {
		fs.writeFileSync(SESSIONS_FILE_PATH, JSON.stringify(data));
	}

	static addSession(data) {
		sessions.push(data);
		this.writeSessions(sessions);
	}

	static loadUsers(data) {
		return new Promise((resolve, reject) => {
			fs.readFile(USERS_FILE_PATH, (err, data) => {
				if (err) {
					if (err.code === 'ENOENT') {
						return resolve([]);
					} else {
						return reject(err);
					}
				}
				// Make sure users don't have any other data
				users.length = 0;
				const rawUsers = JSON.parse(data);
				rawUsers.forEach(user => {
					users.push(new User(user.id, user.username, user.secret, user.created));
				})
				resolve([...users]);
			});
		});
	}

	static writeUsers(data) {
		fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(data));
	}

	static addUser(data) {
		users.push(data);
		this.writeUsers(users);
	}
}
