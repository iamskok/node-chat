module.exports = (room) =>  `
<li id="room-${room.id}" data-id="${room.id}" data-private="${!!room.password}">
	<a href="/room/${room.id}">${room.title.replace('<', '&lt;').replace('>', '&gt;').replace('&', '&amp;')}</a>
	${!!room.password ? "*": ""}
</li>`;
