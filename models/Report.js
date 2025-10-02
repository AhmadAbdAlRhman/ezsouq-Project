const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    reported: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    reason: {
        type: String,
        required: true,
    },
    details: {
        type: String
    },
    status:{
        type: String,
        enum:['معلق','تمت المراجعة'],
        defaut:'تمت المراجعة'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.model('Report', ReportSchema);