const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new mongoose.Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    type: {
        type: String,
        enum: ['comment', 'like', 'reply'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    product_id: {
        type: Schema.Types.ObjectId,
        ref: 'Products',
        required: true
    },
    comment_id: {
        type: Schema.Types.ObjectId,
        ref: 'feedback',
        default: null
    },
    from_user_id: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;

