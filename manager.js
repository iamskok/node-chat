const crypto = require('crypto');
const uuid = require('uuid/v1');

const Storage = require('./storage');
const storage = new Storage();
const User = require('./user');
const Room = require('./room');
const Message = require('./message');

let instance = null;

module.exports = class Manager {
	constructor() {
		if (instance === null) {
			instance = this;
		}
		return instance;
	}

	newMessage(text, author, roomId) {
		const message = new Message(author, text, roomId);
		storage.addMessage(message);
	}

	removeMessage(id, roomId) {
		storage.removeMessage(id);
	}

	newRoom(title, author, messages, password) {
		const roomId = uuid();
		const room = new Room(roomId, title, author, messages, password);
		console.log('manager "new room". title', title);
		storage.addRoom(room);
		return room;
	}

	getRooms() {
		return storage.getRooms();
	}

	getRoomById(id) {
		console.log('room-id', id);
		console.log('rooms:', storage.getRooms());
		return storage.getRooms().filter((room) => {
			if (room.id === id) {
				console.log('XXXX', room);
			}
			return room.id === id;
		})[0];
	}

	removeRoom(id) {
		storage.removeRoom(id);
	}
	
	createSession(userId) {
		const secret = 'abcdefg';
		const sid = crypto.createHmac('sha512', secret)
			.update(uuid())
			.digest('hex');
		const session = {
			user: userId,
			id: sid,
			created: Date.now()
		};
		storage.addSession(session);
		return sid;
	}

	createUser() {
		const userId = uuid();
		const secret = 'User\'s secret';
		const hash = crypto.createHmac('sha512', secret)
			.update(uuid())
			.digest('hex');
		const user = new User(userId, '', hash);
		storage.addUser(user);
		return user;
	}

	findUser(sid) {
		if (!sid) return null;
		return storage.findUser(sid);
	}

	broadcast() {}
}
