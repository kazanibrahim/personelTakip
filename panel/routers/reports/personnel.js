module.exports = function (app) {
  
  app.get("/report/personnel",               secure, controller.personnelReport.getPersonnelReportPage);
  app.get("/reports/personnel/exportReport", secure, controller.personnelReport.getPersonnelReportExport);
  
  app.post("/reports/personnel",             secure, controller.personnelReport.personnelPass);
  
};