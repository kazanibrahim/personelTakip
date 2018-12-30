var Card        = mongoose.model("Card");
var Personnel   = mongoose.model("Personnel");
var Reader      = mongoose.model("Reader");

var streamifier = require('streamifier');
var mime        = require('mime');
var xlsx        = require('node-xlsx');
var path        = require('path');
var fs          = require('fs');
var request     = require('request');
var EXTENSIONS  = ["xlsx","xls"];
var exports     = module.exports = {};

// <editor-fold "Post Method">
exports.createCard          = function (req, res) {
  var cardId = req.body.cardID;
  var cardCode = req.body.cardCode;

  if(!utils.safeInput(cardId) || cardId.length == 0){
    res.json({err: true,msg: "Geçersiz Karakter"});
    return;
  }
  if(!utils.safeInput(cardCode) || cardCode.length == 0){
    res.json({err: true,msg: "Geçersiz Karakter"});
    return;
  }

  function Execute() {
    CheckField(function () {
      CreateCard();
    })
  }

  function CheckField(callback) {
    Card.find({cardCode:cardCode,cardId:cardId }).exec()
      .then(function (afterQuery) {
        if(afterQuery.length == 0){callback();}else{res.json({err: true, msg: "Kayıtlı Kart"});}
      })
      .then(null, function(err){
        console.error("[ DB ERROR ] " + err);
      });
  }

  function CreateCard() {
    Card.count({}).exec()
      .then(function () {
        var card = new Card();
        card.cardId = cardId.toUpperCase();
        card.cardCode = cardCode;
        return card.save()
          .then(function(){
            res.json({
              err: false
            });
          })
          .then(null, function (err) {
            var msg = err.message.split(" ");
            if (err.code == 11000) {
              res.json({err: true, msg: "Kayıtlı Kart"});
            }
            console.error(err.message);
          })
      })
      .then(null, _error(res));
  }

  Execute();
};
exports.editCard            = function (req, res) {
  
  var cardParamsId  = req.params.cardId;
  var cardId        = req.body.cardID;
  var cardCode      = req.body.cardCode;

  if(!utils.safeInput(cardParamsId) || cardParamsId.length == 0){
    res.json({err: true,msg: "badInput"});
    return;
  }
  if(!utils.safeInput(cardId) || cardId.length == 0){
    res.json({err: true,msg: "badInput"});
    return;
  }
  if(!utils.safeInput(cardCode) || cardCode.length == 0){
    res.json({err: true, msg: "badInput"});
    return;
  }
  
  function Execute() {
    CheckFieldCardId(function () {
      CheckField(function () {
        UpdateCard(function () {
          UpdatePersonnelField()
        });
      })
    })
  }
  
  function CheckFieldCardId(callback) {
    Card.find({cardId:{$regex: new RegExp("^" + cardId.toLowerCase(), "i")}, _id: {$ne: cardParamsId}}).exec()
      .then(function (afterQuery) {
        if(afterQuery.length == 0){callback();}else{res.json({err: true, msg: "duplicate"});}
      })
      .then(null, function(err){
        console.error("[ DB ERROR ] " + err);
      });
  }
  
  function CheckField(callback) {
    Card.find({cardCode: cardCode, _id: {$ne: cardParamsId}}).exec()
      .then(function (afterQuery) {
        if(afterQuery.length == 0){callback();}else{res.json({err: true, msg: "duplicate"});}
      })
      .then(null, function(err){
        console.error("[ DB ERROR ] " + err);
      });
  }
  
  function UpdateCard(callback) {
    Card.update({_id: cardParamsId},{
      $set: {
        cardId: cardId,
        cardCode: cardCode
      }
    })
      .then(function () {
        res.json({
          err: false,
          status: "OK"
        })
        callback()
      })
      .then(null, function(err){
        console.error("[ DB ERROR ] " + err);
      });
  }
  
  function UpdatePersonnelField() {
    
    Personnel.update({"cardModelId":cardParamsId},{
      $set: { "_cardCode" : cardCode }
    },{multi:true})
      .then(function (after) {console.log("Done Card Update")})
      .then(null, function (err) {
        console.error(err.message);
      })
    
  }
  
  
  Execute();
};
exports.deleteCard          = function (req, res) {
  
  var cardId = req.body.id;
  
  function Execute() {
    CheckCard4Personnel(function (_isUse) {
      DeleteCard(_isUse);
    })
  }
  
  function CheckCard4Personnel(callback) {
    Personnel.findOne({cardModelId: cardId}).exec()
      .then(function (_personnel) {
        if (!_personnel || !_personnel.cardModelId || typeof (_personnel.cardModelId) === "undefined" || _personnel.cardModelId === "") {
          callback(false);
        } else {
          callback(true);
        }
      })
      .then(null, _error(res));
  }
  
  function DeleteCard(isUse) {
    if(isUse){
      res.json({err: true, OK:0,msg: "Kart Kullanımda" })
    }else{
      
      
      /*
      Card.findOneAndUpdate({_id: cardId}, {$set:{isDelete:true}}, {new: true}, function(err, doc){
        if(err){
          console.error(err);
          res.json({err: true, OK: 0})
        }else{
          res.json({err: false, OK: 1})
        }
      });
      */
      
       Card.where().findOneAndRemove({'_id': cardId},function(err,doc,result){
         if(err){console.error(err);res.json({err: true, OK: 0})}else{res.json({err: false, OK: 1})}
       })
       
    }
  }
  
  Execute()
  
};
exports.importCard          = function (req, res) {
  var errorData = [];
  var cardsData = [];
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

  var dirPath = __dirname + "/../../../public/excel/load";
  try {
    fs.mkdirSync(dirPath, 755);
  } catch (e) {}

  var filePath = dirPath + '/' + fileName;
  var bytesUploaded = 0;
  var file = fs.createWriteStream(filePath, {
    flags: 'w',
    encoding: 'binary',
    mode: 644
  });

  req.on("data", function (chunk) {
    file.write(chunk);
  });

  req.on("end", function () {
    file.end();
    setTimeout(function(){
      const workSheetsFromBuffer = xlsx.parse('${__dirname}/../public/excel/load/'+fileName);

      for (var index in workSheetsFromBuffer) {
        for (var index2 in workSheetsFromBuffer[index].data) {
          if (workSheetsFromBuffer[index].data[index2].length != 0) {
            cardsData.push(workSheetsFromBuffer[index].data[index2]);
          }
        }
      }

      function WriteExcelToCard(clb) {

        var writeInlineExec = function (n, nx) {
          if(cardsData[n][1].length == 8){
            if(cardsData[n][2].length != 0){
              Card.findOne({cardId:cardsData[n][1].toUpperCase()}).exec()
                .then(function (cardFind) {
                  if(!cardFind){
                    var card        = new Card();
                    card.cardId     = cardsData[n][1].toUpperCase();
                    card.cardCode   = cardsData[n][2];
                    cardsData[n][3] === "EVET" ? card.isVisitor  =  true : card.isVisitor  = false;
                     card.save()
                      .then(function () {
                        n--;
                        if (n == 0) {nx();} else {writeInlineExec(n, nx);}
                      })
                      .then(null, function (err) {
                        var errorMessage;
                        var msg = err.message.split(" ");
                        errorMessage = "Satır:" + " " + cardsData[n][0] + ", " + "Sütun:" + " " + msg[7] + ", " + msg[12] + " " + "Tekrarlı Veri Hatası";
                        console.error(err.message);
                        errorData.push(errorMessage);
                        n--;
                        if (n == 0) {nx();} else {writeInlineExec(n, nx);}
                      })
                  }else{
                    var errorMessage = "Satır:" + " " + cardsData[n][0] + ", " + "Sütun: Kart Id, " + "Tekrarlı Kart Id";
                    errorData.push(errorMessage);
                    console.error(errorMessage);
                    n--;
                    if (n == 0) {
                      nx();
                    } else {
                      writeInlineExec(n, nx);
                    }
                  }
                })
                .then(null, function (err) {
                  var errorMessage;
                  var msg = err.message.split(" ");
                  errorMessage = "Satır:" + " " + cardsData[n][0] + ", " + "Sütun:" + " " + msg[7] + ", " + msg[12] + " " + "Tekrarlı Veri Hatası";
                  console.error(err.message);
                  errorData.push(errorMessage);
                  n--;
                  if (n == 0) {nx();} else {writeInlineExec(n, nx);}
                })
            }else{
              var errorMessage = "Satır:" + " " + cardsData[l][0] + ", " + "Sütun: Kart No, " + "Geçersiz Kart No";
              errorData.push(errorMessage);
              console.error(errorMessage);
              n--;
              if (n == 0) {
                nx();
              } else {
                writeInlineExec(n, nx);
              }
            }
          }else{
            var errorMessage = "Satır:" + " " + cardsData[n][0] + ", " + "Sütun: Kart Id, " + "Geçersiz Kart Id";
            errorData.push(errorMessage);
            console.error(errorMessage);
            n--;
            if (n == 0) {
              nx();
            } else {
              writeInlineExec(n, nx);
            }
          }
        };

        writeInlineExec(cardsData.length - 1, function () {
          console.info('Import Card Write Done');
          clb();
        });

      }

      var inlineExec = function (l, cl) {
        if(cardsData[l][1].length == 8){
          if(cardsData[l][2].length != 0) {
            if(cardsData[l][3] === "HAYIR" || cardsData[l][3] === "EVET"){
              l--;
              if (l == 0) {
                cl();
              } else {
                inlineExec(l, cl);
              }
            }else{
              var errorMessage = "Satır:" + " " + cardsData[l][0] + ", " + "Sütun: Ziyaretçi Mi?, " + "Geçersiz Kart Tipi";
              errorData.push(errorMessage);
              console.error(errorMessage);
              l--;
              if (l == 0) {
                cl();
              } else {
                inlineExec(l, cl);
              }
            }
          }else{
            var errorMessage = "Satır:" + " " + cardsData[l][0] + ", " + "Sütun: Kart No, " + "Geçersiz Kart No";
            errorData.push(errorMessage);
            console.error(errorMessage);
            l--;
            if (l == 0) {
              cl();
            } else {
              inlineExec(l, cl);
            }
          }
        }else{
          var errorMessage = "Satır:" + " " + cardsData[l][0] + ", " + "Sütun: Kart Id, " + "Geçersiz Kart Id";
          errorData.push(errorMessage);
          console.error(errorMessage);
          l--;
          if (l == 0) {
            cl();
          } else {
            inlineExec(l, cl);
          }
        }
      };

      inlineExec(cardsData.length - 1, function () {
        if (errorData.length == 0) {
          WriteExcelToCard(function () {
            console.info(cardsData.length - 1 + " " + "Totaly Card");
            res.json({errorData: errorData});
          })
        } else {
          console.error('Card import Failed');
          res.json({errorData: errorData})
        }
      });

    }, 1000);

    console.info('Multiple Card Request Has Been End')
  });
};
// </editor-fold>

// <editor-fold "Get Method">
exports.getCreateCardPage   = function (req, res) {
  
  Reader.find({readerType:-1}).exec()
    .then(function (reader) {
      res.render("definitions/card/create", {
        userName: req.user.name,
        userSurName: req.user.surname,
        reader:reader
      });
    })
    .then(null, _error(res));
};
exports.getEditCardPage     = function (req, res) {
  var cardId = req.params.cardId;
  
  function seqExec() {
    GetDefinitionReader(function (result) {
      GetPage(result)
    })
  }
  
  function GetDefinitionReader(callback) {
    Reader.find({readerType:-1}).exec()
      .then(function (reader) {
        callback(reader)
      })
      .then(null, _error(res));
  }
  
  function GetPage(_reader) {
    Card.findOne({_id:cardId}).exec()
      .then(function (card) {
        res.render("definitions/card/edit", {
          userName: req.user.name,
          userSurName: req.user.surname,
          data:card,
          reader:_reader
        });
      })
      .then(null, _error(res));
  }
  
  seqExec()
};
exports.getListCardPage     = function (req, res) {

  function Execute() {
    GetData(function (result) {
      GetPage(result);
    })
  }

  function GetData(callback) {
    Card.find({}).exec()
      .then(function (card) {
        callback(card)
      })
      .then(null, _error(res));

  }

  function GetPage(result) {
    res.render("definitions/card/list", {
      userName: req.user.name,
      userSurName: req.user.surname,
      data:result
    });
  }

  Execute();
};
exports.getCardId           = function (req, res) {
  
  var serial = req.params.rSerial;
  
  request.get({url: 'http://' + config.cardServiceExpress.url + ':' + config.cardServiceExpress.port + '/card/'+serial},
    function (err, httpResponse, body) {
      if (!err) {
        body = JSON.parse(body);
        
        var newCardID = body.cardId;

        if (newCardID && newCardID != "" && newCardID !== "undefined" && newCardID !== null) {
          Card.findOne({'cardId': newCardID}).exec()
            .then(function (card) {
              if (!card || card.userId === "") {
                res.json({
                  err: false,
                  newCardId: newCardID,
                  msg: "OK"
                });
              } else {
                res.json({
                  err: true,
                  status: 2,
                  msg: "Tanımlı Kart Hatası"
                });
              }
            })
            .then(null, _error(res));
        } else {
          res.json({
            err: true,
            status: 1,
            msg: "Kart Okuma Hatası"
          });
        }
        
      } else {
        res.json({
          err: true,
          status: 0,
          msg: "Bağlantı Hatası"
        });
      }
    });
};
exports.getImportCardPage   = function (req, res) {
  res.render("multiple/card", {
    userName: req.user.name,
    userSurName: req.user.surname
  });
};
// </editor-fold>
