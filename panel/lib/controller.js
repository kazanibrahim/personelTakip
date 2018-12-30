module.exports = {
  main  : require(__dirname + "/../app/controller/Main"),
  user  : require(__dirname + "/../app/controller/User"),
  
  // <editor-fold "Definition Controller">
  reader        : require(__dirname + "/../app/controller/definitions/Reader"),
  card          : require(__dirname + "/../app/controller/definitions/Card"),
  readerGroup   : require(__dirname + "/../app/controller/definitions/ReaderGroup"),
  personnel     : require(__dirname + "/../app/controller/definitions/Personnel"),
  
  // </editor-fold>
  
  // <editor-fold "Report Controller">
  generalReport    : require(__dirname + "/../app/controller/reports/General"),
  personnelReport  : require(__dirname + "/../app/controller/reports/Personnel"),

  // </editor-fold>
  
  // <editor-fold "Settings Controller">

  // </editor-fold>
  
};