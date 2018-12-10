const http = require('http');
const auth = require('./middleware').auth;
const parsePath = require('./middleware').parsePath;
const formidable = require('formidable');

const routes = require('./routes');
const port = 5000;

let server = http.createServer((req, res) => {
	parsePath(req, res);
	auth(req, res);
	let pathName = req.pathName;
	
	console.log('req.pathArray', req.pathArray);
	console.log('pathName', pathName);

	if (!routes[pathName]) {
		pathName = 'notFound';
	}

	if (req.method === 'GET') {
		routes[pathName](req, res);
	} else if (req.method === 'POST') {
		const form = new formidable.IncomingForm();
		form.parse(req, function(err, fields, files) {
			req.body = fields;
			console.log('2.====>', pathName);
			routes[pathName](req, res);
		});
	} else {
		res.statusCode = 405;
		res.end('Method not allowed!')
	}
});

server.listen(port, 'localhost', () => {
	console.log(`Server is running on port: ${port}`);
});
