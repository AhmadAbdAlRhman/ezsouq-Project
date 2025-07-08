const mongoose = require("mongoose");
const Product = require("./products");
const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        allowNull: false,
        unique: true
    }
}, {
    timestamps: true
});
CategorySchema.pre('remove', async function (next) {
    try {
        await Product.deleteMany({
            Category_id: this._id
        });
        next();
    } catch (err) {
        next(err);
    }
});
const Category = mongoose.model("category", CategorySchema);
module.exports = Category;