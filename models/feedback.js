const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedbackSchema = new mongoose.Schema({
    comments:{
        type: String, 
        required: true,
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref:'Users',
        required: true
    },
    product_id:{
        type: Schema.Types.ObjectId,
        ref:'Products',
        required: true
    },
    parent_comment: {
        type: Schema.Types.ObjectId,
        ref: 'feedback',
        default: null
    }
}, { timestamps: true });
const Feedback = mongoose.model("feedback",feedbackSchema);
module.exports = Feedback;