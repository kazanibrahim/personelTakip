var Schema = mongoose.Schema;

var Personnel = new Schema({
  image           : {type: String, default: ""},
  name            : {type: String, default: ""},
  surname         : {type: String, default: ""},
  passportNumber  : {type: String, default: ""},
  registerNumber  : {type: String, default: ""},
  cardModelId     : {type: String, default: ""},
  _cardCode       : {type: String, default: ""},
  permissions     : {type: Array,  default: [{
    pid       : {type: String, default: ""},
    pname     : {type: String, default: ""}
  }]},
  isActive        :   {type: Boolean,default: true},
  created         :   {type: Date,   default: new Date()}
}, {collection: "personnels", minimize: false});

mongoose.model("Personnel", Personnel);

module.exports = Personnel;