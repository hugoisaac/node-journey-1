/* jshint node:true */
'use strict';

var util = require('util');
var restify = require('restify');
var bunyan = require('bunyan');
var model = require('model');
var config = require('./config');

var log = bunyan.createLogger({name: 'api-server'});

var server = restify.createServer({
  name: 'api-server'
  // Setting server.log. NOTE: What's the advantage vs using logger directly?
  , log: log
  // Add **magic** to be able to send an html response.
  , formatters: {
    'text/html; q=0.5': function formatHtml(req, res, body) {
      var htmlTemplate = ' \
        <html> \
          <head> \
            <title>API response</title></head> \
          <body>%s</body> \
        </html>';

      if (body instanceof Error) {
        res.statusCode = body.statusCode || 500;
        body = util.format(htmlTemplate, body.message);
      }
      else if (typeof (body) === 'object') {
        body = util.format(htmlTemplate, JSON.stringify(body));
      }
      else {
        body = util.format(htmlTemplate, body.toString());
      }

      res.setHeader('Content-Length', Buffer.byteLength(body));
      return body;
    }
  }
});

// This is for adding handlers before routing (can change request headers).
// req.params is undefined, and properties added to req.log are not available.
// GOTCHA: Only runs when the resource is found? Failing on unexisting routes.
// server.pre(function (req, res, next) {
//   server.log.info('Running server.pre().');
//
//   return next();
// });

// Extend bunyan request logger (req.log) to include additional info.
// NOTE: It seems to only run when the resource is found (existing route).
server.use(config.requestLogger);

// Add auditLogger. NOTE: Doesn't work if response is written using
// server.use().
server.on('after', config.auditLogger);

// TODO: Find documentation about wildcards for defining routes (e.g. '/.*').
server.get('/htmltest', function getHandler(req, res, next) {
  req.log.info('Handling incoming request.');

  var responseBody = util.format('request: %s\nresponse: %s', req, res);

  responseBody = responseBody.replace(/\n/gi, '<br />');

  // This works thanks to the server.formatters *magic*.
  res.contentLength =  Buffer.byteLength(responseBody);
  res.contentType = 'text/html';
  res.send(200, responseBody);

  // This should work now too (it's .~=*magic*=~.).
  // res.header('Content-Length', Buffer.byteLength(responseBody));
  // res.header('Content-Type','text/html');
  // res.send(200, responseBody);

  // This works without the server.formatters *magic*.
  // res.writeHead(200, {
  //   'Content-Length': Buffer.byteLength(responseBody)
  //   , 'Content-Type': 'text/html'
  // });
  // res.write(responseBody);
  // res.end();

  return next();
});

server.get('/account', function (req, res, next) {
  var allAccounts = model.account.getAll();

  res.send(200, allAccounts);
  return next();
});

server.post('/account/:username/:password', function (req, res, next) {
  model.account.add(req.params.username, req.params.password);

  res.send(201, 'Account created.');
  return next();
});

// TODO: How to read multiple params?
// server.put('/account/:username:password', function (req, res, next) {
//   model.account.update(req.params.username, req.params.password);
//
//   res.send('Account updated.');
//   return next();
// });

// server.del('/account/:username', function (req, res, next) {
//   model.account.delete(req.params.username);
//
//   res.send(204);
//   return next();
// });

server.listen(config.port, function() {
  server.log.info('Listening at %s', server.url);
});
