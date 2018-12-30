module.exports = function (app) {
  app.post("/definitions/card/create",            secure,   controller.card.createCard);
  app.post("/definitions/card/edit/:cardId",      secure,   controller.card.editCard);
  app.post("/definitions/card/delete",            secure,   controller.card.deleteCard);
  app.post("/definitions/card/importCard",        secure,   controller.card.importCard);

  app.get("/definitions/card/create",             secure,   controller.card.getCreateCardPage);
  app.get("/definitions/card/edit/:cardId",       secure,   controller.card.getEditCardPage);
  app.get("/definitions/card/list",               secure,   controller.card.getListCardPage);
  app.get("/definitions/card/import",             secure,   controller.card.getImportCardPage);
  app.get("/definitions/card/getCardId/:rSerial", secure,  controller.card.getCardId);
  
};