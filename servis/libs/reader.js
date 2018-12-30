var ReaderModel       = mongoose.model("Reader");
var ReaderGroupModel  = mongoose.model("ReaderGroup");
function Reader(socket) {
  this._socket      = socket;
  this._readerIP    = null;
  this._serialNo    = null;
  this._macNo       = null;
  this._type        = null;
  this._online      = false;
  this._readerName  = "";
  this._onlineCard  = null;
  this._logBuffer   = [];

  this.addSocketListener();
}

Reader.prototype.addSocketListener = function () {

  var _this = this;
  var s = this._socket;

  s.setTimeout(310000);

  s.on("data", function (rCommand) {
    var bufData;
    var check = rCommand; //typeof decimal
    var checkLength = rCommand.length;
    var dataLength = rCommand[2] + rCommand[3];
    if (check[0] == commands.START && check[1] == commands.CONSTANT && check[checkLength - 1] == commands.STOP) {
      if (dataLength == rCommand.length - 7) {
        var bcc     = utils.calculateBcc4Received(rCommand);
        var recBccL = (rCommand[rCommand.length - 2].toString(16));
        var recBccH = (rCommand[rCommand.length - 3].toString(16));
        if (bcc.l === recBccL && bcc.h === recBccH) {
          var c1  = rCommand.slice(4, 5)[0];
          switch (c1) {
            // <editor-fold "Switch Handshake">
            case commands.CFR_HANDSHAKE:
              s.write(new Buffer([0x02, 0xF6, 0x00, 0x02, 0x4B, 0x4F, 0x46, 0x30, 0x03]), "hex");
              _this.doCfrHandshake(rCommand);
              break;
            // </editor-fold>
            // <editor-fold "Switch Get Ethernet Settings">
            case commands.CFR_SEND_ETHERNET_SETTINGS:
              _this.setReaderIp(rCommand);
              break;
            // </editor-fold>
            // <editor-fold "Switch Get Card">
            case commands.CFR_SEND_CARD_ID:
              _this.doCfrReceivedCardId(rCommand);
              break;
            // </editor-fold>
            // <editor-fold "Switch Reader Date Control">
            case commands.CFR_CLOCK_ERROR: //Every 5 Minutes Readers Send DateTime
              var c_1 = commands.READER_WORKING_PARAMETERS;
              var c_2 = commands.SET_DATE_COMMAND_C2;
              var date = _this.setReaderDate();
              bufData = utils.calculateBcc4Send(c_1, c_2, new Buffer(date));
              s.write(bufData, 'hex');
              logger.info("[ SET TIME ] SerialNo: " + _this._serialNo + " " + date);
              break;
            // </editor-fold>
            // <editor-fold "Switch Log Received">
            case commands.CFR_SEND_LOG_DATA:
              _this.doCfrReceivedLogData(rCommand);
              break;
            // </editor-fold>
            //  <editor-fold "Switch Positive Answer">
            case commands.POSITIVE:
              _this.doCfrPositive(rCommand);
              break;
            //  </editor-fold>
            //  <editor-fold "Switch Negative Answer">
            case commands.NEGATIVE:
              _this.doCfrNegative(rCommand);
              break;
            //  </editor-fold>
            //  <editor-fold "Switch Storage Full">
            case commands.READER_STORAGE_FULL:
              logger.error("[ READER STORAGE FULL ] " + _this._serialNo);
              break;
            //  </editor-fold>
          }
        } else {
          logger.error('BCC Calculate has Invaild!')
        }
      } else {
        logger.error('Data Length has Invaild!')
      }
    } else {
      logger.error('Empty Start or Stop Bit!')
    }
  });

  s.on("close", function () {
    logger.info("[ CLOSED ] SerialNo: " + _this._serialNo);
    readerService.deleteReader(_this._serialNo);
  });

  s.on("error", function () {
    logger.info("[ ERROR ] SerialNo: " + _this._serialNo);
    _this.destroyConnection();
  });

  s.on("timeout", function () {
    console.log("[ DIE ] SerialNo: " + _this._serialNo);
    readerService.restartReader(_this._serialNo);
  });
};

// <editor-fold "Do Cfr Received Data Process">
Reader.prototype.doCfrHandshake = function (rCommand) {
  var serial = this.setSerialNo(rCommand);
  var mac    = this.setMacAdrr(rCommand);
  logger.info("[ CONNECTED ] SerialNo: " + serial);
  this.updateReader(serial);
  this.getReaderIp();
};

Reader.prototype.doCfrReceivedLogData = function (rCommand) {
  var _switch = rCommand.slice(rCommand.length-4,rCommand.length-3)[0];
  var _this = this;
  var c1 = commands.READER_FUNCTION_COMMAND_C1;
  var c2 = commands.LOG_POSITIVE_COMMAND;
  var bufData = utils.calculateBcc4Send(c1, c2, commands.EMPTY);
  _this.send(bufData);

  if(_switch == commands.CFR_SEND_LOG_DATA_CARD){
    if (_this._online) {
      logger.info("[ CARD LOG RECEIVED ] SerialNo:" + this._serialNo);
    } else {
      logger.info("[ LOG BUFFERED ] SerialNo:" + this._serialNo);
      _this._logBuffer.push(rCommand);
    }
  }else{
    logger.error('Invaild Log Recevied')
  }

};

Reader.prototype.doCfrReceivedCardId  = function (rCommand) {
  var _this   = this;
  var cardId  = rCommand.slice(6, rCommand.length - 3).toString();
  var receivedType = rCommand.slice(5, rCommand.length - 11).toString();
  //receivedType a : entrance , b: exit
  var c1 = commands.CARD_ANSWER_COMMAND_C1;
  var c2 = commands.CARD_ANSWER_COMMAND_C2;
  var bufData;

  var r = {
    serialNo  : _this._serialNo,
    ipNo      : _this._readerIP,
    mNo       : _this._macNo,
    type      : _this._type,
    name      : _this._readerName
  };

  if (!_this._online) {
    bufData = utils.calculateBcc4Send(c1, c2, new Buffer("#"));
    _this.send(bufData);

    logger.error("[ READER NOT EXIST ON DATABASE ] " + _this._serialNo);
    return;
  }

  if (_this._onlineCard !== cardId) {
    _this._onlineCard = cardId;

      if (_this._type == -1) {
          setTimeout(function () {
              _this._onlineCard = null;
          }, 2000);

          bufData = utils.calculateBcc4Send(c1, c2, new Buffer('#'));
          _this.send(bufData);

      } else {
          readerService.checkCardOnReader(r, cardId, function (data) {
              bufData = utils.calculateBcc4Send(c1, c2, data);
              _this.send(bufData);

              _this._onlineCard = null;
          });
      }

  } else {
    bufData = utils.calculateBcc4Send(c1, c2, new Buffer("#"));
    _this.send(bufData);
  }

};

Reader.prototype.doCfrPositive = function (rCommand) {
  var _this = this;
  var pData1 = rCommand.slice(5, 6)[0].toString(16).toUpperCase();
  var pData2 = rCommand.slice(6, 7)[0].toString(16).toUpperCase();

  var _checkReaderC1      = commands.READER_FUNCTION_COMMAND_C1[0].toString(16).toUpperCase();
  var _checkReaderC2      = commands.CHECK_READER_COMMAND_C2[0].toString(16).toUpperCase();
  var _controlCardC1      = commands.CARD_COMMAND_C1[0].toString(16).toUpperCase();
  var _controlCardC2      = commands.CONTROL_CARDID_COMMAND_C2[0].toString(16).toUpperCase();
  var _controlPasswordC1  = commands.KEY_COMMAND_C1[0].toString(16).toUpperCase();
  var _controlPasswordC2  = commands.CONTROL_KEY_COMMAND_C2[0].toString(16).toUpperCase();
  var _writeCardC1        = commands.CARD_COMMAND_C1[0].toString(16).toUpperCase();
  var _writeCardC2        = commands.WRITE_CARD_ID_COMMAND_C2[0].toString(16).toUpperCase();
  var _writeKeyC1         = commands.KEY_COMMAND_C1[0].toString(16).toUpperCase();
  var _writeKeyC2         = commands.WRITE_KEY_COMMAND_C2[0].toString(16).toUpperCase();
  var _deleteCardC1       = commands.CARD_COMMAND_C1[0].toString(16).toUpperCase();
  var _deleteCardC2       = commands.DELETE_CARD_ID_COMMAND_C2[0].toString(16).toUpperCase();

  if(pData1 === _checkReaderC1 && pData2 === _checkReaderC2){
    console.log('Recevid Positive Check Reader');
     return this._checked = true;
  }else if(pData1 === _controlCardC1 && pData2 === _controlCardC2){
    logger.info("[ CHECK CARD PROCESS ] Check Card to Reader Has Been Successfully ");
    return this._insideCardReader = true;
  } else if(pData1 === _writeCardC1 && pData2 === _writeCardC2){
    logger.info("[ WRITE CARD PROCESS ] Write Card to Reader Has Been Successfully ");
    return this._isWriteCardReader = true;
  }else if(pData1 === _deleteCardC1 && pData2 === _deleteCardC2) {
    logger.info("[ DELETE CARD PROCESS ] Delete Card to Reader Has Been Successfully ");
    return this._isDeleteCardReader = true;
  }else if(pData1 === _controlPasswordC1 && pData2 === _controlPasswordC2){
    logger.info("[ CHECK KEY PROCESS ] Check key to Reader Has Been Successfully ");
    return this._insideCardReader = true;
  }else if(pData1 === _writeKeyC1 && pData2 === _writeKeyC2) {
    logger.info("[ WRITE KEY PROCESS ] Write Key to Reader Has Been Successfully ");
    return this._isWriteCardReader = true;
  }
};

Reader.prototype.doCfrNegative = function (rCommand) {
  var _this = this;
  var nData1 = rCommand.slice(5, 6)[0].toString(16).toUpperCase();
  var nData2 = rCommand.slice(6, 7)[0].toString(16).toUpperCase();

  var _checkReaderC1        = commands.READER_FUNCTION_COMMAND_C1[0].toString(16).toUpperCase();
  var _checkReaderC2        = commands.CHECK_READER_COMMAND_C2[0].toString(16).toUpperCase();
  var _controlCardC1        = commands.CARD_COMMAND_C1[0].toString(16).toUpperCase();
  var _controlCardC2        = commands.CONTROL_CARDID_COMMAND_C2[0].toString(16).toUpperCase();
  var _controlPasswordC1    = commands.KEY_COMMAND_C1[0].toString(16).toUpperCase();
  var _controlPasswordC2    = commands.CONTROL_KEY_COMMAND_C2[0].toString(16).toUpperCase();
  var _writeKeyC1           = commands.KEY_COMMAND_C1[0].toString(16).toUpperCase();
  var _writeKeyC2           = commands.WRITE_KEY_COMMAND_C2[0].toString(16).toUpperCase();
  var _writeCardC1          = commands.CARD_COMMAND_C1[0].toString(16).toUpperCase();
  var _writeCardC2          = commands.WRITE_CARD_ID_COMMAND_C2[0].toString(16).toUpperCase();
  var _deleteCardC1         = commands.CARD_COMMAND_C1[0].toString(16).toUpperCase();
  var _deleteCardC2         = commands.DELETE_CARD_ID_COMMAND_C2[0].toString(16).toUpperCase();

  if(nData1 === _checkReaderC1 && nData2 === _checkReaderC2){
    console.log('Recevid Negative Check Reader')
  }else if(nData1 === _controlCardC1 && nData2 === _controlCardC2){
    logger.info("[ CHECK CARD PROCESS ] Check Card to Reader Has NOT Been Successfully ");
    return this._insideCardReader = false;
  }else if(nData1 === _writeCardC1 && nData2 === _writeCardC2){
    logger.info("[ WRITE CARD PROCESS ] Write Card to Reader Has NOT Been Successfully ");
    return this._isWriteCardReader = false;
  }else if(nData1 === _deleteCardC1 && nData2 === _deleteCardC2){
    logger.info("[ DELETE CARD PROCESS ] Delete Card to Reader Has NOT Been Successfully ");
    return this._isDeleteCardReader = false;
  } else if(nData1 === _controlPasswordC1 && nData2 === _controlPasswordC2){
    logger.info("[ CHECK KEY PROCESS ] Check key to Reader Has NOT Been Successfully ");
    return this._insideCardReader = false;
  }else if(nData1 === _writeKeyC1 && nData2 === _writeKeyC2) {
    logger.info("[ WRITE KEY PROCESS ] Write Key to Reader Has NOT Been Successfully ");
    return this._isWriteCardReader = false;
  }
};
// </editor-fold>

// <editor-fold "Setter Process">
Reader.prototype.setReaderDate = function () {
  var sDate = "";
  var date = new Date();
  var year = date.getFullYear().toString();
  var month = (( date.getMonth() + 1 < 10 ) ? "0" + (date.getMonth() + 1).toString() : (date.getMonth() + 1).toString());
  var day4Month = (( date.getDate() < 10 ) ? "0" + (date.getDate()).toString() : (date.getDate()).toString());
  var day = (( date.getDay() < 10 ) ? "0" + (date.getDay()).toString() : (date.getDay()).toString());
  var hours = (( date.getHours() < 10 ) ? "0" + (date.getHours()).toString() : (date.getHours()).toString());
  var minutes = (( date.getMinutes() < 10 ) ? "0" + (date.getMinutes()).toString() : (date.getMinutes()).toString());
  var seconds = (( date.getSeconds() < 10 ) ? "0" + (date.getSeconds()).toString() : (date.getSeconds()).toString());

  sDate += seconds;
  sDate += minutes;
  sDate += hours;
  sDate += day;
  sDate += day4Month;
  sDate += month;
  sDate += year.slice(2, 4);

  return sDate;
};

Reader.prototype.setSerialNo = function (rCommand) {
  var sno = rCommand.slice(5, rCommand.length - 9);
  var snoString = sno.toString();
  var realSerial = snoString.substring(8, 16);
  this._serialNo = realSerial;
  return realSerial;
};

Reader.prototype.setMacAdrr  = function (rCommand) {
  var mnoString = "";
  var mno       = rCommand.slice(21, rCommand.length - 3);

  mnoString = mno[0].toString(16)+":";
  mnoString += mno[1].toString(16)+":";
  mnoString += mno[2].toString(16)+":";
  mnoString += mno[3].toString(16)+":";
  mnoString += mno[4].toString(16)+":";
  mnoString += mno[5].toString(16);

  this._macNo = mnoString;
  return mnoString;
};

Reader.prototype.setReaderIp = function (rCommand) {
  var rIp1 = rCommand.slice(14, 18)[0];
  var rIp2 = rCommand.slice(14, 18)[1];
  var rIp3 = rCommand.slice(14, 18)[2];
  var rIp4 = rCommand.slice(14, 18)[3];
  var realIp = rIp1 + "." + rIp2 + "." + rIp3 + "." + rIp4;
  this._readerIP = realIp;
  logger.info("[ Done ] " + realIp + " is connected");
  return realIp;
};

Reader.prototype.setReaderType = function (callback) {
  var _this = this;
  var _rType;
  var data;

  if (!_this._online) {
    logger.error("[ READER NOT EXIST ON DATABASE ] " + _this._serialNo);
    return;
  }

  if(_this._type == 0){_rType = "2";}else if(_this._type == 1){_rType = "1";}else{_rType = "3";}

  data = utils.calculateBcc4Send(commands.READER_WORKING_PARAMETERS, commands.SET_READERTYPE_COMMAND_C2, new Buffer(_rType.toString()));

  _this.send(data);

  callback();

};
// </editor-fold>

// <editor-fold "Getter Process">
Reader.prototype.getSerialNo = function () {
  return this._serialNo;
};

Reader.prototype.getReaderIp = function () {
  var _this = this;
  var c1 = commands.READER_FUNCTION_COMMAND_C1;
  var c2 = commands.GET_ETHERNET_SETTINGS;
  var bufData = utils.calculateBcc4Send(c1, c2, commands.EMPTY);
  _this.send(bufData);
};

Reader.prototype.getCurrentCard = function () {
  return this._onlineCard;
};

Reader.prototype.getSocket = function () {
  return this._socket;
};
// </editor-fold>

// <editor-fold "Update-Reader,Destroy-Con,Data-Send,Notify">
Reader.prototype.updateReader      = function (serialNo) {
    var _this = this;
    var ip = _this._readerIP;
    _this._online = true;
    _this._antiPass = false;
    ReaderModel.findOne({"serialNo": serialNo}).exec()
        .then(function (_reader) {
            if (_reader == null || !_reader) {
                logger.error("[ READER NOT EXIST ON DATABASE ] " + serialNo + " " + ip);
                logger.error("Reader Kaıyıtlı Değil")
                setTimeout(function () {
                    _this.updateReader(serialNo);
                }, 10000);
            } else {
                var readerx = _reader.toObject();

                _this._type = readerx.readerType;
                _this._passWait = readerx.passSignalWait;
                _this._groupId = readerx.groupId;
                _this._readerName = readerx.readerName;

                if (readerx.readerType === null || typeof readerx.readerType === "undefined") {
                    logger.error("[ READER TYPE IS NOT DEFINED ] " + serialNo + " is offline");
                } else if ((readerx.groupId.length == 0 || readerx.groupId === null || typeof readerx.groupId === "undefined") && (readerx.readerType != -1 && readerx.readerType != 2)) {
                    logger.error("[ READER GROUP ID IS NOT DEFINED ] " + serialNo + " is offline");
                }  else {
                    if (_this._type == -1 || _this._type == 2) {
                        _this._online = true;
                        _this._antiPass = false;
                        _this.setReaderType(function () {
                            _this.getReaderIp();
                            logger.info("[ OK ] " + serialNo + " is loaded");
                        })
                    } else {
                        _this.setAntiPass(_this._groupId, function (antipass) {
                            _this._antiPass = (antipass === null || typeof antipass === "undefined") ? _this._antiPass : antipass;
                            _this._online = true;
                            _this.setReaderType(function () {
                                _this.setPassSignalWait(_this._serialNo, function () {
                                    _this.getReaderIp();
                                    logger.info("[ OK ] " + serialNo + " is loaded");
                                });
                            })
                        });
                    }
                }
            }
        })
        .then(null, function (err) {
            logger.error(err.name + " " + err.message)
        })

};

Reader.prototype.destroyConnection = function () {
  readerService.deleteReader(this._serialNo);

  this._socket.destroy();
  logger.info("[ DESTROYED ]" + this._serialNo);
};

Reader.prototype.send = function (data) {
  this._socket.write(data, "hex");
};
// </editor-fold>

module.exports = Reader;