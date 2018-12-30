var WebSocketServer   = require("ws").Server;
var PassActionModel   = mongoose.model("PassAction");

var wss;

var PASS_PORT = config.ws.port;
var Clients = {};

function PassWS(callback) {
  this.init(callback);
}

PassWS.prototype.getPassModel   = function () {
  var _this = this;

  var Model = function Model() {

    var data = {
      err: false,
      cardId:"",
      name: "",
      surname: "",
      passportNumber: "",
      registerNumber: "",
      personnelId:"",
      reader: "",
      readerIp: "",
      readerName: "",
      readerGroup: "",
      readerType: "",
      message: "",
      passStatus: false,
      db: false,
      screenDate: new Date().toLocaleString(),
      date: new Date()
    };

    this._setError      = function (e) {
      data.err = e;
      return this;
    };

    this._setDb         = function (v) {
      data.db = v;
      return this;
    };

    this._setReader     = function (reader) {
      data.reader           = reader.serialNo;
      data.readerIp         = reader.ipNo;
      data.readerName       = reader.name;
      data.readerGroup      = reader.groupId;
      data.readerType       = reader.type;
      return this;
    };

    this._setReader2    = function (serial,ip) {
      data.reader       = serial;
      data.readerIp     = ip;
      return this;
    };

    this._setCardId     = function (cardId) {
      data.cardId = cardId;
      return this;
    };

    this._setPersonnel  = function (personnel) {

      data.name         = personnel.name;
      data.surname      = personnel.surname;
      data.passportNumber = personnel.passportNumber;
      data.registerNumber = personnel.registerNumber;
      data.personnelId  = personnel._id;

      return this;
    };

    this._setPassStatus = function (p) {
      data.passStatus = p;
      return this;
    };

    this._setMessage    = function (message) {
      data.message = message;
      return this;
    };

    this._send          = function () {
      var clone = JSON.parse(JSON.stringify(data));

      if (clone.db) {
        var passAction = new PassActionModel(data);

        passAction.save(function (err) {
          if (err) logger.error("[ SYSTEM ERROR ]" + "Error: " + err);
        });
      }

      _this.broadcast(clone);
    };
  };

  return new Model();
};

PassWS.prototype.getToken       = function () {
  var d = new Date().getTime();
  var token = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });

  return token;
};

PassWS.prototype.broadcast      = function (data) {
  for (var i in Clients) {
    Clients[i].send(JSON.stringify(data));
  }
};

PassWS.prototype.init           = function (next) {
  var _this = this;
  wss = new WebSocketServer({
    port: PASS_PORT
  });

  wss.on("connection", function (ws) {
    var token = _this.getToken();

    Clients[token] = ws;
    ws.on("close", function () {
      delete Clients[token];
    });
  });

  wss.on("close", function () {
    logger.error("DISCONNECTED!");
  });

  wss.on("listening", function () {
    logger.info("PASS WS\t" + "[" + PASS_PORT + "]");
    next();
  });
};

module.exports = PassWS;
