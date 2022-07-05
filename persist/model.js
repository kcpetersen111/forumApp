const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    username:{
        type: String,
        match:[
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please fill a valid email address",
        ],
        require:true,
        unique: true,
    },
    fullname: {
        type: String,
        required: true
    },
    password:{
        type:String,
        require:true
    },
});

const User = mongoose.model("User",userSchema);

module.exports = {
    User,
}