var express = require('express');

module.exports = function(middleware){
	var router = express.Router(),
		handler = require('./handler')(middleware);

	middleware.uri = middleware.uri || '*';
	middleware.method = middleware.method || 'use';
	router[middleware.method](middleware.uri, handler);
	return router;
};
