const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true,
    },
    second_name: {
        type: String,
        required: false,
    },
    infoContact: {
        type: String,
        required: false,
        unique: true,
    },
    password: {
        type: String,
        required: false,
        unique: false,
    },
    avatar: {
        type: String,
        required: false,
    },
    address: {
        type: String,
        required: false,
    },
    googleId: {
        type: String,
        required: false,
        unique: true,
    },
}, {
    timestamps: true
});

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

UserSchema.methods.matchPassword = async function (enteredPassword)  {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Users = mongoose.model("Users", UserSchema);
module.exports = Users;