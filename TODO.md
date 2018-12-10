Send Message


- Create classes User, Room, Message.
- Room contains array of Message objects.
```
class Room {
	constructor(user, date, joinedUsers, private) {
		author: <User>, 
		created: Date.now(), 
		messages: [],
		private: false,
		joined_users: [<User(original author)>]
	}
};
```
- Create server variable with routing (create seperate functions for each route, e.g. '/', '/chat', '/send').
```
const routeMapping = {
	'path': pathFunc,
	'chat': chatFunc
};
routeMapping[route](params);
```

- Think about using middleware/decorators - node.js chat 
- Think about new features for tic-tac-toe (statistics, save game progress, add user registration, add diagonal matching for 5X5 and more field, host app)


1. Where to include and where to call `broadcast`, `loadMessages`, `saveMessages`, IIFE and `process.on` from message.js
2. How to structure code?
3. Naming of dom.js

1. Create session with https://nodejs.org/api/crypto.html
2. Manager class должен взаимодействовать со Storage сохраняя и возобновляя данные, а также добавлять и удалять комнаты и сообщения. Должен быть синглтоном. `manager.addMessage(data); manager.broadcast(data);`.

## Добавить комнаты

1. Добавить комнаты на клиента
2. Добавить кнопку создания новой комнаты на клиенте
3. Добавить новый route в routes.js
4. Какой функционал у комнаты?
5. Post request через ajax


Remove password query from URL `http://localhost:5000/room/?id=d1ab2d90-e28e-11e8-b17e-d358cdf27fb4&password=a`
How to remove it from the client?
- serverside redirect
- encrypt password
- post 

Четверг 11:30

