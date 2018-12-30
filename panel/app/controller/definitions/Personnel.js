// <editor-fold "Definitions">
var Card = mongoose.model("Card");
var ReaderGroup = mongoose.model("ReaderGroup");
var Personnel = mongoose.model("Personnel");
var xlsx = require('node-xlsx');
var path = require('path');
var fs = require('fs');
var streamifier = require('streamifier');
var mime = require('mime');
var request = require('request');
var exports = module.exports = {};
var EXTENSIONS = ["png", "jpeg", "jpg", "xlsx"];
var UPLOAD_SIZE_MAX = "1024x1024x100";
// </editor-fold>

// <editor-fold "Post Method">
exports.createPersonnel = function (req, res) {
  
  // <editor-fold "Req Body Value">
  var photoName = req.body.image;
  var name = req.body.name;
  var surname = req.body.surname;
  var cardMId = req.body.cardCode;
  var tcNo = req.body.TCNo;
  var registerNo = req.body.registerNo;
  var accessGroup = req.body.accessGroup;
  // </editor-fold>
  
  // <editor-fold "Value Controller">
  if (!utils.safeInput(name) || name.length == 0) {
    res.json({err: true, msg: "Hatalı İşlem İsim"});
    return;
  }
  if (!utils.safeInput(surname) || surname.length == 0) {
    res.json({err: true, msg: "Hatalı İşlem Soyisim"});
    return;
  }
  if (!utils.safeInput(cardMId) || cardMId.length == 0) {
    res.json({err: true, msg: "Hatalı İşlem Kart"});
    return;
  }
  // </editor-fold>
  
  function Execute() {
    AcgName(function (acsName) {
      CheckField4PassportNo(function () {
        CheckField4RegisterNo(function () {
          CreatePersonnel(acsName, function (_personnelId) {
            UpdateCardModel(_personnelId, function () {
              GetAccessReaders(function (_permissionReadersUser) {
                GetCardId(function (_cardId) {
                  WritePersonnelToReader(_permissionReadersUser, _cardId);
                })
              })
            })
          })
        })
      })
    })
  }
  
  function AcgName(callback) {
    
    var acsNameArray = [];
    
    function seq(l, cl) {
      
      utils.getAccessGroupName(accessGroup[l], function (name) {
        var pObj = new Object();
        pObj.pid = accessGroup[l];
        pObj.pname = name;
        acsNameArray.push(pObj)
        l--;
        l == -1 ? cl() : seq(l, cl)
      })
      
    }
    
    seq(accessGroup.length - 1, function () {
      callback(acsNameArray)
    })
    
  }
  
  function CheckField4PassportNo(callback) {
    Personnel.find({isDelete: false, passportNumber: tcNo, $and: [{registerNumber: {$ne: ""}}]}).exec()
      .then(function (afterQuery) {
        if (afterQuery.length == 0) {
          callback();
        } else {
          res.json({err: true, msg: "Kayıtlı TC NO"});
        }
      })
      .then(null, function (err) {
        console.error("[ DB ERROR ] " + err);
      });
  }
  
  function CheckField4RegisterNo(callback) {
    Personnel.find({isDelete: false, registerNumber: registerNo, $and: [{registerNumber: {$ne: ""}}]}).exec()
      .then(function (afterQuery) {
        if (afterQuery.length == 0) {
          callback();
        } else {
          res.json({err: true, msg: "Kayıtlı Sicil No"});
        }
      })
      .then(null, function (err) {
        console.error("[ DB ERROR ] " + err);
      });
  }
  
  function CreatePersonnel(_acsNameArray, callback) {
    
    utils.getCardCode(cardMId, function (cCode) {
      
      Personnel.count({}).exec()
        .then(function () {
          var personnel = new Personnel();
          personnel.cardModelId = cardMId;
          personnel._cardCode = cCode;
          personnel.name = name;
          personnel.surname = surname;
          personnel.image = "/img/pers/" + photoName;
          personnel.passportNumber = tcNo;
          personnel.registerNumber = registerNo;
          personnel.permissions = _acsNameArray;
          personnel.created = new Date().getTime();
          return personnel.save()
            .then(function (afterSave) {
              res.json({
                err: false
              });
              callback(afterSave._id);
            })
            .then(null, _error(res));
        })
        .then(null, _error(res));
      
    })
    
    
  }
  
  function UpdateCardModel(personnelId, callback) {
    Card.update({_id: cardMId}, {
      $set: {
        personnelId: personnelId
      }
    })
      .then(function () {
        console.info('Card Model Update for Personnel Create');
        callback();
      })
      .then(null, function (err) {
        console.error(err.message);
      })
  }
  
  function GetAccessReaders(callback) {
    var permissionReader = [];
    
    function sequintalReaders(_readers, clb) {
      function inlineExec(n, nx) {
        permissionReader.push(_readers[n]);
        n--;
        if (n == -1) {
          nx();
        } else {
          inlineExec(n, nx);
        }
      }
      
      inlineExec(_readers.length - 1, function () {
        clb();
      })
    }
    
    function sequintal(l, cl) {
      ReaderGroup.findOne({_id: accessGroup[l].toString()}).exec()
        .then(function (afterQuery) {
          sequintalReaders(afterQuery.readersSerial, function () {
            l--;
            if (l == -1) {
              cl();
            } else {
              sequintal(l, cl);
            }
          })
        })
        .then(null, function (err) {
          console.error(err.message);
          l--;
          if (l == -1) {
            cl();
          } else {
            sequintal(l, cl);
          }
        })
    }
    
    sequintal(accessGroup.length - 1, function () {
      callback(permissionReader);
    });
  }
  
  function GetCardId(callback) {
    Card.findOne({_id: cardMId}).exec()
      .then(function (afterQuery) {
        callback(afterQuery.cardId)
      })
      .then(null, function (err) {
        console.error(err.message);
      })
  }
  
  function WritePersonnelToReader(permissionReadersUser, cardId) {
    
    var cardWriteData = {
      "cardId": cardId,
      "rGroupId": accessGroup,
      "sNoSeries": permissionReadersUser
    };
    
    request.post({
        url: 'http://' + config.cardServiceExpress.url + ':' + config.cardServiceExpress.port + '' + '/card/write',
        json: cardWriteData
      },
      function (err, httpResponse, body) {
        if (err) {
          console.error(err);
        } else if (body.err) {
          console.error(body.msg);
        } else {
          console.info("Personnel Write Reader Success")
        }
      });
  }
  
  
  Execute();
  
};
exports.editPersonnel = function (req, res) {
  
  var personnelParamsId = req.params.personnelId;
  var persOldCardID = "";
  var persOldReaders = [];
  var persOldRGroups = [];
  
  // <editor-fold "Req Body Value">
  var photoName = req.body.image;
  var name = req.body.name;
  var surname = req.body.surname;
  var cardMId = req.body.cardCode;
  var tcNo = req.body.TCNo;
  var registerNo = req.body.registerNo;
  var accessGroup = req.body.accessGroup;
  // </editor-fold>
  
  // <editor-fold "Value Controller">
  if (!utils.safeInput(name) || name.length == 0) {
    res.json({err: true, msg: "Hatalı İşlem İsim"});
    return;
  }
  if (!utils.safeInput(surname) || surname.length == 0) {
    res.json({err: true, msg: "Hatalı İşlem Soyisim"});
    return;
  }
  if (!utils.safeInput(cardMId) || cardMId.length == 0) {
    res.json({err: true, msg: "Hatalı İşlem Kart"});
    return;
  }
  // </editor-fold>
  
  function Execute() {
    AcgName(function (acsName) {
      CheckField4CardCode(function () {
        CheckField4PassportNo(function () {
          CheckField4RegisterNo(function () {
            GetOldPersonnelData(function (_oldPersonnelData) {
              GetOldCardId(_oldPersonnelData, function (_oldCardData) {
                DeleteOldCardId4Model(_oldPersonnelData, function () {
                  GetOldReaderGroup(_oldPersonnelData, function () {
                    UpdatePersonnel(acsName, function () {
                      UpdateCardModel(function () {
                        DeleteCardReaders(_oldPersonnelData, function () {
                          GetAccessReaders(function (_permissionReadersUser) {
                            GetCardId(function (_cardId) {
                              WritePersonnelToReader(_permissionReadersUser, _cardId, function () {});
                            })
                          })
                        })
                      })
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  }
  
  function AcgName(callback) {
    
    var acsNameArray = [];
    
    function seq(l, cl) {
      
      utils.getAccessGroupName(accessGroup[l].toString(), function (name) {
        
        var pObj = new Object();
        pObj.pid = accessGroup[l];
        pObj.pname = name;
        acsNameArray.push(pObj)
        l--;
        l == -1 ? cl() : seq(l, cl)
      })
      
    }
    
    seq(accessGroup.length - 1, function () {
      callback(acsNameArray)
    })
    
  }
  
  function CheckField4CardCode(callback) {
    Personnel.find({isDelete: false, cardModelId: cardMId, _id: {$ne: personnelParamsId}}).exec()
      .then(function (afterQuery) {
        if (afterQuery.length == 0) {
          callback();
        } else {
          res.json({err: true, msg: "Tekrarlı veri hatası Kart"});
        }
      })
      .then(null, function (err) {
        console.error("[ DB ERROR ] " + err);
      });
  }
  
  function CheckField4PassportNo(callback) {
    Personnel.find({
      isDelete: false,
      passportNumber: tcNo,
      $and: [{passportNumber: {$ne: ""}, _id: {$ne: personnelParamsId}}]
    }).exec()
      .then(function (afterQuery) {
        if (afterQuery.length == 0) {
          callback();
        } else {
          res.json({err: true, msg: "Tekrarlı veri hatası TC"});
        }
      })
      .then(null, function (err) {
        console.error("[ DB ERROR ] " + err);
      });
  }
  
  function CheckField4RegisterNo(callback) {
    Personnel.find({
      isDelete: false,
      registerNumber: registerNo,
      $and: [{registerNumber: {$ne: ""}, _id: {$ne: personnelParamsId}}]
    }).exec()
      .then(function (afterQuery) {
        if (afterQuery.length == 0) {
          callback();
        } else {
          res.json({err: true, msg: "Tekrarlı veri hatası Sicil"});
        }
      })
      .then(null, function (err) {
        console.error("[ DB ERROR ] " + err);
      });
  }
  
  function GetOldPersonnelData(callback) {
    
    Personnel.findOne({_id: personnelParamsId}).exec()
      .then(function (afterQuery) {
        callback(afterQuery)
      })
      .then(null, _error(res));
    
  }
  
  function GetOldCardId(oldPersonnelData, callback) {
    Card.findOne({_id: oldPersonnelData.cardModelId}).exec()
      .then(function (afterQuery) {
        persOldCardID = afterQuery.cardId;
        callback(afterQuery)
      })
      .then(null, _error(res));
  }
  
  function DeleteOldCardId4Model(oldPersonnelData, callback) {
    Card.update({_id: oldPersonnelData.cardModelId}, {
      $set: {
        personnelId: ""
      }
    })
      .then(function () {
        callback();
      })
      .then(null, _error(res));
  }
  
  function GetOldReaderGroup(oldPersonnelData, callback) {
    var permissionReader = [];
    
    function sequintalReaders(_readers, clb) {
      function inlineExec(n, nx) {
        permissionReader.push(_readers[n]);
        persOldReaders.push(_readers[n]);
        n--;
        if (n == -1) {
          nx();
        } else {
          inlineExec(n, nx);
        }
      }
      
      inlineExec(_readers.length - 1, function () {
        clb();
      })
    }
    
    function sequintal(l, cl) {
      persOldRGroups.push(oldPersonnelData.permissions[l].pid)
      ReaderGroup.findOne({_id: oldPersonnelData.permissions[l].pid}).exec()
        .then(function (afterQuery) {
          sequintalReaders(afterQuery.readersSerial, function () {
            l--;
            if (l == -1) {
              cl();
            } else {
              sequintal(l, cl);
            }
          })
        })
        .then(null, function (err) {
          console.error(err.message);
          l--;
          if (l == -1) {
            cl();
          } else {
            sequintal(l, cl);
          }
        })
    }
    
    sequintal(oldPersonnelData.permissions.length - 1, function () {
      callback(permissionReader);
    });
  }
  
  function UpdatePersonnel(_acsNameArray, callback) {
    
        utils.getCardCode(cardMId, function (cCode) {
            
            Personnel.update({_id: personnelParamsId}, {
              $set: {
                cardModelId: cardMId,
                _cardCode: cCode,
                name: name,
                surname: surname,
                image: "/img/pers/" + photoName,
                passportNumber: tcNo,
                registerNumber: registerNo,
                permissions: _acsNameArray
              }
            })
              .then(function () {
                res.json({
                  err: false,
                  status: "OK"
                })
                callback();
              })
              .then(null, function (err) {
                var msg = err.message.split(" ");
                if (err.code == 11000) {
                  res.json({err: true, msg: "Tekrarlı veri hatası!"});
                }
                console.error(err.message);
              })
            
        })
    
  }
  
  function UpdateCardModel(callback) {
    Card.update({_id: cardMId}, {
      $set: {
        personnelId: personnelParamsId
      }
    })
      .then(function () {
        console.info('Card Model Update for Personnel Update');
        callback();
      })
      .then(null, function (err) {
        console.error(err.message);
      })
  }
  
  function DeleteCardReaders(oldPersonnelData, callback) {
    
    var cardDeleteData = {
      "cardId": persOldCardID,
      "rGroupId": persOldRGroups,
      "sNoSeries": persOldReaders
    };
    
    request.post({
        url: 'http://' + config.cardServiceExpress.url + ':' + config.cardServiceExpress.port + '' + '/card/delete',
        json: cardDeleteData
      },
      function (err, httpResponse, body) {
        if (err) {
            console.error(err);
            callback();
          
        } else if (body.err) {
          console.error(body.msg);
          callback();
        } else {
          console.info("Personnel Delete Reader Success");
          callback();
        }
      });
  }
  
  function GetAccessReaders(callback) {
    var newPermissionReader = [];
    
    function sequintalReaders(_readers, clb) {
      function inlineExec(n, nx) {
        newPermissionReader.push(_readers[n]);
        n--;
        if (n == -1) {
          nx();
        } else {
          inlineExec(n, nx);
        }
      }
      
      inlineExec(_readers.length - 1, function () {
        clb();
      })
    }
    
    function sequintal(l, cl) {
      ReaderGroup.findOne({_id: accessGroup[l]}).exec()
        .then(function (afterQuery) {
          sequintalReaders(afterQuery.readersSerial, function () {
            l--;
            if (l == -1) {
              cl();
            } else {
              sequintal(l, cl);
            }
          })
        })
        .then(null, function (err) {
          console.error(err.message);
          l--;
          if (l == -1) {
            cl();
          } else {
            sequintal(l, cl);
          }
        })
    }
    
    sequintal(accessGroup.length - 1, function () {
      callback(newPermissionReader);
    });
  }
  
  function GetCardId(callback) {
    Card.findOne({_id: cardMId}).exec()
      .then(function (afterQuery) {
        callback(afterQuery.cardId)
      })
      .then(null, function (err) {
        console.error(err.message);
      })
  }
  
  function WritePersonnelToReader(permissionReadersUser, cardId, callback) {
    
    var cardWriteData = {
      "cardId": cardId,
      "rGroupId": accessGroup,
      "sNoSeries": permissionReadersUser
    };
    
    request.post({
        url: 'http://' + config.cardServiceExpress.url + ':' + config.cardServiceExpress.port + '' + '/card/write',
        json: cardWriteData
      },
      function (err, httpResponse, body) {
        if (err) {
            console.error(err);
            callback();
        } else if (body.err) {
          console.error(body.msg);
          callback();
        } else {
          console.info("Personnel Write Reader Success");
          callback();
        }
      });
  }
  
  Execute();
};
exports.deletePersonnel = function (req, res) {
  
  var pId = req.body.id;
  var persOldCardID = "";
  var persOldReaders = [];
  var persOldRGroups = [];
  
  function Execute() {
    GetPersonnelData(function (_pData) {
      GetCardId(_pData, function () {
        GetReaderGroup(_pData, function () {
          DeletePersonnel(function () {
            UpdateCardModel(_pData)
          });
        })
      })
    })
  }
  
  function GetPersonnelData(callback) {
    
    Personnel.findOne({_id: pId}).exec()
      .then(function (afterQuery) {
        callback(afterQuery)
      })
      .then(null, _error(res));
  }
  
  function GetCardId(oldPersonnelData, callback) {
    Card.findOne({_id: oldPersonnelData.cardModelId}).exec()
      .then(function (afterQuery) {
        persOldCardID = afterQuery.cardId;
        callback(afterQuery)
      })
      .then(null, _error(res));
  }
  
  function GetReaderGroup(oldPersonnelData, callback) {
    var permissionReader = [];
    
    function sequintalReaders(_readers, clb) {
      function inlineExec(n, nx) {
        permissionReader.push(_readers[n]);
        persOldReaders.push(_readers[n]);
        n--;
        if (n == -1) {
          nx();
        } else {
          inlineExec(n, nx);
        }
      }
      
      inlineExec(_readers.length - 1, function () {
        clb();
      })
    }
    
    function sequintal(l, cl) {
      persOldRGroups.push(oldPersonnelData.permissions[l].pid)
      ReaderGroup.findOne({_id: oldPersonnelData.permissions[l].pid}).exec()
        .then(function (afterQuery) {
          sequintalReaders(afterQuery.readersSerial, function () {
            l--;
            if (l == -1) {
              cl();
            } else {
              sequintal(l, cl);
            }
          })
        })
        .then(null, function (err) {
          console.error(err.message);
          l--;
          if (l == -1) {
            cl();
          } else {
            sequintal(l, cl);
          }
        })
    }
    
    sequintal(oldPersonnelData.permissions.length - 1, function () {
      callback(permissionReader);
    });
  }
  
  function DeletePersonnel(callback) {
    
    Personnel.where().findOneAndRemove({_id: pId}, function (err, doc, result) {
      if (err) {
        console.error(err);
        res.json({err: true, OK: 0})
      } else {
        callback();
      }
    })
    
  }
  
  function UpdateCardModel(oldPersonnelData) {
    Card.update({_id: oldPersonnelData.cardModelId}, {$set: {personnelId: ""}})
      .then(function () {
        res.json({err: false, OK: 1})
      })
      .then(null, _error(res));
  }
  
  Execute();
};
exports.uploadImage = function (req, res) {
  var name = req.headers['x-file-name'];
  if (!name) {
    res.send(JSON.stringify({err: true, msg: "No name specified."}));
    return;
  }
  
  var extension = path.extname(name);
  name = name.replace(new RegExp("(" + extension + ")$", "ig"), extension.toLowerCase());
  extension = extension.toLowerCase();
  if (EXTENSIONS.indexOf(extension.substr(1)) == -1) {
    res.send(JSON.stringify({err: true, msg: "Unknown file type."}));
    return;
  }
  
  var fileName = utils.safeFileName(path.basename(name, extension) + extension);
  if (fileName == extension) {
    res.send(JSON.stringify({err: true, msg: "Invalid name."}));
    return;
  }
  
  var size = parseInt(req.headers['x-file-size'], 10);
  if (!size || size < 0) {
    res.send(JSON.stringify({err: true, msg: "No size specified."}));
    return;
  }
  
  if (size > UPLOAD_SIZE_MAX) {
    res.send(JSON.stringify({err: true, msg: "File is too big."}));
    return;
  }
  
  var dirPath = __dirname + "/../../../public/img/pers";
  try {
    fs.mkdirSync(dirPath, 755);
  } catch (e) {
  }
  
  var filePath = dirPath + '/' + fileName;
  var bytesUploaded = 0;
  var file = fs.createWriteStream(filePath, {
    flags: 'w',
    encoding: 'binary',
    mode: 644
  });
  
  req.on("data", function (chunk) {
    if (bytesUploaded + chunk.length > UPLOAD_SIZE_MAX) {
      file.end();
      res.send(JSON.stringify({err: true, msg: "File is too big."}));
      fs.unlinkSync(filePath);
      return;
    }
    file.write(chunk);
    bytesUploaded += chunk.length;
  });
  
  req.on("end", function () {
    file.end();
    var data = {
      fileName: fileName + new Date().getTime(),
      location: filePath
    };
    res.json({
      err: false,
      id: fileName,
      url: filePath
    })
  });
};
// </editor-fold>

// <editor-fold "Get Method">
exports.getCreatePersonnelPage = function (req, res) {
  
  function Execute() {
    GetCards(function (cards) {
      GetReaderGroups(function (rGroups) {
        GetPage(cards, rGroups);
      })
    })
  }
  
  function GetCards(callback) {
    Card.find({personnelId: ""}, {cardId: 0}).exec()
      .then(function (card) {
        callback(card)
      })
      .then(null, _error(res));
  }
  
  function GetReaderGroups(callback) {
    ReaderGroup.find({}).exec()
      .then(function (rgroup) {
        callback(rgroup)
      })
      .then(null, _error(res));
  }
  
  function GetPage(_cards, _rGroups) {
    res.render("definitions/personnel/create", {
      userName: req.user.name,
      userSurName: req.user.surname,
      cards: _cards,
      rGroups: _rGroups
    });
  }
  
  Execute();
  
};
exports.getEditPersonnelPage = function (req, res) {
  
  var pId = req.params.personnelId;
  
  function Execute() {
    GetCards(function (cards) {
      GetReaderGroups(function (rGroups) {
        GetPersonnel(function (personnel) {
          GetPersonnelCard(personnel.cardModelId, function (pCard) {
            GetPage(cards, rGroups, personnel, pCard);
          })
        })
      })
    })
  }
  
  function GetCards(callback) {
    Card.find({personnelId: ""}).exec()
      .then(function (card) {
        callback(card)
      })
      .then(null, _error(res));
  }
  
  function GetReaderGroups(callback) {
    ReaderGroup.find({}).exec()
      .then(function (rgroup) {
        callback(rgroup)
      })
      .then(null, _error(res));
  }
  
  function GetPersonnel(callback) {
    Personnel.findOne({_id: pId}).exec()
      .then(function (personnel) {
        callback(personnel)
      })
      .then(null, _error(res));
    
  }
  
  function GetPersonnelCard(ID, callback) {
    Card.findOne({_id: ID}).exec()
      .then(function (pcard) {
        callback(pcard)
      })
      .then(null, _error(res));
  }
  
  function GetPage(_cards, _rGroups, _personnel, _pCard) {
    res.render("definitions/personnel/edit", {
      userName: req.user.name,
      userSurName: req.user.surname,
      pCard: _pCard,
      cards: _cards,
      rGroups: _rGroups,
      personnel: _personnel
    });
  }
  
  Execute();
};
exports.getListPersonnelPage = function (req, res) {
  
  Personnel.find({}).exec()
    .then(function (after) {
      res.render("definitions/personnel/list", {
        userName: req.user.name,
        userSurName: req.user.surname,
        data: after
      });
    })
    .then(null, _error(res));
  
  
};
// </editor-fold>