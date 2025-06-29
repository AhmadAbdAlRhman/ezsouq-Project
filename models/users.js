const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const options = {
    discriminatorkey: "provider",
    timestamps: true
}
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    infoContact: {
        type: String,
        required: false,
        unique: true,
    },
    avatar: {
        type: String,
        required: false,
    },
    address: {
        type: String,
        required: false,
    },
    Role: {
        type: String,
        required: true,
        enum: [
            'ADMIN',
            'USER',
            'OWNER'
        ]
    }
}, options);

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Users = mongoose.model("Users", UserSchema);
module.exports = Users;