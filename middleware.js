const Manager = require('./manager');
const manager = new Manager();
const url = require('url');

function auth(req, res) {
	const cookies = req.headers['cookie'];
	let sid = cookies ? getCookie('sid', cookies) : null;
	let user = manager.findUser(sid);
	
	if (!user) {
		user = manager.createUser();
		sid = manager.createSession(user.id);
		// Save cookie for 1 month
		res.setHeader('Set-Cookie', [`sid=${sid}; HttpOnly; Expires=${new Date(Date.now() + 2592000000)}`]);
	}

	req.user = user;
	console.log('USER from middelware::::', user);
};

function parsePath(req, res) {
	const parsedUrl = url.parse(req.url, false);
	let pathName = parsedUrl.pathname;
	if (pathName.length) {
		if (pathName[0] === '/') {
			pathName = pathName.slice(1);
		}
		if (pathName[pathName.length - 1] === '/') {
			pathName = pathName.slice(0, -1);
		}
	}
	// const nestedPathName = parsedUrl.pathname;
	// let pathName = nestedPathName.replace(/\//g, '');

	const STATIC_PATH_REGEX = new RegExp('^\/static\/', 'ig');

	if (pathName === '') {
		pathName = 'root';
	} else if (STATIC_PATH_REGEX.test(parsedUrl.pathname)) {
		pathName = 'static';
	} 
	// else if (!routes[pathName]) {
	// 	pathName = 'notFound';
	// }

	const pathArray = pathName.split('/');
	pathName = pathArray[0];
	req.pathArray = pathArray.slice(1);
	req.pathName = pathName;
}

function getCookie(name, cookies) {
	const matches = cookies.match(new RegExp(
		"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
	));

	return matches ? decodeURIComponent(matches[1]) : undefined;
}

exports.auth = auth;
exports.parsePath = parsePath;
