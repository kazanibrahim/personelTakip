var ReaderGroup   = mongoose.model("ReaderGroup");
var Reader        = mongoose.model("Reader");
var request       = require("request");
var exports       = module.exports = {};

// <editor-fold "Post Method">
exports.createReader  = function (req, res) {
  
  var readerName    = req.body.readerName;
  var readerSerial  = req.body.readerSerial;
  var readerProp    = req.body.readerProp;
  var readerType    = req.body.readerType;
  
  if (!utils.safeInput(readerName)    || readerName.length == 0) {
    res.json({err: true, msg: "Okuyucu Adı Hatalı İşlem"});
    return;
  }
  if (!utils.safeInput(readerSerial)  || readerSerial.length == 0) {
    res.json({err: true, msg: "Okuyucu Seri No Hatalı İşlem"});
    return;
  }
  if (!utils.safeInput(readerProp)    || readerProp.length == 0) {
    res.json({err: true, msg: "Okuyucu Özelliği Hatalı İşlem"});
    return;
  }
  
  function Execute() {
    CreateReader(function () {
      RestartReader();
    })
  }
  
  function CreateReader(callback) {
    Reader.count({}).exec()
      .then(function () {
        var reader = new Reader();
        
        reader.serialNo = readerSerial;
        reader.readerName = readerName;
        reader.readerType = readerType;
        reader.readerProp = readerProp;
        reader.created = new Date().getTime();
        return reader.save()
          .then(function () {
            res.json({
              err: false
            });
            callback();
          })
          .then(null, function (err) {
            var msg = err.message.split(" ");
            if (err.code == 11000) {
              res.json({err: true, msg: "Tekrarlı Veri Hatası"});
            }
            console.error(err.message);
          })
      })
      .then(null, _error(res));
  }
  
  function RestartReader() {
    var _readerSerialNo = {readerSerialNo: readerSerial};
    request.post({
        url: 'http://' + config.cardServiceExpress.url + ':' + config.cardServiceExpress.port + '' + '/reader/restart',
        json: _readerSerialNo
      },
      function (err, httpResponse, body) {
        if (err) {
          console.log(err);
        }else{
          console.log("Reader Restart Done")
        }
      });
  }
  
  Execute();
  
};
exports.editReader    = function (req, res) {
  var readerParamsId = req.params.readerId;
  
  var readerName    = req.body.readerName;
  var readerSerial  = req.body.readerSerial;
  var readerProp    = req.body.readerProp;
  var readerType    = req.body.readerType;
  
  if (!utils.safeInput(readerName)    || readerName.length == 0) {
    res.json({err: true, msg: "badInput"});
    return;
  }
  if (!utils.safeInput(readerSerial)  || readerSerial.length == 0) {
    res.json({err: true, msg: "badInput"});
    return;
  }
  if (!utils.safeInput(readerProp)    || readerProp.length == 0) {
    res.json({err: true, msg: "badInput"});
    return;
  }
  
  function Execute() {
    GetOldReaderInf(function (_oldReader) {
      UpdateReaderGroup(_oldReader, function () {
        UpdateReader(function () {
          RestartReader();
        })
      })
    })
  }
  
  function GetOldReaderInf(callback) {
    Reader.findOne({_id: readerParamsId}).exec()
      .then(function (afterQuery) {
        callback(afterQuery)
      })
      .then(null, function (err) {
        console.error("[ DB ERROR ] " + err);
      });
  }
  
  function UpdateReaderGroup(oldReader, callback) {
    ReaderGroup.find({readersId: readerParamsId}).exec()
      .then(function (afterQuery) {
        if(afterQuery.length!=0){
          UpdateProcess(oldReader, afterQuery, function () {
            callback()
          })
        }else{
          callback()
        }
      })
      .then(null, function (err) {
        console.error("[ DB ERROR ] " + err);
      });
  }
  
  function UpdateProcess(oldReader, rGroups, callback) {
    
    var seqExecUpdate = function (l, cl) {
      var index = rGroups[l].readersSerial.indexOf(oldReader.serialNo);
      var index4List = -1;
      for (var i = 0; i < rGroups[l].readers4list.length; i++) {
        if (rGroups[l].readers4list[i].serial == oldReader.serialNo) {
          index4List = i;
          break;
        }
      }
      if (index !== -1 && index4List !== -1) {
        var newReaderSerial = [];
        var newReaderSerialList = [];
        
        rGroups[l].readersSerial[index] = readerSerial;
        newReaderSerial = rGroups[l].readersSerial;
        
        rGroups[l].readers4list[index4List].name = readerName;
        rGroups[l].readers4list[index4List].serial = readerSerial;
        newReaderSerialList = rGroups[l].readers4list;
        
        ReaderGroup.update({_id: rGroups[l]._id}, {
          $set: {
            readersSerial: newReaderSerial,
            readers4list: newReaderSerialList
          }
        })
          .then(function () {
            l--;
            if (l == -1) {
              cl();
            } else {
              seqExecUpdate(l, cl);
            }
          })
          .then(null, function (err) {
            console.error(err.message);
            l--;
            if (l == -1) {
              cl();
            } else {
              seqExecUpdate(l, cl);
            }
          })
      } else {
        l--;
        if (l == -1) {
          cl();
        } else {
          seqExecUpdate(l, cl)
        }
      }
    };
    
    seqExecUpdate(rGroups.length - 1, function () {
      callback();
    })
  }
  
  function UpdateReader(callback) {
    
    Reader.update({_id: readerParamsId}, {
      $set: {
        serialNo: readerSerial,
        readerName: readerName,
        readerType: readerType,
        readerProp: readerProp,
        updated: new Date().getTime()
      }
    })
      .then(function () {
        res.json({
          err: false,
          status: "OK"
        });
        callback();
      })
      .then(null, function (err) {
        var msg = err.message.split(" ");
        if (err.code == 11000) {
          res.json({err: true, msg: "duplicate"});
        }
        console.error(err.message);
      })
  }
  
  function RestartReader() {
    var readerSerialNo = {serialNo: readerSerial};
    request.post({
        url: 'http://' + config.cardServiceExpress.url + ':' + config.cardServiceExpress.port + '' + '/reader/restart',
        json: readerSerialNo
      },
      function (err, httpResponse, body) {
        if (err) {
          console.log(err);
        }
      });
  }
  
  Execute();
  
};
exports.deleteReader  = function (req, res) {
  var readerId = req.body.id;
  var isUse = false;
  
  function Execute() {
    CheckReader4ReaderGroup(function (readerx) {
      DeleteReader(function () {
        RestartReader(readerx)
      });
    })
  }
  
  function CheckReader4ReaderGroup(callback) {
    Reader.findOne({_id: readerId}).exec()
      .then(function (_reader) {
        if (!_reader.groupId) {
          callback(_reader);
        } else {
          isUse = true;
          callback(_reader);
        }
      })
      .then(null, _error(res));
  }
  
  function DeleteReader(callback) {
    if (isUse) {
      res.json({err: true, OK: 0, msg: "Okuyucu Kullanımda"})
    } else {
      Reader.where().findOneAndRemove({'_id': readerId}, function (err, doc, result) {
        if (err) {
          console.error(err);
          res.json({err: true, OK: 0})
        } else {
          res.json({err: false, OK: 1})
          callback()
        }
      })
      //TODO: Test after delete reader db then check the service app
    }
  }
  
  function RestartReader(__readerx) {
    var _readerSerialNo = {readerSerialNo: __readerx.serialNo};
    request.post({
        url: 'http://' + config.cardServiceExpress.url + ':' + config.cardServiceExpress.port + '' + '/reader/restart',
        json: _readerSerialNo
      },
      function (err, httpResponse, body) {
        if (err) {
          console.log(err);
        }
      });
  }
  
  Execute()
};
// </editor-fold>

// <editor-fold "Get Method">
exports.getCreateReaderPage     = function (req, res) {
  
  res.render("definitions/reader/create", {
    userName: req.user.name,
    userSurName: req.user.surname
  });
  
};
exports.getEditReaderPage       = function (req, res) {
  var readerId = req.params.readerId;
  
  function Execute() {
    GetData(function (result) {
      GetPage(result);
    })
  }
  
  function GetData(callback) {
    Reader.findOne({_id: readerId}).exec()
      .then(function (reader) {
        callback(reader)
      })
      .then(null, _error(res));
    
  }
  
  function GetPage(result) {
    res.render("definitions/reader/edit", {
      userName: req.user.name,
      userSurName: req.user.surname,
      data: result
    });
  }
  
  Execute();
  
};
exports.getListReaderPage       = function (req, res) {
  
  function Execute() {
    GetData(function (result) {
      GetPage(result);
    })
  }
  
  function GetData(callback) {
    
    Reader.find({}).exec()
      .then(function (readers) {
        callback(readers)
      })
      .then(null, _error(res));
    
  }
  
  function GetPage(result) {
    res.render("definitions/reader/list", {
      userName: req.user.name,
      userSurName: req.user.surname,
      data: result
    });
  }
  
  Execute();
};
// </editor-fold>
