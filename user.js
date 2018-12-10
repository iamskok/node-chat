const uuid = require('uuid/v1');

module.exports = class User {
	constructor(id = uuid(), username, secret = uuid(), created) {
		this.id = id;
		this.secret = secret;
		this.username = username;
		this.created = Date.now();
	}
}
