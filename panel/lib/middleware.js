var User = mongoose.model("User");

var checkDbItem = function (req,res,next) {
  function seq() {
    mrCheck(function () {
      usCheck(function () {
        next()
      })
    })
  }
  function mrCheck(clb) {
    clb()
  }
  
  function usCheck(clb) {
    User.count({}).exec()
      .then(function (uscount) {
        if(uscount == 0){
          var _us = {
            "username" : "admin",
            "password" : "c7ad44cbad762a5da0a452f9e854fdc1e0e7a52a38015f23f3eab1d80b931dd472634dfac71cd34ebc35d16ab7fb8a90c81f975113d6c7538dc69dd8de9077ec",
            "token" : "",
            "isActive" : true,
            "isDelete" : false,
            "name" : "Halil",
            "surname" : "Kazan",
          }
  
          var sUser = new User(_us);
  
          sUser.save(function (err) {
            if (err){
              console.error("[ SYSTEM ERROR ]" + "Error: " + err);
            } else{
              clb()
            }
          });
          
        }else{clb()}
      })
      .then(null, function (err) {
        console.err(err)
        process.exit(0);
      });
  }
  
  seq()
  
};

var secure = function (req, res, next) {
  var token = req.cookies.token;
  
  if (!token || token == 'undefined' || token == null || token == "") {
    res.render("index");
  } else {
    
    var query = User.findOne({token: token.toString()});
  
    Promise = query.exec();
  
    Promise.then(function (user) {
        if (user) {
          req.user = user;
          next();
        } else {
          res.render("index");
        }
      });
    Promise.then(null, _error(res));
  }
  
};

global.checkDbItem = checkDbItem;
global.secure = secure;

module.exports = {
  secure: secure
};