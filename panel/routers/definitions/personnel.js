module.exports = function (app) {
  app.post("/definitions/personnel/create",                secure,  controller.personnel.createPersonnel);
  app.post("/definitions/personnel/edit/:personnelId",     secure,  controller.personnel.editPersonnel);
  app.post("/definitions/personnel/delete",                secure,  controller.personnel.deletePersonnel);
  app.post("/definitions/personnel/uploadImage",           secure,  controller.personnel.uploadImage);
  
  app.get("/definitions/personnel/create",              secure,  controller.personnel.getCreatePersonnelPage);
  app.get("/definitions/Personnel/edit/:personnelId",   secure,  controller.personnel.getEditPersonnelPage);
  app.get("/definitions/personnel/list",                secure,  controller.personnel.getListPersonnelPage);
};