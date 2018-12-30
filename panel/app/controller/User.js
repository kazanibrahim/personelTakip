var User    = mongoose.model("User");
var sha512  = require('js-sha512').sha512;
var exports = module.exports = {};

// <editor-fold "Post Method">
exports.createUser = function (req, res) {
  
  var nameInput     = req.body.name;
  var surnameInput  = req.body.surname;
  var usernameInput = req.body.username;
  var pwdInput      = req.body.pwd;
  
  if (!utils.safeInput(nameInput)     || nameInput.length == 0) {
    res.json({err: true, msg: "Kullanıcı Adı Hatalı İşlem"});
    return;
  }
  if (!utils.safeInput(surnameInput)  || surnameInput.length == 0) {
    res.json({err: true, msg: "Kullanıcı SoyAdı Hatalı İşlem"});
    return;
  }
  if (!utils.safeInput(usernameInput) || usernameInput.length == 0) {
    res.json({err: true, msg: "Kullanıcı Rumuz Hatalı İşlem"});
    return;
  }
  if (!utils.safeInput(pwdInput)      || pwdInput.length == 0) {
    res.json({err: true, msg: "Kullanıcı Şifre Hatalı İşlem"});
    return;
  }
  
  function Execute() {
    CreateUser();
  }
  
  function CreateUser() {
    User.count({}).exec()
      .then(function () {
        var user = new User();
        user.username = usernameInput;
        user.name     = nameInput;
        user.surname  = surnameInput;
        user.password = sha512(pwdInput);
        return user.save()
          .then(function () {
            res.json({
              err: false
            });
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
  
  Execute();
  
};
exports.editUser   = function (req, res) {
  
  var userId        = req.params.userId;
  var nameInput     = req.body.name;
  var surnameInput  = req.body.surname;
  var usernameInput = req.body.username;
  var pwdInput      = req.body.pwd;
  
  if (!utils.safeInput(nameInput)     || nameInput.length == 0) {
    res.json({err: true, msg: "Kullanıcı Adı Hatalı İşlem"});
    return;
  }
  if (!utils.safeInput(surnameInput)  || surnameInput.length == 0) {
    res.json({err: true, msg: "Kullanıcı SoyAdı Hatalı İşlem"});
    return;
  }
  if (!utils.safeInput(usernameInput) || usernameInput.length == 0) {
    res.json({err: true, msg: "Kullanıcı Rumuz Hatalı İşlem"});
    return;
  }
  if (!utils.safeInput(pwdInput)      || pwdInput.length == 0) {
    res.json({err: true, msg: "Kullanıcı Şifre Hatalı İşlem"});
    return;
  }
  
  User.update({_id: userId}, {
    $set: {
      name: nameInput,
      surname: surnameInput,
      username: usernameInput,
      password : sha512(pwdInput)
    }
  })
    .then(function () {
      res.json({
        err: false,
        status: "OK"
      });
    })
    .then(null, function (err) {
      var msg = err.message.split(" ");
      if (err.code == 11000) {
        res.json({err: true, msg: "Tekrarlı Veri Hatası"});
      }
      console.error(err.message);
    })
  
  
};
exports.deleteUser = function (req, res) {
  
  var userId = req.body.id;
  
  User.findOneAndUpdate({_id: userId}, {$set:{isDelete:true}}, {new: true}, function(err, doc){
    if(err){
      console.error(err);
      res.json({err: true, OK: 0})
    }else{
      res.json({err: false, OK: 1})
    }
  });
  
};
// </editor-fold>

// <editor-fold "Get Method">
exports.getCreateUserPage   = function (req, res) {
  res.render("user/create", {
    userName: req.user.name,
    userSurName: req.user.surname
  });
};
exports.getEditUserPage     = function (req, res) {
  
  var userId = req.params.userId;
  
  User.findOne({_id:userId.toString()}).exec()
    .then(function (user) {
      res.render("user/edit", {
        userName: req.user.name,
        userSurName: req.user.surname,
        data:user
  
      });
    })
    .then(null, _error(res));
  
};
exports.getListUserPage     = function (req, res) {
  
  function Execute() {
    GetData(function (result) {
      GetPage(result);
    })
  }
  
  function GetData(callback) {
    
    User.find({isDelete:false}).exec()
      .then(function (user) {
        callback(user)
      })
      .then(null, _error(res));
    
  }
  
  function GetPage(result) {
    res.render("user/list", {
      userName: req.user.name,
      userSurName: req.user.surname,
      data: result
    });
  }
  
  Execute();
};
// </editor-fold>