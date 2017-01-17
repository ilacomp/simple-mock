module.exports.mocks = mocks;
module.exports.startServer = startServer;

var express = require('express'),
	httpProxy = require('express-http-proxy'),
	glob = require('glob'),
	path = require('path'),
	fs = require('fs'),
	bodyParser = require('body-parser'),
	constructor = require('./constructor'),
	logger = require('morgan'),
	http = require('http'),
	https = require('https');

function mocks(config) {
	var middlewares = [cors],
		loglevel = 'dev',
		loggerOpts = {};

	if (config.log) {
		if (config.log.logfile) {
			loggerOpts = {stream: fs.createWriteStream(config.log.logfile, {flags: 'a'})};
		}
		loglevel = config.log.loglevel;
	}

	middlewares.push(logger(loglevel, loggerOpts));
	middlewares.push(bodyParser.json());
	middlewares.push(bodyParser.urlencoded({extended: false}));

	glob.sync(config.mocksDir + '/*.js*').forEach(function (file) {
		var middleware = require(path.resolve(file));
		console.log('Loaded middleware: ' + file);
		if (typeof middleware === 'object') {
			middleware = constructor(middleware);
		}
		middlewares.push(middleware);
	});

	//Use proxy
	if (config.proxies) {
		config.proxies.forEach(function(proxy){
			var router = express.Router();
			router.all(proxy.uri, httpProxy(proxy.host));
			middlewares.push(router);
		});
	}

	return middlewares;
}

function cors(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
}

function Error404(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
}

function Error500(err, req, res, next) {
	res.status(err.status || 500);
	res.send(err.message);
}

function startServer(config) {
	var app = express();
	var serverConfig = config.server;

	if (!serverConfig) {
		console.error('No server config options found!');
		return;
	}
	app.use(mocks(config));
	app.use(Error404);
	app.use(Error500);

	//Start http server
	if (serverConfig.httpPort) {
		var httpServer = http.createServer(app);
		httpServer.listen(config['http-port'], function () {
			console.log('Mock server listening on port', serverConfig.httpPort);
		});
	}

	//Start https server
	if (serverConfig.httpsPort) {
		var privateKey = fs.readFileSync(serverConfig.privateKey, 'utf8');
		var certificate = fs.readFileSync(serverConfig.cert, 'utf8');
		var credentials = {key: privateKey, cert: certificate};
		var httpsServer = https.createServer(credentials, app);

		httpsServer.listen(config['https-port'], function () {
			console.log('Mock server listening on port', serverConfig.httpsPort);
		});
	}
}
