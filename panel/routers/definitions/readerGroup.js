module.exports = function (app) {
  app.post("/definitions/rgroup/create",          secure,   controller.readerGroup.createReaderGroup);
  app.post("/definitions/rgroup/edit/:rGroupId",  secure,   controller.readerGroup.editReaderGroup);
  app.post("/definitions/rgroup/delete",          secure,   controller.readerGroup.deleteReaderGroup);
  
  app.get("/definitions/rgroup/create",           secure,   controller.readerGroup.getCreateReaderGroupPage);
  app.get("/definitions/rgroup/edit/:rGroupId",   secure,   controller.readerGroup.getEditReaderGroupPage);
  app.get("/definitions/rgroup/list",             secure,   controller.readerGroup.getListReaderGroupPage);
};