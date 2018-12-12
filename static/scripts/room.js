const submitMessage = document.getElementById('submit-message').addEventListener('click', (event) => {
	event.preventDefault();
	const form = document.getElementById('message-form');
	const formData = new FormData(form);

	//console.log('message formData', [...formData.entries()]);
	const url = form.getAttribute('action');

	(async () => {
		const rawResponse = await fetch(url, {
			method: 'POST',
			body: formData
		});

		//console.log('rawResponse:', rawResponse);

		if (rawResponse.status !== 200) {
			if (rawResponse.statusText) {
				alert(rawResponse.statusText);
			} else {
				alert('Server Error 😈');
			}
		}
	})();
});

(function() {
	function polling() {
		let messages = Array.from(document.querySelectorAll('.message'));
		const id = document.getElementById('room-id').value;
		messageDates = Array.from(messages)
			.map(item => parseInt(item.dataset.date))
			.sort((a, b) => a > b);
		//let lastDate = messages[messages.length - 1] || 0;
		let lastDate = 0;
		if (messageDates.length) {
			lastDate = messageDates[messages.length - 1];
		}
		console.log('>>>>>>>>>>>>>>', lastDate);
		const request = new XMLHttpRequest();
		request.addEventListener('load', function() {
			let data;
			try {
				data = JSON.parse(this.responseText);
			} catch(e) {
				data = [];
			}
			console.log('Get message from the server via polling:', data);
			messages = messages.concat(data);
			data.forEach(msg => {
				const div = document.createElement('div');
				document.getElementById('chat-history').appendChild(div);
				div.outerHTML = msg;
			});
			polling();
		});

		request.open("GET", `http://localhost:5000/polling?id=${id}&last=${lastDate}`);
		request.send();
	}
	polling();
})();

// (function() {
// 	let messages = [];

// 	function polling() {
// 		const request = new XMLHttpRequest();
// 		request.addEventListener("load", function() {

// 			const data = JSON.parse(this.responseText);
// 			messages = messages.concat(data);
// 			data.forEach(msg => {
// 				const username = msg.username;
// 				const message = msg.message;

// 				let html = document.getElementById('chat-history').innerHTML;
// 				const div = document.createElement('div');
// 				div.innerHTML = `${username}: ${message}`;
// 				document.getElementById('chat-history').appendChild(div);
// 			});

// 			polling();
// 		});

// 		let id;

// 		if (!messages.length) {
// 			id = 0;
// 		} else {
// 			id = messages[messages.length - 1].id;
// 		}

// 		request.open("GET", `http://localhost:5000/chat?id=${id}`);
// 		request.send();
// 	}

// 	polling();
// })();
