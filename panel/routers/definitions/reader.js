module.exports = function (app) {
  app.post("/definitions/reader/create",         secure,   controller.reader.createReader);
  app.post("/definitions/reader/edit/:readerId", secure,   controller.reader.editReader);
  app.post("/definitions/reader/delete",         secure,   controller.reader.deleteReader);
  
  app.get("/definitions/reader/create",          secure,   controller.reader.getCreateReaderPage);
  app.get("/definitions/reader/edit/:readerId",  secure,   controller.reader.getEditReaderPage);
  app.get("/definitions/reader/list",            secure,   controller.reader.getListReaderPage);
};