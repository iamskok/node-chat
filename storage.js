const crypto = require('crypto');
const uuid = require('uuid');
const Loader = require('./loader');

let instance = null;

module.exports = class Storage {
	constructor() {
		if (instance === null) {
			instance = this;
		} else {
			return instance;
		}

		this.messages = [];
		this.rooms = [];
		this.users = [];
		this.structure = {};
		this.sessions = [];
		this.responses = [];
		this.roomUsers = {};
		this.userRoom = {};

		Loader.loadSessions()
			.then(sessions => this.sessions = sessions)
			.catch(error => console.error(error));

		Loader.loadUsers()
			.then(users => this.users = users)
			.catch(error => console.error(error));

		Loader.loadRooms()
			.then(rooms => this.rooms = rooms)
			.catch(error => console.error(error));

		Loader.loadMessages()
			.then(messages => {
				this.rooms.forEach((room) => {
					this.structure[room.id] = [];
				});
				console.log('OOO', this.structure, this.rooms);
				messages.forEach((message) => {
					console.log('ROOMS', this.rooms);
					if (this.structure[message.room]) {
						this.structure[message.room].push(message);	
					}
				});
				this.messages = messages;
			})
			.catch(error => console.error(error));
	}

	// structureData(data) {
	// 	this.structure = data;
	// }

	addMessage(message) {
		const roomId = message.room;
		console.log('addMessage.roomID:::', roomId);
		const data = JSON.stringify(message);
		this.messages.push(data);
		if (this.structure[roomId]) {
			this.structure[roomId].push(message);
		} else {
			console.error('Storage.addMessage roomId is not found');
		}
		console.log('structure:', this.structure);
		Loader.addMessage(message);
	}

	removeMessage(id, roomId) {
		this.messages = this.messages.filter((message) => message.id !== id);
	}

	addRoom(room) {
		console.log('storage "new room"', room);
		this.rooms.push(room);
		this.structure[room.id] = [];
		Loader.addRoom(room);
	}

	getRooms() {
		return this.rooms;
	}

	getLastMessages(roomId, lastDate) {
		return this.structure[roomId].filter(msg => msg.date > lastDate);
	}

	getMessages(roomId) {
		console.log('GET_MESSAGES', roomId, this.structure[roomId], this.structure);
		return this.structure[roomId];
	}

	removeRoom(id) {
		this.rooms = this.rooms.filter((room) => room.id !== id);
	}

	addSession(session) {	
		this.sessions.push(session);
		Loader.addSession(session);
	}

	addUser(user) {
		this.users.push(user);
		Loader.addUser(user);
	}

	addUserInRoom(roomId, userId) {
		if (!this.roomUsers[roomId]) {
			this.roomUsers[roomId] = [];
		}
		this.roomUsers[roomId].push(userId);
		this.userRoom[userId] = roomId;
	}

	removeUserFromRoom(userId) {
		if (this.userRoom[userId]) {
			const roomId = this.userRoom[userId];
			const index = this.roomUsers[roomId].indexOf(userId);
			if (index > -1) {
				this.roomUsers[roomId].splice(index, 1)
			}
		}
	}

	getRoomUsers(roomId) {
		return this.roomUsers[roomId];
	}

	getUserBySecret(secret) {
		return this.users.filter(user => user.secret === secret)[0];
	}

	findUser(sid) {
		let i;
		for (i = 0; i < this.sessions.length; i++) {
			// console.log('SID', sid, this.sessions[i].id, this.sessions[i]);
			if (this.sessions[i].id === sid) {
				const userId = this.sessions[i].user;
				return this.findUserById(userId);
			}
		}
		// console.log('findUser', 'NO USER!!!');
		return null;
	}

	findUserById(id) {
		let i;
		for (i = 0; i < this.users.length; i++) {
			if (this.users[i].id === id) {
				console.log('FINDUSERBYID::::::', id, this.users);
				return this.users[i];
			}
		}
		return null;
	}

	getSessionByUser(userId) {
		return this.sessions.filter(session => session.user === userId)[0];
	}

	getUserBySession(sid) {
		const sessionsList = Loader.loadSessions(sid);
		let i;
		for (i = 0; i < sessionsList.length; i++) {
			if (sessionsList[i] === sid) {
				return sessionsList[i];
			}
		}
		// console.log('getUserBySession', 'NO USER!!!');
		return null;
	}

	changeUser(id, username) {
		let i;
		for (i = 0; i < this.users.length; i++) {
			if (this.users[i].id === id) {
				this.users[i].username = username;
				Loader.writeUsers(this.users);
				return this.users[i];
			}
		}
		return null;
	}

	addResponse(response) {
		this.responses.push(response);
	}

	removeResponse(response) {
		this.responses = this.responses.filter((res) => res !== response);
	}

	broadcast() {}
}
