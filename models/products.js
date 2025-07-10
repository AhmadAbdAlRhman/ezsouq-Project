const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ProductsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    Category_name: {
        type: String,
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
    isnew: {
        type: Boolean,
        required: false,
        default: null
    },
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
        ],
        default: null
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
        ],
        default: null
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
        ],
        default: null
    },
    for_sale: {
        type: Boolean,
        required: false,
        default: null
    },
    //مفروش ولا لا
    in_Furniture: {
        type: Boolean,
        required: false,
        default: null
    },
    //for mobile
    processor: String,
    Sotarge: Number,
}, {
    timestamps: true
});
const Products = mongoose.model("Products", ProductsSchema);
module.exports = Products;