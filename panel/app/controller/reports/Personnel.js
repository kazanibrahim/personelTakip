// <editor-fold "Definitions">
var PassAction  = mongoose.model("PassAction");
var Personnel   = mongoose.model("Personnel");

var exports     = module.exports = {};
var fs          = require('fs');
var xlsx        = require('node-xlsx');
var streamifier = require('streamifier');
var mime        = require('mime');
// </editor-fold>


// <editor-fold "Post Method">

exports.personnelPass            = function (req, res) {
  
  var _dateRange  = req.body.dateRange;
  var _personnel  = req.body.personnelId;
  
  var date        = _dateRange.split("-");
  var _sDate      = new Date(date[0]);
  var _sDate2     = new Date(date[0]);
  _sDate.setHours(0,0,0,0);
  _sDate2.setHours(23,59,59);
  var _fDate      = new Date(date[1]);
  var _fDate2     = new Date(date[1]);
  _fDate.setHours(0,0,0,0);
  _fDate2.setHours(23,59,59);
  var dayArrayLength;
  
  var yearStart   = date[0].slice(0, 4);
  var yearFinish  = date[1].slice(1, 5);
  var monthStart  = date[0].slice(5, 7);
  var monthFinish = date[1].slice(6, 8);
  var dayStart    = date[0].slice(8, 10);
  var dayFinish   = date[1].slice(9, 11);
  
  if (_dateRange.length < 35)   {
    res.json({err: true, msg: "Geçersiz Tarih Seçimi"});
    return;
  }
  if (yearStart === yearFinish) {
    if (monthStart === monthFinish) {
      dayArrayLength = (dayFinish - dayStart) + 1;
    } else {
      res.json({err: true, msg: "Bir Aylık Rapor Seçin"})
    }
  } else {
    res.json({err: true, msg: "Bir Aylık Rapor Seçin"})
  }
  
  PassAction.find({personnelId:_personnel, $and: [{date: {$gte: _sDate, $lte: _fDate}}]})
    .exec()
    .then(function (afterQuery) {
      res.json({
        err:false,
        data:afterQuery
      })
    })
    .then(null, _error(res));
  
};

// </editor-fold>

// <editor-fold "Get Method">

exports.getPersonnelReportPage    = function (req, res) {
  
  function Execute() {
    GetData(function (result) {
      GetPage(result);
    })
  }
  
  function GetData(callback) {
  
    Personnel.find({isDelete:false}).exec()
      .then(function (department) {
        callback(department)
      })
      .then(null, _error(res));
    
  }
  
  function GetPage(result) {
    res.render("reports/personnel", {
      userName: req.user.name,
      userSurName: req.user.surname,
      data: result
    });
  }
  
  Execute();
  
  
};
exports.getPersonnelReportExport  = function (req, res) {
  
  var excel         = [["İsim", "Soyisim", "Sicil No", "Pozisyon", "Departman",  "Okuyucu Adı", "Tarih/Zaman","Durum"]];
  var _dateRange  = req.query.dateRange;
  var _personnel  = req.query.perId;
  
  var date        = _dateRange.split("-");
  var _sDate      = new Date(date[0]);
  var _sDate2     = new Date(date[0]);
  _sDate.setHours(0,0,0,0);
  _sDate2.setHours(23,59,59);
  var _fDate      = new Date(date[1]);
  var _fDate2     = new Date(date[1]);
  _fDate.setHours(0,0,0,0);
  _fDate2.setHours(23,59,59);
  var dayArrayLength;
  
  var yearStart   = date[0].slice(0, 4);
  var yearFinish  = date[1].slice(1, 5);
  var monthStart  = date[0].slice(5, 7);
  var monthFinish = date[1].slice(6, 8);
  var dayStart    = date[0].slice(8, 10);
  var dayFinish   = date[1].slice(9, 11);
  
  if (_dateRange.length < 35)   {
    res.json({err: true, msg: "Geçersiz Tarih Seçimi"});
    return;
  }
  if (yearStart === yearFinish) {
    if (monthStart === monthFinish) {
      dayArrayLength = (dayFinish - dayStart) + 1;
    } else {
      res.json({err: true, msg: "Bir Aylık Rapor Seçin"})
    }
  } else {
    res.json({err: true, msg: "Bir Aylık Rapor Seçin"})
  }
  
  function seqExec() {
    GetData(function (allData) {
      CreateExcel(allData)
    })
  }
  
  function GetData(callback) {
    PassAction.find({personnelId:_personnel, $and: [{date: {$gte: _sDate, $lte: _fDate}}]})
      .exec()
      .then(function (afterQuery) {
        callback(afterQuery)
      })
      .then(null, _error(res));
  }
  
  function CreateExcel(_data) {
    for(var index = 0; index < _data.length; index ++){
      var item = _data[index];
      excel.push([item.name, item.surname, item.registerNumber, item.positionName, item.departmentName, item.reader.name, item.date.toLocaleString(),item.message]);
    }
    
    var buffer  = xlsx.build([{name: "PersonelBazliRapor", data: excel}]);
    var size    = buffer.length;
    res.writeHead(200, {
      "Content-Disposition": "attachment;filename=PersonelBazliRapor" + new Date().getTime().toString() + ".xlsx",
      'Content-Length': size,
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    
    streamifier.createReadStream(buffer).pipe(res);
  }
  
  seqExec();
  
};

// </editor-fold>
