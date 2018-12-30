module.exports = function (app) {
  
  require(__dirname + "/../routers/index.js")(app);
  require(__dirname + "/../routers/user.js")(app);
  
  // <editor-fold "Definitions Route">
  require(__dirname + "/../routers/definitions/reader.js")(app);
  require(__dirname + "/../routers/definitions/card.js")(app);
  require(__dirname + "/../routers/definitions/readerGroup.js")(app);
  require(__dirname + "/../routers/definitions/personnel.js")(app);

  // </editor-fold>
  
  // <editor-fold "Reports Route">
  require(__dirname + "/../routers/reports/general.js")(app);
  require(__dirname + "/../routers/reports/personnel.js")(app);
  // </editor-fold>
  
  // <editor-fold "Settings Route">

  // </editor-fold>
  
};