
const mongoose = require("mongoose");
const { use } = require("passport");
const Schema = mongoose.Schema;
const passportLocalSchema = require("passport-local-mongoose");

const userSchema = new Schema ({
    email: {
         type: String,
        required: true
    }
});

userSchema.plugin(passportLocalSchema);

module.exports = mongoose.model("User" , userSchema)