const fs = require('fs');
const path = require('path');
const User = require('./user');

const SESSIONS_FILE_PATH = path.join(__dirname, 'sessions.json');
const USERS_FILE_PATH = path.join(__dirname, 'users.json');

let sessions = [];
let users = [];

module.exports = class Loader {
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
					users.push(new User(user.id, user.name, user.secret, user.created));
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
