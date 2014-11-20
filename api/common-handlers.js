/* jshint node:true */

var restify = require('restify');
var bunyan = require('bunyan');

module.exports = {

  requestLoggers: {
    simple: function simpleRequestLogger(req, res, next) {
      var requestLogger = restify.requestLogger({
          properties: {
            route: req.route
          }
          // , serializers: {...}
      });

      requestLogger(req, res, next);
    }

    , verbose: function verboseRequestLogger(req, res, next) {
      var requestLogger = restify.requestLogger({
          properties: {
            route: req.route
            , request: req.toString()
            , response: res.toString()
          }
          // , serializers: {...}
      });

      requestLogger(req, res, next);
    }
  }

  , auditLoggers: {
    simple: restify.auditLogger({
      log: bunyan.createLogger({
        name: 'api-audit'
        , stream: process.stdout
      })
    })

    , null: function nullAuditLogger() {}
  }

};
