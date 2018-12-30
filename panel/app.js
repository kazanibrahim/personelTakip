var init = function () {
  
  var fs = require('fs');
  
  console.log('StartApp >>>');
  
  if (fs.existsSync(__dirname + '/config.json')) {
    try {
      global.config = JSON.parse(fs.readFileSync(__dirname + "/config.json", "utf-8"));
      console.info("Config has been loaded !");
    } catch (e) {
      console.error("[ ERROR ] config.json could not read", e);
      process.exit(0);
    }
  } else {
    console.error('[ERROR] config.json does not exist!');
    process.exit(0);
  }
  
  var db      = require(__dirname + "/lib/db");
  var express = require(__dirname + "/lib/express");
  var router  = require(__dirname + "/lib/router");
  
  db(function () {
    console.info("DB Module Has Been Loaded");
    global._error = function(res){
      return function(err){
        res.json({
          err: true,
          msg: err.name  + " " + err.message
        });
      }
    };
    global.controller = require(__dirname + "/lib/controller");
    global.utils = require(__dirname + "/lib/utils");
    require(__dirname + "/lib/middleware");
    express(function (app) {
      console.info("Express Module Has Been Loaded");
      router(app)
    })
  })
  
};

init();