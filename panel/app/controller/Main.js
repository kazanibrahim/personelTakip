var sha512      = require('js-sha512').sha512;
var randomToken = require('rand-token');
var User = mongoose.model("User");

var exports = module.exports = {};

exports.home = function (req, res) {
  
  res.render("home", {
    userName: req.user.name,
    userSurName: req.user.surname
  });
  
};

exports.doLogin = function (req, res) {
  
  if (utils.safeInput(req.body.username) && req.body.username.length != 0 && utils.safeInput(req.body.password) && req.body.password.length != 0) {
    var username = req.body.username;
    var encrypted = sha512(req.body.password);
    var minute = 28800000;
    
    function SeqExec() {
      CheckUser()
    }
    
    function CheckUser() {
      User.findOne({'username': username, 'password': encrypted}).exec()
        .then(function (user) {
          if (user && user.isActive && !user.isDelete) {
            var createToken = randomToken.generate(32);
            user.token = createToken;
            return user
              .save()
              .then(function () {
                res.cookie("token", createToken, { expires: new Date(Date.now() + minute), maxAge: minute}).json({
                  "err": false,
                  "token": createToken
                });
              });
          } else {
            res.status(404).json({
              "err": true,
              "msg": "Geçersiz Kullanıcı"
            });
          }
        })
        .then(null, _error(res));
    }
    
    SeqExec();
    
  } else {
    res.json({
      "err": true,
      'msg': 'Hatalı Giriş'
    });
  }
  
};

exports.doLogout = function (req, res) {
  var cookieToken = req.cookies['token'];
  
  User.findOne({'token': cookieToken})
    .exec()
    .then(function (user) {
      if (user) {
        res.cookie("token", "").redirect('/')
      } else {
        res.status(404).json({
          "err": true,
          "msg": "Token not found."
        });
      }
    })
    .then(null, _error(res));
};