const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productId: String,
    storeName: String,
    title: String,
    price: Number,
    categories: Array,
    incrStr: String,
    qtyStr: String,
  },
  { timestamps: true }
);

const Product = mongoose.model("product", productSchema);

module.exports = Product;
