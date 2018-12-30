var Schema = mongoose.Schema;

var PassAction = new Schema({
  cardId          : {type: String, default: ""},
  name            : {type: String, default: ""},
  surname         : {type: String, default: ""},
  passportNumber  : {type: String, default: ""},
  registerNumber  : {type: String, default: ""},
  reader          : {type: String, default: ""},
  readerGroup     : {type: String, default: ""},
  readerName      : {type: String, default: ""},
  readerIp        : {type: String, default: ""},
  readerType      : {type: String, default: ""},
  personnelId     : {type: String, default: ""},
  message         : {type: String, default: ""},
  passStatus      : {type: Boolean,default: false},
  screenDate      : {type: String, default: ""},
  date            : {type: Date, default: new Date()}
}, {collection: "passActions", minimize: false});

mongoose.model("PassAction", PassAction);

module.exports = PassAction;