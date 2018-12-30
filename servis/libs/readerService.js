var ReaderGroupModel  = mongoose.model("ReaderGroup");
var PassAction   = mongoose.model("PassAction");
var Personnel    = mongoose.model("Personnel");
var CardModel    = mongoose.model("Card");

function Reader() {
  this.readerDTO = [];
}

Reader.prototype.validateAccess     = function (personnel, cardId, reader, callback) {
  var _this = this;


  _this.checkPermission(reader.serialNo, personnel.permissions, cardId, function (hasPermission) {

    if (hasPermission) {
      callback(true, {message: "GECIS ONAYLANDI İHK" });

    }

    else {
      callback(false, {message: "YETKiSiZ GECIS İHK"});
    }
  })

};


Reader.prototype.addtoAccessHistory = function (cardId, serialNo, readerGroup, readerType, rType) {
  CardModel.update({
    cardId: cardId
  }, {
    "$push": {
      accessPassHistory: {
        reader: serialNo,
        readerGroup: readerGroup,
        type: readerType,
        requestType: rType
      }
    }
  })
    .exec()
    .then(null, this.systemError(serialNo, cardId));
};


Reader.prototype.addtoDeniedHistory = function (cardId, serialNo, readerGroup, readerType, rType) {
  CardModel.update({
    cardId: cardId
  }, {
    "$push": {
      deniedPassHistory: {
        reader: serialNo,
        readerGroup: readerGroup,
        type: readerType,
        requestType: rType
      }
    }
  })
    .exec()
    .then(null, this.systemError(serialNo, cardId));
};

Reader.prototype.systemError        = function (serialNo, cardId) {
  return function (err) {
    logger.error("[ SYSTEM ERROR ] cardId: " + cardId + "Error: " + err);
  };
};


if(prototype.addtoDeniedHistory(undefined))
{
    Reader.prototype.systemError= function (serialNo, cardId) {
        return function (err) {

            logger.error(cardId + err)

        };

    };
}




// <editor-fold "Check Method">

Reader.prototype.checkCardOnReader        = function (reader, cardId, callback) {
  var _this       = this;
  var serialNo    = reader.serialNo;
  var readerType  = reader.type;
  var readerIP    = reader.ipNo;
  var readerMNo   = reader.mNo;

  logger.pass("[ PASS ACTION ] cardId: " + cardId + " serial: " + serialNo + " ip: "+ readerIP +" Date: " + new Date().toLocaleString());

  CardModel.findOne({cardId: cardId}).exec()
    .then(function (_card) {
      if (!_card) {
        logger.error("[ CARD ERROR ] cardId: " + cardId + " serial: " + serialNo + " Error: " + "CARD NOT FOUND");

        callback(_this.getMachineRelayResponse("KAYITSIZ KART", false, false));

        passWS.getPassModel()
          ._setError(true)
          ._setDb(true)
          ._setReader(reader)
          ._setCardId(cardId)
          ._setPassStatus(false)
          ._setMessage("Kayıtsız kart")
          ._send();

      }else {
        logger.info("[ CARD INFO ] cardId: " + cardId + " serial: " + serialNo + " Info: " + "CARD FOUND ");

        if (_card.personnelId === "") {

          callback(_this.getMachineRelayResponse("PASIF KART", false, false));

          passWS.getPassModel()
            ._setError(true)
            ._setDb(true)
            ._setReader(reader)
            ._setCardId(cardId)
            ._setPassStatus(false)
            ._setMessage("Pasif Kart")
            ._send();


        }
        else {

          var personnelId = _card.personnelId;

          Personnel.findOne({_id: personnelId}).exec()


            .then(function (_personnel) {
              if (_personnel == undefined || _personnel == null) {

                callback(_this.getMachineRelayResponse("KAYITSIZ PERSONEL", false, false));

                passWS.getPassModel()
                  ._setError(true)
                  ._setDb(true)
                  ._setReader(reader)
                  ._setCardId(cardId)
                  ._setPassStatus(false)

                  ._setMessage("Kayıtsız Personel")

                  ._send();
              } else {
                _this.validateAccess(_personnel, cardId, reader, function (access, valResponse) {
                  var uMessage = _personnel.name + " " + _personnel.surname;
                  var wMessage = (access === true) ? uMessage : valResponse.message;
                  callback(_this.getMachineRelayResponse(wMessage, access, false));

                  if (access) {
                    _this.addtoAccessHistory(cardId, serialNo, readerGroup, readerType, 0);
                  } else {
                    _this.addtoDeniedHistory(cardId, serialNo, readerGroup, readerType, 0);
                  }

                  passWS.getPassModel()
                    ._setCardId(cardId)
                    ._setPersonnel(_personnel)
                    ._setReader(reader)
                    ._setMessage(valResponse.message)
                    ._setDb(true)
                    ._setPassStatus(access)
                    ._send();

                })
              }
            })
            .then(null, _this.systemError(serialNo, cardId));
        }
      }
    })
    .then(null, _this.systemError(serialNo, cardId));

};

Reader.prototype.checkPermission          = function (sno, permissions, carId, callback) {
  var _this = this;
  var _hasPermission = false;

  function SeqExec(l, cl) {
    ReaderGroupModel.findOne({_id: permissions[l].pid}).exec()
      .then(function (afterQuery) {
        if (afterQuery.readersSerial.indexOf(sno) == -1) {
          l--;
          if (l == -1) {
            cl()
          } else {
            SeqExec(l, cl)
          }
        } else {
          _hasPermission = true;
          cl();
        }
      })
      .then(null, _this.systemError(sno, carId));
  }

  SeqExec(permissions.length - 1, function () {
    callback(_hasPermission);
  })

};

// </editor-fold>

// <editor-fold "Get Method">
Reader.prototype.getCurrentCard = function (serial) {
  var card;
  var readers = this.readerDTO;

  for (var i = 0; i < readers.length; i++) {
    var r = readers[i];
    if (r.getSerialNo() === serial) {
      card = r.getCurrentCard();
      break;
    }
  }

  return card;
};

Reader.prototype.getMachineRelayResponse = function (message, isPositive, isSpecific) {
  message = message.replace(/[üÜşŞğĞıİÖöçÇ]/g, function (match) {
    if (match.charCodeAt() == 351) return "s";
    else if (match.charCodeAt() == 350) return "S";
    else if (match.charCodeAt() == 286) return "G";
    else if (match.charCodeAt() == 287) return "g";
    else if (match.charCodeAt() == 305) return "i";
    else if (match.charCodeAt() == 304) return "I";
    else if (match.charCodeAt() == 252) return "u";
    else if (match.charCodeAt() == 220) return "U";
    else if (match.charCodeAt() == 231) return "c";
    else if (match.charCodeAt() == 199) return "C";
    else if (match.charCodeAt() == 246) return "o";
    else if (match.charCodeAt() == 214) return "O";
    else return match;
  });

  var line = (Math.ceil(message.length / 21));
  var limit = Math.floor(((7 - line) / 2));
  var marr = [];
  var prefix = "";

  for (var i = 0; i < limit; i++) {
    prefix += "#";
  }

  for (var j = 1; j < line + 1; j++) {
    message = [message.slice(0, (21 * i)), "#", message.slice((21 * j))].join('');
  }

  message = message + "#####";

  for (var m = 0; m < message.length; m++) {
    marr.push(message.charCodeAt(m));
  }

  var mBuf = new Buffer(marr);

  //TODO:0 +1 will change by language
  if (isPositive) {
    if (isSpecific) buffer = Buffer.concat([new Buffer("+3" + prefix), mBuf], mBuf.length + limit + 2);
    else buffer = Buffer.concat([new Buffer("+1"), mBuf], mBuf.length + 2);
  } else {
    buffer = Buffer.concat([new Buffer("-3" + prefix), mBuf], mBuf.length + limit + 2);
  }

  return buffer;
};
// </editor-fold>

// <editor-fold "Reader Method">
Reader.prototype.deleteReader = function (serialNo) {
  var readers = this.readerDTO;

  for (var i = 0; i < readers.length; i++) {
    var r = readers[i];
    if (r.getSerialNo() === serialNo) {
      this.readerDTO.splice(i, 1);
      logger.info("[ READER DELETED ] " + serialNo);
      break;
    }
  }
};

Reader.prototype.restartReader = function (serialNo) {
  var readers = this.readerDTO;
  for (var i = 0; i < readers.length; i++) {
    var r = readers[i];

    if (r.getSerialNo() === serialNo) {
      r.destroyConnection();
      logger.info("[ READER RESTART ] " + serialNo);
      break;
    }
  }
};
// </editor-fold>

module.exports = Reader;