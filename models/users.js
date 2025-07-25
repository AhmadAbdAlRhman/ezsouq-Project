const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Product = require('./products');
const options = {
    discriminatorkey: "provider",
    timestamps: true
}
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: false,
        unique: true,
    },
    avatar: {
        type: String,
        required: false,
    },
    phone: {
        type: Number
    },
    Location: {
        type: String,
        required: false,
    },
    workplace: {
        type: String,
        required: false,
    },
    work_type: {
        type: String,
        required: false
    },
    Role: {
        type: String,
        required: true,
        enum: [
            'USER',
            'ADMIN',
            'OWNER'
        ]
    },
    whats_app: {
        type: Number,
        required: false
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products'
    }],
    ratings: [{
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        }
    }],
    averageRating: {
        type: Number,
        default: 0
    }
}, options);

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});
UserSchema.pre('remove', async function (next) {
    try {
        await Product.deleteMany({
            Owner_id: this._id
        });
        next();
    } catch (err) {
        next(err);
    }
});
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Users = mongoose.model("Users", UserSchema);
module.exports = Users;