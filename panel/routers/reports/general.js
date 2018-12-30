module.exports = function (app) {
  
  app.get("/report/general",               secure,   controller.generalReport.getGeneralReportPage);
  app.get("/reports/general/exportReport", secure,   controller.generalReport.getGeneralReportExport);
  
  app.post("/reports/general",             secure,   controller.generalReport.generalPass);
  
};