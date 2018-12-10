const server = require('./server');

const User = require('./user');
const Room = require('./room');
const Message = require('./message');
const Storage = require('./storage');
const Manager = require('./manager');

// const boris = new User('Boris');
// const vladimir = new User('Vladimir');


// const generalRoom = new Room(
// 	'General', 
// 	boris, 
// 	[], 
// 	false,
// 	[vladimir]
// );

// const borisFirstMessage = new Message(boris.username, 'Hello world', generalRoom.id);
// const borisSecondMessage = new Message(boris.username, 'My name is Boris', generalRoom.id);

// const vladimirFirstMessage = new Message(vladimir.username, 'Hello chat', generalRoom.id);
// const vladimirSecondMessage = new Message(vladimir.username, 'My name is Vladimir', generalRoom.id);

// generalRoom.messages = [borisFirstMessage, vladimirFirstMessage, borisSecondMessage, vladimirSecondMessage];

// console.log(generalRoom);
