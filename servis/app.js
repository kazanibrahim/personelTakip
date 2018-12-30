var fs = require('fs');

console.log('StartApp');

if (fs.existsSync(__dirname + '/config.json')) {
  try {
    global.config = JSON.parse(fs.readFileSync(__dirname + "/config.json", "utf-8"));
    console.info(config);
  } catch (e) {
    console.error("[ ERROR ] config.json could not read", e);
  }
} else {
  console.error('[ERROR] config.json does not exist!');
  process.exit(0);
}

var log = require(__dirname + "/bin/logger");
var db  = require(__dirname + "/bin/db");

global.commands = require(__dirname + "/libs/commands");

log(function () {
  db(function () {
    global.utils          = require(__dirname + "/bin/utils");
    var ReaderService     = require(__dirname + "/libs/readerService");
    var Passws            = require(__dirname + "/libs/passws");

    global.readerService  = new ReaderService();
    global.passWS = new Passws(function () {
      require(__dirname + "/bin/express")(function () {
        require(__dirname + "/libs/tcp")();
      });
    });
  })
});