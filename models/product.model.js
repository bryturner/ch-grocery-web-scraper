const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    storeName: { type: String },
    title: { type: String },
    price: { type: Number },
    categories: { type: Array },
    increment: {
      incrPrice: { type: Number },
      incrQty: { type: Number },
      incrStr: { type: String },
    },
    quantity: {
      qtyAmount: { type: Number },
      qtyStr: { type: String },
    },
    favorites: { type: Array },
    grocList: { type: Array },
  },
  { timestamps: true }
);

const Product = mongoose.model("product", productSchema);

module.exports = Product;

// add display price as string/ keep price as number for math
