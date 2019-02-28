const submitMessage = document.getElementById('submit-message').addEventListener('click', async (e) => {
	e.preventDefault();
	const form = document.getElementById('message-form');
	const formData = new FormData(form);
	const url = form.getAttribute('action');
	if (formData.get('message')) {
		form.elements['message'].value = '';
		const rawResponse = await fetch(url, {
			method: 'POST',
			body: formData
		});
		if (rawResponse.status !== 200) {
			if (rawResponse.statusText) {
				alert(rawResponse.statusText);
			} else {
				alert('Server Error');
			}
		}
	}
});

(function() {
	function polling() {
		let messages = Array.from(document.querySelectorAll('.message'));
		const id = document.getElementById('room-id').value;
		messageDates = Array.from(messages)
			.map(item => parseInt(item.dataset.date))
			.sort((a, b) => a > b);
		let lastDate = 0;
		if (messageDates.length) {
			lastDate = messageDates[messages.length - 1];
		}
		const request = new XMLHttpRequest();
		request.addEventListener('load', function() {
			let data;
			try {
				data = JSON.parse(this.responseText);
			} catch(e) {
				data = [];
			}
			messages = messages.concat(data);
			data.forEach(msg => {
				const div = document.createElement('div');
				document.getElementById('chat-history').appendChild(div);
				div.outerHTML = msg;
			});
			polling();
		});
		request.open("GET", `https://iamskok-node-chat.glitch.me/polling?id=${id}&last=${lastDate}`);
		request.send();
	}
	polling();
})();
