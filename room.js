const uuid = require('uuid/v1');

module.exports = class Room {
	constructor(id, title, author, messages, password = false, joinedUsers = [], date = Date.now()) {
		this.id = id;
		this.title = title;
		this.author = author;
		this.messages = messages;
		this.password = password;
		this.created = date;
	}
}
