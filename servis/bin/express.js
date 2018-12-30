var express     = require('express');
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var app         = express();

module.exports = function (callback) {
  app.use(bodyParser.json({limit: '50mb'}));
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(morgan('combined', {stream: logger._stream}));
  app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization, X-AuthToken');
    res.setHeader('Access-Control-Allow-Credentials', true);
    if (req.method === "OPTIONS") {
      res.end();
    }
    next();
  });

  app.get("/card/:desReader", function (req, res) {

    var _desReader = req.params.desReader;
    if (!_desReader || _desReader.length == 0 ) {
      res.json({
        err: true,
        msg: "serialNo or cardId is missed"
      });
      return;
    }

    res.json({
      cardId: readerService.getCurrentCard(_desReader)
    })

  });

  app.post("/reader/restart"  , function (req, res) {
    /*
    var _serialNo = req.body.readerSerialNo;
    readerService.restartReader(_serialNo);
    res.json({
      err: false,
      msg: ""
    });
    */
  });
  app.post("/card/write"      , function (req, res) {
    /*
    var sNoSeries   = req.body.sNoSeries;
    var cId         = req.body.cardId;
    var fId         = req.body.firmId;
    var rGroupId    = req.body.rGroupId;

    if (!sNoSeries || sNoSeries.length == 0 || !cId || !fId || !rGroupId) {
      res.json({
        err: true,
        msg: "serialNo or cardId is missed"
      });
      return;
    }else{res.json({
      err: false,
      msg: "done"
    });}

    function SeqExec() {
      WriteCardIdToReader(function (_errorData) {
        WriteControl(_errorData)
      })
    }

    function WriteCardIdToReader(mCallback) {
      var errorData = [];

      var sequentialProcess = function(l,cl) {
          readerService.searchCardReaderFlash(sNoSeries[l].toString(), cId, function (hasCard) {
            if(hasCard){
              logger.info("[ WRITE CARD PROCESS ] " +cId+"  HAS BEEN WROTE " +sNoSeries[l].toString()+ " TO READER");
              l--;
              if(l == -1){cl();}else{sequentialProcess(l,cl)}
            }else{
              readerService.writeCardIdToReader(sNoSeries[l].toString(), cId,function (isWrite) {
                errorData.push(isWrite);
                logger.info("[ WRITE CARD PROCESS ] DOES IT WRITE "  +cId+"  TO " +sNoSeries[l].toString()+ " READER ? " +isWrite);
                l--;
                if(l == -1){cl();}else{sequentialProcess(l,cl)}
              });
            }
          })
        };

      sequentialProcess(sNoSeries.length - 1, function () {
        logger.info("[ WRITE CARD PROCESS ] Write Card to Reader Process Done");
        mCallback(errorData);
        });
    }

    function WriteControl(errData) {
      if(errData.indexOf(false) >= 0){
        var writeFault            = new WriteFault();

        writeFault.cardId         = cId;
        writeFault.readerGroupId  = rGroupId;
        writeFault.isDelete       = true;
        writeFault.isWrite        = false;
        writeFault.firmId         = fId;

        return writeFault.save()
          .then(function () {
            logger.info("[ WRITE CARD PROCESS ] THIS " +cId+ " CARD ID HAS NOT WRITE THIS READER GROUP " +rGroupId  );
          })
          .then(null, function (err) {
            logger.error(err);
          })
      }
    }

    SeqExec()
    */
  });
  app.post("/password/write"  , function (req, res) {
    /*
    var sNoSeries   = req.body.sNoSeries;
    var cId         = req.body.password;
    var fId         = req.body.firmId;
    var rGroupId    = req.body.rGroupId;

    if (!sNoSeries || sNoSeries.length == 0 || !cId || !fId || !rGroupId) {
      res.json({
        err: true,
        msg: "serialNo or password is missed"
      });
      return;
    }else{res.json({
      err: false,
      msg: "done"
    });}

    function SeqExec() {
      WritePasswordToReader(function (_errorData) {
        WriteControl(_errorData)
      })
    }

    function WritePasswordToReader(mCallback) {
      var errorData = [];

      var sequentialProcess = function(l,cl) {
        readerService.searchPasswordReaderFlash(sNoSeries[l].toString(), cId, function (hasCard) {
          if(hasCard){
            logger.info("[ WRITE KEY PROCESS ] " +cId+"  HAS BEEN WROTE " +sNoSeries[l].toString()+ " TO READER");
            l--;
            if(l == -1){cl();}else{sequentialProcess(l,cl)}
          }else{
            readerService.writePasswordToReader(sNoSeries[l].toString(), cId,function (isWrite) {
              errorData.push(isWrite);
              logger.info("[ WRITE KEY PROCESS ] DOES IT WRITE "  +cId+"  TO " +sNoSeries[l].toString()+ " READER ? " +isWrite);
              l--;
              if(l == -1){cl();}else{sequentialProcess(l,cl)}
            });
          }
        })
      };

      sequentialProcess(sNoSeries.length - 1, function () {
        logger.info("[ WRITE KEY ] Write Key to Reader Process Done");
        mCallback(errorData);
      });
    }

    function WriteControl(errData) {
      if(errData.indexOf(false) >= 0){
        var writeFault            = new WriteFault();

        writeFault.cardId         = cId;
        writeFault.readerGroupId  = rGroupId;
        writeFault.isDelete       = true;
        writeFault.isWrite        = false;
        writeFault.firmId         = fId;

        return writeFault.save()
          .then(function () {
            logger.info("[ WRITE KEY PROCESS ] THIS " +cId+ " KEY HAS NOT WRITE THIS READER GROUP " +rGroupId  );
          })
          .then(null, function (err) {
            logger.error(err);
          })
      }
    }

    SeqExec()
    */
  });
  app.post("/card/delete"     , function (req, res) {
    /*
    var sNoSeries   = req.body.sNoSeries;
    var cId         = req.body.cardId;
    var fId         = req.body.firmId;
    var rGroupId    = req.body.rGroupId;

    if (!sNoSeries || sNoSeries.length == 0 || !cId || !fId || !rGroupId) {
      res.json({
        err: true,
        msg: "serialNo or cardId is missed"
      });
      return;
    }else{res.json({
      err: false,
      msg: "done"
    });}

    function SeqExec() {
      DeleteCardIdFromReader(function (_errorData) {
        DeleteControl(_errorData)
      })
    }

    function DeleteCardIdFromReader(callback) {
      var errorData = [];

      var sequentialProcess = function(l,cl) {
          readerService.deleteCardIdToReader(sNoSeries[l].toString(), cId, function (isDeleted) {
            errorData.push(isDeleted);
            logger.info("[ DELETE CARD PROCESS ] DOES IT DELETE "  +cId+"  TO " +sNoSeries[l].toString()+ " READER ? " +isDeleted);
            l--;
            if(l == -1){cl();}else{sequentialProcess(l,cl)}
          });
        };

      sequentialProcess(sNoSeries.length - 1, function () {
        logger.info("[ DELETE CARD PROCESS ] Delete Card to Reader Process Done");
          callback(errorData);
        });
      }

    function DeleteControl(errData) {
      if(errData.indexOf(false) >= 0){
        var writeFault            = new WriteFault();

        writeFault.cardId         = cId;
        writeFault.readerGroupId  = rGroupId;
        writeFault.isDelete       = false;
        writeFault.isWrite        = true;
        writeFault.firmId         = fId;

        return writeFault.save()
          .then(function () {
            logger.info("[ DELETE CARD PROCESS ] THIS " +cId+ " CARD ID HAS NOT DELETE THIS READER GROUP " +rGroupId  );
          })
          .then(null, function (err) {
            logger.error(err);
          })
      }
    }

    SeqExec()
    */
  });
  app.post("/password/delete" , function (req, res) {
    /*
    var sNoSeries   = req.body.sNoSeries;
    var cId         = req.body.password;
    var fId         = req.body.firmId;
    var rGroupId    = req.body.rGroupId;

    if (!sNoSeries || sNoSeries.length == 0 || !cId || !fId || !rGroupId) {
      res.json({
        err: true,
        msg: "serialNo or password is missed"
      });
      return;
    }else{res.json({
      err: false,
      msg: "done"
    });}

    function SeqExec() {
      DeletePasswordFromReader(function (_errorData) {
        DeleteControl(_errorData)
      })
    }

    function DeletePasswordFromReader(callback) {
      var errorData = [];

      var sequentialProcess = function(l,cl) {
        readerService.deletePasswordToReader(sNoSeries[l].toString(), cId, function (isDeleted) {
          errorData.push(isDeleted);
          logger.info("[ DELETE KEY PROCESS ] DOES IT DELETE "  +cId+"  TO " +sNoSeries[l].toString()+ " READER ? " +isDeleted);
          l--;
          if(l == -1){cl();}else{sequentialProcess(l,cl)}
        });
      };

      sequentialProcess(sNoSeries.length - 1, function () {
        logger.info("[ DELETE KEY PROCESS ] Delete Key to Reader Process Done");
        callback(errorData);
      });
    }

    function DeleteControl(errData) {
      if(errData.indexOf(false) >= 0){
        var writeFault            = new WriteFault();

        writeFault.cardId         = cId;
        writeFault.readerGroupId  = rGroupId;
        writeFault.isDelete       = false;
        writeFault.isWrite        = true;
        writeFault.firmId         = fId;

        return writeFault.save()
          .then(function () {
            logger.info("[ DELETE KEY PROCESS ] THIS " +cId+ " KEY HAS NOT DELETE THIS READER GROUP " +rGroupId  );
          })
          .then(null, function (err) {
            logger.error(err);
          })
      }
    }

    SeqExec()
    */
  });

  app.listen(config.server.port, function () {
    logger.info('EXPRESS\t [' + config.server.port + ']');
    callback();
  });
};