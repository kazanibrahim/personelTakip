var fs = require("fs");
var dbConfig = config.db;

global.mongoose = require('mongoose');
mongoose.Promise = global.Promise;

module.exports = function (callback) {
    mongoose.connect(dbConfig.host, {
        user: dbConfig.username,
        pass: dbConfig.password
    });

    process.on('SIGINT', function () {
        console.info("MONGOOSE Disconnecting...");
        mongoose.disconnect(function () {
            process.exit();
        });
    });

    mongoose.connection.on('error', function (err) {
        throw err;
    });

    mongoose.connection.on('disconnected', function () {
        console.error("MONGO Disconnected");
        callback();
    });

    mongoose.connection.on('connected', function () {
        console.info("MONGO\t [" + dbConfig.title + "]");
        callback();
    });

    fs.readdirSync(__dirname + '/../app/model').forEach(function (file) {
        file.indexOf('.js') != -1 ? require(__dirname + '/../app/model/' + file) : false;
    });
};
