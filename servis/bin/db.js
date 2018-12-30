var fs = require("fs");
var dbConfig = config.db;

global.mongoose = require('mongoose');

module.exports = function (callback) {
  mongoose.connect(dbConfig.host, {
    user: dbConfig.username,
    pass: dbConfig.password
  });

  process.on('SIGINT', function () {
    logger.info("MONGOOSE Disconnecting...");
    mongoose.disconnect(function () {
      process.exit();
    });
  });

  mongoose.connection.on('error', function (err) {
    throw err;
  });

  mongoose.connection.on('disconnected', function () {
    logger.error("MONGO Disconnected");
    callback();
  });

  mongoose.connection.on('connected', function () {
    logger.info("MONGO\t [" + dbConfig.title + "]");
    callback();
  });

  fs.readdirSync(__dirname + '/../models').forEach(function (file) {
    file.indexOf('.js') != -1 ? require(__dirname + '/../models/' + file) : false;
  });
};
