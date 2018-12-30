var Schema = mongoose.Schema;

var User = new Schema({
    username        : {type: String,unique:true},
    name            : {type: String, default:""},
    surname         : {type: String, default:""},
    image           : {type: String, default:""},
    token           : {type: String, default:""},
    password        : {type: String},
    isActive        : {type: Boolean, default:true},
    isDelete        : {type: Boolean, default:false},
    created         : {type: Date, default:new Date()}
}, {collection: "users", minimize: false});

mongoose.model("User", User);

module.exports = User;