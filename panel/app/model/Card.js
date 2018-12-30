var Schema = mongoose.Schema;

var Card = new Schema({
  cardId      : {type: String, default: ""},
  cardCode    : {type: String, default: ""},
  personnelId : {type: String, default: ""},
  accessPassHistory : [{
    reader      : {type: String, default: ""},
    readerGroup : {type: String, default: ""},
    date        : {type: Date, default: new Date()},
    type        : {type: Number, default: -2},//input - output
    requestType : {type: Number, default: 0} //0 - card, 1 - password, 2 - fingerprint
  }],
  deniedPassHistory : [{
    reader      : {type: String, default: ""},
    readerGroup : {type: String, default: ""},
    date        : {type: Date, default: new Date()},
    type        : {type: Number, default: -2},
    requestType : {type: Number, default: 0}
  }],
  created     :   {type: Date,   default: new Date()}
}, {collection: "cards", minimize: false});

mongoose.model("Card", Card);

module.exports = Card;