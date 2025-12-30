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
    googleId: {
        type: String,
        required: false,
        unique: true,
    },
    password: {
        type: String,
        required: false,
        unique: false,
    },
    resetToken: String,
    resetTokenExpire: Date,
    avatar: {
        type: String,
        required: false,
    },
    phone: {
        type: String
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
            'OWNER',
            'BANNED'
        ]
    },
    tokenVersion: {
        type: Number,
        default: 0
    },
    whats_app: {
        type: String,
        required: false
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products'
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
        const { deleteUserFiles, deleteAllUserProductFiles } = require('../functions/deleteFiles');
        
        // حذف ملفات جميع منتجات المستخدم
        await deleteAllUserProductFiles(this._id);
        
        // حذف منتجات المستخدم من قاعدة البيانات
        await Product.deleteMany({
            Owner_id: this._id
        });
        
        // حذف ملفات المستخدم
        await deleteUserFiles(this);
        
        next();
    } catch (err) {
        next(err);
    }
});

// Hook لحذف الملفات عند استخدام findByIdAndDelete
UserSchema.pre('findOneAndDelete', async function() {
    const user = await this.model.findOne(this.getQuery());
    if (user) {
        const { deleteUserFiles, deleteAllUserProductFiles } = require('../functions/deleteFiles');
        
        // حذف ملفات جميع منتجات المستخدم
        await deleteAllUserProductFiles(user._id);
        
        // حذف منتجات المستخدم من قاعدة البيانات (سيتم حذفها تلقائياً بواسطة pre('remove') hook)
        // لكن يجب حذفها هنا أيضاً لأن findByIdAndDelete لا يستدعي pre('remove')
        await Product.deleteMany({
            Owner_id: user._id
        });
        
        // حذف ملفات المستخدم
        await deleteUserFiles(user);
    }
});
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Users = mongoose.model("Users", UserSchema);
module.exports = Users;