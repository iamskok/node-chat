const uuid = require('uuid/v1');

module.exports = class Message {
	constructor(author, content, roomId, date = Date.now(), id = uuid()) {
		this.author = author;
		this.content = content;
		this.room = roomId;
		this.date = date;
		this.id = id;
	}
}
