var Schema = mongoose.Schema;

var Reader = new Schema({
    serialNo          :   {type: String, default: 0, unique:true},
    groupId           :   {type: String, default: ""},
    readerName        :   {type: String, default: ""},
    passSignalWait    :   {type: Boolean, default: true},
    readerType        :   {type: Number, default: 2},//-1:definition,0:Exit,1:Entrance,2:Entrance-Exit
    readerProp        :   {type: Number, default: 2},//0:tcp/ip-standard,1:tcp/ip-keypad
    created           :   {type: Date,   default: new Date()}
}, {collection: "readers", minimize: false});

mongoose.model("Reader", Reader);

module.exports = Reader;