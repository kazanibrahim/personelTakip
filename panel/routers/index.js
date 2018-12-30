module.exports = function (app) {
  app.get("/",checkDbItem,secure,controller.main.home);
  app.get("/home",secure,controller.main.home);
  app.get("/logout", controller.main.doLogout);
  app.post("/login", controller.main.doLogin);
};
