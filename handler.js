function handler(middleware) {
	return function (req, res, next) {
		if (middleware.status) res.status(middleware.status);
		if (middleware.headers) {
			middleware.headers.forEach(function (header) {
				res.header(header.name, header.value);
			});
		}
		if (middleware.cookies) {
			middleware.cookies.forEach(function (cookies) {
				res.cookie(cookies.name, cookies.value, cookies.options);
			});
		}
		middleware.response = middleware.response ? middleware.response : '';
		if (typeof middleware.response == 'object')
			res.json(middleware.response);
		else
			res.send(middleware.response);
	}
}
module.exports = handler;
