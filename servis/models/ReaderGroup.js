var Schema = mongoose.Schema;

var ReaderGroup = new Schema({
  name              :   {type: String, default: ""},
  readersId         :   {type: Array, default: []},
  readersSerial     :   {type: Array, default: []},
  readers4list      :   {type: Array, default: []},
  isAntiPassBack    :   {type: Boolean, default: false},
  created           :   {type: Date,   default: new Date()}
}, {collection: "readerGroups", minimize: false});

mongoose.model("ReaderGroup", ReaderGroup);

module.exports = ReaderGroup;