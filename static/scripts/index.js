const submitRoom = document.getElementById('submit-room').addEventListener('click', (event) => {
	event.preventDefault();
	const form = document.getElementById('new-room');
	const formData = new FormData(form);

	console.log('formData', [...formData.entries()]);
	const url = form.getAttribute('action');
	
	(async () => {
		const rawResponse = await fetch(url, {
			method: 'POST',
			body: formData
		});

		const html = await rawResponse.text();
		document.getElementById('rooms').innerHTML += html;
		console.log('HTML = ', html);
	})();
});

const submitUsername = document.getElementById('submit-username').addEventListener('click', (event) => {
	event.preventDefault();
	const form = document.getElementById('username-form');
	const formData = new FormData(form);

	console.log('username formData', [...formData.entries()]);
	const url = form.getAttribute('action');

	(async () => {
		const rawResponse = await fetch(url, {
			method: 'POST',
			body: formData
		});

		console.log('rawResponse:', rawResponse);

		if (rawResponse.status !== 200) {
			if (rawResponse.statusText) {
				alert(rawResponse.statusText);
			} else {
				alert('Server Error 😈');
			}
		}
	})();
});

if (document.getElementById('rooms')) {
	document.getElementById('rooms').addEventListener('click', function(evt) {
		let password;
		evt.preventDefault();
		const private = evt.target.parentNode.getAttribute('data-private') === 'true';
		const id = evt.target.parentNode.getAttribute('data-id');
		if (private) {
			password = prompt('Enter room password');
		}
		document.querySelector('#room').setAttribute('action', evt.target.getAttribute('href'));
		document.querySelector('#room input[name="id"]').value = id;
		document.querySelector('#room input[name="password"]').value = password;
		document.querySelector('#room input[type="submit"]').click();
	});
}

window.addEventListener('click', (e) => {
	const userSecret = document.getElementById('user-secret');
	if (userSecret.value) {
		userSecret.select();
		document.execCommand('copy');
	}
});
// document.getElementById('get-secret').blur();
// const userSecret = document.getElementById('user-secret');
// userSecret.focus();
// // document.designMode = 'on';
// userSecret.value = 'sfewfwefewf';
// userSecret.select();
// document.execCommand('copy');

let secret = '';

const getSecret = document.getElementById('get-secret')
	.addEventListener('click', (event) => {
		console.log('get-secret');

		const xhr = new XMLHttpRequest();
		xhr.open('GET', '/get-secret', true);
		xhr.send();

		function onLoad(e) {
			if (xhr.status == 200) {
				const userSecret = document.getElementById('user-secret');
				userSecret.value = xhr.responseText;
				alert('Click on the screen to copy user secret in your clipboard');
			}
		}
		xhr.onload = onLoad;
	}
);
