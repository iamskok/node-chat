module.exports = (room) =>  `
<li id="room-${room.id}" data-id="${room.id}" data-private="${!!room.password}">
	<a href="/room/${room.id}">${room.title}</a>
	${!!room.password ? "*": ""}
</li>`;
