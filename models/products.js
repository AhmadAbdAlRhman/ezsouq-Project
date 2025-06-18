const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ProductsSchema = new mongoose.Schema({
    Category_id: {
        type: Schema.Types.ObjectId,
        ref: 'categories',
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    shape: String,
    Owner_id: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    Governorates_id: {
        type: Schema.Types.ObjectId,
        ref: 'Governorates',
        required: true,
    },
    year_of_manufacture: Number,
    mileage: Number,
    engine_type: String,
    main_photo: {
        type: String,
        required: true,
    },
    photos: [String],
    color: String,
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    fuel: String,
    isnew: Boolean,
    real_estate_type: {
        type: String,
        enum: [
            'Apartment',
            'Office',
            'Land'
        ]
    },
    real_estate_size: Number,
    processor: String,
    Sotarge: Number,
    RAM: Number,
}, { timestamps: true });
const Products = mongoose.model("Products", ProductsSchema);
module.exports = Products;