module.exports = function (app) {
  app.post("/user/create",        secure,   controller.user.createUser);
  app.post("/user/edit/:userId",  secure,   controller.user.editUser);
  app.post("/user/delete",        secure,   controller.user.deleteUser);
  
  app.get("/user/create",         secure,   controller.user.getCreateUserPage);
  app.get("/user/edit/:userId",   secure,   controller.user.getEditUserPage);
  app.get("/user/list",           secure,   controller.user.getListUserPage);
};