const mongoose = require('mongoose');

const GovernoratesSchema = new mongoose.Schema({
    name: {
        type: String,
        unique:true,
        required: true,
    },
    cities:[String],
}, { timestamps: true });
const Governorates = mongoose.model("Governorates", GovernoratesSchema);
module.exports = Governorates;