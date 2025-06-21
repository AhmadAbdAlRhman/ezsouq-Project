const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ProductsSchema = new mongoose.Schema({
    Category_id: {
        type: Schema.Types.ObjectId,
        ref: 'categories',
        required: true,
    },
    //just for mobile and car
    name: {
        type: String,
        required: false,
    },
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
    city: {
        type: String,
        required: true,
    },
    main_photo: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    //for cars and mobiles and real_state
    color: String,
    isnew: Boolean,
    photos: [String],
    //for cars
    shape: {
        type: String,
        enum: [
            'سرفيس',
            'فان',
            'تكسي',
            'سباق',
            'سوزوكي',
            'جبلي',
        ]
    },
    real_estate_type: {
        type: String,
        enum: [
            'شقة',
            'مكتب',
            'أرض',
            'عيادة أسنان',
            'فيلة',
            'شاليه'
        ]
    },
    for_sale: Boolean,
    //مفروش ولا لا
    in_Furniture: Boolean,
    //for mobile
    processor: String,
    Sotarge: Number,
}, {
    timestamps: true
});
const Products = mongoose.model("Products", ProductsSchema);
module.exports = Products;