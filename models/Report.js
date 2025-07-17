const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products',
        required: true
    },
    reported_By: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    reason: {
        type: String,
        required: true,
        enum: ['محتوى مزيف', 'منتج مكرر', 'مخالف للشروط', 'أخرى','']
    },
    message: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.model('Report', ReportSchema);