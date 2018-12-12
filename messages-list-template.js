module.exports = (message) => {
	let date = new Date(message.date);
	date = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`

	return `<div 
		id="message-${message.id}" 
		data-id="${message.id}" 
		data-date="${message.date}"
		data-room="${message.room}"
		class="message"
	>
		<b>${message.author.username}</b>: <span>${message.content}</span> <span>${date}</span>
	</div>`.replace(/[\t\n]/g, '');	
}
