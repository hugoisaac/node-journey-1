/* jshint node:true */

var handlers = require('./common-handlers');

module.exports = {
  port: 8080
  , requestLogger: handlers.requestLoggers.simple
  , auditLogger: handlers.auditLoggers.simple
};
