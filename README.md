# simple-http-mock
NodeJS simple mock module used to mock http responses and optionaly proxy them to other host.
It can be used as middleware constructor, or standalone http/https server.
Basic usage: Add your mocks to mocks directory, start mock server and debug http requests/responses.

##Install
Clone repository
```bash
$ npm install simple-mock --save-dev
```

##API
```js
var simpleMock = require('simple-http-mock');
```

### simpleMock.createServer(options)

Runs http/https server base on options.

### simpleMock.mocks(options)

Returns array of middlewares, which can be used in your app.

#### Options

simpleMock accepts these properties in the options object.

#### mocksDir

Directory where you place your mocks.

#### server

And object with http/https server options.

```js
// EXAMPLE: create http and https server
server: {
    httpPort: 3000,
    httpsPort: 3443,
    privateKey: "sslcert/server.key",
    cert: "sslcert/server.crt"
}
```

#### proxies

List of objects, contain proxy servers.

```js
// EXAMPLE: Use proxy for requests to /auth
proxies: [
    {
        uri: "/auth",
        host: "google.com"
    }
]
```

#### log

Object with log options. loglevel is a loglevel for morgan middleware.

```js
// EXAMPLE: Write logs to logfile.log
log: {
    logfile: "logfile.log",
    loglevel: "combined"
}
```

##Creating mocks
###Simple mock
Create json file in mocks folder
```js
{
    "method": "post",
    "uri": "/a/b",
    "status": 403,
    "response": {
        "answer": "ok"
    },
    "headers": [
    {
      "name": "Myheader",
      "value": "Myvalue"
    },
    {
      "name": "Anything-else",
      "value": "More values"
    }
    ],
    "cookies": [
        {
          "name": "mycookie",
          "value": "something"
        }
    ]
}
```
###Advanced mock
You can create your own mock function using NodeJS and express framework.

Mock function is a Express middleware, which will receive params:

`req` - object with request information

`res` - object with response

`next` - function, which must be called if you wish to pass request to other middlewares.

Just put your module to mocks directory.

Example module:

```js
var express = require('express');
var router = express.Router();

router.route('/mock/:id1')
    .get(function(req, res, next){
        res.json({answer: 'not ok'});
    })
    .post(function(req, res, next){
        console.log('This is PUT middleware:', req.url);
        next();
    });

module.exports = router;
```