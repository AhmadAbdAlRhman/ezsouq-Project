const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ProductsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    Category_id: {
        type: Schema.Types.ObjectId,
        ref: 'category',
        required: true,
    },
    Owner_id: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    Governorate_name: {
        type: String,
        ref: 'Governorates',
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    main_photos: {
        type: [String],
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
    video: String,
    //just for mobile and car
    color: String,
    //for cars and mobiles and real_state
    isnew: Boolean,
    photos: {
        type: [String],
        validate: {
            validator: function (arr) {
                return arr.length <= 2;
            },
            message: 'يمكنك رفع حتى صورتين إضافيتين فقط.'
        },
        default: []
    },
    //for cars
    engine_type:{
        type:String,
        enum:[
            'اتوماتيك',
            'غيير عادي'
        ]
    },
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