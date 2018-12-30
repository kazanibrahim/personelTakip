// <editor-fold "Definitions">
var ReaderGroup = mongoose.model("ReaderGroup");
var Personnel   = mongoose.model("Personnel");
var Card        = mongoose.model("Card");
// </editor-fold>

var updateUniqueFieldControl  = function (modelName,id,input,callback) {
  
  var _modelName  = mongoose.model(modelName);
  var _isUnique   = false;
  function SeqExec() {
    FirstStep(function () {
      SecondStep();
    })
  }
  
  function FirstStep(callback) {
    _modelName.find({isDelete:false,name:{$regex: new RegExp("^" + input + "$", "i")}, '_id': {$ne: id}}).exec()
      .then(function (afterQuery) {
        if(afterQuery.length == 0){_isUnique = true; callback();}else{_isUnique = false; callback();}
      })
      .then(null, function(err){
        console.error("[ DB ERROR ] " + err);
      });
  }
  
  function SecondStep() {
    callback( _isUnique);
  }
  
  SeqExec()
};

var uniqueFieldControl  = function (modelName,input,callback) {
    
  var _modelName  = mongoose.model(modelName);
  var _isUnique   = false;
  function SeqExec() {
    FirstStep(function () {
      SecondStep();
    })
  }
  
  function FirstStep(callback) {
    _modelName.find({isDelete:false,name:{$regex: new RegExp("^" + input + "$", "i")}}).exec()
      .then(function (afterQuery) {
        if(afterQuery.length == 0){_isUnique = true; callback();}else{_isUnique = false; callback();}
      })
      .then(null, function(err){
        console.error("[ DB ERROR ] " + err);
      });
  }
  
  function SecondStep() {
    callback( _isUnique);
  }
  
  SeqExec()
};

var mailInputControl    = function (email) {
  var re = /^(([^<>()[\]\\.,:\s@\"]+(\.[^<>()[\]\\.,:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};

var safeInput           = function (input) {
  if(input.search(/[_;$?!.*,{}']/gi) != -1) {return false;} else{return true;}
};

var safeFileName        = function(name){
  name = name.replace(/ /g, '-');
  name = name.replace(/[^A-Za-z0-9-_\.]/g, '');
  name = name.replace(/\.+/g, '.');
  name = name.replace(/-+/g, '-');
  name = name.replace(/_+/g, '_');
  
  var d = new Date();
  return Math.round(d.getTime() / 1000) + "-" + name;
};

var arr_diff            = function (a1,a2) {
  
  var a = [], diff = [];
  
  for (var i = 0; i < a1.length; i++) {
    a[a1[i]] = true;
  }
  
  for (var i = 0; i < a2.length; i++) {
    if (a[a2[i]]) {
      delete a[a2[i]];
    } else {
      a[a2[i]] = true;
    }
  }
  
  for (var k in a) {
    diff.push(k);
  }
  
  return diff;
  
};

var getCardCode         = function (_cId,clb) {
  
  Card.findOne({_id:_cId}).exec()
    .then(function (afterQuery) {
      clb(afterQuery.cardCode)
    })
    .then(null, function (err) {
      console.error(err);
      clb("")
    });
};

var getAccessGroupName  = function (_acsId,clb) {
  ReaderGroup.findOne({_id:_acsId}).exec()
    .then(function (afterQuery) {
      clb(afterQuery.name)
    })
    .then(null, function (err) {
      console.error(err);
      clb("")
    });
};

var getPersonnelData    = function (_pId,clb) {
  
  Personnel.findOne({_id:_pId.toString()}).exec()
    .then(function (afterQuery) {
      clb(afterQuery)
    })
    .then(null, function (err) {
      console.error(err);
      clb("")
    });
};

module.exports = {
  updateUniqueFieldControl  : updateUniqueFieldControl,
  uniqueFieldControl  : uniqueFieldControl,
  getAccessGroupName  : getAccessGroupName,
  getPersonnelData    : getPersonnelData,
  mailInputControl    : mailInputControl,
  getCardCode         : getCardCode,
  safeFileName        : safeFileName,
  safeInput           : safeInput,
  arr_diff            : arr_diff
};