var winston = require('winston');
var fs      = require("fs");

module.exports = function (callback) {
  if (!fs.existsSync(__dirname + "/../logs/")) {
    try {
      fs.mkdirSync(__dirname + "/../logs");
    } catch (e) {
      throw new Error(e);
    }
  }

  var linfo = new (winston.Logger)({
    transports: [
      new winston.transports.File({
        level: 'info',
        filename: __dirname + '/../logs/info-logs.log',
        json: true,
        handleExceptions: true
      }),
      new winston.transports.Console({
        level: 'debug',
        handleExceptions: true,
        colorize: true,
        humanReadableUnhandledException: true
      })
    ],
    exitOnError: false
  });

  var lpass = new (winston.Logger)({
    transports: [
      new winston.transports.File({
        level: 'info',
        filename: __dirname + '/../logs/pass-logs.log',
        json: true,
        handleExceptions: true
      }),
      new winston.transports.Console({
        level: 'debug',
        handleExceptions: true,
        colorize: true,
        humanReadableUnhandledException: true
      })
    ],
    exitOnError: false
  });

  var lerror = new (winston.Logger)({
    transports: [
      new winston.transports.File({
        level: 'error',
        filename: __dirname + '/../logs/error-logs.log',
        json: true,
        handleExceptions: true
      }),
      new winston.transports.Console({
        level: 'debug',
        handleExceptions: true,
        colorize: true,
        humanReadableUnhandledException: true
      })
    ],
    exitOnError: false
  });

  var logger = {
    info: function (msg) {
      linfo.info(msg);
    },
    error: function(msg) {
      lerror.error(msg)
    },
    pass: function (msg) {
      lpass.info(msg);
    }
  };

  logger._stream = {
    write: function (message, encoding) {
      logger.info(message);
    }
  };

  global.logger = logger;

  callback();
};