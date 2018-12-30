var ReaderGroup = mongoose.model("ReaderGroup");
var Personnel   = mongoose.model("Personnel");
var Reader      = mongoose.model("Reader");
var request = require("request");
var exports = module.exports = {};

// <editor-fold "Post Method">
exports.createReaderGroup   = function (req, res) {
  
  var readerGroupName = req.body.readerGroupName;
  var readerGroupAPB  = req.body.readerGroupAPB;
  var readersId       = req.body.readersId;
  
  if (!utils.safeInput(readerGroupName) || readerGroupName.length == 0 || ((typeof(readerGroupName) === 'undefined') && (readerGroupName === null))) {
    res.json({err: true, msg: "Okuyucu Grup Adı Hatası"});
    return;
  }
  if (readersId.length == 0) {
    res.json({err: true, msg: "Okuyucu seçimi Hatası"});
    return;
  }
  
  function Execute() {
    GetReaders(function (_readersSerial, _readers4List) {
      CreateReaderGroup(_readersSerial, _readers4List,function (_readerGroupId) {
        UpdateReader(_readerGroupId, function () {
          RestartReaderGroup();
        })
      })
    })
  }
  
  function GetReaders(callback) {
    var readerSerial = [];
    var reader4List = [];
    var inlineExec = function (l, cl) {
      Reader.findOne({_id: readersId[l]}).exec()
        .then(function (_reader) {
          var _reader4list = new Object();
          _reader4list.name = _reader.readerName;
          _reader4list.serial = _reader.serialNo;
          readerSerial.push(_reader.serialNo);
          reader4List.push(_reader4list);
          l--;
          if (l == -1) {
            cl();
          } else {
            inlineExec(l, cl);
          }
        })
        .then(null, function (err) {
          console.error(err.message);
          l--;
          if (l == -1) {
            cl();
          } else {
            inlineExec(l, cl);
          }
        })
    };
    
    inlineExec(readersId.length - 1, function () {
      callback(readerSerial, reader4List);
    });
  }
  
  function CreateReaderGroup(serials, readers4ListObj,callback) {
    ReaderGroup.count({}).exec()
      .then(function () {
        var readerGroup = new ReaderGroup();
        
        readerGroup.name = readerGroupName;
        readerGroup.readersId = readersId;
        readerGroup.readersSerial = serials;
        readerGroup.readers4list = readers4ListObj;
        readerGroup.isAntiPassBack = readerGroupAPB;
        readerGroup.created = new Date();
        
        return readerGroup.save()
          
          .then(function (afterSave) {
            res.json({
              err: false
            });
            callback(afterSave._id);
          })
          .then(null, function (err) {
            var msg = err.message.split(" ");
            if (err.code == 11000) {
              res.json({err: true, msg: "duplicate"});
            }
            console.error(err.message);
          })
      })
      .then(null, _error(res));
  }
  
  function UpdateReader(rGroupId, callback) {
    var inlineExec = function (l, cl) {
      Reader.update({_id: readersId[l]}, {
        $set: {
          groupId: rGroupId
        }
      })
        .then(function () {
          l--;
          if (l == -1) {
            cl();
          } else {
            inlineExec(l, cl);
          }
        })
        .then(null, function (err) {
          console.error(err.message);
          l--;
          if (l == -1) {
            cl();
          } else {
            inlineExec(l, cl);
          }
        })
    };
    
    inlineExec(readersId.length - 1, function () {
      callback();
    });
  }
  
  function RestartReaderGroup() {
    var inlineExec = function (l, cl) {
      Reader.findOne({_id: readersId[l]}).exec()
        .then(function (_reader) {
          var readerSerialNo = {readerSerialNo: _reader.serialNo};
          request.post({
              url: 'http://' + config.cardServiceExpress.url + ':' + config.cardServiceExpress.port + '' + '/reader/restart',
              json: readerSerialNo
            },
            function (err, httpResponse, body) {
              if (err) {
                console.error(err);
                l--;
                if (l == -1) {
                  cl();
                } else {
                  inlineExec(l, cl);
                }
              } else {
                console.info("Restart Reader Done " + _reader.serialNo);
                setTimeout(function () {
                  l--;
                  if (l == -1) {
                    cl();
                  } else {
                    inlineExec(l, cl);
                  }
                },3000)
              }
            });
          
        })
        .then(null, function (err) {
          console.error(err.message);
          l--;
          if (l == -1) {
            cl();
          } else {
            inlineExec(l, cl);
          }
        })
    };
    
    inlineExec(readersId.length - 1, function () {
      console.info("Reader Group Create Done")
    });
  }
  
  Execute();
  
};
exports.editReaderGroup     = function (req, res) {
  var rGroupParamsId = req.params.rGroupId;
  
  var readerGroupName = req.body.readerGroupName;
  var readerGroupAPB  = req.body.readerGroupAPB;
  var readersId       = req.body.readersId;
  
  if (!utils.safeInput(readerGroupName) || readerGroupName.length == 0 || ((typeof(readerGroupName) === 'undefined') && (readerGroupName === null))) {
    res.json({err: true, msg: "Okuyucu Grup Adı Hatası"});
    return;
  }
  if (readersId.length == 0) {
    res.json({err: true, msg: "Okuyucu seçimi Hatası"});
    return;
  }
  
  function Execute() {
    GetReaders4DeleteGId(function (_rGroupIds) {
      DeleteReaders4RGId(_rGroupIds, function () {
        GetReaders(function (_readersSerial, _readers4List) {
          UpdateReaderGroup(_readersSerial, _readers4List, function () {
            UpdateReader(function () {
              UpdatePersonnelField(function () {
                RestartReaderGroup();
              })
            })
          })
        })
      })
    })
  }
  
  function GetReaders4DeleteGId(callback) {
    
    Reader.find({groupId: rGroupParamsId.toString()}).exec()
      .then(function (reader) {
        callback(reader)
      })
      .then(null, function (err) {
        console.error(err)
      });
    
  }
  
  function DeleteReaders4RGId(_rGroupIdS,callback) {
    var inlineExec = function (l, cl) {
      Reader.update({groupId: _rGroupIdS[l].groupId.toString()}, {
        $set: {
          groupId: ""
        }
      })
        .then(function () {
          l--;
          if (l == -1) {
            cl();
          } else {
            inlineExec(l, cl);
          }
        })
        .then(null, function (err) {
          console.error(err.message);
          l--;
          if (l == -1) {
            cl();
          } else {
            inlineExec(l, cl);
          }
        })
    };
    
    inlineExec(_rGroupIdS.length - 1, function () {
      callback();
    });
  }
  
  function GetReaders(callback) {
    var readerSerial = [];
    var reader4List = [];
    var inlineExec = function (l, cl) {
      Reader.findOne({_id: readersId[l]}).exec()
        .then(function (_reader) {
          var _reader4list = new Object();
          _reader4list.name = _reader.readerName;
          _reader4list.serial = _reader.serialNo;
          
          readerSerial.push(_reader.serialNo);
          reader4List.push(_reader4list);
          l--;
          if (l == -1) {
            cl();
          } else {
            inlineExec(l, cl);
          }
        })
        .then(null, function (err) {
          console.error(err.message);
          l--;
          if (l == -1) {
            cl();
          } else {
            inlineExec(l, cl);
          }
        })
    };
    
    inlineExec(readersId.length - 1, function () {
      callback(readerSerial, reader4List);
    });
  }
  
  function UpdateReaderGroup(serials, readers4ListObj, callback) {
    
    ReaderGroup.update({_id: rGroupParamsId}, {
      $set: {
        name: readerGroupName,
        readersId: readersId,
        readersSerial: serials,
        readers4list: readers4ListObj,
        isAntiPassBack: readerGroupAPB
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
  
  function UpdateReader(callback) {
    var inlineExec = function (l, cl) {
      Reader.update({_id: readersId[l]}, {
        $set: {
          groupId: rGroupParamsId
        }
      })
        .then(function () {
          l--;
          if (l == -1) {
            cl();
          } else {
            inlineExec(l, cl);
          }
        })
        .then(null, function (err) {
          console.error(err.message);
          l--;
          if (l == -1) {
            cl();
          } else {
            inlineExec(l, cl);
          }
        })
    };
    
    inlineExec(readersId.length - 1, function () {
      callback();
    });
  }
  
  function UpdatePersonnelField(callback) {
    
    Personnel.update({"permissions.pid":rGroupParamsId},{
      $set: { "permissions.$.pname" : readerGroupName }
    },{multi:true})
      .then(function (after) {
        callback()
      })
      .then(null, function (err) {
        console.error(err.message);
      })
    
  }
  
  function RestartReaderGroup() {
    var inlineExec = function (l, cl) {
      Reader.findOne({_id: readersId[l]}).exec()
        .then(function (_reader) {
          var readerSerialNo = {readerSerialNo: _reader.serialNo};
          request.post({
              url: 'http://' + config.cardServiceExpress.url + ':' + config.cardServiceExpress.port + '' + '/reader/restart',
              json: readerSerialNo
            },
            function (err, httpResponse, body) {
              if (err) {
                console.error(err);
                l--;
                if (l == -1) {
                  cl();
                } else {
                  inlineExec(l, cl);
                }
              } else {
                console.info("Restart Reader Done " + _reader.serialNo);
                l--;
                if (l == -1) {
                  cl();
                } else {
                  inlineExec(l, cl);
                }
              }
            });
          
        })
        .then(null, function (err) {
          console.error(err.message);
          l--;
          if (l == -1) {
            cl();
          } else {
            inlineExec(l, cl);
          }
        })
    };
    
    inlineExec(readersId.length - 1, function () {
      console.info("Reader Group Edit Done")
    });
  }
  
  Execute();
  
};
exports.deleteReaderGroup   = function (req, res) {
  var rGroupId = req.body.id;
  
  function Execute() {
    CheckReaderGroup4Personnel(function (_isUse) {
      DeleteRGroup(_isUse,function () {
        GetReaders4DeleteGId(function (_rGroupIds) {
          DeleteReaders4RGId(_rGroupIds);
        })
      })
    })
  }
  
  function CheckReaderGroup4Personnel(callback) {
    Personnel.find({permissionsId: rGroupId}).exec()
      .then(function (_personnel) {
        if (_personnel.length == 0) {
          callback(false);
        } else {
          callback(true);
        }
      })
      .then(null, _error(res));
  }
  
  function DeleteRGroup(isUse,callback) {
    if(isUse){
      res.json({err: true, OK:0,msg: "hasUseNotDelete" })
    }else{
      ReaderGroup.where().findOneAndRemove({'_id': rGroupId}, function (err, doc, result) {
        if (err) {
          console.error(err);
          res.json({err: true, OK: 0})
        } else {
          res.json({err: false, OK: 1})
          callback();
        }
      })
      //TODO: Test after delete group db then check the service app
    }
  }
  
  function GetReaders4DeleteGId(callback) {
    
    Reader.find({groupId: rGroupId}).exec()
      .then(function (reader) {
        callback(reader)
      })
      .then(null, function (err) {
        console.error(err)
      });
    
  }
  
  function DeleteReaders4RGId(_rGroupIdS) {
    var inlineExec = function (l, cl) {
      Reader.update({groupId: _rGroupIdS[l].groupId}, {
        $set: {
          groupId: ""
        }
      })
        .then(function () {
          l--;
          if (l == -1) {
            cl();
          } else {
            inlineExec(l, cl);
          }
        })
        .then(null, function (err) {
          console.error(err.message);
          l--;
          if (l == -1) {
            cl();
          } else {
            inlineExec(l, cl);
          }
        })
    };
    
    inlineExec(_rGroupIdS.length - 1, function () {
      console.info("Reader Group Delete Done")
    });
  }
  
  Execute();
};
// </editor-fold>

// <editor-fold "Get Method">
exports.getCreateReaderGroupPage    = function (req, res) {
  
  function Execute() {
    GetData(function (result) {
      GetPage(result);
    })
  }
  
  function GetData(callback) {
    Reader.find({readerType: {$ne: -1},groupId:""}).exec()
      .then(function (reader) {
        callback(reader)
      })
      .then(null, _error(res));
    
  }
  
  function GetPage(result) {
    res.render("definitions/readerGroup/create", {
      userName: req.user.name,
      userSurName: req.user.surname,
      reader: result
    });
  }
  
  Execute();
};
exports.getEditReaderGroupPage      = function (req, res) {
  var rgroupId = req.params.rGroupId;
  
  function Execute() {
    GetData(function (result) {
      GetPage(result);
    })
  }
  
  function GetData(callback) {
    Reader.find({readerType: {$ne: -1},$or: [ { groupId: "" },{groupId: rgroupId} ] }).exec()
      .then(function (reader) {
        callback(reader)
      })
      .then(null, _error(res));
    
  }
  
  function GetPage(result) {
    ReaderGroup.findOne({_id:rgroupId}).exec()
      .then(function (_rGroup) {
        res.render("definitions/readerGroup/edit", {
          userName: req.user.name,
          userSurName: req.user.surname,
          dataReader: result,
          dataRGroup: _rGroup
        });
      })
      .then(null, _error(res));
    
  }
  
  Execute();
  
};
exports.getListReaderGroupPage      = function (req, res) {
  
  function Execute() {
    GetData(function (result) {
      GetPage(result);
    })
  }
  
  function GetData(callback) {
    ReaderGroup.find().exec()
      .then(function (rGroup) {
        callback(rGroup)
      })
      .then(null, _error(res));
    
  }
  
  function GetPage(result) {
    res.render("definitions/readerGroup/list", {
      userName: req.user.name,
      userSurName: req.user.surname,
      data: result
    });
  }
  
  Execute();
};
// </editor-fold>